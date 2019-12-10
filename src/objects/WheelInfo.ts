import {Vec3} from '../math/Vec3.js';
import {Transform} from '../math/Transform.js';
import {RaycastResult} from '../collision/RaycastResult.js';
import {Body} from './Body.js';

/**
 * @class WheelInfo
 * @constructor
 * @param {Object} [options]
 *
 * @param {Vec3} [options.chassisConnectionPointLocal]
 * @param {Vec3} [options.chassisConnectionPointWorld]
 * @param {Vec3} [options.directionLocal]
 * @param {Vec3} [options.directionWorld]
 * @param {Vec3} [options.axleLocal]
 * @param {Vec3} [options.axleWorld]
 * @param {number} [options.suspensionRestLength=1]
 * @param {number} [options.suspensionMaxLength=2]
 * @param {number} [options.radius=1]
 * @param {number} [options.suspensionStiffness=100]
 * @param {number} [options.dampingCompression=10]
 * @param {number} [options.dampingRelaxation=10]
 * @param {number} [options.frictionSlip=10000]
 * @param {number} [options.steering=0]
 * @param {number} [options.rotation=0]
 * @param {number} [options.deltaRotation=0]
 * @param {number} [options.rollInfluence=0.01]
 * @param {number} [options.maxSuspensionForce]
 * @param {boolean} [options.isFrontWheel=true]
 * @param {number} [options.clippedInvContactDotSuspension=1]
 * @param {number} [options.suspensionRelativeVelocity=0]
 * @param {number} [options.suspensionForce=0]
 * @param {number} [options.skidInfo=0]
 * @param {number} [options.suspensionLength=0]
 * @param {number} [options.maxSuspensionTravel=1]
 * @param {boolean} [options.useCustomSlidingRotationalSpeed=false]
 * @param {number} [options.customSlidingRotationalSpeed=-0.1]
 */

export class WheelInfo {
	id=0;
    /**
     * Max travel distance of the suspension, in meters.
	 * 悬挂系统允许移动的最大范围。
     */
    maxSuspensionTravel: number=1;

    /**
     * Speed to apply to the wheel rotation when the wheel is sliding.  
     * 当滑动的时候，设置的轮胎转速
     */
    customSlidingRotationalSpeed: number=-0.1;

    /**
     * If the customSlidingRotationalSpeed should be used.
     */
    useCustomSlidingRotationalSpeed: boolean=false;

    sliding = false;

    /**
     * 轮子与底盘的连接点。
	 * 世界空间的是以后更新的时候计算出来的
     */
    chassisConnectionPointLocal: Vec3 = new Vec3();
    chassisConnectionPointWorld: Vec3 = new Vec3();

	/** 向下的方向 */
    directionLocal: Vec3 = new Vec3();
	directionWorld: Vec3 = new Vec3();
	
	/** 轮轴方向 */
    axleLocal: Vec3 = new Vec3();
    axleWorld: Vec3= new Vec3();

	/** 悬挂系统在正常状态下的长度。还可以伸长和压缩，范围是 maxSuspensionTravel */
	suspensionRestLength: number=1;
	/** 悬挂系统允许的最大长度 */
	suspensionMaxLength: number=2;
	
	/** 轮胎半径 */
	radius: number=1;
	
	/** 悬挂系统的硬度。变形*硬度=提供的悬挂力 */
	suspensionStiffness: number=100;
    
    /** 悬挂压缩过程中的阻尼 */
    dampingCompression: number=10;
    /** 悬挂放松过程中的阻尼 */
	dampingRelaxation: number=10;
    
    /** 静摩擦系数。悬挂力乘这个系数表示提供的静摩擦力，超过了就开始打滑 */
    frictionSlip: number=1000;

	/** 方向盘方向，0表示向前 */
    steering = 0;

    /**
	 * 当前轮子的转动弧度
     */
    rotation = 0;
    deltaRotation = 0;

	/** 侧滑力作用位置，0表示在质心，不易翻车，1表示在接触点，易翻车 */
    rollInfluence: number = 0.01;
	maxSuspensionForce: number = Number.MAX_VALUE;
	
    engineForce = 0;
	brake = 0;
	
    isFrontWheel=true;
	clippedInvContactDotSuspension = 1;
	/** 悬挂系统的相对速度。 */
    suspensionRelativeVelocity = 0;
    /** 悬挂系统提供的力，>0 */
    suspensionForce = 0;

	/** 当前的悬挂系统的长度 */
    suspensionLength = 0;

	/** 由于侧滑导致的力 */
    sideImpulse = 0;

	/** 提供的向前的力 */
    forwardImpulse = 0;

    raycastResult = new RaycastResult();

    /** 轮子的世界空间的位置和旋转  */
    worldTransform = new Transform();

	/** 轮胎是否接触地面 */
    isInContact = false;

	/** 打滑比例 */
	slipInfo:i32=0; 
	/** 侧滑比例 */
    skidInfo = 0;

    constructor(options?: any) {
        if(options){
            this.maxSuspensionTravel = options.maxSuspensionTravel;
            this.customSlidingRotationalSpeed = options.customSlidingRotationalSpeed;
            this.useCustomSlidingRotationalSpeed = options.useCustomSlidingRotationalSpeed;
            this.chassisConnectionPointLocal = options.chassisConnectionPointLocal.clone();
            options.chassisConnectionPointWorld && (this.chassisConnectionPointWorld.copy(options.chassisConnectionPointWorld));
            this.directionLocal = options.directionLocal.clone();
            options.directionWorld && this.directionWorld.copy(options.directionWorld);
            this.axleLocal = options.axleLocal.clone();
            options.axleWorld && this.axleWorld.copy( options.axleWorld);
            this.suspensionRestLength = options.suspensionRestLength;
            this.suspensionMaxLength = options.suspensionMaxLength;
            this.radius = options.radius;
            this.suspensionStiffness = options.suspensionStiffness;
            this.dampingCompression = options.dampingCompression;
            this.dampingRelaxation = options.dampingRelaxation;
            this.frictionSlip = options.frictionSlip;
            this.rollInfluence = options.rollInfluence;
            this.maxSuspensionForce = options.maxSuspensionForce;
            this.isFrontWheel = options.isFrontWheel;
        }
    }

    updateWheel(chassis:Body) {
        const raycastResult = this.raycastResult;

        if (this.isInContact) {
			// 接触中
            const project = raycastResult.hitNormalWorld.dot(raycastResult.directionWorld);
            raycastResult.hitPointWorld.vsub(chassis.position, relpos);
            chassis.getVelocityAtWorldPoint(relpos, chassis_velocity_at_contactPoint);
            const projVel = raycastResult.hitNormalWorld.dot(chassis_velocity_at_contactPoint);
            if (project >= -0.1) {
                this.suspensionRelativeVelocity = 0.0;
                this.clippedInvContactDotSuspension = 1.0 / 0.1;
            } else {
                const inv = -1 / project;
                this.suspensionRelativeVelocity = projVel * inv;
                this.clippedInvContactDotSuspension = inv;
            }

        } else {
            // Not in contact : position wheel in a nice (rest length) position
            raycastResult.suspensionLength = this.suspensionRestLength;
            this.suspensionRelativeVelocity = 0.0;
            raycastResult.directionWorld.scale(-1, raycastResult.hitNormalWorld);
            this.clippedInvContactDotSuspension = 1.0;
        }
    }
}

var chassis_velocity_at_contactPoint = new Vec3();
var relpos = new Vec3();
var chassis_velocity_at_contactPoint = new Vec3();