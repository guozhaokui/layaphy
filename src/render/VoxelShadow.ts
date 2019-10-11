import { Vector3 } from "laya/d3/math/Vector3";
import { VoxelLightRay } from "./VoxelLightRay";
import { VoxelLightSphere } from "./VoxelLightSphere";

/**
 *  sh = new VoxelShadow()
 * sh.initFromData(dt,w,l,h)
 * sh.addBlock(x,y,z)
 * sh.delBlock(x,y,z)
 * sh.lightDir(x,y,z)
 * sh.inShadow(x,y,z)
 */
export class VoxelShadow {
    xsize: int = 0;
    xsizeBit: int = 0; 	//为了尽量加快定位，采用2的n次方的方法做偏移
    ysize: int = 0;
    ysizeBit: int = 0;
    zsize: int = 0;
    zsizeBit: int = 0;
    xzsize: int = 0;
    xzsizeBit: int = 0;

    shadowMap: Float32Array;	// 阴影图，每个方向的深度
    _lightDir = new Vector3(0, -1, 0);
    lightInvLine = new VoxelLightRay();			//反向光线路径，每个xyz记录的是与起点的偏移。不包含起点

    edgeVoxids: number[] = [];	// 没有完全被包住的点

    voxelData: Uint8Array;
    voxelLight: Uint8Array;

    lightSphere = new VoxelLightSphere(1024, 100);

    // 紧紧包住整个世界的膜
    bound_ymin: Uint16Array;	// 格子中的y最小的，比这个还小的地方一定没有方块了
    bound_ymax: Uint16Array;
    bound_xmin: Uint16Array;
    bound_xmax: Uint16Array;
    bound_zmin: Uint16Array;
    bound_zmax: Uint16Array;
    boundFace: Uint16Array[] = new Array<Uint16Array>(6);	//0 xmin 1 xmax, 2 ymin 3 ymax, 4 zmin 5 zmax

    tmpFaceLight: number[] = [0, 0, 0, 0, 0, 0];
    //lit2color:Array = new Array(32);
    //
    getBitNum(v: int): int {
        if (v === 1) return 0;
        else if (v === 2) return 1;
        else if (v <= 4) return 2;
        else if (v <= 8) return 3;
        else if (v <= 16) return 4;
        else if (v <= 32) return 5;
        else if (v <= 64) return 6;
        else if (v <= 128) return 7;
        else if (v <= 256) return 8;
        else if (v <= 512) return 9;
        else if (v <= 1024) return 10;
        else if (v <= 2048) return 11;
        else if (v <= 4096) return 12;
        else if (v <= 8192) return 13;
        else if (v <= 16384) return 14;
        else return Math.ceil(Math.log(v) / Math.log(2));	//TODO 当然不用这个，有个简单的方法
    }
    VoxelShadow(xs: int, ys: int, zs: int): void {
        // 大小按照2的n次方对齐。 问题：存在一个超出一点浪费大量空间的问题
        this.xsizeBit = this.getBitNum(xs);
        this.ysizeBit = this.getBitNum(ys);
        this.zsizeBit = this.getBitNum(zs);

        this.xsize = xs;// 1 << xsizeBit;
        this.ysize = ys;// 1 << ysizeBit;
        this.zsize = zs;// 1 << zsizeBit;
        this.xzsize = this.xsize * this.zsize;
        this.xzsizeBit = this.xsizeBit + this.zsizeBit;
        this.voxelData = new Uint8Array(this.ysize * this.xzsize);
        this.voxelLight = new Uint8Array(this.voxelData.length);

        var xmax: int = this.xsize - 1;
        var ymax: int = this.ysize - 1;
        var zmax: int = this.zsize - 1;
        let _this=this;
        this.bound_xmin = new Uint16Array(this.ysize * this.zsize); this.bound_xmin.forEach(function (v, i){ _this.bound_xmin[i] = xmax; });
        this.bound_xmax = new Uint16Array(this.ysize * this.zsize); this.bound_xmax.fill(0);
        this.bound_ymin = new Uint16Array(this.xsize * this.zsize); this.bound_ymin.forEach(function (v, i){ _this.bound_ymin[i] = ymax; });
        this.bound_ymax = new Uint16Array(this.xsize * this.zsize); this.bound_ymax.fill(0);
        this.bound_zmin = new Uint16Array(this.xsize * this.ysize); this.bound_zmin.forEach(function (v, i) { _this.bound_zmin[i] = zmax; });
        this.bound_zmax = new Uint16Array(this.xsize * this.ysize); this.bound_zmax.fill(0);
        this.boundFace[0] = this.bound_xmin; this.boundFace[1] = this.bound_xmax;
        this.boundFace[2] = this.bound_ymin; this.boundFace[3] = this.bound_ymax;
        this.boundFace[4] = this.bound_zmin; this.boundFace[6] = this.bound_zmax;

        //for (var i = 0; i < 32; i++) {
        //lit2color[i] = (i<<10)+(i<<5)+i
        //}
    }

    pos2id(x: int, y: int, z: int): int {
        /* 在数据大的情况下，这个判断会严重降低速度
        if (true) {	//保护用，如果确认没有问题了，可以关掉以提高效率
            if (x < 0 || x >= xsize || y < 0 || y >= ysize || z < 0 || z >= zsize) {
                throw 'err 70';
            }
        }
        */
        return x + z * this.xsize + y * this.xzsize;
    }

    //根据一个0到32的值，返回一个认识的color值。 因为目前只能表示32级亮度
    //getColor(lit:int):int {
    //return lit2color[lit];
    //}

    findEdge(): void {
        var ci: int = 0;

        // 获取边界信息
        var x: int = 0;
        var y: int = 0;
        var z: int = 0;
        let zsize = this.zsize;
        let xsize = this.xsize;
        let ysize = this.ysize;
        let voxelData = this.voxelData;
        let edgeVoxids = this.edgeVoxids;
        //底面
        for (z = 0; z < zsize; z++) {
            for (x = 0; x < xsize; x++) {
                if (voxelData[this.pos2id(x, 0, z)])
                    edgeVoxids.push(x, 0, z);
            }
        }
        //上面
        y = ysize - 1;
        for (z = 0; z < zsize; z++) {
            for (x = 0; x < xsize; x++) {
                if (voxelData[this.pos2id(x, y, z)])
                    edgeVoxids.push(x, y, z);
            }
        }
        //左面
        x = 0;
        for (z = 0; z < zsize; z++) {
            for (y = 1; y < ysize - 1; y++) {	//不要把底面和上面再加一次
                if (voxelData[this.pos2id(x, y, z)])
                    edgeVoxids.push(x, y, z);
            }
        }
        //右面
        x = xsize - 1;
        for (z = 0; z < zsize; z++) {
            for (y = 1; y < ysize - 1; y++) {	//不要把底面和上面再加一次
                if (voxelData[this.pos2id(x, y, z)])
                    edgeVoxids.push(x, y, z);
            }
        }
        //前面
        z = zsize - 1;
        for (x = 1; x < xsize - 1; x++) {			// 不要考虑左右
            for (y = 1; y < ysize - 1; y++) {	//不要把底面和上面再加一次
                if (voxelData[this.pos2id(x, y, z)])
                    edgeVoxids.push(x, y, z);
            }
        }
        //后面
        z = 0;
        for (x = 1; x < xsize - 1; x++) {			// 不要考虑左右
            for (y = 1; y < ysize - 1; y++) {	//不要把底面和上面再加一次
                if (voxelData[this.pos2id(x, y, z)])
                    edgeVoxids.push(x, y, z);
            }
        }

        //先只考虑去掉外壳的。外壳的一定是边界的。 TODO
        let xzsize = this.xsize;
        ci += xzsize;//第2层
        for (y = 1; y < ysize - 1; y++) {
            for (z = 1; z < zsize - 1; z++) {
                ci = y * xzsize + z * xsize;
                for (x = 1; x < xsize - 1; x++) {
                    var cvid: int = ci + x;
                    var cv: int = voxelData[cvid];
                    if (cv) {
                        if (!voxelData[cvid + 1] 			// 右
                            || !voxelData[cvid - 1]			// 左
                            || !voxelData[cvid + xsize]		// 前
                            || !voxelData[cvid - xsize]		// 后
                            || !voxelData[cvid + xzsize]	// 上
                            || !voxelData[cvid - xzsize]	// 下
                        ) {
                            edgeVoxids.push(x, y, z);
                        }
                    }
                }
            }
        }
    }

    setBlockEnd(): void {
        this.findEdge();
        // 打印统计信息
        var voxelNum: int = 0;
        var x: int = 0;
        var y: int = 0;
        var z: int = 0;
        var ci: int = 0;
        let zsize = this.zsize;
        let xsize = this.xsize;
        let ysize = this.ysize;
        let voxelData = this.voxelData;
        for (y = 0; y < ysize; y++) {
            for (z = 1; z < zsize; z++) {
                for (x = 1; x < xsize; x++) {
                    if (voxelData[ci++] > 0) voxelNum++;
                }
            }
        }
        // 统计可见面
        var faceNum = 0;
        let _this = this;
        let xzsize = this.xzsize;
        this.forEachEdge(function (x: int, y: int, z: int) {
            var cpos: int = _this.pos2id(x, y, z);
            if (x == 0) {
                faceNum++;
                if (!voxelData[cpos + 1]) faceNum++;
            }
            else if (x == xsize - 1) {
                faceNum++;
                if (!voxelData[cpos - 1]) faceNum++;
            }
            else {
                if (!voxelData[cpos - 1]) faceNum++;
                if (!voxelData[cpos + 1]) faceNum++;
            }

            if (y == 0) {
                faceNum++;
                if (!voxelData[cpos + xzsize]) faceNum++;
            }
            else if (y == ysize - 1) {
                faceNum++;
                if (!voxelData[cpos - xzsize]) faceNum++;
            } else {
                if (!voxelData[cpos + xzsize]) faceNum++;
                if (!voxelData[cpos - xzsize]) faceNum++;
            }

            if (z == 0) {
                faceNum++;
                if (!voxelData[cpos + xsize]) faceNum++;
            }
            else if (z == zsize - 1) {
                faceNum++;
                if (!voxelData[cpos - xsize]) faceNum++;
            } else {
                if (!voxelData[cpos + xsize]) faceNum++;
                if (!voxelData[cpos - xsize]) faceNum++;
            }
        });

        console.log("世界大小:", xsize, ysize, zsize, ' 总共:', ysize * xzsize);
        console.log("总体素个数:", voxelNum);
        console.log('位于边缘的体素个数:', this.edgeVoxids.length / 3);
        console.log("边缘面数:", faceNum, ' 平均每格子可见面:', faceNum / (this.edgeVoxids.length / 3));
    }

    setCameraInfo(): void {

    }

    setBlock(x: int, y: int, z: int): void {
        let zsize = this.zsize;
        let xsize = this.xsize;
        let xzsize = this.xzsize;

        this.voxelData[x + z * xsize + y * xzsize] = 1;
        // 更新包围盒
        var yz: int = y * zsize + z;
        var xy: int = y * xsize + x;
        var xz: int = z * xsize + x;
        if (this.bound_xmin[yz] > x) this.bound_xmin[yz] = x;
        if (this.bound_xmax[yz] < x) this.bound_xmax[yz] = x;
        if (this.bound_ymin[xz] > y) this.bound_ymin[xz] = y;
        if (this.bound_ymax[xz] < y) this.bound_ymax[xz] = y;
        if (this.bound_zmin[xy] > z) this.bound_zmin[xy] = z;
        if (this.bound_zmax[xy] < z) this.bound_zmax[xy] = z;
    }

    //返回值如果>=0则表示遇到边界了
    isBound(x: int, y: int, z: int): int {
        var yz: int = y * this.zsize + z;
        var xy: int = y * this.xsize + x;
        var xz: int = z * this.xsize + x;
        if (x <= this.bound_xmin[yz]) return 0;
        if (x >= this.bound_xmax[yz]) return 1;
        if (y <= this.bound_ymin[xz]) return 2;
        if (y >= this.bound_ymax[xz]) return 3;
        if (z <= this.bound_zmin[xy]) return 4;
        if (z >= this.bound_zmax[xy]) return 5;
        return -1;
    }

    //已经出去边界了
    isOutBound(x: int, y: int, z: int): int {
        var yz: int = y * this.zsize + z;
        var xy: int = y * this.xsize + x;
        var xz: int = z * this.xsize + x;
        if (x < this.bound_xmin[yz]) return 0;
        if (x > this.bound_xmax[yz]) return 1;
        if (y < this.bound_ymin[xz]) return 2;
        if (y > this.bound_ymax[xz]) return 3;
        if (z < this.bound_zmin[xy]) return 4;
        if (z > this.bound_zmax[xy]) return 5;
        return -1;
    }

    isInShadow(x: int, y: int, z: int): Boolean {
        return !this.canPathEscape(x, y, z, this.lightInvLine);
    }

    /**
     * 遍历所有的边界点
     * @param	cb	(x,y,z)
     */
    forEachEdge(cb: Function) {
        var edgeNum: int = this.edgeVoxids.length / 3;
        let edgeVoxids = this.edgeVoxids;
        var st: int = 0;
        for (var i: int = 0; i < edgeNum; i++) {
            var x: int = edgeVoxids[st++];
            var y: int = edgeVoxids[st++];
            var z: int = edgeVoxids[st++];
            cb(x, y, z);
        }
    }

    set lightDir(dir: Vector3) {
        this._lightDir.x = dir.x;
        this._lightDir.y = dir.y;
        this._lightDir.z = dir.z;

        var len: int = 200;
        var ex: int = (-dir.x * len) | 0;
        var ey: int = (-dir.y * len) | 0;
        var ez: int = (-dir.z * len) | 0;

        this.lightInvLine.setEnd(ex, ey, ez);
    }

    /**
     * 重新计算阴影图。
     */
    recalcShadowMap(onend: Function): void {

    }

    /**
     * 同步重新计算
     */
    reclcShadowMapSync(): void {

    }

    setSize(x: int, y: int, z: int): void {

    }

    getLight(x: int, y: int, z: int, faceid: int): int {
        return 1;
        return this.voxelLight[this.pos2id(x, y, z)] / 255;
    }

    /**
     * 直接计算，不需要存储的。
     * @param	outmesh
     */
    updateLight1(outmesh: any): void {
        var maxLitFaceID = this.lightInvLine.maxLitFaceID;
        var faceLight = this.lightInvLine.faceLight;
        let _this = this;
        this.forEachEdge((x: int, y: int, z: int)=>{
            //var posidx: int = this.pos2id(x, y, z);
            //阴影的影响
            var canLit: Boolean = !_this.isInShadow(x, y, z);
            //输出结果
            for (var fi = 0; fi < 6; fi++) {
                var litface: Boolean = maxLitFaceID == fi;
                outmesh.ChangeOneFaceColor(x, y, z, fi, faceLight[fi] * ((canLit && litface) ? 1.0 : 0.5), false);
            }

        });
    }

    /**
     * 当前光线是否能不被遮挡
     * @param ray 位置偏移数组
     * @return
     */
    canPathEscape(x: int, y: int, z: int, ray: VoxelLightRay): Boolean {
        var line = ray.path;
        var lightLen = line.length / 3;
        var cx: int = 0;
        var cy: int = 0;
        var cz: int = 0;
        var maxx: int = this.xsize - 1;
        var maxy: int = this.ysize - 1;
        var maxz: int = this.zsize - 1;
        var cl: int = 0;
        let voxelData = this.voxelData;
        for (var l: int = 0; l < lightLen; l++) {
            cx = x + line[cl++];
            cy = y + line[cl++];
            cz = z + line[cl++];
            if (cx < 0 || cy < 0 || cz < 0 || cx >= maxx || cy >= maxy || cz >= maxz) {
                return true;
            }
            //是否有东西阻挡
            if (voxelData[this.pos2id(cx, cy, cz)]) {
                return false;
            }
        }
        return true;
    }
    /**
     * 获取当前点的直接照明效果
     * @param	x
     * @param	y
     * @param	z
     * @prame  faceLight 	6个面的亮度
     * @return
     */
    getDirectLight(x: int, y: int, z: int, faceLight: number[]): void {
        faceLight.fill(0);

        var faceSum = this.lightSphere.raysContrib;
        var light = this._lightDir; //注意方向
        var raye: Vector3;
        // 先直接计算 l = dot(light*ray)* dot(ray*norm) 
        let lightSphere = this.lightSphere;
        for (var ri: int = 0; ri < this.lightSphere.rays.length; ri++) {
            var ray: VoxelLightRay = lightSphere.rays[ri];
            raye = ray.dir;

            if (this.canPathEscape(x, y, z, ray)) {
                var dot1: number = Math.max(-(light.x * raye.x + light.y * raye.y + light.z * raye.z), 0); 	// 光线与采样线的dot
                for (var fi: int = 0; fi < 6; fi++) {
                    faceLight[fi] += dot1 * ray.faceLight[fi] / faceSum[fi];
                }
            }
        }
    }

    /**
     * GI
     * @param	outmesh
     */
    updateLight2(outmesh: any/*CubeMeshManager*/): void {
        //先把光照复原
        //voxelLight.fill(0);	// 先设成0

        // 第一遍计算
        this.forEachEdge((x: int, y: int, z: int)=>{
            //var posidx:int = pos2id(x, y, z);
            this.getDirectLight(x, y, z, this.tmpFaceLight);

            //输出结果
            for (var fi = 0; fi < 6; fi++) {
                outmesh.ChangeOneFaceColor(x, y, z, fi, this.tmpFaceLight[fi], false);
            }
        });

        // 第二遍计算
    }
}