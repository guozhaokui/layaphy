import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import NaiveBroadphase from "../collision/NaiveBroadphase";
import World from "../world/World";
import CannonBody from "./CannonBody";

export class CannonWorld extends Script3D{
    world = new World();
    static inst:CannonWorld;
    bodies:CannonBody[]=[];

    constructor(){
        super();
        CannonWorld.inst=this;
        let world = this.world;
        world.quatNormalizeSkip = 0;
        world.quatNormalizeFast = false;
    
        world.gravity.set(0,-10,0);
        world.allowSleep=true;
        world.stepnumber=1;
    }

    onUpdate(){
        //let dt = Laya.systemTimer.delta/1000;
        this.world.step(1/60);//,dt);

        let i:i32=0;
        let sz:i32=this.bodies.length;
        for( ;i<sz; i++){
            let cb = this.bodies[i];
            cb.applyPose();
        }
        //console.log('update phy1');
    }
}