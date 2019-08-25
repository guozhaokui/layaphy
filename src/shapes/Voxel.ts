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
}

export class VoxelScene{

}
