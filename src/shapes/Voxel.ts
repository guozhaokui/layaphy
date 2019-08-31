import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";
import Shape, { SHAPETYPE } from "./Shape";

export class Voxel extends Shape{
    data:Uint8Array;
    pos:Vec3;
    quat:Quaternion;
    scale:Vec3;
    constructor(dt:Uint8Array, xs:i32, ys:i32, zs:i32){
        super();
        this.type = SHAPETYPE.VOXEL;
    }

    onPreNarrowpase(stepId: number,pos:Vec3,quat:Quaternion): void {}
    fill(){
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

    hitPlane(myPos:Vec3, planePos:Vec3, planeNorm:Vec3,hitPos:Vec3):f32{
        throw 'no';
    }

    hitVoxel(otherPos:Vec3, otherQuat:Quaternion, hitPos:Vec3 ):f32{
        throw 'no'
    }

    isSolid(x:i32,y:i32,z:i32):boolean{
        return false;
    }
    
    // 获取xyz的法线
    getNormal(x:i32,y:i32,z:i32,nout:Vec3):Vec3{
        // 根据x,y,z的梯度变化
        throw 'NI';
    }
}

export class VoxelScene{

}
