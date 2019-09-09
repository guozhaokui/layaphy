import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";
import Shape, { SHAPETYPE } from "./Shape";
import RaycastResult from "../collision/RaycastResult";
import Mat3 from "../math/Mat3";
import AABB from "../collision/AABB";
import Box from "./Box";

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
    x:number;y:number;z:number;color:number;
}
export class SparseVoxData{
    data:voxdata[];   
    gridsz:f32;     // 每个格子的大小
    dataszx:i32;    // x方向多少个格子
    dataszy:i32;
    dataszz:i32;
    aabbmin:Vec3;   // local坐标的包围盒。相对于本地原点
	aabbmax:Vec3;
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

    POT(v:i32):i32{
        let r:i32=2;
        while(v>r){
            r=r<<1;
        }
        return r;
    }

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
        let nx=this.POT(x);
        let ny=this.POT(y);
        let nz=this.POT(z);
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
    voxData: PhyVoxelData;
    //data:Uint8Array;
    pos: Vec3;
    quat: Quaternion;
    mat: Mat3;   // 相当于记录了xyz的轴
    scale: Vec3;
    addToSceTick=-1;  // 
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
    addVox(vox:SparseVoxData, pos:Vec3, q:Quaternion, scale:Vec3, mymin:Vec3, mymax:Vec3):void{
		let bmin = vox.aabbmin;
		let bmax = vox.aabbmax;
		// 变换vox的包围盒
		let nmin = new Vec3();
		let nmax = new Vec3();
		Box.calculateWorldAABB1(pos,q,scale,bmin,bmax,nmin,nmax);

		// 包围盒判断
		

    }

    setVox(x:i32,y:i32,z:i32,v:i32,id:i32):void{

    }
    clearData():void{

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