import { Script3D } from "laya/d3/component/Script3D";
import { BtBody } from "./BulletBody";
import { Laya } from "Laya";
import { getBullet } from "./bulletLoader";

export class BtWorld extends Script3D{
    static inst:BtWorld|null;
    bodies:BtBody[];    // 下标是每个body的id
    cptr:i32;
    _getAllMotionStateInfo:()=>i32;
    _step:(ptr:i32, fixdt:f32,dt:f32, maxstep:i32)=>void;
    bullet:BulletExport|null;
    constructor(){
        super();
        BtWorld.inst=this;
        let bullet = this.bullet = getBullet();
        if(bullet){
            this._getAllMotionStateInfo=bullet.world_getAllMotionState;
            this._step = bullet.world_step
            this.cptr = bullet.createWorld();
        }
    }
    destroy(){
        BtWorld.inst=null;
        if(this.bullet){
            this.bullet.deleteWorld(this.cptr);
        }
    }

    addBody(body:BtBody):void{
        //TODO
    }
    removeBody(body:BtBody):void{
        //TODO
    }
    onUpdate(){
        let dt = Laya.systemTimer.delta/1000;
        this._step(this.cptr,1/60,dt,10);
        let bullet = this.bullet;
        if(bullet){
            let allmotioni = this._getAllMotionStateInfo()>>2;
            let u32buffer= bullet.u32buffer;
            if(u32buffer.byteLength==0){
                u32buffer = bullet.u32buffer = new Uint32Array(bullet.mem.buffer);
            }
            //同步所有的活动对象的物理姿态。
            let i32ptr = allmotioni;
            let changednum:int = u32buffer[i32ptr];
            let changeDataPtr:int = u32buffer[i32ptr+1]>>2;
            for(let i=0; i<changednum; i++){
                let cbodyid:int = u32buffer[changeDataPtr++];
                let bd = this.bodies[cbodyid];
                bd.getPhyTransform();   
                bd.applyPose();
            }
        }
    }
}