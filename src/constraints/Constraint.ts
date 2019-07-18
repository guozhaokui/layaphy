import { PhyBody } from "../PhyBody";

export class Constraint{
    bodyA:PhyBody;
    bodyB:PhyBody;
    wakeupBodies=true;

    collideConnected=false;     // bodyA和bodyB是否进行碰撞检测

    constructor(A:PhyBody, B:PhyBody, wakeup=true, collide=false ){
        this.bodyA=A;
        this.bodyB=B;
        if(wakeup){
            A.wakeup();
            B.wakeup();
        }
        if(!collide){
            // TODO 给AB做个标记，在宽检测的时候就不要检测
        }
    }

    update(){

    }
}