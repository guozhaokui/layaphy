import { Vec3 } from "../math/Vec3";
import { Mat3 } from "../math/Mat3";

export function POT(v: i32): i32 {
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
	private gridsz: f32;     // 每个格子的大小。单位是米
	dataszx: i32;    // x方向多少个格子
	dataszy: i32;
	dataszz: i32;
	maxsz: i32;
	/** local坐标的包围盒。相对于本地原点 */
	aabbmin = new Vec3(); 
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
 * 每一级的voxel数据
 */
export class VoxelBitData {
	xs = 0;//uint8数据的xsize，是实际数据长度的一半
	ys = 0;
	zs = 0;
	dt: Uint8Array;
	/** 由于上面为了对齐可能有多余的，这里记录实际数据 */
	rx=0;
	ry=0;
	rz=0;
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
		this.rx = xsize;
		this.ry = ysize;
		this.rz = zsize;
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
		if (x >= this.rx || x < 0 || y >= this.ry || y < 0 || z >= this.rz || z < 0) {
			//debugger;
			console.error('getbit param error');
			return 0;
		}
		//bit:z,y,x, 所以是
		//      Y
		//      |     010 011
		//   110 111  000 001  
		//   100 101 ________ X
		//   /
		// Z		
		// 注意转成二进制查看的话，要倒着看，例如  00110011 表示两层，下层水平面是4个实，上层是4个空
		//                                     <-------
		//      0 0
		//  0 0 1 1
		//  1 1
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

export interface CubeModule{
	//centerVec:Vec3;
	//cubePoint:Vec3;
	//current:Vec3;
	//dCollisionPoint:Vec3;
	//dMax:Vec3;
	//dStart:Vec3; private
	//max:Vec3;
	//min:Vec3;
	//temporaryMax:Vec3;
	//temporaryMni:Vec3;
	_data:Uint8Array;//  按照bit紧密排列的数据，并没有做任何对齐
	// 原点在格子的位置，所以bbxmin = {-dx,-dy,-dz}
	_dx:int;
	_dy:int;
	_dz:int;
	//_isYHave:boolean;
	//数据的大小。_lx*_ly*lz/8=_data.length
	_lx:int;			
	_ly:int;
	_lz:int;

	/** xyz是否有数据 */
	//find(x:int,y:int,z:int):int;
}

export interface IOrigVoxData{
	/** 只有SparseVoxeData 有 */
	//data:any[]|null;
	dataszx:int;
	dataszy:int;
	dataszz:int;

	/** 遍历，只有sparseVoxelData有 */
	travAll?(f:(x:int,y:int,z:int,v:int)=>void):void;

	/** 原始包围盒 */
	aabbmin:Vec3;
	aabbmax:Vec3;

	fillVoxBitData(dt:VoxelBitData):void;
}
