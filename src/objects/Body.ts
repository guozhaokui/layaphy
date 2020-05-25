import { AABB } from '../collision/AABB.js';
import { ContactInfoMgr } from '../collision/ContactManager.js';
import { Material } from '../material/Material.js';
import { Mat3 } from '../math/Mat3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Vec3 } from '../math/Vec3.js';
import { Box } from '../shapes/Box.js';
import { Shape } from '../shapes/Shape.js';
import { EventTarget } from '../utils/EventTarget.js';
import { World } from '../world/World.js';
import { gridInfo } from '../collision/GridBroadphase1.js';

export interface BodyInitOptions {
    position?: Vec3;
    velocity?: Vec3;
    angularVelocity?: Vec3;
    quaternion?: Quaternion;
    material?: Material;
    type?: number;
    linearDamping?: number;//0.01;
    angularDamping?: number;//0.01;
    allowSleep?: boolean;//true;
    sleepSpeedLimit?: number;//0.1
    sleepTimeLimit?: number;//1
    collisionFilterGroup?: number;//1
    collisionFilterMask?: number;//-1
    fixedRotation?: boolean;//false;
    linearFactor?: Vec3;
    angularFactor?: Vec3;
}

export const enum BODYTYPE{
    /**
     * A dynamic body is fully simulated. Can be moved manually by the user, but normally they move according to forces. 
	 * A dynamic body can collide with all body types. A dynamic body always has finite, non-zero mass.
     */
	DYNAMIC = 1,
	

    /**
     * A static body does not move during simulation and behaves as if it has infinite mass. 
	 * Static bodies can be moved manually by setting the position of the body. The velocity of a static body is always zero. 
	 * Static bodies do not collide with other static or kinematic bodies.
	 * 静态对象不记录碰撞信息
	 * 不计算转动惯量
     */
	STATIC = 2,
	

    /**
     * A kinematic body moves under simulation according to its velocity. They do not respond to forces. 
	 * They can be moved manually, but normally a kinematic body is moved by setting its velocity.
	 * A kinematic body behaves as if it has infinite mass. Kinematic bodies do not collide with other static or kinematic bodies.
	 * 能记录碰撞信息。无物理运动（会自己根据位置计算速度）
     */
	KINEMATIC = 4,

	
	/**
	 * 触发器，任何类型的对象与触发器都只进行碰撞检测
	 * TODO 以后改成bit位表示？
	 * trigger对象也不是动态对象，不计算转动惯量，因此不会物理运动。能记录碰撞信息，
	 * 如果需要能物理运动且只是触发的，用动态对象去掉物理响应来做
	 */
	TRIGGER=8,	

}

export const enum BODY_SLEEP_STATE{
    AWAKE = 0,
    SLEEPY = 1,
    SLEEPING = 2
}

/**
 * Base class for all body types.
 * @example
 *     var body = new Body({
 *         mass: 1
 *     });
 *     var shape = new Sphere(1);
 *     body.addShape(shape);
 *     world.addBody(body);
 */
export class Body extends EventTarget {

    /**
     * Dispatched after two bodies collide. This event is dispatched on each
     * of the two bodies involved in the collision.
     */
	static EVENT_COLLIDE_ENTER = "collideEnter";
	static EVENT_COLLIDE_EXIT = "collideExit";

    static idCounter = 0;

    /**
     * Dispatched after a sleeping body has woken up.
     */
    static wakeupEvent = {
        type: "wakeup"
    };

    /**
     * Dispatched after a body has gone in to the sleepy state.
     */
    static sleepyEvent = {
        type: "sleepy"
    };

    /**
     * Dispatched after a body has fallen asleep.
     */
    static sleepEvent = {
        type: "sleep"
    };

    id = Body.idCounter++;
    index = 0;    //index in world bodies
	name='noname';  // for debug
	
	enable=true;
	/** 是否允许射线检测。 TODO 用collisionResponse*/
	enableRayTest=true;	

    world: World|null =null;    // null 表示没有加到world中

    /**
	 * integrate之前调用
	 * 这时候已经完成碰撞处理了
	 * integrate包含更新速度和位置
     */
    preIntegrate:(b:Body)=>void|undefined;

    /**
	 * integrate之后调用
     */
    postIntegrate:(b:Body)=>void|undefined;

	/** 每次resolve计算的v增量 */
    vlambda = new Vec3();

    collisionFilterGroup = 1;
    collisionFilterMask = -1;

    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
     */
    collisionResponse = true;

    /**
     * World space position of the body.
     */
    position = new Vec3();

    previousPosition = new Vec3();  // 上次的位置

    /**
     * Interpolated position of the body.
     * 在上次位置和这次位置之间的插值的值,还不知道有什么用
     */
    interpolatedPosition = new Vec3();

    /**
     * Initial position of the body
     */
    initPosition = new Vec3();

    /**
     * World space velocity of the body.
     */
    velocity = new Vec3();

    initVelocity = new Vec3();

    /**
     * Linear force on the body in world space.
     */
    force = new Vec3();

    _mass:f32  = 0;
    invMass:f32 = 0;

	material:Material|null=null;
	/** 线速度衰减系数，0到1 */
	private _linearDamping:f32 = 0.01;
	ldampPow=0.9998325084307209;
	get linearDamping(){
		return this._linearDamping;
	}
	set linearDamping(v:number){
		this._linearDamping=v;
		this.ldampPow = Math.pow(1.0-this._linearDamping,1/60);
	}

    type:BODYTYPE = BODYTYPE.STATIC;

    /**
     * If true, the body will automatically fall to sleep.
     */
    allowSleep = true;

    /**
     * Current sleep state.
     */
    sleepState=BODY_SLEEP_STATE.AWAKE;

    /**
     * If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
     */
    sleepSpeedLimit = 0.1;

    /**
     * If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
     */
    sleepTimeLimit = 1;

    timeLastSleepy = 0;

	/** 由于碰撞后满足wakeup条件，需要wakeup了。 一次性的 */
    _wakeUpAfterNarrowphase = false;

    /**
     * World space rotational force on the body, around center of mass.
     */
    torque = new Vec3();

    /**
     * World space orientation of the body.
     */
    quaternion = new Quaternion();
    //initQuaternion = new Quaternion();
    previousQuaternion = new Quaternion();
    /**
     * Interpolated orientation of the body.
     */
	interpolatedQuaternion = new Quaternion();
	
	private _scale:Vec3|null=null;	// 可能有缩放。 只是保存用来缩放新添加的shape的。不在其他地方使用

    /**
     * Angular velocity of the body, in world space. Think of the angular velocity as a vector, which the body rotates around. The length of this vector determines how fast (in radians per second) the body rotates.
     */
    angularVelocity = new Vec3();

    initAngularVelocity = new Vec3();

    shapes: Shape[] = [];

    /**
     * Position of each Shape in the body, given in local Body space.
     */
    shapeOffsets: (Vec3|null)[] = [];

    /**
     * Orientation of each Shape, given in local Body space.
     */
    shapeOrientations:(Quaternion|null)[] = [];

    inertia = new Vec3();

    invInertia = new Vec3();

    invInertiaWorld = new Mat3();

    invMassSolve = 0;

    invInertiaSolve = new Vec3();

    invInertiaWorldSolve = new Mat3();

    /**
     * Set to true if you don't want the body to rotate. Make sure to run .updateMassProperties() after changing this.
     */
    fixedRotation = false;

	private _angularDamping = 0.01;  // 旋转速度的衰减，现在没有材质能提供转动摩擦
	adampPow=0.9998325084307209;
	set angularDamping(v:number){
		this._linearDamping=v;
		this.adampPow = Math.pow(1-v,1/60);
	}
	get angularDamping(){
		return this._angularDamping;
	}

    /**
     * Use this property to limit the motion along any world axis. (1,1,1) will allow motion along all axes while (0,0,0) allows none.
     * 1,1,1可以理解，就是一切按照物理来，0,0,0可以理解，就是关掉受力，其他的无法理解，建议不要用。
     */
    linearFactor = new Vec3(1, 1, 1);

    /**
     * Use this property to limit the rotational motion along any world axis. (1,1,1) will allow rotation along all axes while (0,0,0) allows none.
     */
    angularFactor = new Vec3(1, 1, 1);

    /**
     * World space bounding box of the body and its shapes.
     */
    aabb = new AABB();
    private _aabbNeedsUpdate = true;

    /**
     * Total bounding radius of the Body including its shapes, relative to body.position.
     */
    boundingRadius = 0;

	/** 每次resolve计算的w增量 */
	wlambda = new Vec3();

	/** 如果是kinematic对象，用速度控制还是用位置控制。 */
	kinematicUsePos=false;

	userData:any=null;  // 保存游戏逻辑对象
	dbgData:any=null;

	contact = new ContactInfoMgr();

	/** 每个刚体自定义的重力，设置以后，不再受到全局重力影响 */
	bodyGravity:Vec3|null=null; 

	/** 控制是否显示包围盒 */
	dbgShow=true;	

	/** 格子管理相关信息。以后拿出去 */
	gridinfo:gridInfo|null=null;

    constructor(mass: number = 1, shape: Shape|null = null, pos:Vec3|null=null, options?: BodyInitOptions) {
        super();
        this._mass = mass;
        this.invMass = mass > 0 ? 1.0 / mass : 0;
        this.type = (mass <= 0.0 ? BODYTYPE.STATIC : BODYTYPE.DYNAMIC);
        if(pos){
            this.position.copy(pos);
            this.previousPosition.copy(pos);
            this.interpolatedPosition.copy(pos);
            this.initPosition.copy(pos);
        }

        if (options) {
            this.collisionFilterGroup = typeof (options.collisionFilterGroup) === 'number' ? options.collisionFilterGroup : 1;
            this.collisionFilterMask = typeof (options.collisionFilterMask) === 'number' ? options.collisionFilterMask : -1;
            this.material = options.material||null;
            this.linearDamping = typeof (options.linearDamping) === 'number' ? options.linearDamping : 0.01;
            this.allowSleep = typeof (options.allowSleep) !== 'undefined' ? options.allowSleep : true;
            this.sleepSpeedLimit = typeof (options.sleepSpeedLimit) !== 'undefined' ? options.sleepSpeedLimit : 0.1;
            this.sleepTimeLimit = typeof (options.sleepTimeLimit) !== 'undefined' ? options.sleepTimeLimit : 1;
            this.fixedRotation = typeof (options.fixedRotation) !== "undefined" ? options.fixedRotation : false;
            this.angularDamping = typeof (options.angularDamping) !== 'undefined' ? options.angularDamping : 0.01;
            if (options.velocity) {
                this.velocity.copy(options.velocity);
            }

            if (typeof (options.type) === typeof (BODYTYPE.STATIC)) {
                this.type = options.type as i32;
            }
            if (options.quaternion) {
                this.quaternion.copy(options.quaternion);
                //this.initQuaternion.copy(options.quaternion);
                this.previousQuaternion.copy(options.quaternion);
                this.interpolatedQuaternion.copy(options.quaternion);
            }

            if (options.angularVelocity) {
                this.angularVelocity.copy(options.angularVelocity);
            }

            if (options.linearFactor) {
                this.linearFactor.copy(options.linearFactor);
            }

            if (options.angularFactor) {
                this.angularFactor.copy(options.angularFactor);
            }
        }

        if (shape) {
            this.addShape(shape);
        }

        this.updateMassProperties();
    }

    set mass(v:f32){
		if(v==undefined)
			console.error('set mass error');
        this._mass=v;
        this.updateMassProperties();
    }

    get mass():f32{
        return this._mass;
    }

	setPos(x:number, y:number, z:number):void{
		this.position.set(x,y,z);
		this.aabbNeedsUpdate=true;
	}

	set aabbNeedsUpdate(b:boolean){
		this._aabbNeedsUpdate=b;
		if(b && this.gridinfo){
			this.gridinfo.onNeedUpdate();
		}
	}
	get aabbNeedsUpdate(){
		return this._aabbNeedsUpdate;
	}

	setScale(x:number,y:number, z:number):void{
		let shapes = this.shapes;
		let sn = shapes.length;
		for(let i=0; i<sn; i++){
			shapes[i].setScale(x,y,z);
		}

		if(x==1&&y==1&&z==1){
			this._scale=null;
			return;
		}
			
		if(!this._scale){
			this._scale = new Vec3(x,y,z);
		}else{
			this._scale.set(x,y,z);
		}
		this.updateBoundingRadius();
	}

    /**
     * Wake the body up.
     * @method wakeUp
     */
    wakeUp() {
        const s = this.sleepState;
        this.sleepState = BODY_SLEEP_STATE.AWAKE;
        this._wakeUpAfterNarrowphase = false;
        if (s === BODY_SLEEP_STATE.SLEEPING) {
			this.dispatchEvent(Body.wakeupEvent);
        }
    }

    /**
     * Force body sleep
     * @method sleep
     */
    sleep() {
        this.sleepState = BODY_SLEEP_STATE.SLEEPING;
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this._wakeUpAfterNarrowphase = false;
    }

    isSleep(){
        return this.sleepState===BODY_SLEEP_STATE.SLEEPING;
    }

    /**
     * Called every timestep to update internal sleep timer and change sleep state if needed.
     * @param time The world time in seconds
     */
    sleepTick(time: number) {
        if (this.allowSleep) {
            const sleepState = this.sleepState;
            const speedSquared = this.velocity.lengthSquared() + this.angularVelocity.lengthSquared();
            const speedLimitSquared = this.sleepSpeedLimit ** 2;
            if (sleepState === BODY_SLEEP_STATE.AWAKE && speedSquared < speedLimitSquared) {
                this.sleepState = BODY_SLEEP_STATE.SLEEPY; // Sleepy
                this.timeLastSleepy = time;
                this.dispatchEvent(Body.sleepyEvent);
            } else if (sleepState === BODY_SLEEP_STATE.SLEEPY && speedSquared > speedLimitSquared) {
                this.wakeUp(); // Wake up
            } else if (sleepState === BODY_SLEEP_STATE.SLEEPY && (time - this.timeLastSleepy) > this.sleepTimeLimit) {
                this.sleep(); // Sleeping
                this.dispatchEvent(Body.sleepEvent);
            }
        }
    }

    /**
     * If the body is sleeping, it should be immovable / have infinite mass during solve. We solve it by having a separate "solve mass".
     * @TODO 问题：sleeping状态下，如果要solve，则必然会被唤醒，所以感觉这里有问题 
     */
    updateSolveMassProperties() {
        if (this.sleepState === BODY_SLEEP_STATE.SLEEPING || this.type === BODYTYPE.KINEMATIC) {
            this.invMassSolve = 0;
            this.invInertiaSolve.setZero();
            this.invInertiaWorldSolve.setZero();
        } else {
            this.invMassSolve = this.invMass;
            this.invInertiaSolve.copy(this.invInertia);
            this.invInertiaWorldSolve.copy(this.invInertiaWorld);
        }
    }

    /**
     * Convert a world point to local body frame.
     */
    pointToLocalFrame(worldPoint: Vec3, result: Vec3 = new Vec3()) {
        worldPoint.vsub(this.position, result);
        this.quaternion.conjugate().vmult(result, result);
        return result;
    }

    /**
     * Convert a world vector to local body frame.
     */
    vectorToLocalFrame(worldVector: Vec3, result=new Vec3()) {
        this.quaternion.conjugate().vmult(worldVector, result);
        return result;
    }

    /**
     * Convert a local body point to world frame.
     */
    pointToWorldFrame(localPoint: Vec3, result: Vec3=new Vec3()):Vec3 {
        this.quaternion.vmult(localPoint, result);
        result.vadd(this.position, result);
        return result;
    }

    /**
     * Convert a local body point to world frame.
     */
    vectorToWorldFrame(localVector: Vec3, result: Vec3) {
        var result = result || new Vec3();
        this.quaternion.vmult(localVector, result);
        return result;
    }

    /**
     * Add a shape to the body with a local offset and orientation.
	 * 注意，这个shape目前不要共享，因为1. 如果有缩放，这个shape会被修改，2.。。
     * @return The body object, for chainability.
     */
    addShape(shape: Shape, _offset?: Vec3, _orientation?: Quaternion) {
        let offset:Vec3|null=null;
        let orientation:Quaternion|null=null;// = new Quaternion();

        if (_offset) {
			offset =new Vec3();
			offset.copy(_offset);
        }
        if (_orientation) {
			orientation = new Quaternion();
            orientation.copy(_orientation);
        }

		let scale = this._scale;
		if(scale){
			shape.setScale(scale.x, scale.y,scale.z);
		}
        this.shapes.push(shape);
        this.shapeOffsets.push(offset);
        this.shapeOrientations.push(orientation);
        this.updateMassProperties();
        this.updateBoundingRadius();

        this.aabbNeedsUpdate = true;
        shape.body = this;
        this.onShapeChange();
        return this;
    }

    onShapeChange(){
        this.shapes.forEach( s=>{});
    }

    /**
     * 同时添加多个shape，避免每次都重新计算转动惯量
     */
    addShapes(){

    }

    /**
     * Update the bounding radius of the body. Should be done if any of the shapes are changed.
     */
    updateBoundingRadius() {
        const shapes = this.shapes;
        const shapeOffsets = this.shapeOffsets;
        const N = shapes.length;
        let radius = 0;

        for (let i = 0; i !== N; i++) {
            const shape = shapes[i];
			shape.updateBndSphR();
			let offset = 0;
			let off = shapeOffsets[i];
			if(off){
				offset = off.length();
			}
            const r = shape.boundSphR;
            if (offset + r > radius) {
                radius = offset + r;
            }
        }

        this.boundingRadius = radius;
    }

    /**
     * Updates the .aabb
     * 计算世界空间的AABB
     */
    updateAABB() {
        const shapes = this.shapes;
        const shapeOffsets = this.shapeOffsets;
        const shapeOrientations = this.shapeOrientations;
        const N = shapes.length;
        const offset = tmpVec;
        const orientation = tmpQuat;
        const bodyQuat = this.quaternion;
        const aabb = this.aabb;
        const shapeAABB = computeAABB_shapeAABB;

        for (let i = 0; i !== N; i++) {
            const shape = shapes[i];

			// Get shape world position
			var shapeoff = shapeOffsets[i];
			var shapeQ = shapeOrientations[i];

			if(shapeoff){
            	bodyQuat.vmult(shapeoff, offset);
				offset.vadd(this.position, offset);
			}else{
				offset.copy(this.position);
			}

			// Get shape world quaternion
			if( shapeQ){
				shapeQ.mult(bodyQuat,orientation);
			}else{
				orientation.copy(bodyQuat);
			}

            // Get shape AABB
            shape.calculateWorldAABB(offset, orientation, shapeAABB.lowerBound, shapeAABB.upperBound);

            if (i === 0) {
                aabb.copy(shapeAABB);
            } else {
                aabb.extend(shapeAABB);
            }
        }

        this.aabbNeedsUpdate = false;
    }

    /**
     * Update .inertiaWorld and .invInertiaWorld
     * 转动惯量转到世界空间 I'=RIR'
     */
    updateInertiaWorld(force = false) {
        const I = this.invInertia;
        if (I.x === I.y && I.y === I.z && !force) {
            // If inertia M = s*I, where I is identity and s a scalar, then
            //    R*M*R' = R*(s*I)*R' = s*R*I*R' = s*R*R' = s*I = M
            // where R is the rotation matrix.
            // In other words, we don't have to transform the inertia if all
            // inertia diagonal entries are equal.
        } else {
            // = worldRotMat * diag(I) * invWorldRotMat
            const m1 = uiw_m1;
            const m2 = uiw_m2;
            //const m3 = uiw_m3;
            m1.setRotationFromQuaternion(this.quaternion);
            m1.transpose(m2);
            m1.scale(I, m1);
            m1.mmult(m2, this.invInertiaWorld);
        }
    }

    /**
     * Apply force to a world point. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.torque.
     * @param  force The amount of force to add.
     * @param   relativePoint A point relative to the center of mass to apply the force on.
     */
    applyForce(force: Vec3, relativePoint: Vec3) {
        if (this.type !== BODYTYPE.DYNAMIC) { // Needed?
            return;
        }

        // Compute produced rotational force
        const rotForce = Body_applyForce_rotForce;
        relativePoint.cross(force, rotForce);

        // Add linear force
        this.force.vadd(force, this.force);

        // Add rotational force
        this.torque.vadd(rotForce, this.torque);
    }

    /**
     * Apply force to a local point in the body.
     * @param   force The force vector to apply, defined locally in the body frame.
     * @param   localPoint A local point in the body to apply the force on.
     */
    applyLocalForce(localForce: Vec3, localPoint: Vec3) {
        if (this.type !== BODYTYPE.DYNAMIC) {
            return;
        }

        const worldForce = Body_applyLocalForce_worldForce;
        const relativePointWorld = Body_applyLocalForce_relativePointWorld;

        // Transform the force vector to world space
        this.vectorToWorldFrame(localForce, worldForce);
        this.vectorToWorldFrame(localPoint, relativePointWorld);

        this.applyForce(worldForce, relativePointWorld);
    }

    /**
     * Apply impulse to a world point. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
	 * 施加一个本地坐标系下的冲量。影响线速度和角速度。
     * @param   impulse The amount of impulse to add.
     * @param   relativePoint A point relative to the center of mass to apply the force on.
     */
    applyImpulse(impulse: Vec3, relativePoint: Vec3) {
        if (this.type !== BODYTYPE.DYNAMIC) {
            return;
        }

        // Compute point position relative to the body center
        const r = relativePoint;

        // Compute produced central impulse velocity
        const velo = Body_applyImpulse_velo;
        velo.copy(impulse);
        velo.scale(this.invMass, velo);

        // Add linear impulse
        this.velocity.vadd(velo, this.velocity);

        // Compute produced rotational impulse velocity
        const rotVelo = Body_applyImpulse_rotVelo;
        r.cross(impulse, rotVelo);

        /*
        rotVelo.x *= this.invInertia.x;
        rotVelo.y *= this.invInertia.y;
        rotVelo.z *= this.invInertia.z;
        */
        this.invInertiaWorld.vmult(rotVelo, rotVelo);

        // Add rotational Impulse
        this.angularVelocity.vadd(rotVelo, this.angularVelocity);
    }

    /**
     * Apply locally-defined impulse to a local point in the body.
     * @param  force The force vector to apply, defined locally in the body frame.
     * @param  localPoint A local point in the body to apply the force on.
     */
    applyLocalImpulse(localImpulse: Vec3, localPoint: Vec3) {
        if (this.type !== BODYTYPE.DYNAMIC) {
            return;
        }

        const worldImpulse = Body_applyLocalImpulse_worldImpulse;
        const relativePointWorld = Body_applyLocalImpulse_relativePoint;

        // Transform the force vector to world space
        this.vectorToWorldFrame(localImpulse, worldImpulse);
        this.vectorToWorldFrame(localPoint, relativePointWorld);

        this.applyImpulse(worldImpulse, relativePointWorld);
    }

	set isTrigger(b:boolean){
		if(b) this.type|=BODYTYPE.TRIGGER;
		else{
			this.type &=(~BODYTYPE.TRIGGER);
		}
	}

	get isTrigger():boolean{
		return (this.type & BODYTYPE.TRIGGER)!=0;
	}

	/** 获得整体的接触法线。这里不判断是否接触 */
	getContactNormal(norm:Vec3){
		norm.set(0,0,0);
		let contact = this.contact;
		let n =contact.allcLen; 
		if(n<=0)
			return;
		for( let i=0; i<n; i++){
			let c = contact.allc[i];
			norm.vadd(c.hitnorm, norm);
		}
		norm.scale(1/n,norm);
	}
    /**
     * Should be called whenever you change the body shape or mass.
     * 更新对象的转动惯量相关值
     */
    updateMassProperties() {
		if(this.type & BODYTYPE.TRIGGER)
			return;
		if(this.type==BODYTYPE.DYNAMIC && this._mass<=0.0)
			// 不要改变其他类型的
			this.type=BODYTYPE.STATIC;

        this.invMass = this._mass > 0 ? 1.0 / this._mass : 0;

        const halfExtents = Body_updateMassProperties_halfExtents;

        const I = this.inertia;
        const fixed = this.fixedRotation;

        let shapes = this.shapes;
        if(shapes.length<=0)
            return;

        // 要算转动惯量的包围盒，因此需要忽略旋转。（位置也要忽略，由于不影响下面的计算所以不管）
        let cq = this.quaternion;
        let oqx=cq.x; let oqy=cq.y; let oqz=cq.z; let oqw=cq.w;
        cq.set(0,0,0,1);
        this.updateAABB();
        cq.set(oqx,oqy,oqz,oqw);//恢复旋转
        halfExtents.set(
            (this.aabb.upperBound.x - this.aabb.lowerBound.x) / 2,
            (this.aabb.upperBound.y - this.aabb.lowerBound.y) / 2,
            (this.aabb.upperBound.z - this.aabb.lowerBound.z) / 2
        );

        if(this.type==BODYTYPE.STATIC){
            // statci 不要旋转
            this.invInertia.set(0,0,0);
        }else{
            // 组合形状的话，先用包围盒的转动惯量来模拟
            Box.calculateInertia(halfExtents, this._mass, I);
            /* 如果要精确的话，考虑offset的影响则无法用Vec3来描述转动惯量了 所以先不精确处理了
            if(this.shapes.length>1){
                Box.calculateInertia(halfExtents, this._mass, I);
            }else{
                //TODO 测试
                this.shapes[0].calculateLocalInertia(this.mass,I);
                // 受到shape偏移的影响
                let offpos = this.shapeOffsets[0];
                let offq = this.shapeOrientations[0];
                if(offq){

                }
            }
            */
            this.invInertia.set(
                I.x > 0 && !fixed ? 1.0 / I.x : 0,
                I.y > 0 && !fixed ? 1.0 / I.y : 0,
                I.z > 0 && !fixed ? 1.0 / I.z : 0
            );
			this.updateInertiaWorld(true);
        }
    }

    /**
     * Get world velocity of a point in the body.
     */
    getVelocityAtWorldPoint(worldPoint: Vec3, result: Vec3) {
        const r = new Vec3();
        worldPoint.vsub(this.position, r);
        this.angularVelocity.cross(r, result);
        this.velocity.vadd(result, result);
        return result;
    }

    /**
     * Move the body forward in time.
	 * 先更新速度，使用新的速度计算位置
     * @param  dt Time step
     * @param  quatNormalize Set to true to normalize the body quaternion
     * @param  quatNormalizeFast If the quaternion should be normalized using "fast" quaternion normalization
     */
    integrate(dt: f32, quatNormalize: boolean, quatNormalizeFast: boolean) {
        // Save previous position
        this.previousPosition.copy(this.position);
		this.previousQuaternion.copy(this.quaternion);
		
        if ( this.type===BODYTYPE.STATIC || this.sleepState === BODY_SLEEP_STATE.SLEEPING) { // Only for dynamic
            return;
        }

		// kinematic用位置控制的话，不需要integrate
		if(this.type==BODYTYPE.KINEMATIC && this.kinematicUsePos){
			return;
		}

        const velo = this.velocity;
        const angularVelo = this.angularVelocity;
        const pos = this.position;
        const force = this.force;
        const torque = this.torque;
        const quat = this.quaternion;
        const invMass = this.invMass;
        const invInertia = this.invInertiaWorld;
        const linearFactor = this.linearFactor;

        const iMdt = invMass * dt;
        velo.x += force.x * iMdt * linearFactor.x;
        velo.y += force.y * iMdt * linearFactor.y;
        velo.z += force.z * iMdt * linearFactor.z;

        const e = invInertia.ele;
        const angularFactor = this.angularFactor;
        const tx = torque.x * angularFactor.x;
        const ty = torque.y * angularFactor.y;
        const tz = torque.z * angularFactor.z;
        angularVelo.x += dt * (e[0] * tx + e[1] * ty + e[2] * tz);
        angularVelo.y += dt * (e[3] * tx + e[4] * ty + e[5] * tz);
        angularVelo.z += dt * (e[6] * tx + e[7] * ty + e[8] * tz);

        // Use new velocity  - leap frog
        pos.x += velo.x * dt;
        pos.y += velo.y * dt;
        pos.z += velo.z * dt;

        quat.integrate(this.angularVelocity, dt, this.angularFactor, quat);

        if (quatNormalize) {
            if (quatNormalizeFast) {
                quat.normalizeFast();
            } else {
                quat.normalize();
            }
        }

        this.aabbNeedsUpdate = true;

        // Update world inertia
        this.updateInertiaWorld();
	}
	
	preCollision:()=>void;
}


var tmpVec = new Vec3();
var tmpQuat = new Quaternion();

var computeAABB_shapeAABB = new AABB();

var uiw_m1 = new Mat3();
var uiw_m2 = new Mat3();
//var uiw_m3 = new Mat3();

//const Body_applyForce_r = new Vec3();
var Body_applyForce_rotForce = new Vec3();

var Body_applyLocalForce_worldForce = new Vec3();
var Body_applyLocalForce_relativePointWorld = new Vec3();

//const Body_applyImpulse_r = new Vec3();
var Body_applyImpulse_velo = new Vec3();
var Body_applyImpulse_rotVelo = new Vec3();

var Body_applyLocalImpulse_worldImpulse = new Vec3();
var Body_applyLocalImpulse_relativePoint = new Vec3();

var Body_updateMassProperties_halfExtents = new Vec3();

//const torque = new Vec3();
//const invI_tau_dt = new Vec3();
//const w = new Quaternion();
//const wq = new Quaternion();
