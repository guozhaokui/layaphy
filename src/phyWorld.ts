import { Vector3 } from "../laya/laya/d3/math/Vector3";
import { PhyBody, BODYTYPE, BODYSTATE } from "./PhyBody";
import { Broadphase } from "./collision/Broadphase";
import { NaiveBroadPhase } from "./collision/NaiveBroadPhase";
import { GSSolver } from "./solver/GSSolver";
import { Matrix3x3 } from "../laya/laya/d3/math/Matrix3x3";
import { Vec3Trans, QuatIntegrate } from "./math/PhyUtils";
import { Quaternion } from "../laya/laya/d3/math/Quaternion";

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

    private invI_tau_dt = new Vec3();    // 计算角速度的临时变量
    private step_w = new Quaternion();   //
    private step_wq = new Quaternion();
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
        let solver = this.solver;

        // 遍历所有的动态对象，添加重力影响
        for(i=0; i<N; i++ ){
            let cbody = bodies[i];
            if(cbody.type==BODYTYPE.DYNAMIC){
                let m = cbody.mass;
                let f = cbody.force;
                f.x += g.x*m;
                f.y += g.y*m;
                f.z += g.z*m;
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

        // contacts 
        // constraints

        let sovIt = solver.solve(dt,this);
        // 去掉所有的式子
        solver.clear();

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

        // 发布 pre-step 事件

        // leap frog
        // 更新速度和位置 
        for(i=0; i<N; i++){
            let bi=bodies[i],
                force = bi.force,
                torque = bi.torque;
            if(bi.type&BODYTYPE.DYNAMIC_OR_KINEMATIC && bi.sleepState!=BODYSTATE.SLEEPING){
                // 只处理运动的物体
                // 线速度
                let dt_div_mass = dt/bi.mass;
                let vel = bi.velocity;
                let pos = bi.position;
                vel.x+=force.x*dt_div_mass;
                vel.y+=force.y*dt_div_mass;
                vel.z+=force.z*dt_div_mass;
                // 使用最新的vel计算位置。（这种可以增加稳定性）
                pos.x+=vel.x*dt;    
                pos.y+=vel.y*dt;
                pos.z+=vel.z*dt;

                // 角速度
                let angVel = bi.angularVelocity;
                if(angVel){
                    let invI_tau_dt = this.invI_tau_dt;
                    let invInertia = bi.invInertiaWorld;
                    let quat = bi.quaternion;

                    Vec3Trans(torque,invInertia,invI_tau_dt);                   //torque*Mat 角加速度
                    invI_tau_dt.x*=dt; invI_tau_dt.y*=dt; invI_tau_dt.z*=dt;    //*dt
                    // 增加角速度
                    angVel.x+=invI_tau_dt.x;
                    angVel.y+=invI_tau_dt.y;
                    angVel.z+=invI_tau_dt.z;

                    // 计算旋转
                    QuatIntegrate(quat, angVel, dt, quat);
                    if( true ){  // quat其实不必每次都normalize
                        quat.normalize(quat);
                    }
                }

                // 更新包围盒
                if(bi.aabb){
                    bi.aabbNeedsUpdate=true;
                }

                // 更新世界空间转动惯量
                if(bi.updateInertiaWorld){
                    bi.updateInertiaWorld();
                }
            }
        }

        // 所有对象上的力清零
        for(i=0; i<N; i++){
            let bi=bodies[i];
            bi.force.setValue(0,0,0);
            bi.torque.setValue(0,0,0);
        }

        this.boradphase.dirty=true;

        this.stepnumber++;
        this.time+=dt;

        // post-step 事件

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