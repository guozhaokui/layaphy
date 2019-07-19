import { PhyBody } from "../PhyBody";
import { Vector3 } from "../../laya/laya/d3/math/Vector3";

export const enum SHAPETYPES{
    NA=0,
    SPHERE=1,
    PLANE=2,
    BOX=4,
    COMPOUND=8,
    CONVEXPOLYHEDRON=16,
    HEIGHTFIELD=32,
    PARTICLE=64,
    CYLINDER=128,
    TRIMESH=256,
}

export class PhyShape{
    static idCounter=0;
    id=PhyShape.idCounter++;
    type=SHAPETYPES.NA; // 什么都不是。

    boundingSphereRadius = 0;
    collisionFilterGroup=1;
    collisionFilterMask=0xffffffff;
    material=0;
    body:PhyBody=null;

    constructor(){

    }

    /**
     *  计算形状的转动惯量
     * @param mass 
     * @param target   输出转动惯量，可以为空
     * @return 返回转动惯量
     */
    calculateLocalInertia(mass:number, target:Vector3):Vector3{
        return null;
    }
}