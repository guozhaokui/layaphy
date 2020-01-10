import { Vector3 } from "laya/d3/math/Vector3";

export class VoxTriangleFiller {
    // 三角形信息的赋值通过直接修改成员变量完成
    v0 = [0, 0, 0, 0, 0, 0, 0];	// x,y,z,u,v,color,tmp	tmp是用来交换用的
    v1 = [0, 0, 0, 0, 0, 0, 0];
	v2 = [0, 0, 0, 0, 0, 0, 0];
	private nV0:int[]=[0,0,0];			//格子，
	private nV1:int[]=[0,0,0];
	private nV2:int[]=[0,0,0];
	private norm= new Vector3();
	private normArr=[0,0,0];
	private planeD=0;
	private hasnorm=false;
	gridsz=1;
	private curGrid:int[]=[0,0,0];

    static tmpVec30 = new Vector3();
    static tmpVec31 = new Vector3();
    static tmpVec32 = new Vector3();

	// 包围盒
	private nmin=[0,0,0];
	private nmax=[1,1,1];

    hascolor: boolean = false;
    fillCB: (x:int,y:int,z:int, u:f32, v:f32)=>void; 	// x:int, y:int, z:int, u:number, v:number

    private interpolate(min: number, max: number, gradient: number) {
        return min + (max - min) * gradient;
    }

    // y是当前y，pa,pb 是左起始线，pc,pd 是右结束线
    processScanLine(y: int,pa:int[], pb:int[], pc:int[], pd:int[], axisID:int): void {
		let xid = (axisID+1)%3;
		let yid = (axisID+2)%3;
		let w = this.gridsz;
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
		// gradient1 = (y-pa.y) /(pb.y-pa.y) 然后根据这个计算对应的 sx,sz 
		//let fy = (y+0.5)*w;
        var gradient1 = pa[yid] != pb[yid] ? (y - pa[yid]) / (pb[yid] - pa[yid]) : (pa[xid] > pb[xid] ? 1 : 0);	// y的位置，0 在pa， 1在pb
        var gradient2 = pc[yid] != pd[yid] ? (y - pc[yid]) / (pd[yid] - pc[yid]) : (pc[xid] > pd[xid] ? 0 : 1); // pc-pd

        var sx: int = Math.round(this.interpolate(pa[xid], pb[xid], gradient1));	// 
        var ex: int = Math.round(this.interpolate(pc[xid], pd[xid], gradient2));
        //var su: number = this.interpolate(fpa[3], fpb[3], gradient1);
        //var eu: number = this.interpolate(fpc[3], fpd[3], gradient2);
        //var sv: number = this.interpolate(fpa[4], fpb[4], gradient1);
        //var ev: number = this.interpolate(fpc[4], fpd[4], gradient2);

		var x: int = 0;
		// x每一步走多少
        //var stepx: number = ex != sx ? 1 / (ex - sx) : 0;
		//var kx: number = 0;
		let min = this.nmin;
		let max = this.nmax;
		let grid = this.curGrid;
		grid[axisID]=0;
		grid[yid]=y;
		let norm = this.normArr;
		let planeD = this.planeD;
		for (x = sx; x <= ex; x++) {
			grid[xid]=x;
			this.hitRange(min,max,grid,norm, planeD, axisID);
		}
    }

	/**
	 * 
	 * @param min  格子范围。包含
	 * @param max 	包含
	 * @param grid	当前格子。就是平面三角形所在格子 
	 * @param norm 	p.norm=d
	 * @param d 
	 * @param axis 射线方向,x=0,y=1,z=2
	 */
	private hitRange(min:int[], max:int[], grid:int[], norm:number[], d:number, axis:int){
		let w = this.gridsz;
		let nax  = (axis+1)%3;
		let nnax = (axis+2)%3;
		let fnax  = (grid[nax ]+0.5)*w;
		let fnnax = (grid[nnax ]+0.5)*w;
		let v1 = (norm[nax]*fnax+norm[nnax]*fnnax);
		let normax = norm[axis];
		let fax =(d - v1)/normax;
		let cx = Math.round(fax/this.gridsz);
		let cb = this.fillCB;
		let planed = this.planeD;

		let hw=w/2*1.414;
		// 必须要上下都找，并且一直找到超出距离。因为这个可能倾斜着靠着轴
		// 向上
		let maxv = max[axis];
		for(let xi=cx; xi<=maxv ;xi++ ){
			// 计算中心位置到平面的距离
			grid[axis]=xi;
			let d1 = v1+normax*(xi+0.5)*w-planed;
			if(d1<=hw&&d1>=-hw)
				cb(grid[0],grid[1],grid[2],0,0);
		}

		// 向下
		let minv = min[axis];
		for( let xi=cx-1; xi>=minv; xi--){
			grid[axis]=xi;
			let d1 = v1+normax*(xi+0.5)*w-planed;
			if(d1<=hw&&d1>=-hw)
				cb(grid[0],grid[1],grid[2],0,0);
		}
	}

    fill_2d(axisID:int): void {
        let v0 = this.v0;
        let v1 = this.v1;
		let v2 = this.v2;
		let nv0 = this.nV0;
		let nv1 = this.nV1;
		let nv2 = this.nV2;

		// 三个点按照2d的y轴排序，下面相当于是展开的冒泡排序,p0的y最小
		let xid = (axisID+1)%3;
		let yid = (axisID+2)%3;
		var temp;
		var temp1;
        if (nv0[yid] > nv1[yid]) {
			temp = nv1; nv1 = nv0; nv0 = temp;
			temp1 = v1; v1=v0; v0=temp1;
        }

        if (nv1[yid] > nv2[yid]) {
            temp = nv1; nv1 = nv2; nv2 = temp;
            temp1 = v1; v1 = v2; v2 = temp1;
        }

        if (nv0[yid] > nv1[yid]) {
            temp = nv1; nv1 = nv0; nv0 = temp;
            temp1 = v1; v1 = v0; v0 = temp1;
        }

        var y: int = 0;
        var turnDir: number = (nv1[xid] - nv0[xid]) * (nv2[yid] - nv0[yid]) - (nv2[xid] - nv0[xid]) * (nv1[yid] - nv0[yid]);
		if (turnDir >= 0) {// >0 则v0-v2在v0-v1的右边，即向右拐。 在一条线上也走这个流程
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
            for (y = nv0[yid]; y <= nv2[yid]; y++) {
				// y分成两部分处理
                if (y < nv1[yid]) {
					// 上半部分。 v0-v2 扫描到 v0-v1
                    this.processScanLine(y, nv0, nv2, nv0, nv1,axisID);
                }
                else {
                    this.processScanLine(y, nv0, nv2, nv1, nv2,axisID);
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
            for (y = nv0[yid]; y <= nv2[yid]; y++) {
                if (y < nv1[yid]) {
                    this.processScanLine(y, nv0, nv1, nv0, nv2,axisID);
                }
                else {
                    this.processScanLine(y, nv1, nv2, nv0, nv2,axisID);
                }
            }
        }
    }

	setNorm(x:number,y:number,z:number){
		this.norm.x=x; 
		this.norm.y=y;
		this.norm.z=z;
		this.hasnorm=true;
	}

	/**
	 * 先填上v0,v1,v2
	 * @param cb 
	 */
	fill(cb: (x:int,y:int,z:int, u:f32,v:f32)=>void){
        let v0 = this.v0;
        let v1 = this.v1;
		let v2 = this.v2;
		this.fillCB = cb;
		let nv0=this.nV0;
		let nv1=this.nV1;
		let nv2=this.nV2;
		let gridsz = this.gridsz;
		nv0[0] = (v0[0]/gridsz)|0;	//这个不能用round, 因为就是要定位在哪个格子中
		nv0[1] = (v0[1]/gridsz)|0;
		nv0[2] = (v0[2]/gridsz)|0;

		nv1[0] = (v1[0]/gridsz)|0;
		nv1[1] = (v1[1]/gridsz)|0;
		nv1[2] = (v1[2]/gridsz)|0;

		nv2[0] = (v2[0]/gridsz)|0;
		nv2[1] = (v2[1]/gridsz)|0;
		nv2[2] = (v2[2]/gridsz)|0;

		let norm = this.norm;
		if(!this.hasnorm){
			var e1 = VoxTriangleFiller.tmpVec30;
			var e2 = VoxTriangleFiller.tmpVec31;
			e1.x = v1[0] - v0[0];
			e1.y = v1[1] - v0[1];
			e1.z = v1[2] - v0[2];
			e2.x = v2[0] - v0[0];
			e2.y = v2[1] - v0[1];
			e2.z = v2[2] - v0[2];
			Vector3.cross(e1, e2, norm);
			Vector3.normalize(norm,norm);
		}

		this.normArr[0]=norm.x;
		this.normArr[1]=norm.y;
		this.normArr[2]=norm.z;
		this.planeD =  norm.x*v0[0]+norm.y*v0[1]+norm.z*v0[2];
	
		let min = this.nmin;
		min[0] = Math.min(nv0[0],nv1[0],nv2[0]);
		min[1] = Math.min(nv0[1],nv1[1],nv2[1]);
		min[2] = Math.min(nv0[2],nv1[2],nv2[2]);
		let max = this.nmax;
		max[0] = Math.max(nv0[0],nv1[0],nv2[0]);
		max[1] = Math.max(nv0[1],nv1[1],nv2[1]);
		max[2] = Math.max(nv0[2],nv1[2],nv2[2]);
		// 确定投影方向
		let normx = Math.abs(norm.x);
		let normy = Math.abs(norm.y);
		let normz = Math.abs(norm.z);
		if(normx>=normy&&normx>=normz){ //x轴最大，投影到yz平面
			this.fill_2d(0);
		}else if(normy>=normx&&normy>=normz){//y轴最大，投影到xz平面
			this.fill_2d(1);
		}else{//z轴最大，投影到xy平面
			this.fill_2d(2);
		}

		// hasnorm是一次性的
		this.hasnorm=false;
	}

}
