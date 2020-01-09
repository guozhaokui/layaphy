import { Laya } from "Laya";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { ColorQuantization_Mediancut } from "./ColorQuantization_Mediancut";
import { OBJLoader_Material, OBJLoader_mesh } from "./ObjectFile";
import { VoxTriangleFiller } from "./VoxTriangleFiller";
import {Vec3} from "../math/Vec3";
import { SparseVoxData } from "../shapes/VoxelData";

/**
 * 使用方法：
 * 
 * var lv = new Lh2Voxel();
 * lv.setModelData(vertices,indices);
 * 
 * var ret = lv.renderToPalVoxel(sz, colornum);
 * 或者
 * var ret = lv.renderToVoxel(xsize);				
 * 		这种是不压缩颜色的。
 *
 * 如果要打印统计信息：
 * lv.printDbgInfo();
 * 
 * 如果不使用贴图信息：
 * lv.onlyMtl = true
 * 
 */
let int32v = new Uint32Array(1);
let sampleCol = [0, 0, 0, 0];

export class Mesh2Voxel {
    faceIndex: number[];
    vertexArray: any[] = [];	//[[x,y,z,u,v,Texture2D]]
    modelXSize = 0;	//模型包围盒
    modelYSize = 0;
    modelZSize = 0;
    minx = 0;
    miny = 0;
    minz = 0;

    gridXSize = 0;
    gridYSize = 0;
    gridZSize = 0;
    gridSize = 0.1;	//每个小方格的大小。单位是米

    trifiller = new VoxTriangleFiller();
    onlyMtl: boolean = false;	// 只用材质中的颜色
    // 统计信息
    duration_setModelData = 0;

    objmtl:OBJLoader_Material|null=null;

    onloadOk:()=>void;
    loadObj(url: string,gridsz:number, cb:(voxdata:SparseVoxData)=>void): void {
        Laya.loader.load(url, new Handler(this, (data:string)=>{
            let dt = this.voxelizeObjMesh(data,gridsz);
            let xn=this.gridXSize; let yn=this.gridYSize; let zn = this.gridZSize;
            let min=new Vec3(this.minx,this.miny,this.minz);
            let max=new Vec3(xn,yn,zn);
            min.addScaledVector(this.gridSize,max,max);
            let ret = new SparseVoxData(dt,xn,yn,zn,min,max);
            cb && cb(ret);
        }));
    }

    loadTmp(data:any,gridsz:number, cb:(voxdata:SparseVoxData)=>void): void {
		let dt = this.voxelizeTmpMesh(data,gridsz);
		let xn=this.gridXSize; let yn=this.gridYSize; let zn = this.gridZSize;
		let min=new Vec3(this.minx,this.miny,this.minz);
		let max=new Vec3(xn,yn,zn);
		min.addScaledVector(this.gridSize,max,max);
		let ret = new SparseVoxData(dt,xn,yn,zn,min,max);
		cb && cb(ret);
	}

    onLoadMtl(mtlstr:string):void{
    }
    
    parseObjMtl(mtlstr:string):OBJLoader_Material{
        var objmtl = this.objmtl = new OBJLoader_Material('root');
        objmtl.parse(mtlstr);
        return objmtl;
    }

    /**
     * 
     * @param data 
     * @param sz 小格子大小
     */
    voxelizeTmpMesh(data:any, sz:number){
        let verteices = data.vertices;
        var vertnum = verteices.length / 3;
        var vertex = [];
        for (var vi = 0; vi < vertnum; vi++) {
            vertex.push([
                verteices[vi * 3], verteices[vi * 3 + 1], verteices[vi * 3 + 2],    //x,y,z
                0, 0,             //u, v
                null]    //texture
            );
        }

        this.setModelData(vertex, data.indices);
        var ret = this.renderToVoxel(sz);
        return ret;
    }

    /**
     * 
     * @param data 
     * @param sz 小格子大小
     */
    voxelizeObjMesh(data:string, sz:number){
        // 加载obj文件
        var objmesh = new OBJLoader_mesh(data, null);
        // 所有的顶点，index，texture
        let verteices = objmesh.vertices;
        let textures = objmesh.textures;
        var vertnum = verteices.length / 3;
        var uvnum = textures.length / 2;
        let objmtl = this.objmtl;
        if (objmtl && vertnum != uvnum) 
            console.error('pos vertext num!=uv vertex num');
        //var mtls: Texture[] = [];
        var vertex = [];
        for (var vi = 0; vi < vertnum; vi++) {
            var tex: Texture2D | null = null;
            var mtlid = objmesh.vertexMaterialIndices[vi];  // 当前点的材质索引
            var mtlname = objmesh.materialNames[mtlid];     // 当前材质名称
            var mtl = objmtl && objmtl.materials[mtlname];
            if (mtl && mtl.mapDiffuse && mtl.mapDiffuse.filename) {
                tex = Laya.loader.getRes(mtl.mapDiffuse.filename);
            }
            vertex.push([
                verteices[vi * 3], verteices[vi * 3 + 1], verteices[vi * 3 + 2],    //x,y,z
                textures[vi * 2], 1 - textures[vi * 2 + 1],             //u, v
                tex]    //texture
            );
        }

        this.setModelData(vertex, objmesh.indices);
        var ret = this.renderToVoxel(sz);
        return ret;
    }


    /**
     * 设置模型数据。
     * 
     * @param	vertData 顶点数组。每个顶点又是一个数组。[x,y,z,u,v,texture2D][]
     * 			其中的 texture2D可以是一个数组，直接表示颜色,[r,g,b], rgb范围是0~1
     * @param	index	索引数组，例如 [0,1,2]
     */
    setModelData(vertData:any[], index: number[]) {
        console.time('setmodeldata');
        this.vertexArray = vertData.concat();
        vertData = this.vertexArray;

        let minx = 10000; let maxx = -10000;
        let miny = 10000; let maxy = -10000;
        let minz = 10000; let maxz = -10000;

        //计算包围盒
        for (var vi = 0; vi < vertData.length; vi++) {
            var cvert = vertData[vi];
            if (minx > cvert[0]) minx = cvert[0];
            if (miny > cvert[1]) miny = cvert[1];
            if (minz > cvert[2]) minz = cvert[2];
            if (maxx < cvert[0]) maxx = cvert[0];
            if (maxy < cvert[1]) maxy = cvert[1];
            if (maxz < cvert[2]) maxz = cvert[2];
        }
        this.minx=minx; 
        this.miny=miny;
        this.minz=minz;
        this.modelXSize = maxx - minx;
        this.modelYSize = maxy - miny;
        this.modelZSize = maxz - minz;

        //移动到正象限
        for (var vi = 0; vi < vertData.length; vi++) {
            var cvert = vertData[vi];
            cvert[0] -= minx;
            cvert[1] -= miny;
            cvert[2] -= minz;
        }

        this.faceIndex = index;
        console.timeEnd('setmodeldata');
    }

    /**
     * 采用最近采样。 注意不要保留返回值，因为是共享的。
     * @param	tex
     * @param	u
     * @param	v
     * @return
     */
    sampleTexture(tex: Texture2D|number[]|null, u: number, v: number):number[] {
        if (!tex) return [255, 255, 255, 255];
        if (tex instanceof Array)
            return [tex[0] * 255, tex[1] * 255, tex[2] * 255, 255];
        var x = ((tex.width * u) | 0) % tex.width;
        var y = ((tex.height * v) | 0) % tex.height;
        var dt = tex.getPixels();
        var st = (x + y * tex.width) * 4;
        sampleCol[0] = dt[st];
        sampleCol[1] = dt[st + 1];
        sampleCol[2] = dt[st + 2];
        sampleCol[3] = dt[st + 3];
        return sampleCol;
    }

    static colorToU32(colorArr: number[]): number {
        int32v[0] = (colorArr[2] << 16) | (colorArr[1] << 8) | colorArr[0];
        return int32v[0];
    }

    U32ToArray(color:number){
        int32v[0]=color;
        let ret = [0,0,0,0];    //r,g,b,a
        ret[3] = 255;
        ret[2] = (int32v[0]>>>16) & 0xff
        ret[1] =(int32v[0]>>8) & 0xff;
        ret[0] = int32v[0]&0xff;
        return ret;
    }


    /**
     * 把当前对象保存的模型数据转换成格子信息。
     * @param	gridsz   每个小格子的大小
     * @return  返回一个对象数组 {x:number,y:number,z:number, color:number[]}[]  表示在什么位置有什么颜色。
     */
    renderToVoxel(gridsz:number) {
        let modelXSize = this.modelXSize;
        let modelYSize = this.modelYSize;
        let modelZSize = this.modelZSize;
        console.log('modelsize ', modelXSize, modelYSize, modelZSize);

        let gridSize = this.gridSize = gridsz; 

        let trifiller = this.trifiller;
        this.gridXSize = Math.max(Math.ceil(modelXSize / gridSize), 1)+1;// +1是解决正好在最边上的问题
        this.gridYSize = Math.max(Math.ceil(modelYSize / gridSize), 1)+1;
        this.gridZSize = Math.max(Math.ceil(modelZSize / gridSize), 1)+1;

        var ret1:{x:number,y:number,z:number,color:number}[] = [];		//x,y,z,color
        var ret:number[][] = [];			//三维数组

        console.time('格子化');
        let faceIndex = this.faceIndex;
        let vertexArray = this.vertexArray;
        var faceNum = faceIndex.length / 3;
        var gridnum = 0;
        var fidSt = 0;
        for (var fi = 0; fi < faceNum; fi++) {
            //取出纹理对象
            var vert0 = vertexArray[faceIndex[fidSt++]];
            var vert1 = vertexArray[faceIndex[fidSt++]];
            var vert2 = vertexArray[faceIndex[fidSt++]];
            //三个顶点的贴图必然一致。只取第一个就行了
            var tex: Texture2D = vert0[5];
            trifiller.v0[0] = (vert0[0] / gridSize + 0.5) | 0;
            trifiller.v0[1] = (vert0[1] / gridSize + 0.5) | 0;
            trifiller.v0[2] = (vert0[2] / gridSize + 0.5) | 0;
            trifiller.v0f[3] = vert0[3];
            trifiller.v0f[4] = vert0[4];

            trifiller.v1[0] = (vert1[0] / gridSize + 0.5) | 0;
            trifiller.v1[1] = (vert1[1] / gridSize + 0.5) | 0;
            trifiller.v1[2] = (vert1[2] / gridSize + 0.5) | 0;
            trifiller.v1f[3] = vert1[3];
            trifiller.v1f[4] = vert1[4];

            trifiller.v2[0] = (vert2[0] / gridSize + 0.5) | 0;
            trifiller.v2[1] = (vert2[1] / gridSize + 0.5) | 0;
            trifiller.v2[2] = (vert2[2] / gridSize + 0.5) | 0;
            trifiller.v2f[3] = vert2[3];
            trifiller.v2f[4] = vert2[4];

            // TODO 现在的uv其实是不对的，应该根据重心坐标重新计算
            trifiller.fill((x:i32, y:i32, z:i32, u: number, v: number)=>{
                var gridid = x << 20 | y << 10 | z;
                var col = this.sampleTexture(tex, u, v);//[u*255,v*255,0,255];//
                var curcoldt = ret[gridid];
                if (!curcoldt) {
                    ret[gridid] = [col[0], col[1], col[2], 255, 1];
                    gridnum++;
                }
                else {
                    curcoldt[0] += col[0];
                    curcoldt[1] += col[1];
                    curcoldt[2] += col[2];
                    //curcoldt[3] += col[3];
                    curcoldt[4]++;	// 多少个点
                }
            });
        }
        console.timeEnd('格子化');
        console.time('求平均值-输出');
        ret1.length = gridnum;
        gridnum = 0;
        let repeatNum = 0;
        //整理结果，每个格子只保留平均值
        //var keys:Array = Object.keys(ret);
        for (let posid in ret) {
            let iposid = parseInt(posid)
            let colsum = ret[posid];
            let rsum = colsum[0];
            let gsum = colsum[1];
            let bsum = colsum[2];
            let cnum = colsum[4];
            repeatNum += cnum;
            let r = (rsum/cnum)|0;
            let g = (gsum/cnum)|0;
            let b = (bsum/cnum)|0;
            let color = (r<<16) + (g<<8) + b
            ret1[gridnum++] = { x: iposid >>> 20, y: (iposid >> 10) & 0x3ff, z: iposid & 0x3ff, color:color };
            //ret1.push( );
        }
        console.timeEnd('求平均值-输出');
		console.log(`总格子数目[${this.gridXSize},${this.gridYSize},${this.gridZSize}]：`,this.gridXSize*this.gridYSize*this.gridZSize,' 有效格子=', gridnum, '每个格子重复度:', (repeatNum / gridnum));
		// 这里必须清理ret， 否则会被上面的 trifiller.fill 的回调函数引用而无法释放
		ret.length=0;
        return ret1;
    }


    //这个不需要了。转voxel都用原色就行
    /**
     * 
     * @param	xsize  		x方向上的格子数量，根据包围盒可以知道每个格子的大小。
     * @param	colorNum	颜色数。现在都是256就行。
     * @return
     */
    renderToPalVoxel(xsize: int, colorNum: int = 256): Object {
        var ret = this.renderToVoxel(xsize);
        console.time('renderToPalVoxel计算调色板');
        var i: int = 0;
        // 统计所有的颜色
        var origColor: Uint8Array = new Uint8Array(ret.length * 4);
        for (i = 0; i < ret.length; i++) {
            var colarr = this.U32ToArray(ret[i].color);
            origColor[i * 4] = colarr[0] | 0;
            origColor[i * 4 + 1] = colarr[1] | 0;
            origColor[i * 4 + 2] = colarr[2] | 0;
            origColor[i * 4 + 3] = 255;
        }
        // 转成调色板
        var reducer = new ColorQuantization_Mediancut();
        var pal = reducer.mediancut(origColor, colorNum);
        var idxRet = new Uint8Array(ret.length);
        // 获得原始颜色的索引
        for (i = 0; i < ret.length; i++) {
            var colarr = this.U32ToArray(ret[i].color);
            var r: int = colarr[0] | 0;
            var g: int = colarr[1] | 0;
            var b: int = colarr[2] | 0;
            var idx: int = reducer.getNearestIndex(r, g, b, pal);
            idxRet[i] = idx;
            // TEST 原始颜色转成调色板颜色
            colarr[0] = pal[idx * 3];
            colarr[1] = pal[idx * 3 + 1];
            colarr[2] = pal[idx * 3 + 2];
        }
        console.timeEnd('renderToPalVoxel计算调色板');
        return { palcolor: ret, pal: pal, idx: idxRet };
    }
}
