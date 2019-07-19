import { Vector3 } from "../laya/laya/d3/math/Vector3";
import { PhyBody, BODYTYPE } from "./PhyBody";
import { Broadphase } from "./collision/Broadphase";
import { NaiveBroadPhase } from "./collision/NaiveBroadPhase";

type Vec3 = Vector3;
let Vec3 = Vector3;

export class PhyWorld{
    bodies: PhyBody[]; //所有的物体
    contacts:any[]; //所有的当前帧的碰撞信息
    gravity = new Vec3(0,-9.8,0);
    time = 0;    // 累计执行时间

    boradphase:Broadphase=null;     // 宽检测对象

    pair1:any[]=[]; // 碰撞检测到的碰撞组
    pair2:any[]=[];

    constructor(){
        this.boradphase = new NaiveBroadPhase();    // 缺省为暴力宽检测对象
    }

    /**
     * 
     * @param dt 
     * @param timeSinceLastCalled   如果为0则表示使用固定间隔dt
     * @param maxSubSteps 
     */
    step(dt:number, timeSinceLastCalled:number=0, maxSubSteps:number=10){
        if(timeSinceLastCalled===0){
            this.internalStep(dt);
            this.time+=dt;
        }else{
            //TODO
        }
    }

    internalStep(dt:number){
        let bodies = this.bodies;
        let g = this.gravity;

        // 遍历所有的动态对象，添加重力影响
        for(let i=0, len=bodies.length; i<len; i++ ){
            let cbody = bodies[i];
            if(cbody.type==BODYTYPE.DYNAMIC){
                var m = cbody.mass;
                cbody.f.x += g.x*m;
                cbody.f.y += g.y*m;
                cbody.f.z += g.z*m;
            }
        }

        // 碰撞检测
        // 宽阶段
        this.pair1.length=0;
        this.pair2.length=0;
        this.boradphase.collisionPairs(this, this.pair1, this.pair2);

        // 下面要窄阶段了，先做一些准备工作
        // 
        //TODO 交换保存的碰撞信息。

        // 生成碰撞信息
        // TODO 保存当前碰撞信息

        // 清理摩擦等式，到pool中

        //

    }

    postStep(){

    }
}