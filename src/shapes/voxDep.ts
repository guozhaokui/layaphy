import { POT } from "./VoxelData";
import { Vec3 } from "../math/Vec3";
import { Mat3 } from "../math/Mat3";
import { AABB } from "../collision/AABB";

//// 暂时无用的voxel类 /////

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
	addData(vox: any, min: Vec3, max: Vec3): void {
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
	addVox(vox: any, mymin: Vec3, mymax: Vec3): void {
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
	staticVox: any[] = [];
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

	addStaticVoxel(vox: any, updateSce = true): void {
		this.staticVox.push(vox);
		if (updateSce) {
			this.updateStaticSceneInfo();
		}
	}

	removeStaticVoxel(vox: any): void {
		// 根据格子中记录的voxel来恢复
	}

	updateStaticSceneInfo(): void {
	}
}

/**
 * 占用同一个格子的多个静态模型不重复添加
 *
 */