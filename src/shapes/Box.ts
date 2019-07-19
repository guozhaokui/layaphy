import { PhyShape, SHAPETYPES } from "./Shape";
import { Vector3 } from "../../laya/laya/d3/math/Vector3";

export class PhyBox extends PhyShape{
    halfExtents = new Vector3(1,1,1);
    constructor(halfx:number,halfy:number,halfz:number){
        super();
        this.type=SHAPETYPES.BOX;
        this.halfExtents.x=halfx;
        this.halfExtents.y=halfy;
        this.halfExtents.z=halfz;
        this.boundingSphereRadius = Vector3.scalarLength(this.halfExtents);
    }

    calculateLocalInertia(mass:number, target:Vector3):Vector3{
        target = target || new Vector3();
        PhyBox.calculateInertia(this.halfExtents, mass, target);
        return target;
    }

    updateBoundingSphereRadius(){
        //用么
    }
    static calculateInertia(halfExtents:Vector3,mass:number,target:Vector3){
        var e = halfExtents;
        target.x = 1.0 / 12.0 * mass * (   2*e.y*2*e.y + 2*e.z*2*e.z );
        target.y = 1.0 / 12.0 * mass * (   2*e.x*2*e.x + 2*e.z*2*e.z );
        target.z = 1.0 / 12.0 * mass * (   2*e.y*2*e.y + 2*e.x*2*e.x );
    };    
}