import Vec3 from '../math/Vec3.js';
import Transform from '../math/Transform.js';
import RaycastResult from '../collision/RaycastResult.js';
import Body from './Body.js';

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
export default class WheelInfo {

    /**
     * Max travel distance of the suspension, in meters.
     */
    maxSuspensionTravel: number=1;

    /**
     * Speed to apply to the wheel rotation when the wheel is sliding.
     */
    customSlidingRotationalSpeed: number=-0.1;

    /**
     * If the customSlidingRotationalSpeed should be used.
     */
    useCustomSlidingRotationalSpeed: boolean=false;

    sliding = false;

    /**
     * Connection point, defined locally in the chassis body frame.
     */
    chassisConnectionPointLocal: Vec3 = new Vec3();

    chassisConnectionPointWorld: Vec3 = new Vec3();

    directionLocal: Vec3 = new Vec3();

    directionWorld: Vec3 = new Vec3();
    axleLocal: Vec3 = new Vec3();

    axleWorld: Vec3= new Vec3();

    suspensionRestLength: number=1;
    suspensionMaxLength: number=2;
    radius: number=1;
    suspensionStiffness: number=100;
    dampingCompression: number=10;
    dampingRelaxation: number=10;
    frictionSlip: number=1000;

    steering = 0;

    /**
     * Rotation value, in radians.
     */
    rotation = 0;
    deltaRotation = 0;

    rollInfluence: number = 0.01;
    maxSuspensionForce: number = Number.MAX_VALUE;
    engineForce = 0;
    brake = 0;
    isFrontWheel=true;
    clippedInvContactDotSuspension = 1;
    suspensionRelativeVelocity = 0;
    suspensionForce = 0;
    skidInfo = 0;

    suspensionLength = 0;

    sideImpulse = 0;

    forwardImpulse = 0;

    /**
     * The result from raycasting
     */
    raycastResult = new RaycastResult();

    /**
     * Wheel world transform
     */
    worldTransform = new Transform();

    isInContact = false;

    constructor(options?: any) {
        /*
        if(options){
            this.maxSuspensionTravel = options.maxSuspensionTravel;
            this.customSlidingRotationalSpeed = options.customSlidingRotationalSpeed;
            this.useCustomSlidingRotationalSpeed = options.useCustomSlidingRotationalSpeed;
            this.chassisConnectionPointLocal = options.chassisConnectionPointLocal.clone();
            this.chassisConnectionPointWorld = options.chassisConnectionPointWorld.clone();
            this.directionLocal = options.directionLocal.clone();
            this.directionWorld = options.directionWorld.clone();
            this.axleLocal = options.axleLocal.clone();
            this.axleWorld = options.axleWorld.clone();
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
        */
    }

    updateWheel(chassis:Body) {
        const raycastResult = this.raycastResult;

        if (this.isInContact) {
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