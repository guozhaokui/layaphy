import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";
import Shape, { SHAPETYPE } from "./Shape";
import RaycastResult from "../collision/RaycastResult";
import Mat3 from "../math/Mat3";

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

class VoxelRawData{
    
}

class VoxelOctree{

}

class VoxelCompletOctree{

}

class VoxelBVH{

}


class VoxelDataHash{
    dataissolid=true;   // false则表示存的是空
    constructor(dt:Uint8Array, xs:i32, ys:i32, zs:i32){
        // 比较0和1那个多，保存数据少的
    }
}

class StaticVoxel{
    id=0;
    voxData: VoxelData;
    //data:Uint8Array;
    pos: Vec3;
    quat: Quaternion;
    mat: Mat3;   // 相当于记录了xyz的轴
    scale: Vec3;
}

export class Voxel extends Shape {
    voxData: VoxelData;
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

/**
 * 静态场景用一个静态hash表维护
 */
export class VoxelScene {
    min: Vec3;   // 场景包围盒
    max: Vec3;

    // 统一格子管理。每个场景可以不同，基本根据主角大小来定
    gridsz: f32 = 1;   // 
    staticsVox:Voxel[]=[];
    // dynamicVox:Voxel[]=[]; 动态格子暂时不做

    addStaticVoxel(vox:StaticVoxel):void{

    }

    removeStaticVoxel(vox:StaticVoxel):void{

    }

}

/**
 * 占用同一个格子的多个静态模型不重复添加
 * 
 */