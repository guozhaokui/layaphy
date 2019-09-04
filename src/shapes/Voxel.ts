import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";
import Shape, { SHAPETYPE } from "./Shape";
import RaycastResult from "../collision/RaycastResult";
import Mat3 from "../math/Mat3";

/**
 * 可以共享的数据
 * 类似八叉树管理数据
 */
class VoxelData {
    data: Uint8Array;

    has(x: i32, y: i32, z: i32): boolean {
        return false;
    }

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

    // 统一格子管理
    gridsz: f32 = 1;   // 

    addStaticVoxel(vox:VoxelData,pos:Vec3, quat:Quaternion, scale:Vec3):void{

    }

    addDynamicVoxel(vox:VoxelData,pos:Vec3, quat:Quaternion, scale:Vec3):Voxel{
        throw 'ni';
    }

}
