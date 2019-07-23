import { Vector3 } from "../laya/laya/d3/math/Vector3";
import { Quaternion } from "../laya/laya/d3/math/Quaternion";
import { BoundBox } from "../laya/laya/d3/math/BoundBox";
import { PhyShape } from "./shapes/Shape";
import { Matrix3x3 } from "../laya/laya/d3/math/Matrix3x3";
import { PhyBox } from "./shapes/PhyBox";
import { mat3Scale } from "./math/PhyUtils";
type Vec3 = Vector3;
let Vec3 = Vector3;

export const enum BODYTYPE{
    STATIC=1,
    DYNAMIC=2,
    KINEMATIC=4,
    DYNAMIC_OR_KINEMATIC = 6
}

export const enum BODYSTATE{
    ACTIVE,
    SLEEPY,
    SLEEPING
}

/**
 * TODO 分成两个类，把不旋转的分开
 */
export class PhyBody{
    type = BODYTYPE.STATIC;             // 可以是多种
    sleepState = BODYSTATE.ACTIVE;
    allowSleep=false;

    collisionFilterGroup=0xffffffff;    // 碰撞组。被检测。别人都可以碰我
    collisionFilterMask=0xffffffff;     // 检测用。全部检测

    AABB:BoundBox;          // 包围盒

    shapes:PhyShape[];
    shapeOffsets:Vector3[];             //每个shape的位置
    shapeOrientations:Quaternion[];     // 每个shape的朝向
    
    gravity:Vec3;
    position:Vec3;          // 位置
    quaternion:Quaternion;  // 旋转
    mass=0;
    invMass=0;
    inertia = new Vec3();     // 转动惯量
    invInertia = new Vec3();
    invInertiaWorld = new Matrix3x3();  // 世界空间转动惯量。计算角加速度的时候用这个

    // solve的时候使用的相关变量。因为受到状态的影响，所以分开表示
    invMassSolve=0;
    invInertiaSolve=new Vec3();
    invInertiaWorldSolve=new Matrix3x3();

    velocity=new Vec3();        // 线速度
    angularVelocity:Vec3;       // 角速度

    aabbNeedsUpdate=true;
    aabb=new BoundBox(new Vec3(), new Vec3());

    fixedRotation=false;    // 是否不允许旋转。修改后需要调用 updateMassProperties

    //f:Vec3; //经过重心的力
    force = new Vec3();     // 受力。世界空间中的。
    torque = new Vec3();    // 世界空间中的力矩。绕着质心。

    linearDamping=0;        // 线速度阻尼
    angularDamping=0;       // 角速度阻尼


    //temp
    static tmpVec = new Vec3();
    static tmpQuat = new Quaternion();    

    constructor(){

    }

    wakeup(){

    }

    sleep(){

    }

    /**
     * 更新sleep状态
     * @param tm 
     */
    sleepTick(tm:number){
        if(this.allowSleep){
            //TODO 根据状态和速度来转换sleep状态，并且发送sleep事件
        }
    }

    /**
     * If the body is sleeping, it should be immovable / have infinite mass during solve. We solve it by having a separate "solve mass".
     * @method updateSolveMassProperties
     */
    updateSolveMassProperties(){
        if(this.sleepState === BODYSTATE.SLEEPING || this.type === BODYTYPE.KINEMATIC){
            this.invMassSolve = 0;
            this.invInertiaSolve.setValue(0,0,0);
            this.invInertiaWorldSolve.elements.fill(0);
        } else {
            this.invMassSolve = this.invMass;
            this.invInertia.cloneTo(this.invInertiaSolve);
            this.invInertiaWorld.cloneTo(this.invInertiaWorldSolve);
        }
    };

    computeAABB(){
        var shapes = this.shapes,
            shapeOffsets = this.shapeOffsets,
            shapeOrientations = this.shapeOrientations,
            N = shapes.length,
            offset = PhyBody.tmpVec,
            orientation = PhyBody.tmpQuat,
            bodyQuat = this.quaternion,
            aabb = this.aabb,
            shapeAABB = computeAABB_shapeAABB;
    
        // 根据所有的shape来计算AABB
        for(var i=0; i!==N; i++){
            var shape = shapes[i];
    
            // Get shape world position
            bodyQuat.vmult(shapeOffsets[i], offset);
            offset.vadd(this.position, offset);
    
            // Get shape world quaternion
            shapeOrientations[i].mult(bodyQuat, orientation);
    
            // Get shape AABB
            shape.calculateWorldAABB(offset, orientation, shapeAABB.lowerBound, shapeAABB.upperBound);
    
            if(i === 0){
                aabb.copy(shapeAABB);
            } else {
                aabb.extend(shapeAABB);
            }
        }
    
        this.aabbNeedsUpdate = false;
    };

    static uiw_m1 = new Matrix3x3();
    static uiw_m2 = new Matrix3x3();
    static uiw_m3 = new Matrix3x3();
    /**
     * Update .inertiaWorld and .invInertiaWorld
     */
    updateInertiaWorld(force=false){
        var I = this.invInertia;
        if (I.x === I.y && I.y === I.z && !force) {
            // If inertia M = s*I, where I is identity and s a scalar, then
            //    R*M*R' = R*(s*I)*R' = s*R*I*R' = s*R*R' = s*I = M
            // where R is the rotation matrix.
            // In other words, we don't have to transform the inertia if all
            // inertia diagonal entries are equal.
        } else {
            var m1 = PhyBody.uiw_m1,
                m2 = PhyBody.uiw_m2,
                m3 = PhyBody.uiw_m3;
            // 把 I和invI转换到世界空间
            Matrix3x3.createRotationQuaternion(this.quaternion, m1);
            m1.transpose(m2);   // invM1
            mat3Scale(m1,I,m1);
            Matrix3x3.multiply(m1,m2,this.invInertiaWorld);
        }
    };    

    static Body_updateMassProperties_halfExtents = new Vec3();
    /**
     * Should be called whenever you change the body shape or mass.
     */
    updateMassProperties (){
        var halfExtents = PhyBody.Body_updateMassProperties_halfExtents;

        this.invMass = this.mass > 0 ? 1.0 / this.mass : 0;
        var I = this.inertia;
        var fixed = this.fixedRotation;

        // Approximate with AABB box
        this.computeAABB();
        halfExtents.setValue(
            (this.aabb.max.x-this.aabb.min.x) / 2,
            (this.aabb.max.y-this.aabb.min.y) / 2,
            (this.aabb.max.z-this.aabb.min.z) / 2
        );

        PhyBox.calculateInertia(halfExtents, this.mass, I);

        this.invInertia.setValue(
            I.x > 0 && !fixed ? 1.0 / I.x : 0,
            I.y > 0 && !fixed ? 1.0 / I.y : 0,
            I.z > 0 && !fixed ? 1.0 / I.z : 0
        );
        this.updateInertiaWorld(true);
    }

    /**
     * 
     * @param dt 时间间隔，单位是秒
     * @param quatNormalize     是否normalize 旋转
     * @param quatNormalizeFast 如果要normalize旋转的话，使用fast方法
     */
    integrate(dt, quatNormalize, quatNormalizeFast){

    }
}