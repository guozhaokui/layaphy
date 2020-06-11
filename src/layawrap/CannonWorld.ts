import { Script3D } from "laya/d3/component/Script3D";
import {World} from "../world/World";
import {CannonBody} from "./CannonBody";
import { Body } from "../objects/Body";

export class CannonWorld extends Script3D{
    world = new World();
    static inst:CannonWorld;
	dummyBody = new Body(0);
    constructor(){
        super();
        CannonWorld.inst=this;
        let world = this.world;
        world.quatNormalizeSkip = 0;
        world.quatNormalizeFast = false;
    
        world.gravity.set(0,-10,0);
        world.allowSleep=true;
		world.stepnumber=1;
		this.world.addBody(this.dummyBody);
    }

    onUpdate(){
        let world = this.world;
        //let dt = Laya.systemTimer.delta/1000;
        world.step(1/60);//,dt);

        let i:i32=0;
        let sz:i32=world.bodies.length;
        for( ;i<sz; i++){
			let phy = world.bodies[i].userData as CannonBody;
			if(phy)
            	phy.applyPose();
        }
        //console.log('update phy1');
    }
}