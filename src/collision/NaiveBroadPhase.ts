import { Broadphase } from "./Broadphase";
import { PhyWorld } from "../phyWorld";

//最笨的宽检测方式。两两检测。
export class NaiveBroadPhase extends Broadphase{
    collisionPairs(world:PhyWorld, p1:any[], p2:any[]){
        let bodies = world.bodies;
        let n = bodies.length;
        for( let i=0; i<n; i++){
            let A = bodies[i];
            for( let j=0; j<i; j++){
                let B = bodies[j];

                if(!this.needBroadphaseCollision(A,B))
                    continue;
                this.intersectionTest(A,B,p1,p2);
            }
        }
    }
}