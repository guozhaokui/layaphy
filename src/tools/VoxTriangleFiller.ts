import { Vector3 } from "laya/d3/math/Vector3";

export class VoxTriangleFiller {
    // 三角形信息的赋值通过直接修改成员变量完成
    static SWAPI: int = 6;
    v0 = new Uint32Array([0, 0, 0, 0, 0, 0, 0]);	// x,y,z,u,v,color,tmp	tmp是用来交换用的
    v1 = new Uint32Array([0, 0, 0, 0, 0, 0, 0]);
    v2 = new Uint32Array([0, 0, 0, 0, 0, 0, 0]);
    // 为了操作里面的浮点数:u,v
    v0f = new Float32Array(this.v0.buffer);
    v1f = new Float32Array(this.v1.buffer);
    v2f = new Float32Array(this.v2.buffer);

    static tmpVec30 = new Vector3();
    static tmpVec31 = new Vector3();
    static tmpVec32 = new Vector3();

    // 包围盒
    bbxx: int = 0;
    bbxy: int = 0;
    bbxz: int = 0;

    hascolor: boolean = false;
    fillCB: (x:int,y:int,z:int, u:f32, v:f32)=>void; 	// x:int, y:int, z:int, u:number, v:number
    faceDir: int = 0;			// 0 表示投影到yz,数组中的值为 yzx， 1 投影到xz,数组中的值是xzy, 2 投影到xy,数组中的值是xyz

    interpolate(min: number, max: number, gradient: number) {
        return min + (max - min) * gradient;
    }

    // y是当前y，pa,pb 是左起始线，pc,pd 是右结束线
    processScanLine(y: number,
        pa: Uint32Array, fpa: Float32Array, pb: Uint32Array, fpb: Float32Array,
        pc: Uint32Array, fpc: Float32Array, pd: Uint32Array, fpd: Float32Array): void {

        // 水平线的处理，需要考虑谁在左边,
        // papb 可能的水平
        //   pb-----pa
        //   pa
        //   \
        //    \
        //    pb
        //  或者
        //    /pa
        //   /
        //  pb pa-----pb
        // pcpd 可能的水平
        //    pc----pd
        //        pc
        //       /
        //      /
        //      pd
        //  或者
        //     pc
        //      \
        //       \pd
        //   pd---pc
        var gradient1 = pa[1] != pb[1] ? (y - pa[1]) / (pb[1] - pa[1]) : (pa[0] > pb[0] ? 1 : 0);	// y的位置，0 在pa， 1在pb
        var gradient2 = pc[1] != pd[1] ? (y - pc[1]) / (pd[1] - pc[1]) : (pc[0] > pd[0] ? 0 : 1); // pc-pd

        var sx: int = this.interpolate(pa[0], pb[0], gradient1) | 0;	// 
        var ex: int = this.interpolate(pc[0], pd[0], gradient2) | 0;
        var sz: number = this.interpolate(pa[2], pb[2], gradient1);	//[2]是被忽略的轴，不一定是z
        var ez: number = this.interpolate(pc[2], pd[2], gradient2);
        var su: number = this.interpolate(fpa[3], fpb[3], gradient1);
        var eu: number = this.interpolate(fpc[3], fpd[3], gradient2);
        var sv: number = this.interpolate(fpa[4], fpb[4], gradient1);
        var ev: number = this.interpolate(fpc[4], fpd[4], gradient2);

        var x: int = 0;
        var stepx: number = ex != sx ? 1 / (ex - sx) : 0;
        var kx: number = 0;
        var cz: int = sz;
        switch (this.faceDir) {
            case 0://yzx x是y，y是z，z是x
                for (x = sx; x <= ex; x++) {
                    cz = (this.interpolate(sz, ez, kx)) | 0;
                    this.fillCB(cz, x, y, this.interpolate(su, eu, kx), this.interpolate(sv, ev, kx));
                    kx += stepx;
                }
                break;
            case 1://xzy 即 x是x，y是z， z是y
                for (x = sx; x <= ex; x++) {
                    cz = (this.interpolate(sz, ez, kx)) | 0;
                    this.fillCB(x, cz, y, this.interpolate(su, eu, kx), this.interpolate(sv, ev, kx));
                    kx += stepx;
                }
                break;
            case 2://xyz x是x，y是y，z是z
                for (x = sx; x <= ex; x++) {
                    cz = (this.interpolate(sz, ez, kx)) | 0
                    this.fillCB(x, y, cz, this.interpolate(su, eu, kx), this.interpolate(sv, ev, kx));
                    kx += stepx;
                }
                break;
            default:
        }
    }

    /**
     *  问题： 只用一个方向填充总是会有漏洞
     * @param	cb
     */
    fill1(cb: (x:int,y:int,z:int, u:f32, v:f32)=>void): void {
        this.fillCB = cb;

        // 计算面的法线，确定忽略那个轴
        var e1 = VoxTriangleFiller.tmpVec30;
        var e2 = VoxTriangleFiller.tmpVec31;
        let v0 = this.v0;
        let v1 = this.v1;
        let v2 = this.v2;
        e1.x = v1[0] - v0[0];
        e1.y = v1[1] - v0[1];
        e1.z = v1[2] - v0[2];
        e2.x = v2[0] - v0[0];
        e2.y = v2[1] - v0[1];
        e2.z = v2[2] - v0[2];
        Vector3.cross(e1, e2, VoxTriangleFiller.tmpVec32);
        var v3 = VoxTriangleFiller.tmpVec32;
        var nx = Math.abs(v3.x);
        var ny = Math.abs(v3.y);
        var nz = Math.abs(v3.z);
        let SWAPI = VoxTriangleFiller.SWAPI;
        // 化成2d三角形
        var dir: int = 0;
        if (nx >= ny && nx >= nz) {// x轴最长，总体朝向x，忽略x轴
            //zyx
            v0[SWAPI] = v0[0]; v0[0] = v0[2]; v0[2] = v0[SWAPI];
            v1[SWAPI] = v1[0]; v1[0] = v1[2]; v1[2] = v1[SWAPI];
            v2[SWAPI] = v2[0]; v2[0] = v2[2]; v2[2] = v2[SWAPI];
            //yzx
            v0[SWAPI] = v0[0]; v0[0] = v0[1]; v0[1] = v0[SWAPI];
            v1[SWAPI] = v1[0]; v1[0] = v1[1]; v1[1] = v1[SWAPI];
            v2[SWAPI] = v2[0]; v2[0] = v2[1]; v2[1] = v2[SWAPI];
        } else if (ny >= nx && ny >= nz) {// y轴最长
            //xzy
            dir = 1;
            v0[SWAPI] = v0[1]; v0[1] = v0[2]; v0[2] = v0[SWAPI];
            v1[SWAPI] = v1[1]; v1[1] = v1[2]; v1[2] = v1[SWAPI];
            v2[SWAPI] = v2[1]; v2[1] = v2[2]; v2[2] = v2[SWAPI];
        } else {	// z轴最长
            //xyz
            dir = 2;
        }
        this.faceDir = dir;
        this.fill_2d();
    }

    /**
     * 3个点已经整理好了，只处理xy就行
     */
    fill_2d(): void {
        let v0 = this.v0;
        let v1 = this.v1;
        let v2 = this.v2;
        let v1f = this.v1f;
        let v2f = this.v2f;
        let v0f = this.v0f;

        // 三个点按照2d的y轴排序，下面相当于是展开的冒泡排序,p0的y最小
        var temp;
        if (v0[1] > v1[1]) {
            temp = v1; v1 = v0; v0 = temp;
            temp = v1f; v1f = v0f; v0f = temp;
        }

        if (v1[1] > v2[1]) {
            temp = v1; v1 = v2; v2 = temp;
            temp = v1f; v1f = v2f; v2f = temp;
        }

        if (v0[1] > v1[1]) {
            temp = v1; v1 = v0; v0 = temp;
            temp = v1f; v1f = v0f; v0f = temp;
        }

        var y: int = 0;
        var turnDir: number = (v1[0] - v0[0]) * (v2[1] - v0[1]) - (v2[0] - v0[0]) * (v1[1] - v0[1]);
        if (turnDir == 0) {	// 同一条线上

        } else if (turnDir > 0) {// >0 则v0-v2在v0-v1的右边，即向右拐
            // v0
            // -
            // -- 
            // - -
            // -  -
            // -   - v1
            // -  -
            // - -
            // -
            // v2
            for (y = v0[1]; y <= v2[1]; y++) {

                if (y < v1[1]) {
                    this.processScanLine(y, v0, v0f, v2, v2f, v0, v0f, v1, v1f);
                }
                else {
                    this.processScanLine(y, v0, v0f, v2, v2f, v1, v1f, v2, v2f);
                }
            }
        } else {	// 否则，左拐
            //       v0
            //        -
            //       -- 
            //      - -
            //     -  -
            // v1 -   - 
            //     -  -
            //      - -
            //        -
            //       v2
            for (y = v0[1]; y <= v2[1]; y++) {
                if (y < v1[1]) {
                    this.processScanLine(y, v0, v0f, v1, v1f, v0, v0f, v2, v2f);
                }
                else {
                    this.processScanLine(y, v1, v1f, v2, v2f, v0, v0f, v2, v2f);
                }
            }
        }
    }

    /**
     * 采用三个方向各扫描一次的方法
     * @param	cb
     */
    fill(cb: (x:int,y:int,z:int, u:f32,v:f32)=>void): void {
        let SWAPI = VoxTriangleFiller.SWAPI;
        let v0 = this.v0;
        let v1 = this.v1;
        let v2 = this.v2;
        this.fillCB = cb;
        //fill_xy();
        this.faceDir = 2;
        this.fill_2d();

        //fill_xz();
        //xzy
        v0[SWAPI] = v0[1]; v0[1] = v0[2]; v0[2] = v0[SWAPI];
        v1[SWAPI] = v1[1]; v1[1] = v1[2]; v1[2] = v1[SWAPI];
        v2[SWAPI] = v2[1]; v2[1] = v2[2]; v2[2] = v2[SWAPI];
        this.faceDir = 1;
        this.fill_2d();

        // 恢复顶点
        v0[SWAPI] = v0[1]; v0[1] = v0[2]; v0[2] = v0[SWAPI];
        v1[SWAPI] = v1[1]; v1[1] = v1[2]; v1[2] = v1[SWAPI];
        v2[SWAPI] = v2[1]; v2[1] = v2[2]; v2[2] = v2[SWAPI];

        //fill_yz();
        //zyx
        v0[SWAPI] = v0[0]; v0[0] = v0[2]; v0[2] = v0[SWAPI];
        v1[SWAPI] = v1[0]; v1[0] = v1[2]; v1[2] = v1[SWAPI];
        v2[SWAPI] = v2[0]; v2[0] = v2[2]; v2[2] = v2[SWAPI];
        //yzx
        v0[SWAPI] = v0[0]; v0[0] = v0[1]; v0[1] = v0[SWAPI];
        v1[SWAPI] = v1[0]; v1[0] = v1[1]; v1[1] = v1[SWAPI];
        v2[SWAPI] = v2[0]; v2[0] = v2[1]; v2[1] = v2[SWAPI];
        this.faceDir = 0;
        this.fill_2d();
    }
}
