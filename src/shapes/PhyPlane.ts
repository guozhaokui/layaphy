import { PhyShape } from "./Shape";
import { Vector3 } from "../../laya/laya/d3/math/Vector3";
import { Quaternion } from "../../laya/laya/d3/math/Quaternion";

/**
 * 平面缺省是xy平面
 */
export class PhyPlane extends PhyShape{
    worldNormal = new Vector3();
    worldNormalNeedsUpdate=true;
    constructor(){
        super();
        this.boundingSphereRadius = Number.MAX_VALUE;
    }

    computeWorldNormal(quat:Quaternion){
        
        this.worldNormalNeedsUpdate=false;
    }

    /**
     * 平面不可动
     * @param mass 
     * @param target 
     */
    calculateLocalInertia(mass:number, target:Vector3){
        target = target || new Vector3();
        return target;        
    }
}