import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";
import Shape, { SHAPETYPE } from "./Shape";
import RaycastResult from "../collision/RaycastResult";
import Mat3 from "../math/Mat3";
import AABB from "../collision/AABB";
import Box from "./Box";

function POT(v:i32):i32{
	let r:i32=1;
	while(v>r){
		r=r<<1;
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

function hashIGrid(x:i32, y:i32, z:i32, n:i32):i32{
	return (((x*73856093)^(y*19349663)^(z*83492791))&0x7fffffff)%n;
}


export interface voxdata{
    x:i32;y:i32;z:i32;color:i32;
}

/**
 * 原始数据构造
 * 除了第一层以外都是完整八叉树  用来做大块的判断 上层完整的话，占0层的1/7的内存
 * 第一层用hash来保存
 */
export class SparseVoxData{
	data:voxdata[];   
	dataLod:voxdata[][]=[];
    gridsz:f32;     // 每个格子的大小。单位是米
    dataszx:i32;    // x方向多少个格子
    dataszy:i32;
	dataszz:i32;
	maxsz:i32;
    aabbmin:Vec3;   // local坐标的包围盒。相对于本地原点
	aabbmax:Vec3;

	travAll(cb:(x:i32,y:i32,z:i32,v:i32)=>void){
		this.data.forEach(v=>{
			cb(v.x,v.y,v.z,v.color);
		});
	}

	// 0表示没有
	get(x:i32,y:i32,z:i32):i32{
		let dt = this.data;
		for(let i=0,sz=dt.length; i<sz; i++){
			let cd = dt[i];
			if( cd.x==x && cd.y==y && cd.z==z)
				return cd.color;
		}
		return 0;
	}

	// 生成各级LOD信息,也就是八叉树。这是为了做大范围检测用的。
	genLOD(){
		let maxs = this.maxsz = Math.max(this.dataszx, this.dataszy, this.dataszz);
		let lodlv = POT(maxs);
		this.dataLod.length=lodlv;
		this.dataLod.map
		this.dataLod[0]=this.data;	//0级就是原始数据
		let dictobj = {};
		this.travAll((x,y,z,v)=>{
			//while()
			//x>>1,y>>1,z>>1
		});

	}

	OBBCheck(min:Vec3,max:Vec3, mat:Mat3){
		// 一级一级找
	}
}

export class hashData{
    x:i32;
    y:i32;
    z:i32;
    v:i32;  //现在不是表示颜色而是对象id
}

// 把 SparseVoxData 转成普通的 hash数组
export function hashSparseVox(vox:SparseVoxData):hashData[][]{
    let solidnum = vox.data.length;
    let data = new Array<hashData[]>(solidnum);
    vox.data.forEach( v=>{
        let hashi = hashIGrid(v.x,v.y,v.z,solidnum);
        let cdt = data[hashi];
        if(!cdt){ 
            data[hashi]=cdt=[];
        }
        cdt.push({x:v.x,y:v.y,z:v.z,v:v.color});
    });
    return data;
}


/**
 * 可以共享的数据
 * 类似八叉树管理数据
 * 
 */
export class PhyVoxelData {
    data: Uint8Array;
    xs:i32;
    ys:i32;
    zs:i32;
    maxs:i32;

    /**
     * 
     * @param dt 
     * @param x 
     * @param y 
     * @param z 
     * @param olddt 以前的格式，只是线性的把8个合成一个byte，
     */
    constructor(dt:Uint8Array|null, x:i32, y:i32, z:i32,olddt=true){
        // 必须要POT
        let nx=POT(x);
        let ny=POT(y);
        let nz=POT(z);
        this.maxs = Math.max(nx,ny,nz);
        if(!dt){
            dt = new Uint8Array(nx*ny*nz/8);
        }else{
            this.data=dt;
            if(olddt){

            }
            // 生成八叉树

        }
        this.xs=nx;
        this.ys=ny;
        this.zs=nz;
    }

    has(x: i32, y: i32, z: i32): boolean {
        return false;
    }

    set(x:i32,y:i32,z:i32,v:i32):void{

    }

    buildOcttree():void{
        let dt = this.data;
        let xs = this.xs; 
        let ys = this.ys;
        let zs = this.zs;

    }
}

function getBit(v:i8, p:i32):boolean{
    //z,y,x

    //      Y
    //      |     010 011
    //   110 111  000 001  
    //   100 101 ________ X
    //   /
    // Z
    return (v & (1<<p))!=0
}

class StaticVoxel{
    id=0;
	voxData: SparseVoxData;//|PhyVoxelData;
    //data:Uint8Array;
    quat: Quaternion;
	pos: Vec3;
	centroid:Vec3 = new Vec3();	// 在voxData坐标系下的质心 @TODO 转换
    mat: Mat3;   // 相当于记录了xyz的轴
    scale: Vec3;		// 注意这个动态改变的话会破坏刚体的假设。
	aabbmin = new Vec3();
	aabbmax = new Vec3();
	addToSceTick=-1;  // 
	needUpdate=true;
	updateAABB():void{
		if(!this.needUpdate)
			return;
		let bmin = this.aabbmin;
		let bmax = this.aabbmax;
		// 变换vox的包围盒
		let nmin = new Vec3();
		let nmax = new Vec3();
		Box.calculateWorldAABB1(this.pos,this.quat,this.scale,bmin,bmax,nmin,nmax);
		// TODO 转成矩阵
		let mat = this.mat;
		mat.identity();
		mat.setRotationFromQuaternion(this.quat);
		mat.scale(this.scale,mat);
		this.needUpdate=false;
	}

	// 不同的实现这个函数不同
	getVox(x:i32,y:i32,z:i32){

	}

	calcCentroid():void{
		let sx=0;
		let sy=0;
		let sz=0;
		let i=0;
		this.voxData.travAll( (x,y,z,v)=>{
			if(v){
				sx+=x;
				sy+=y;
				sz+=z;
				i++;
			}
		});
		sx/=i; // 是浮点数
		sy/=i; 
		sz/=i; 
		let c= this.centroid;
		c.x=sx; c.y=sy; c.z=sz;
	}

	// 计算相对于质心的转动惯量。
	calculateLocalInertia(mass: number, target: Vec3): void {
		let c = this.centroid;
		target.x=0;
		target.y=0;
		target.z=0;
		let grid = this.voxData.gridsz;
		let sx = grid*this.scale.x;
		let sy = grid*this.scale.y;
		let sz = grid*this.scale.z;
		this.voxData.travAll( (x,y,z,v)=>{
			if(v){
				let dx = x-c.x;	// 没有考虑实际缩放，最后集中处理
				let dy = y-c.y;
				let dz = z-c.z;
				let dx2=dx*dx;
				let dy2=dy*dy;
				let dz2=dz*dz;
				target.x+=dy2+dz2;
				target.y+=dx2+dz2;
				target.z+=dx2+dy2;
			}
		});
		target.x*=(sx*sx*mass);	 // 根据缩放和格子大小转换为实际距离。上面是平方，所以这也是
		target.y*=(sy*sy*mass);
		target.z*=(sz*sz*mass);
	}

	// 用世界空间的包围盒来检查碰撞
	AABBCheck(min:Vec3, max:Vec3, onlytest:boolean=true):boolean{
		// 在不考虑父对象导致的变形的情况下，本地只有旋转缩放，求逆可以比较容易
		// 根据包围盒大小选择合适的lod等级
		let szx = max.x-min.x; let szy = max.y-min.y; let szz = max.z-min.z;
		let lod = this.getLOD(szx,szy,szz);

	}

	// 参数是local空间的盒子大小
	getLOD(szx:f32, szy:f32, szz:f32):i32{
		let scale = this.scale;
		let szmax = Math.max(szx/scale.x,szy/scale.y,szz/scale.z);
		let lod = Math.round(Math.log2(szmax));
		return lod;
	}
}

export class Voxel extends Shape {
    voxData: PhyVoxelData;
    //data:Uint8Array;
    pos: Vec3;
    quat: Quaternion;
    mat: Mat3;   // 相当于记录了xyz的轴
    scale: Vec3;
    /**
     * 
     * @param dt 
     * @param xs x总的宽度
     * @param ys 
     * @param zs 
     */
    constructor(dt: Uint8Array, xs: i32, ys: i32, zs: i32) {
        super();
        this.type = SHAPETYPE.VOXEL;
    }

    setData(dt: Uint8Array, xnum: i32, ynum: i32, znum: i32, xs: f32, ys: f32, zs: f32): void {
        // 重新组织数据        
        // 生成LOD数据
    }

    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void { }

    fill() {
    }

    updateBoundingSphereRadius(): void {
        throw new Error("Method not implemented.");
    }
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void {
        throw new Error("Method not implemented.");
    }
    volume(): number {
        throw new Error("Method not implemented.");
    }
    calculateLocalInertia(mass: number, target: Vec3): void {
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
}

class OctRegion{

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
class hashRegion{
    isSolid=true;   //实心的少，所以hash的是实心的。为false则hash记录的是空，如果实心对象超过一个，必须记录实
    solidInfo:i32[];      // 只是区分虚实的hash信息，可以用来判断是否碰撞
    objlist:number[]|null=null; //实对象的id列表，如果只有一个最好了，记录空的情况
    aabbinfo:number[];   // 格子内的aabb。0不用，min:4,4,4 max:4,4,4
    //faceinfo:{nx:f32,ny:f32,nz:f32,d:f32}[];    //分割平面。如果内存太多也可以用一个int来表示

    /**
     * 添加新的voxel。后加的会覆盖前面的。
     * 这个vox可能超越本区域大小，所以可能需要裁减
     */
    addData(vox:StaticVoxel,min:Vec3, max:Vec3):void{
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
    addVox( vox:StaticVoxel, mymin:Vec3, mymax:Vec3):void{
		vox.updateAABB();
		let min = vox.aabbmin;
		let max = vox.aabbmax;

		// 包围盒判断
		if(
			mymax.x<min.x || mymin.x>max.x ||
			mymax.y<min.y || mymin.y>max.y ||
			mymax.z<min.z || mymin.z>max.z)
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
	delVox(){

	}

	addAVox(pos:Vec3, size:f32, axis:Mat3):void{

	}

    setVox(x:i32,y:i32,z:i32,v:i32,id:i32):void{

    }
    clearData():void{

    }
}

class GridItem{
	objlist:Object[];
}
/**
 * 格子管理。可以管理静态的八叉树，也可以管理动态的voxel
 */
export class GridScene{
	// 为了避免扩展的问题，再分成多个区域，每个区域是1024^3米，如果要，最多允许10^3个区域
	// 中心区域是-512 到512
	static gridAtlasInfo:GridScene[] = new Array<GridScene>(1000);	
	static gridWidth=1024;
	static gridAtlasOri = new Vec3(-512,-512,-512);
	static data:GridItem[]=[];	//这个是全局公用，可能会扩展
	static getAtlas(min:Vec3, max:Vec3):GridScene[]{
		throw 'no';
	}

	gridSize=64;	//每个格子是 64x64x64
	gridw = 1024/64;
	gridnum = this.gridw**3;
	aabbmin=new Vec3(-512,-512,-512);
	aabbmax=new Vec3(512,512,512);
	dataoff=0; 	
	constructor(){
		let dt = GridScene.data;
		let dataoff = this.dataoff;
		let gridnum = this.gridnum;
		if(dt.length<dataoff+gridnum){
			dt.length=dataoff+gridnum
		}
		for(let i=dataoff,e=dataoff+gridnum; i<e; i++){
			dt[i]=new GridItem();
		}
	}

	addObj(obj:{aabbmin:Vec3, aabbmax:Vec3}){
		let gsize = this.gridSize;
		let objmin=obj.aabbmin;
		let objmax=obj.aabbmax;
		let min = this.aabbmin;
		let max = this.aabbmax;
		let exp=false;
		let floor = Math.floor;
		let data = GridScene.data;
		if(objmin.x<min.x){
			exp=true;
		}
		if(objmax.x>max.x){
			exp=true;
		}
		if(objmin.y<min.y){
			exp=true;
		}
		if(objmax.y>max.y){
			exp=true;
		}
		if(objmin.z<min.z){
			exp=true;
		}
		if(objmax.z>max.z){
			exp=true;
		}

		if(exp){
			throw '超出边界的还没有做呢';
		}

		// 计算在哪个格子里
		let sx = floor((objmin.x-min.x)/gsize);
		let sy = floor((objmin.y-min.y)/gsize);
		let sz = floor((objmin.z-min.z)/gsize);

		let ex = floor((objmax.x-min.x)/gsize);
		let ey = floor((objmax.y-min.y)/gsize);
		let ez = floor((objmax.z-min.z)/gsize);
		let w = this.gridw;
		let xy=w*w;
		let off = this.dataoff;
		for(let z=sz; z<=ez; z++){
			for(let y=sy; y<=ey; y++){
				for(let x=sx; x<=ex; x++){
					let p = z*xy+y*w+x+off;
					data[p].objlist.push(obj);
				}
			}
		}
	}

	updateObj(obj:{}){
	}

	addVox():void{

	}

	// 把某个格子变成八叉树
	setOctree(ix:i32, iy:i32, iz:i32){

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
    staticVox:StaticVoxel[]=[];
    staticVoxAABB:AABB[];   // 每个对象添加到场景的时候对应的AABB
    // dynamicVox:Voxel[]=[]; 动态格子暂时不做
    lv1Grids:Uint16Array;   // 一级格子。0表示没有内容。
    lv2Grids:Uint16Array;   // 二级格子。0表示没有内容。
    // 一级格子的大小
    lv1szx:i32; 
    lv1szy:i32;
    lv1szz:i32;

    //叶子格子
    hashgrids:hashRegion[];

    constructor(scemin:Vec3, scemax:Vec3, gridsz:f32){
        let lv2sz = gridsz*16;  // 最后一级是 16x16x16
        let lv1gridsz = lv2sz*8;    // 每个一级格子包含 8x8x8=512个二级格子
        //this.lv1szx = ;//TODO
        //this.lv1szy=;
        //this.lvlszz=;
        let lv1gridnum = this.lv1szx*this.lv1szy*this.lv1szz;
        this.lv1Grids = new Uint16Array(lv1gridnum);

        // 一级格子的有效个数
        let validLv1Num=0;  //TODO
        let lv2GridNum = validLv1Num*512;   //每个一级包含512个二级（8x8x8）

        // 统计二级格子中的有效格子
        let hashGridNum=0;//TODO
        this.hashgrids.length = hashGridNum;

    }

    addStaticVoxel(vox:StaticVoxel,updateSce=true):void{
        this.staticVox.push(vox);
        if(updateSce){
            this.updateStaticSceneInfo();
        }
    }

    removeStaticVoxel(vox:StaticVoxel):void{
        // 根据格子中记录的voxel来恢复
    }

    updateStaticSceneInfo():void{
    }
}

/**
 * 占用同一个格子的多个静态模型不重复添加
 * 
 */