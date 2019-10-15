import AABB from "../collision/AABB";
import RaycastResult from "../collision/RaycastResult";
import Mat3 from "../math/Mat3";
import Quaternion from "../math/Quaternion";
import Vec3 from "../math/Vec3";
import { getPhyRender } from "../world/World";
import Box from "./Box";
import Shape, { SHAPETYPE } from "./Shape";

function POT(v: i32): i32 {
	let r: i32 = 1;
	while (v > r) {
		r = r << 1;
	}
	return r;
}

/**
 * 求vec3的哈希值
 * http://www.beosil.com/download/CollisionDetectionHashing_VMV03.pdf
 * @param x 
 * @param y 
 * @param z 
 * @param l 格子的大小
 * @param n hash表的大小
 */
function hashVec3(x: f32, y: f32, z: f32, l: f32, n: i32): i32 {
	let ix = (x / l) | 0;
	let iy = (y / l) | 0;
	let iz = (z / l) | 0;
	let p1 = 73856093;
	let p2 = 19349663;  //TODO 这个并不是一个质数 19349669 
	let p3 = 83492791;
	return ((ix * p1) ^ (iy * p2) ^ (iz * p3)) % n
}

function hashIGrid(x: i32, y: i32, z: i32, n: i32): i32 {
	return (((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) & 0x7fffffff) % n;
}


export interface voxdata {
	x: i32; y: i32; z: i32; color: i32;
}

export class hashData {
	x: i32;
	y: i32;
	z: i32;
	v: i32;  //现在不是表示颜色而是对象id
}

// 把 SparseVoxData 转成普通的 hash数组
export function hashSparseVox(vox: SparseVoxData): hashData[][] {
	let solidnum = vox.data.length;
	let data = new Array<hashData[]>(solidnum);
	vox.data.forEach(v => {
		let hashi = hashIGrid(v.x, v.y, v.z, solidnum);
		let cdt = data[hashi];
		if (!cdt) {
			data[hashi] = cdt = [];
		}
		cdt.push({ x: v.x, y: v.y, z: v.z, v: v.color });
	});
	return data;
}


/**
 * 原始数据构造
 * 除了第一层以外都是完整八叉树  用来做大块的判断 上层完整的话，占0层的1/7的内存
 * 第一层用hash来保存
 */
export class SparseVoxData {
	data: voxdata[];
	dataLod: voxdata[][] = [];
	gridsz: f32;     // 每个格子的大小。单位是米
	dataszx: i32;    // x方向多少个格子
	dataszy: i32;
	dataszz: i32;
	maxsz: i32;
	aabbmin = new Vec3();   // local坐标的包围盒。相对于本地原点
	aabbmax = new Vec3();

	//get 加速
	hashdata: hashData[][];

	constructor(dt: voxdata[], xn: i32, yn: i32, zn: i32, min: Vec3, max: Vec3) {
		this.data = dt;
		this.dataszx = xn;
		this.dataszy = yn;
		this.dataszz = zn;
		this.aabbmin.copy(min);
		this.aabbmax.copy(max);
		this.gridsz = (max.x - min.x) / xn;
		this.hashdata = SparseVoxData.hashSparseVox(this);
	}

	// 把 SparseVoxData 转成普通的 hash数组
	static hashSparseVox(vox: SparseVoxData): hashData[][] {
		let solidnum = vox.data.length;
		let data = new Array<hashData[]>(solidnum);
		vox.data.forEach(v => {
			let hashi = hashIGrid(v.x, v.y, v.z, solidnum);
			let cdt = data[hashi];
			if (!cdt) {
				cdt = data[hashi] = [];
			}
			cdt.push({ x: v.x, y: v.y, z: v.z, v: v.color });
		});
		return data;
	}

	travAll(cb: (x: i32, y: i32, z: i32, v: i32) => void) {
		this.data.forEach(v => {
			cb(v.x, v.y, v.z, v.color);
		});
	}

	// 0表示没有
	getRaw(x: i32, y: i32, z: i32): i32 {
		let dt = this.data;
		for (let i = 0, sz = dt.length; i < sz; i++) {
			let cd = dt[i];
			if (cd.x == x && cd.y == y && cd.z == z)
				return cd.color;
		}
		return 0;
	}

	get(x: i32, y: i32, z: i32): i32 {
		let dt = this.hashdata;
		let hashsz = this.hashdata.length;
		let id = hashIGrid(x, y, z, hashsz)
		let bin = dt[id];
		if (bin) {
			for (let i = 0, sz = bin.length; i < sz; i++) {
				let cdt = bin[i];
				if (cdt.x == x && cdt.y == y && cdt.z == z)
					return cdt.v;
			}
		}
		return 0;
	}

	// 生成各级LOD信息,也就是八叉树。这是为了做大范围检测用的。
	genLOD() {
		let maxs = this.maxsz = Math.max(this.dataszx, this.dataszy, this.dataszz);
		let lodlv = POT(maxs);
		this.dataLod.length = lodlv;
		this.dataLod.map
		this.dataLod[0] = this.data;	//0级就是原始数据
		let dictobj = {};
		this.travAll((x, y, z, v) => {
			//while()
			//x>>1,y>>1,z>>1
		});

	}

	OBBCheck(min: Vec3, max: Vec3, mat: Mat3) {
		// 一级一级找
	}
}

/**
 * 可以共享的数据
 * 类似八叉树管理数据
 * 
 */
export class PhyVoxelData {
	data: Uint8Array;
	xs: i32;
	ys: i32;
	zs: i32;
	maxs: i32;

    /**
     * 
     * @param dt 
     * @param x 
     * @param y 
     * @param z 
     * @param olddt 以前的格式，只是线性的把8个合成一个byte，
     */
	constructor(dt: Uint8Array | null, x: i32, y: i32, z: i32, olddt = true) {
		// 必须要POT
		let nx = POT(x);
		let ny = POT(y);
		let nz = POT(z);
		this.maxs = Math.max(nx, ny, nz);
		if (!dt) {
			dt = new Uint8Array(nx * ny * nz / 8);
		} else {
			this.data = dt;
			if (olddt) {

			}
			// 生成八叉树

		}
		this.xs = nx;
		this.ys = ny;
		this.zs = nz;
	}

	has(x: i32, y: i32, z: i32): boolean {
		return false;
	}

	set(x: i32, y: i32, z: i32, v: i32): void {

	}

	buildOcttree(): void {
		let dt = this.data;
		let xs = this.xs;
		let ys = this.ys;
		let zs = this.zs;

	}
}

function getBit(v: i8, p: i32): boolean {
	//z,y,x

	//      Y
	//      |     010 011
	//   110 111  000 001  
	//   100 101 ________ X
	//   /
	// Z
	return (v & (1 << p)) != 0
}

/**
 * 每一级的voxel数据
 */
class VoxelBitData {
	xs = 0;//uint8数据的xsize，是实际数据长度的一半
	ys = 0;
	zs = 0;
	dt: Uint8Array;
	/**
	 * 由于不是POT
	 * 可能会扩展bbx，例如 上一级x有6个格子,对应的xs=3, bbx=0~6， 每个格子宽度为1
	 * 下一级的时候，xs=2，表示4个格子，比直接除2多出一个来，所以要扩展 上一级gridx*2 = 2 
	 * 如果下一级没有扩展，则不变，例如 8->4->2->1
	 */
	max = new Vec3();	// 注意这个只是原始包围盒，没有被变换
	min = new Vec3();	//

	/**
	 * xyzsize是数据个数，这里会用bit来保存，所以里面每个轴会除以2
	 * @param xsize 
	 * @param ysize 
	 * @param zsize 
	 * @param min  原始包围盒大小
	 * @param max 
	 */
	constructor(xsize: i32, ysize: i32, zsize: i32, min: Vec3, max: Vec3) {
		this.xs = (xsize + 1) >> 1;
		this.ys = (ysize + 1) >> 1;
		this.zs = (zsize + 1) >> 1
		this.dt = new Uint8Array(this.xs * this.ys * this.zs);
		this.min.copy(min);
		this.max.copy(max);
		// 是否扩展了bbx
		if ((xsize & 1) == 1) {
			let dx = (max.x - min.x) / xsize;
			this.max.x += dx;
		}
		if ((ysize & 1) == 1) {
			let dy = (max.y - min.y) / ysize;
			this.max.y += dy;
		}
		if ((zsize & 1) == 1) {
			let dz = (max.z - min.z) / zsize;
			this.max.z += dz;
		}
	}

	//设置。这里的xyz可以是 this.xs的两倍
	setBit(x: i32, y: i32, z: i32) {
		//z,y,x
		let xs = this.xs, ys = this.ys;
		let pos = (z >> 1) * (xs * ys) + (y >> 1) * xs + (x >> 1);
		let bit = ((z & 1) << 2) + ((y & 1) << 1) + (x & 1);
		this.dt[pos] |= (1 << bit);
	}

	getBit(x: i32, y: i32, z: i32) {
		if (x >= this.xs * 2 || x < 0 || y >= this.ys * 2 || y < 0 || z >= this.zs * 2 || z < 0) {
			//debugger;
			console.error('getbit param error');
		}
		//z,y,x
		let xs = this.xs, ys = this.ys;
		let pos = (z >> 1) * (xs * ys) + (y >> 1) * xs + (x >> 1);
		let bit = ((z & 1) << 2) + ((y & 1) << 1) + (x & 1);
		return (this.dt[pos] & (1 << bit)) != 0;
	}

	/**
	 * 生成上一级数据，并且填充
	 */
	genParent(): VoxelBitData | null {
		if (this.xs <= 1 && this.ys <= 1 && this.zs <= 1)
			return null;
		let xs = this.xs, ys = this.ys, zs = this.zs;
		let ret = new VoxelBitData(xs, ys, zs, this.min, this.max);//xs等已经是除以2的了
		//给父级设值
		let dt = this.dt;
		let i = 0;
		for (let z = 0; z < zs; z++) {
			for (let y = 0; y < ys; y++) {
				for (let x = 0; x < xs; x++) {
					let v = dt[i++];
					if (v) {
						ret.setBit(x, y, z);
					}
				}
			}
		}
		return ret;
	}
}

export class Voxel extends Shape {
	id = 0;
	voxData: SparseVoxData;//|PhyVoxelData;
	//data:Uint8Array;
	//bitData:Uint8Array;
	bitDataLod: VoxelBitData[];
	dataxsize = 0;
	dataysize = 0;
	datazsize = 0;
	quat: Quaternion;
	pos:Vec3 ;// 目前是一个临时引用，不可以跨函数
	centroid: Vec3 = new Vec3();	// 在voxData坐标系下的质心 @TODO 转换
	mat: Mat3;   // 相当于记录了xyz的轴
	scale = new Vec3(1, 1, 1);		// 注意这个动态改变的话会破坏刚体的假设。
	aabbmin = new Vec3();			// 当前的aabb
	aabbmax = new Vec3();
	addToSceTick = -1;  // 
	gridw = 0;

	constructor(dt: SparseVoxData) {
		super();
		this.voxData = dt;
		this.type = SHAPETYPE.VOXEL;
		this.aabbmin.copy(dt.aabbmin);
		this.aabbmax.copy(dt.aabbmax);
		this.gridw = ((dt.aabbmax.x - dt.aabbmin.x) / dt.dataszx);
		// 如果不是方的，转成多个方的
		let xs = this.dataxsize = dt.dataszx;
		let ys = this.dataysize = dt.dataszy;
		let zs = this.datazsize = dt.dataszz;
		let maxsize = Math.max(xs, ys, zs);
		let maxpot = POT(maxsize);
		let lodlv = Math.log2(maxpot);
		this.bitDataLod = new Array<VoxelBitData>(lodlv);
		//let clv = lodlv - 1;
		let clv = 0;
		let cdt = this.bitDataLod[clv] = new VoxelBitData(xs, ys, zs, this.aabbmin, this.aabbmax);
		//设置末级数据
		dt.data.forEach(v => {
			cdt.setBit(v.x, v.y, v.z);
		});

		//设置各级数据
		while (cdt) {
			cdt = cdt.genParent() as VoxelBitData;
			if (cdt) {
				this.bitDataLod[++clv] = cdt;
			}
		}
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
		let sx = 0;
		let sy = 0;
		let sz = 0;
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
	}

	// 计算相对于质心的转动惯量。
	calculateLocalInertia(mass: number, target: Vec3): void {
		let c = this.centroid;
		target.x = 0;
		target.y = 0;
		target.z = 0;
		let grid = this.voxData.gridsz;
		let sx = grid * this.scale.x;
		let sy = grid * this.scale.y;
		let sz = grid * this.scale.z;
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
		let scale = this.scale;
		let szmax = Math.max(szx / scale.x, szy / scale.y, szz / scale.z);
		let lod = Math.round(Math.log2(szmax));
		return lod;
	}

	getLODByW(w: number) {
		let k = (w / this.gridw) | 0;	// 0~1024对应0到10级
		this.gridw
	}

	updateBndSphR(): void {
		let mx = Math.max(Math.abs(this.aabbmax.x), Math.abs(this.aabbmin.x));
		let my = Math.max(Math.abs(this.aabbmax.y), Math.abs(this.aabbmin.y));
		let mz = Math.max(Math.abs(this.aabbmax.z), Math.abs(this.aabbmin.z));
		this.boundSphR = Math.sqrt(mx * mx + my * my + mz * mz);
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
		this.quat.vmult(pt,out);
		out.vadd(this.pos,out);
		return out;
	}

	//3dline
	/**
	 * 射线经过voxle的路径。原理是每次根据碰撞到每个分隔面的时间取最近的。
	 * @param st  voxel空间的起点
	 * @param ed  voxel空间的终点
	 * @param visitor 返回true则继续
	 */
	rayTravel(st: Vec3, ed: Vec3, visitor: (x: int, y: int, z: int) => boolean) {
		let w = this.gridw;
		let min = this.voxData.aabbmin;
		let max = this.voxData.aabbmax;

		//先用包围盒裁剪
		let nst = trav_tmpV1;
		let ned = trav_tmpV2;

		if (!Box.rayHitBox(st, ed, min, max, nst, ned))
			return;

		//debug
		let phyr =  getPhyRender();
		let wpos = new Vec3();
		phyr.addPersistPoint( this.pointToWorld(nst, wpos));
		phyr.addPersistPoint( this.pointToWorld(ned,wpos));
		//debug

		//dir
		let nx = ned.x - nst.x;
		let ny = ned.y - nst.y;
		let nz = ned.z - nst.z;
		let len = nx * nx + ny * ny + nz * nz;
		let dirx = nx / len;
		let diry = ny / len;
		let dirz = nz / len;

		let x0 = ((nst.x - min.x) / w) | 0;	// 不可能<0所以可以直接 |0
		let y0 = ((nst.y - min.y) / w) | 0;
		let z0 = ((nst.z - min.z) / w) | 0;

		let x1 = ((ned.x - min.x) / w) | 0;
		let y1 = ((ned.y - min.y) / w) | 0;
		let z1 = ((ned.z - min.z) / w) | 0;

		//确定前进方向
		let sx = x1 > x0 ? 1 : x1 < x0 ? -1 : 0;
		let sy = y1 > y0 ? 1 : y1 < y0 ? -1 : 0;
		let sz = z1 > z0 ? 1 : z1 < z0 ? -1 : 0;

		// 从开始到结束的长度
		let fdx = Math.abs(ned.x - nst.x);
		let fdy = Math.abs(ned.y - nst.y);
		let fdz = Math.abs(ned.z - nst.z);
		let t = Math.sqrt(fdx * fdx + fdy * fdy + fdz * fdz);//其实也可以判断x,y,z但是由于不知道方向，所以把复杂的事情留到循环外面
		// 每经过一个格子需要的时间
		let xt = Math.abs(dirx) > 1e-6 ? w / dirx : 10000;
		let yt = Math.abs(diry) > 1e-6 ? w / diry : 10000;
		let zt = Math.abs(dirz) > 1e-6 ? w / dirz : 10000;

		//由于起点不在0,0,0因此需要计算到下一个面的时间，第一次需要计算，以后直接加就行
		let maxX = (1 - (nst.x % w) / w) * xt;
		let maxY = (1 - (nst.y % w) / w) * yt;
		let maxZ = (1 - (nst.z % w) / w) * zt;

		let cx = x0;
		let cy = y0;
		let cz = z0;
		let end = false;
		while (!end) {
			end = !visitor(cx, cy, cz);
			if(end){
				break;
			}
			//取穿过边界用的时间最少的方向，前进一格
			//同时更新当前方向的边界
			if (maxX <= maxY && maxX <= maxZ) {//x最小，表示最先遇到x面
				cx += sx;
				end = maxX > t;  //先判断end。否则加了delta之后可能还没有完成就end了
				maxX += xt;
			} else if (maxY <= maxX && maxY <= maxZ) {//y最小
				cy += sy;
				end = maxY > t;
				maxY += yt;
			} else {	// z最小
				cz += sz;
				end = maxZ > t;
				maxZ += zt;
			}
		}
	}
}

var getEdge_edge: number[] = [];

/**
 * 层次场景的最后一级。大小是16x16x16。
 * 用hash的方式管理
 * 每个格子的信息
 *  x:4bit,y:4bit,z:4bit,objid:4bit,  aabbid:12 unused:4
 *  objid是本区域内的列表的
 * 
 * 注意：这个类个数可能很多，所以要尽可能的小。
 */
class hashRegion {
	isSolid = true;   //实心的少，所以hash的是实心的。为false则hash记录的是空，如果实心对象超过一个，必须记录实
	solidInfo: i32[];      // 只是区分虚实的hash信息，可以用来判断是否碰撞
	objlist: number[] | null = null; //实对象的id列表，如果只有一个最好了，记录空的情况
	aabbinfo: number[];   // 格子内的aabb。0不用，min:4,4,4 max:4,4,4
	//faceinfo:{nx:f32,ny:f32,nz:f32,d:f32}[];    //分割平面。如果内存太多也可以用一个int来表示

    /**
     * 添加新的voxel。后加的会覆盖前面的。
     * 这个vox可能超越本区域大小，所以可能需要裁减
     */
	addData(vox: Voxel, min: Vec3, max: Vec3): void {
		vox.pos;
	}

    /**
     * 虽然是添加voxel，但实际上格子单位不统一，所以与添加mesh其实差不多
     * @param vox 
     * @param pos 
     * @param q 
     * @param scale 
     * @param mymin  当前区域的包围盒
     * @param mymax 
     */
	addVox(vox: Voxel, mymin: Vec3, mymax: Vec3): void {
		vox.updateAABB();
		let min = vox.aabbmin;
		let max = vox.aabbmax;

		// 包围盒判断
		if (
			mymax.x < min.x || mymin.x > max.x ||
			mymax.y < min.y || mymin.y > max.y ||
			mymax.z < min.z || mymin.z > max.z)
			return;

		let hitmin = new Vec3();
		let hitmax = new Vec3();
		// 两个小的取大的
		hitmin.x = Math.max(min.x, mymin.x);
		hitmin.y = Math.max(min.y, mymin.y);
		hitmin.z = Math.max(min.z, mymin.z);
		// 两个大的取小的
		hitmax.x = Math.min(max.x, mymax.x);
		hitmax.y = Math.min(max.y, mymax.y);
		hitmax.z = Math.min(max.z, mymax.z);

		// 开始添加
		// 本对象是轴对齐的，vox不一定是轴对齐的

	}

	/**
	 * allobj = thisgrid.objlist - thisvox;
	 * 更新每个vox的空间
	 * allVox.forEach( v )
	 * 		grid[v]=0
	 * 		allObj.forEach o
	 * 			v in o? 
	 * 					v=o,return	// 这一步比较费，还要计算内部aabb
	 * 					:coninue;
	 */
	delVox() {

	}

	addAVox(pos: Vec3, size: f32, axis: Mat3): void {

	}

	setVox(x: i32, y: i32, z: i32, v: i32, id: i32): void {

	}
	clearData(): void {

	}
}

class GridItem {
	objlist: Object[];
}
/**
 * 格子管理。可以管理静态的八叉树，也可以管理动态的voxel
 */
export class GridScene {
	// 为了避免扩展的问题，再分成多个区域，每个区域是1024^3米，如果要，最多允许10^3个区域
	// 中心区域是-512 到512
	static gridAtlasInfo: GridScene[] = new Array<GridScene>(1000);
	static gridWidth = 1024;
	static gridAtlasOri = new Vec3(-512, -512, -512);
	static data: GridItem[] = [];	//这个是全局公用，可能会扩展
	static getAtlas(min: Vec3, max: Vec3): GridScene[] {
		throw 'no';
	}

	gridSize = 64;	//每个格子是 64x64x64
	gridw = 1024 / 64;
	gridnum = this.gridw ** 3;
	aabbmin = new Vec3(-512, -512, -512);
	aabbmax = new Vec3(512, 512, 512);
	dataoff = 0;
	constructor() {
		let dt = GridScene.data;
		let dataoff = this.dataoff;
		let gridnum = this.gridnum;
		if (dt.length < dataoff + gridnum) {
			dt.length = dataoff + gridnum
		}
		for (let i = dataoff, e = dataoff + gridnum; i < e; i++) {
			dt[i] = new GridItem();
		}
	}

	addObj(obj: { aabbmin: Vec3, aabbmax: Vec3 }) {
		let gsize = this.gridSize;
		let objmin = obj.aabbmin;
		let objmax = obj.aabbmax;
		let min = this.aabbmin;
		let max = this.aabbmax;
		let exp = false;
		let floor = Math.floor;
		let data = GridScene.data;
		if (objmin.x < min.x) {
			exp = true;
		}
		if (objmax.x > max.x) {
			exp = true;
		}
		if (objmin.y < min.y) {
			exp = true;
		}
		if (objmax.y > max.y) {
			exp = true;
		}
		if (objmin.z < min.z) {
			exp = true;
		}
		if (objmax.z > max.z) {
			exp = true;
		}

		if (exp) {
			throw '超出边界的还没有做呢';
		}

		// 计算在哪个格子里
		let sx = floor((objmin.x - min.x) / gsize);
		let sy = floor((objmin.y - min.y) / gsize);
		let sz = floor((objmin.z - min.z) / gsize);

		let ex = floor((objmax.x - min.x) / gsize);
		let ey = floor((objmax.y - min.y) / gsize);
		let ez = floor((objmax.z - min.z) / gsize);
		let w = this.gridw;
		let xy = w * w;
		let off = this.dataoff;
		for (let z = sz; z <= ez; z++) {
			for (let y = sy; y <= ey; y++) {
				for (let x = sx; x <= ex; x++) {
					let p = z * xy + y * w + x + off;
					data[p].objlist.push(obj);
				}
			}
		}
	}

	updateObj(obj: {}) {
	}

	addVox(): void {

	}

	// 把某个格子变成八叉树
	setOctree(ix: i32, iy: i32, iz: i32) {

	}
}

/**
 * 静态场景合并成为一个对象。
 * 
 */
export class VoxelScene {
	min: Vec3;   // 场景包围盒
	max: Vec3;

	// 统一格子管理。每个场景可以不同，基本根据主角大小来定
	gridsz: f32 = 0.5;   // 
	staticVox: Voxel[] = [];
	staticVoxAABB: AABB[];   // 每个对象添加到场景的时候对应的AABB
	// dynamicVox:Voxel[]=[]; 动态格子暂时不做
	lv1Grids: Uint16Array;   // 一级格子。0表示没有内容。
	lv2Grids: Uint16Array;   // 二级格子。0表示没有内容。
	// 一级格子的大小
	lv1szx: i32;
	lv1szy: i32;
	lv1szz: i32;

	//叶子格子
	hashgrids: hashRegion[];

	constructor(scemin: Vec3, scemax: Vec3, gridsz: f32) {
		let lv2sz = gridsz * 16;  // 最后一级是 16x16x16
		let lv1gridsz = lv2sz * 8;    // 每个一级格子包含 8x8x8=512个二级格子
		//this.lv1szx = ;//TODO
		//this.lv1szy=;
		//this.lvlszz=;
		let lv1gridnum = this.lv1szx * this.lv1szy * this.lv1szz;
		this.lv1Grids = new Uint16Array(lv1gridnum);

		// 一级格子的有效个数
		let validLv1Num = 0;  //TODO
		let lv2GridNum = validLv1Num * 512;   //每个一级包含512个二级（8x8x8）

		// 统计二级格子中的有效格子
		let hashGridNum = 0;//TODO
		this.hashgrids.length = hashGridNum;

	}

	addStaticVoxel(vox: Voxel, updateSce = true): void {
		this.staticVox.push(vox);
		if (updateSce) {
			this.updateStaticSceneInfo();
		}
	}

	removeStaticVoxel(vox: Voxel): void {
		// 根据格子中记录的voxel来恢复
	}

	updateStaticSceneInfo(): void {
	}
}

/**
 * 占用同一个格子的多个静态模型不重复添加
 *
 */

var trav_tmpV1 = new Vec3();
var trav_tmpV2 = new Vec3();