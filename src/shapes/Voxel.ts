import { RaycastResult } from "../collision/RaycastResult";
import { Mat3 } from "../math/Mat3";
import { Quaternion } from "../math/Quaternion";
import { Vec3 } from "../math/Vec3";
import { Box } from "./Box";
import { Shape, SHAPETYPE } from "./Shape";
import { IOrigVoxData, VoxelBitData, SparseVoxData, CubeModule, POT } from "./VoxelData";

export class Voxel extends Shape {
	voxData: IOrigVoxData;//|PhyVoxelData;
	//data:Uint8Array;
	//bitData:Uint8Array;
	bitDataLod: VoxelBitData[];
	dataxsize = 0;
	dataysize = 0;
	datazsize = 0;
	cpos=new Vec3();	// 重心坐标的原点。quat是相对于这个的，如果静态对象可以简单设置为包围盒的中心
	quat: Quaternion;
	pos:Vec3 ;// 目前是一个临时引用，不可以跨函数
	centroid: Vec3 = new Vec3();	// 在voxData坐标系下的质心 @TODO 转换
	mat: Mat3;   // 相当于记录了xyz的轴
	/** 别的形状都是直接改变参数，这里为了简单通用，记下了scale。注意非均匀缩放是有问题的。动态改变的话会破坏刚体的假设 */
	scale:Vec3|null = null;
	invScale:Vec3|null = null;
	maxScale=1;

	aabbmin = new Vec3();			// 当前的aabb
	aabbmax = new Vec3();
	addToSceTick = -1;  // 
	gridw = 0;
	/** 简化为box时的情况 */
	box:Box|null = null; 	

	constructor(dt: SparseVoxData|CubeModule,scale:number=1) {
		super();
		this.type = SHAPETYPE.VOXEL;

		if(dt instanceof SparseVoxData){
			this.initFromSparseVoxData(dt,scale);
		}else{
			this.initFromCubeModule(dt,scale)
		}
	}

	private initFromSparseVoxData(sparsedt:SparseVoxData,scale:number){
		var dt = this.voxData ={
			//data:sparsedt.data,
			aabbmin:sparsedt.aabbmin,
			aabbmax:sparsedt.aabbmax,
			travAll:sparsedt.travAll,
			dataszx:sparsedt.dataszx,
			dataszy:sparsedt.dataszy,
			dataszz:sparsedt.dataszz,
			fillVoxBitData:(dt:VoxelBitData)=>{
				sparsedt.data.forEach(v => {
					dt.setBit(v.x, v.y, v.z);
				});
			}
		}; 
		this.initFromVData(dt,scale);
	}

	/** 从layame的格子信息中构造。注意可能有效率问题 */
	private initFromCubeModule(cubedt:CubeModule, scale:number){
		var dt = this.voxData ={
			//data:null,
			aabbmin:new Vec3(-cubedt._dx,-cubedt._dy,-cubedt._dz),
			aabbmax:new Vec3(cubedt._lx-cubedt._dx,cubedt._ly-cubedt._dy,cubedt._lz-cubedt._dz),
			//travAll:null,
			dataszx:cubedt._lx,
			dataszy:cubedt._ly,
			dataszz:cubedt._lz,
			fillVoxBitData:(dt:VoxelBitData)=>{
				let bufdt = cubedt._data;
				let xlen = cubedt._lx;
				let ylen = cubedt._ly;
				let zlen = cubedt._lz;
				let xzlen = xlen*zlen;
				let dtlen = xzlen*ylen;
				let cpos =0;
				let num = Math.min( (dtlen>>3)+1, bufdt.length);
				for(let i=0; i<num; i++){
					if(bufdt[i]==0){
						cpos+=8;
						continue;
					}
					let v = bufdt[i];
					for(let bi=0; bi<8 && cpos<dtlen; bi++){
						let cy = (cpos/xzlen)|0;
						let left = (cpos%xzlen);
						let cz = (left/xlen)|0;
						let cx = left%xlen;
						if(v&(1<<bi)){
							dt.setBit(cx,cy,cz);
						}
						cpos++;
					}
				}
				//@ts-ignore
				bufdt =null;
			}
		}; 
		this.initFromVData(dt,scale);
	}

	/**
	 * 根据定义的中间接口构造
	 * @param dt 
	 * @param scale 
	 */
	private initFromVData(dt:IOrigVoxData,scale:number){
		let min = this.aabbmin;
		let max = this.aabbmax;
		dt.aabbmin.scale(scale,dt.aabbmin);
		dt.aabbmax.scale(scale,dt.aabbmax);
		min.copy(dt.aabbmin);
		max.copy(dt.aabbmax);

		this.gridw = ((max.x - min.x) / dt.dataszx);

		let xs = this.dataxsize = dt.dataszx;
		let ys = this.dataysize = dt.dataszy;
		let zs = this.datazsize = dt.dataszz;

		let maxsize = Math.max(xs, ys, zs);
		let maxpot = POT(maxsize);
		let lodlv = Math.log2(maxpot);
		this.bitDataLod = new Array<VoxelBitData>(lodlv);
		//let clv = lodlv - 1;
		let clv = 0;
		let cdt = this.bitDataLod[clv] = new VoxelBitData(xs, ys, zs, min,max);
		//设置末级数据
		dt.fillVoxBitData(cdt);

		//设置各级数据
		while (cdt) {
			cdt = cdt.genParent() as VoxelBitData;
			if (cdt) {
				this.bitDataLod[++clv] = cdt;
			}
		}
	}

	/**
	 * 按照box来处理voxel
	 * @param b 
	 */
	setAsBox(b:boolean):void{
		let min = this.aabbmin;
		let max = this.aabbmax;
		if(b){
			if(!this.box){
				
			}
		}else{

		}
	}

	/**
	 * voxel的缩放只能是均匀的。
	 * @param x 
	 * @param y 
	 * @param z 
	 * @param recalcMassProp 
	 */
	setScale(x:number,y:number,z:number, recalcMassProp:boolean=false){
		if(!this.scale){
			this.scale = new Vec3(x,y,z);
		}else{
			this.scale.set(x,y,z);
		}

		if(!this.invScale){
			this.invScale = new Vec3(1/x,1/y,1/z);
		}else{
			this.invScale.set(1/x,1/y,1/z);
		}

		this.maxScale = Math.max(Math.abs(x),Math.abs(y),Math.abs(z));
	}

	updateAABB(): void {
		// 变换vox的包围盒
		Box.calculateWorldAABB1(this.pos, this.quat, this.scale, this.voxData.aabbmin, this.voxData.aabbmax, this.aabbmin, this.aabbmax);
		// TODO 转成矩阵
		/*
		let mat = this.mat;
		mat.identity();
		mat.setRotationFromQuaternion(this.quat);
		mat.scale(this.scale, mat);
		*/
	}

	// 不同的实现这个函数不同
	getVox(x: i32, y: i32, z: i32) {
		let dt = this.bitDataLod[0];
		return dt.getBit(x, y, z);
	}

	calcCentroid(): void {
		console.error( 'not need');
		let sx = 0;
		let sy = 0;
		let sz = 0;
		if( this.voxData.travAll){
			let i = 0;
			this.voxData.travAll((x, y, z, v) => {
				if (v) {
					sx += x;
					sy += y;
					sz += z;
					i++;
				}
			});
			sx /= i; // 是浮点数
			sy /= i;
			sz /= i;
			let c = this.centroid;
			c.x = sx; c.y = sy; c.z = sz;
		}else{

		}
	}

	// 计算相对于质心的转动惯量。
	calculateLocalInertia(mass: number, target: Vec3): void {
		console.error( 'not need');
		let c = this.centroid;
		target.x = 0;
		target.y = 0;
		target.z = 0;
		let grid = this.gridw;//.voxData.gridsz;
		let sx = grid;
		let sy = grid;
		let sz = grid;
		if(this.scale){
			sx*=this.scale.x;
			sy*=this.scale.y;
			sz*=this.scale.z;
		}
		if(this.voxData.travAll){
			this.voxData.travAll((x, y, z, v) => {
				if (v) {
					let dx = x - c.x;	// 没有考虑实际缩放，最后集中处理
					let dy = y - c.y;
					let dz = z - c.z;
					let dx2 = dx * dx;
					let dy2 = dy * dy;
					let dz2 = dz * dz;
					target.x += dy2 + dz2;
					target.y += dx2 + dz2;
					target.z += dx2 + dy2;
				}
			});
		}

		target.x *= (sx * sx * mass);	 // 根据缩放和格子大小转换为实际距离。上面是平方，所以这也是
		target.y *= (sy * sy * mass);
		target.z *= (sz * sz * mass);
	}

	// 用世界空间的包围盒来检查碰撞
	AABBCheck(min: Vec3, max: Vec3, onlytest: boolean = true): boolean {
		// 在不考虑父对象导致的变形的情况下，本地只有旋转缩放，求逆可以比较容易
		// 根据包围盒大小选择合适的lod等级
		let szx = max.x - min.x; let szy = max.y - min.y; let szz = max.z - min.z;
		let lod = this.getLOD(szx, szy, szz);
		return false;
	}

	// 参数是local空间的盒子大小
	getLOD(szx: f32, szy: f32, szz: f32): i32 {
		let iscale = this.invScale;
		let sx = 1; let sy=1; let sz=1;
		if(iscale){
			sx=iscale.x;
			sy=iscale.y;
			sz=iscale.z;
		}
		let szmax = Math.max(szx*sx, szy*sy, szz*sz);
		let lod = Math.round(Math.log2(szmax));
		return lod;
	}

	getLODByW(w: number) {
		let k = (w / this.gridw) | 0;	// 0~1024对应0到10级
		this.gridw
	}

	updateBndSphR(): void {
		let min = this.voxData.aabbmin;
		let max = this.voxData.aabbmax;
		let mx = Math.max(Math.abs(max.x), Math.abs(min.x));
		let my = Math.max(Math.abs(max.y), Math.abs(min.y));
		let mz = Math.max(Math.abs(max.z), Math.abs(min.z));
		this.boundSphR = Math.sqrt(mx * mx + my * my + mz * mz)*this.maxScale;
	}

	calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void {
		this.pos = pos;
		this.quat = quat;
		this.updateAABB();
		min.copy(this.aabbmin);
		max.copy(this.aabbmax);
	}

	onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void {
		throw new Error("Method not implemented.");
	}

	setData(dt: Uint8Array, xnum: i32, ynum: i32, znum: i32, xs: f32, ys: f32, zs: f32): void {
		// 重新组织数据        
		// 生成LOD数据
	}


	fill() {
	}

	volume(): number {
		throw new Error("Method not implemented.");
	}

	hitPlane(myPos: Vec3, planePos: Vec3, planeNorm: Vec3, hitPos: Vec3): f32 {
		throw 'no';
	}

	hitVoxel(otherPos: Vec3, otherQuat: Quaternion, hitPos: Vec3): f32 {
		throw 'no'
	}

	checkAABB(): boolean {
		throw 'no'
	}

	checkSphere(pos: Vec3, r: f32, hitnorm: Vec3): f32 {
		return 0;
	}

	// 获取xyz的法线
	getNormal(x: i32, y: i32, z: i32, nout: Vec3): Vec3 {
		// 根据x,y,z的梯度变化
		throw 'NI';
	}

	hitCapsule() {
	}

	rayCast(ori: Vec3, dir: Vec3): RaycastResult {
		throw 'noimp';
	}

	/**
	 * 取出某一层的某个区域边信息，注意结果不允许保存 
	 * @param dirid 哪个方向， 0表示yz平面  1表示xz平面 2表示xy平面
	 * @param id  0表示0层的底
	 */
	getEdge(dirid: i32, id: i32, ustart: i32, vstart: i32, uend: i32, vend: i32): number[] {
		let edge = getEdge_edge;
		edge.length = 0;

		switch (dirid) {
			case 0://yz平面
				break;
			case 1://xz平面
				break;
			case 2://xy平面
				break;
		}
		return edge;
	}


	pointToWorld(pt:Vec3, out:Vec3):Vec3{
		if(this.scale){
			pt.vmul(this.scale,out);
			this.quat.vmult(out,out);
		}else
			this.quat.vmult(pt,out);
		out.vadd(this.pos,out);
		return out;
	}

	/**
	 * 把格子坐标xyz，根据pos和Q转换成世界坐标min,max
	 * @param x 
	 * @param y 
	 * @param z 
	 * @param pos 
	 * @param Q 
	 * @param min 
	 * @param max 
	 */
	xyzToPos(x:int,y:int,z:int, pos:Vec3, Q:Quaternion, min:Vec3, max:Vec3){
		let w = this.gridw;
		let orimin = this.voxData.aabbmin;
		let orimax = this.voxData.aabbmax;
		let scale = this.scale;

		min.set(x*w,y*w,z*w);
		min.vadd(orimin, min);
		if(scale)
			min.vmul(scale,min);

		Q.vmult(min,min);
		min.vadd(pos,min);

		max.set(x*w+w,y*w+w,z*w+w);
		max.vadd(orimin, max);
		if(scale)
			max.vmul(scale,max);
		Q.vmult(max,max);
		max.vadd(pos,max);
	}

	//3dline
	/**
	 * 射线经过voxle的路径。原理是每次根据碰撞到每个分隔面的时间取最近的。
	 * @param st  voxel空间的起点
	 * @param ed  voxel空间的终点
	 * @param visitor 返回true则继续
	 */
	rayTravel(st: Vec3, ed: Vec3, visitor: (x: int, y: int, z: int, has:boolean) => boolean) {
		let w = this.gridw;
		let min = this.voxData.aabbmin;
		let max = this.voxData.aabbmax;

		//先用包围盒裁剪
		let nst = trav_tmpV1;
		let ned = trav_tmpV2;

		if (!Box.rayHitBox(st, ed, min, max, nst, ned))
			return;

		//debug
		//let phyr =  getPhyRender();
		//let wpos = new Vec3();
		//phyr.addPersistPoint( this.pointToWorld(nst, wpos));
		//phyr.addPersistPoint( this.pointToWorld(ned,wpos));
		//debug

		//dir
		let nx = ned.x - nst.x;
		let ny = ned.y - nst.y;
		let nz = ned.z - nst.z;
		let len = nx * nx + ny * ny + nz * nz;
		let dirx = nx / len;
		let diry = ny / len;
		let dirz = nz / len;

		// 起点格子
		let x0 = ((nst.x - min.x) / w) | 0;	// 不可能<0所以可以直接 |0
		let y0 = ((nst.y - min.y) / w) | 0;
		let z0 = ((nst.z - min.z) / w) | 0;

		// 终点格子
		let x1 = ((ned.x - min.x) / w) | 0;
		let y1 = ((ned.y - min.y) / w) | 0;
		let z1 = ((ned.z - min.z) / w) | 0;

		// 由于点可能在边缘，因此有可能正好超出，做一下保护
		let maxx = this.dataxsize-1;
		let maxy = this.dataysize-1;
		let maxz = this.datazsize-1;
		if(x0>maxx) x0=maxx;
		if(x1>maxx) x1=maxx;
		if(y0>maxy) y0=maxy;
		if(y1>maxy) y1=maxy;
		if(z0>maxz) z0=maxz;
		if(z1>maxz) z1=maxz;

		//确定前进方向
		let sx = x1 > x0 ? 1 : x1 < x0 ? -1 : 0;
		let sy = y1 > y0 ? 1 : y1 < y0 ? -1 : 0;
		let sz = z1 > z0 ? 1 : z1 < z0 ? -1 : 0;

		// 从开始到结束的长度
		let fdx = Math.abs(ned.x - nst.x);
		let fdy = Math.abs(ned.y - nst.y);
		let fdz = Math.abs(ned.z - nst.z);

		let absdirx = Math.abs(dirx);
		let absdiry = Math.abs(diry);
		let absdirz = Math.abs(dirz);

		let t = Math.sqrt((fdx * fdx + fdy * fdy + fdz * fdz)/(absdirx*absdirx+absdiry*absdiry+absdirz*absdirz));//其实也可以判断x,y,z但是由于不知道方向，所以把复杂的事情留到循环外面
		// 每经过一个格子需要的时间
		let xt = absdirx > 1e-6 ? w / absdirx : 10000;
		let yt = absdiry > 1e-6 ? w / absdiry : 10000;
		let zt = absdirz > 1e-6 ? w / absdirz : 10000;

		//由于起点不在0,0,0因此需要计算到下一个面的时间，第一次需要计算，以后直接加就行
		let maxX = (1 - (nst.x % w) / w) * xt;
		let maxY = (1 - (nst.y % w) / w) * yt;
		let maxZ = (1 - (nst.z % w) / w) * zt;

		let cx = x0;
		let cy = y0;
		let cz = z0;
		let end = false;
		let data = this.bitDataLod[0];
		while (!end) {
			if(data.getBit(cx,cy,cz))
				end = !visitor(cx, cy, cz, true);
			//
			//let pt = new Vec3(cx*this.gridw+min.x,cy*this.gridw+min.y,cz*this.gridw+min.z);
			//phyr.addPersistPoint( this.pointToWorld(pt,pt) )
			//
			if(end){
				break;
			}
			//取穿过边界用的时间最少的方向，前进一格
			//同时更新当前方向的边界
			if (maxX <= maxY && maxX <= maxZ) {//x最小，表示最先遇到x面
				end = maxX > t || cx==x1;  //先判断end。否则加了delta之后可能还没有完成就end了
				cx += sx;
				maxX += xt;
			} else if (maxY <= maxX && maxY <= maxZ) {//y最小
				end = maxY > t || cy==y1;
				cy += sy;
				maxY += yt;
			} else {	// z最小
				end = maxZ > t || cz==z1;
				cz += sz;
				maxZ += zt;
			}
		}
	}

	private _dtToStr(){
		let a = new Uint8Array(1);
	
	}
	toJSON():string{
		return JSON.stringify({

		});
	}
	fromJSON(data:string){
		let o = JSON.parse(data);

	}
}

var getEdge_edge: number[] = [];

var trav_tmpV1 = new Vec3();
var trav_tmpV2 = new Vec3();