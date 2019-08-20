import EventTarget from '../utils/EventTarget.js';
import Shape from '../shapes/Shape.js';
import Vec3 from '../math/Vec3.js';
import Mat3 from '../math/Mat3.js';
import Quaternion from '../math/Quaternion.js';
import Material from '../material/Material.js';
import AABB from '../collision/AABB.js';
import Box from '../shapes/Box.js';
import World from '../world/World.js';

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
export default class Body extends EventTarget {

    /**
     * Dispatched after two bodies collide. This event is dispatched on each
     * of the two bodies involved in the collision.
     * @event collide
     * @param {Body} body The body that was involved in the collision.
     * @param {ContactEquation} contact The details of the collision.
     */
    static COLLIDE_EVENT_NAME = "collide";

    /**
     * A dynamic body is fully simulated. Can be moved manually by the user, but normally they move according to forces. A dynamic body can collide with all body types. A dynamic body always has finite, non-zero mass.
     */
    static DYNAMIC = 1;

    /**
     * A static body does not move during simulation and behaves as if it has infinite mass. Static bodies can be moved manually by setting the position of the body. The velocity of a static body is always zero. Static bodies do not collide with other static or kinematic bodies.
     */
    static STATIC = 2;

    /**
     * A kinematic body moves under simulation according to its velocity. They do not respond to forces. They can be moved manually, but normally a kinematic body is moved by setting its velocity. A kinematic body behaves as if it has infinite mass. Kinematic bodies do not collide with other static or kinematic bodies.
     */
    static KINEMATIC = 4;

    static AWAKE = 0;
    static SLEEPY = 1;
    static SLEEPING = 2;

    static idCounter = 0;

    /**
     * Dispatched after a sleeping body has woken up.
     * @event wakeup
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

    /**
     * Reference to the world the body is living in
     */
    world: World = null;

    /**
     * Callback function that is used BEFORE stepping the system. Use it to apply forces, for example. Inside the function, "this" will refer to this Body object.
     * @type {Function}
     * @deprecated Use World events instead
     */
    preStep: () => void = null;

    /**
     * Callback function that is used AFTER stepping the system. Inside the function, "this" will refer to this Body object.
     * @type {Function}
     * @deprecated Use World events instead
     */
    postStep: () => void = null;

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

    previousPosition = new Vec3();

    /**
     * Interpolated position of the body.
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

    mass = 0;
    invMass = 0;

    material = null;

    linearDamping = 0.01;

    /**
     * One of: Body.DYNAMIC, Body.STATIC and Body.KINEMATIC.
     */
    type = Body.STATIC;

    /**
     * If true, the body will automatically fall to sleep.
     */
    allowSleep = true;

    /**
     * Current sleep state.
     */
    sleepState = 0;

    /**
     * If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
     */
    sleepSpeedLimit = 0.1;

    /**
     * If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
     */
    sleepTimeLimit = 1;

    timeLastSleepy = 0;

    _wakeUpAfterNarrowphase = false;

    /**
     * World space rotational force on the body, around center of mass.
     */
    torque = new Vec3();

    /**
     * World space orientation of the body.
     */
    quaternion = new Quaternion();

    initQuaternion = new Quaternion();

    previousQuaternion = new Quaternion();

    /**
     * Interpolated orientation of the body.
     */
    interpolatedQuaternion = new Quaternion();

    /**
     * Angular velocity of the body, in world space. Think of the angular velocity as a vector, which the body rotates around. The length of this vector determines how fast (in radians per second) the body rotates.
     */
    angularVelocity = new Vec3();

    initAngularVelocity = new Vec3();

    shapes: Shape[] = [];

    /**
     * Position of each Shape in the body, given in local Body space.
     */
    shapeOffsets: Vec3[] = [];

    /**
     * Orientation of each Shape, given in local Body space.
     */
    shapeOrientations = [];

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

    angularDamping = 0.01;  // 旋转速度的衰减，现在没有材质能提供转动摩擦

    /**
     * Use this property to limit the motion along any world axis. (1,1,1) will allow motion along all axes while (0,0,0) allows none.
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
    aabbNeedsUpdate = true;

    /**
     * Total bounding radius of the Body including its shapes, relative to body.position.
     */
    boundingRadius = 0;

    wlambda = new Vec3();

    constructor(mass: f32 = 1, shape: Shape = null, options?: BodyInitOptions) {
        super();
        this.mass = mass;
        this.invMass = mass > 0 ? 1.0 / mass : 0;
        this.type = (mass <= 0.0 ? Body.STATIC : Body.DYNAMIC);

        if (options) {
            this.collisionFilterGroup = typeof (options.collisionFilterGroup) === 'number' ? options.collisionFilterGroup : 1;
            this.collisionFilterMask = typeof (options.collisionFilterMask) === 'number' ? options.collisionFilterMask : -1;
            this.material = options.material;
            this.linearDamping = typeof (options.linearDamping) === 'number' ? options.linearDamping : 0.01;
            this.allowSleep = typeof (options.allowSleep) !== 'undefined' ? options.allowSleep : true;
            this.sleepSpeedLimit = typeof (options.sleepSpeedLimit) !== 'undefined' ? options.sleepSpeedLimit : 0.1;
            this.sleepTimeLimit = typeof (options.sleepTimeLimit) !== 'undefined' ? options.sleepTimeLimit : 1;
            this.fixedRotation = typeof (options.fixedRotation) !== "undefined" ? options.fixedRotation : false;
            this.angularDamping = typeof (options.angularDamping) !== 'undefined' ? options.angularDamping : 0.01;
            if (options.position) {
                this.position.copy(options.position);
                this.previousPosition.copy(options.position);
                this.interpolatedPosition.copy(options.position);
                this.initPosition.copy(options.position);
            }
            if (options.velocity) {
                this.velocity.copy(options.velocity);
            }

            if (typeof (options.type) === typeof (Body.STATIC)) {
                this.type = options.type;
            }
            if (options.quaternion) {
                this.quaternion.copy(options.quaternion);
                this.initQuaternion.copy(options.quaternion);
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

    /**
     * Wake the body up.
     * @method wakeUp
     */
    wakeUp() {
        const s = this.sleepState;
        this.sleepState = 0;
        this._wakeUpAfterNarrowphase = false;
        if (s === Body.SLEEPING) {
            this.dispatchEvent(Body.wakeupEvent);
        }
    }

    /**
     * Force body sleep
     * @method sleep
     */
    sleep() {
        this.sleepState = Body.SLEEPING;
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this._wakeUpAfterNarrowphase = false;
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
            if (sleepState === Body.AWAKE && speedSquared < speedLimitSquared) {
                this.sleepState = Body.SLEEPY; // Sleepy
                this.timeLastSleepy = time;
                this.dispatchEvent(Body.sleepyEvent);
            } else if (sleepState === Body.SLEEPY && speedSquared > speedLimitSquared) {
                this.wakeUp(); // Wake up
            } else if (sleepState === Body.SLEEPY && (time - this.timeLastSleepy) > this.sleepTimeLimit) {
                this.sleep(); // Sleeping
                this.dispatchEvent(Body.sleepEvent);
            }
        }
    }

    /**
     * If the body is sleeping, it should be immovable / have infinite mass during solve. We solve it by having a separate "solve mass".
     */
    updateSolveMassProperties() {
        if (this.sleepState === Body.SLEEPING || this.type === Body.KINEMATIC) {
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
    pointToLocalFrame(worldPoint: Vec3, result: Vec3) {
        var result = result || new Vec3();
        worldPoint.vsub(this.position, result);
        this.quaternion.conjugate().vmult(result, result);
        return result;
    }

    /**
     * Convert a world vector to local body frame.
     */
    vectorToLocalFrame(worldVector: Vec3, result?: Vec3) {
        var result = result || new Vec3();
        this.quaternion.conjugate().vmult(worldVector, result);
        return result;
    }

    /**
     * Convert a local body point to world frame.
     */
    pointToWorldFrame(localPoint: Vec3, result: Vec3) {
        var result = result || new Vec3();
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
     * @return The body object, for chainability.
     */
    addShape(shape: Shape, _offset?: Vec3, _orientation?: Quaternion) {
        const offset = new Vec3();
        const orientation = new Quaternion();

        if (_offset) {
            offset.copy(_offset);
        }
        if (_orientation) {
            orientation.copy(_orientation);
        }

        this.shapes.push(shape);
        this.shapeOffsets.push(offset);
        this.shapeOrientations.push(orientation);
        this.updateMassProperties();
        this.updateBoundingRadius();

        this.aabbNeedsUpdate = true;

        shape.body = this;

        return this;
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
            shape.updateBoundingSphereRadius();
            const offset = shapeOffsets[i].length();
            const r = shape.boundingSphereRadius;
            if (offset + r > radius) {
                radius = offset + r;
            }
        }

        this.boundingRadius = radius;
    }

    /**
     * Updates the .aabb
     * @todo rename to updateAABB()
     */
    computeAABB() {
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
            bodyQuat.vmult(shapeOffsets[i], offset);
            offset.vadd(this.position, offset);

            // Get shape world quaternion
            shapeOrientations[i].mult(bodyQuat, orientation);

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
            const m1 = uiw_m1;
            const m2 = uiw_m2;
            const m3 = uiw_m3;
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
        if (this.type !== Body.DYNAMIC) { // Needed?
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
        if (this.type !== Body.DYNAMIC) {
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
     * @param   impulse The amount of impulse to add.
     * @param   relativePoint A point relative to the center of mass to apply the force on.
     */
    applyImpulse(impulse: Vec3, relativePoint: Vec3) {
        if (this.type !== Body.DYNAMIC) {
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
        if (this.type !== Body.DYNAMIC) {
            return;
        }

        const worldImpulse = Body_applyLocalImpulse_worldImpulse;
        const relativePointWorld = Body_applyLocalImpulse_relativePoint;

        // Transform the force vector to world space
        this.vectorToWorldFrame(localImpulse, worldImpulse);
        this.vectorToWorldFrame(localPoint, relativePointWorld);

        this.applyImpulse(worldImpulse, relativePointWorld);
    }

    /**
     * Should be called whenever you change the body shape or mass.
     */
    updateMassProperties() {
        const halfExtents = Body_updateMassProperties_halfExtents;

        this.invMass = this.mass > 0 ? 1.0 / this.mass : 0;
        const I = this.inertia;
        const fixed = this.fixedRotation;

        // Approximate with AABB box
        this.computeAABB();
        halfExtents.set(
            (this.aabb.upperBound.x - this.aabb.lowerBound.x) / 2,
            (this.aabb.upperBound.y - this.aabb.lowerBound.y) / 2,
            (this.aabb.upperBound.z - this.aabb.lowerBound.z) / 2
        );
        Box.calculateInertia(halfExtents, this.mass, I);

        this.invInertia.set(
            I.x > 0 && !fixed ? 1.0 / I.x : 0,
            I.y > 0 && !fixed ? 1.0 / I.y : 0,
            I.z > 0 && !fixed ? 1.0 / I.z : 0
        );
        this.updateInertiaWorld(true);
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
     * @param  dt Time step
     * @param  quatNormalize Set to true to normalize the body quaternion
     * @param  quatNormalizeFast If the quaternion should be normalized using "fast" quaternion normalization
     */
    integrate(dt: number, quatNormalize: boolean, quatNormalizeFast: boolean) {
        // Save previous position
        this.previousPosition.copy(this.position);
        this.previousQuaternion.copy(this.quaternion);

        if (!(this.type === Body.DYNAMIC || this.type === Body.KINEMATIC) || this.sleepState === Body.SLEEPING) { // Only for dynamic
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

        const e = invInertia.elements;
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
}


var tmpVec = new Vec3();
var tmpQuat = new Quaternion();

var computeAABB_shapeAABB = new AABB();

var uiw_m1 = new Mat3();
var uiw_m2 = new Mat3();
var uiw_m3 = new Mat3();

const Body_applyForce_r = new Vec3();
var Body_applyForce_rotForce = new Vec3();

var Body_applyLocalForce_worldForce = new Vec3();
var Body_applyLocalForce_relativePointWorld = new Vec3();

const Body_applyImpulse_r = new Vec3();
var Body_applyImpulse_velo = new Vec3();
var Body_applyImpulse_rotVelo = new Vec3();

var Body_applyLocalImpulse_worldImpulse = new Vec3();
var Body_applyLocalImpulse_relativePoint = new Vec3();

var Body_updateMassProperties_halfExtents = new Vec3();

const torque = new Vec3();
const invI_tau_dt = new Vec3();
const w = new Quaternion();
const wq = new Quaternion();
