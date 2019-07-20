import { Vector3 } from "../laya/laya/d3/math/Vector3";
import { PhyBody, BODYTYPE } from "./PhyBody";
import { Broadphase } from "./collision/Broadphase";
import { NaiveBroadPhase } from "./collision/NaiveBroadPhase";
import { GSSolver } from "./solver/GSSolver";

type Vec3 = Vector3;
let Vec3 = Vector3;

export class PhyWorld{
    bodies: PhyBody[]; //所有的物体
    contacts:any[]; //所有的当前帧的碰撞信息
    gravity = new Vec3(0,-9.8,0);
    time = 0;    // 累计执行时间
    stepnumber=0;
    allowSleep=true;

    boradphase:Broadphase=null;     // 宽检测对象
    solver = new GSSolver();

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

    /**
     * 
     * @param dt 单位是秒
     */
    internalStep(dt:number){
        let bodies = this.bodies;
        let g = this.gravity;
        let N = bodies.length;
        let i=0;
        let pow=Math.pow;

        // 遍历所有的动态对象，添加重力影响
        for(i=0; i<N; i++ ){
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
        // 应用阻尼
        for(i=0; i<N; i++){
            var bi=bodies[i];
            if(bi.type&BODYTYPE.DYNAMIC){
                if(bi.linearDamping){
                    let v = bi.velocity;
                    let ld = pow(1.0-bi.linearDamping,dt);
                    v.x*=ld; v.y*=ld; v.z*=ld;
                }
                let av = bi.angularVelocity;
                if(bi.angularDamping && av){
                    let ad = pow(1.0-bi.angularDamping,dt);
                    av.x*=ad; av.y*=ad; av.z*=ad;
                }
            }
        }

        // 发布 prestep 事件

        // leap frog
        for(i=0; i<N; i++){
            let bi=bodies[i];
        }


        this.stepnumber++;
        this.time+=dt;

        // 更新sleep
        if(this.allowSleep){
            for(let i=0; i<N; i++){
                this.bodies[i].sleepTick(this.time);
            }
        }

    }

    postStep(){

    }
}