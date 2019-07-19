import { Vector3 } from "../laya/laya/d3/math/Vector3";
import { Quaternion } from "../laya/laya/d3/math/Quaternion";
import { BoundBox } from "../laya/laya/d3/math/BoundBox";
import { PhyShape } from "./shapes/Shape";
type Vec3 = Vector3;
let Vec3 = Vector3;

export const enum BODYTYPE{
    STATIC=1,
    DYNAMIC=2,
    KINEMATIC=4
}

export const enum BODYSTATE{
    ACTIVE,
    SLEEPY,
    SLEEPING
}

export class PhyBody{
    type = BODYTYPE.STATIC;             // 可以是多种
    sleepState = BODYSTATE.ACTIVE;

    collisionFilterGroup=0xffffffff;    // 碰撞组。被检测。别人都可以碰我
    collisionFilterMask=0xffffffff;     // 检测用。全部检测

    AABB:BoundBox;          // 包围盒

    shapes:PhyShape[];
    
    gravity:Vec3;
    position:Vec3;          // 位置
    quaternion:Quaternion;  // 旋转
    mass=0;
    f:Vec3; //经过重心的力

    wakeup(){

    }
}