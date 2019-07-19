import { PhyShape, SHAPETYPES } from "./Shape";
import { Vector3 } from "../../laya/laya/d3/math/Vector3";

export class PhySphere extends PhyShape{
    radius=0;
    constructor(r:number){
        super();
        this.type=SHAPETYPES.SPHERE;
        this.radius=r;
        this.boundingSphereRadius=r;
    }

    calculateLocalInertia(mass:number, target:Vector3){
        if(!target)
            target=new Vector3();
        let I = 2.0*mass*this.radius*this.radius/5.0;//为什么不是 (2/5)m*R*R
        target.x=I;
        target.y=I;
        target.z=I;
        return target;
    }
}