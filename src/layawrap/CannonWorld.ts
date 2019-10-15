import { Script3D } from "laya/d3/component/Script3D";
import {World} from "../world/World";
import {CannonBody} from "./CannonBody";

export class CannonWorld extends Script3D{
    world = new World();
    static inst:CannonWorld;

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
        let world = this.world;
        //let dt = Laya.systemTimer.delta/1000;
        world.step(1/60);//,dt);

        let i:i32=0;
        let sz:i32=world.bodies.length;
        for( ;i<sz; i++){
            let phy = world.bodies[i].userData as CannonBody;
            phy.applyPose();
        }
        //console.log('update phy1');
    }
}