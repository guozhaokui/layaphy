import Body from './Body.js';
import Sphere from '../shapes/Sphere.js';
import Box from '../shapes/Box.js';
import Vec3 from '../math/Vec3.js';
import HingeConstraint from '../constraints/HingeConstraint.js';
import Constraint from '../constraints/Constraint.js';
import World from '../world/World.js';

/**
 * Simple vehicle helper class with spherical rigid body wheels.
 */
export default class RigidVehicle {
    wheelBodies: Body[] = [];
    coordinateSystem: Vec3;
    chassisBody: Body;
    constraints: HingeConstraint[] = [];
    wheelAxes = [];
    wheelForces = [];

    constructor(coordinateSystem: Vec3, chassisBody: Body) {
        this.coordinateSystem = coordinateSystem ? coordinateSystem.clone() : new Vec3(1, 2, 3);
        chassisBody && (this.chassisBody = chassisBody);

        if (!this.chassisBody) {
            // No chassis body given. Create it!
            const chassisShape = new Box(new Vec3(5, 2, 0.5));
            this.chassisBody = new Body(1, chassisShape);
        }
    }

    /**
     * Add a wheel
     * @method addWheel
     * @param {object} options
     * @param {boolean} [options.isFrontWheel]
     * @param {Vec3} [options.position] Position of the wheel, locally in the chassis body.
     * @param {Vec3} [options.direction] Slide direction of the wheel along the suspension.
     * @param {Vec3} [options.axis] Axis of rotation of the wheel, locally defined in the chassis.
     * @param {Body} [options.body] The wheel body.
     */
    addWheel(body: Body, position: Vec3 = new Vec3(), direction: Vec3, axis: Vec3 = new Vec3()) {
        let wheelBody = body;
        if (!wheelBody) {
            wheelBody = new Body(1, new Sphere(1.2));
        }
        this.wheelBodies.push(wheelBody);
        this.wheelForces.push(0);

        // Position constrain wheels
        const zero = new Vec3();

        // Set position locally to the chassis
        const worldPosition = new Vec3();
        this.chassisBody.pointToWorldFrame(position, worldPosition);
        wheelBody.position.set(worldPosition.x, worldPosition.y, worldPosition.z);

        // Constrain wheel
        this.wheelAxes.push(axis);

        const hingeConstraint = new HingeConstraint(this.chassisBody, wheelBody, 1e6, position, Vec3.ZERO, axis, axis);
        this.constraints.push(hingeConstraint);
        return this.wheelBodies.length - 1;
    }

    /**
     * Set the steering value of a wheel.
     * @todo check coordinateSystem
     */
    setSteeringValue(value: f32, wheelIndex: i32) {
        // Set angle of the hinge axis
        const axis = this.wheelAxes[wheelIndex];

        const c = Math.cos(value);
        const s = Math.sin(value);
        const x = axis.x;
        const y = axis.y;
        this.constraints[wheelIndex].axisA.set(
            c * x - s * y,
            s * x + c * y,
            0
        );
    }

    /**
     * Set the target rotational speed of the hinge constraint.
     */
    setMotorSpeed(value:f32, wheelIndex:i32) {
        const hingeConstraint = this.constraints[wheelIndex];
        hingeConstraint.enableMotor();
        hingeConstraint.motorTargetVelocity = value;
    }

    /**
     * Set the target rotational speed of the hinge constraint.
     */
    disableMotor(wheelIndex: i32) {
        const hingeConstraint = this.constraints[wheelIndex];
        hingeConstraint.disableMotor();
    }

    /**
     * Set the wheel force to apply on one of the wheels each time step
     * @method setWheelForce
     * @param  {number} value
     * @param  {integer} wheelIndex
     */
    setWheelForce(value, wheelIndex) {
        this.wheelForces[wheelIndex] = value;
    }

    /**
     * Apply a torque on one of the wheels.
     */
    applyWheelForce(value: f32, wheelIndex: i32) {
        const axis = this.wheelAxes[wheelIndex];
        const wheelBody = this.wheelBodies[wheelIndex];
        const bodyTorque = wheelBody.torque;

        axis.scale(value, torque);
        wheelBody.vectorToWorldFrame(torque, torque);
        bodyTorque.vadd(torque, bodyTorque);
    }

    /**
     * Add the vehicle including its constraints to the world.
     */
    addToWorld(world: World) {
        const constraints = this.constraints;
        const bodies = this.wheelBodies.concat([this.chassisBody]);

        for (var i: i32 = 0; i < bodies.length; i++) {
            world.addBody(bodies[i]);
        }

        for (var i: i32 = 0; i < constraints.length; i++) {
            world.addConstraint(constraints[i]);
        }

        world.addEventListener('preStep', this._update.bind(this));
    }

    _update() {
        const wheelForces = this.wheelForces;
        for (let i: i32 = 0; i < wheelForces.length; i++) {
            this.applyWheelForce(wheelForces[i], i);
        }
    }

    /**
     * Remove the vehicle including its constraints from the world.
     */
    removeFromWorld(world: World) {
        const constraints = this.constraints;
        const bodies = this.wheelBodies.concat([this.chassisBody]);

        for (var i: i32 = 0; i < bodies.length; i++) {
            world.remove(bodies[i]);
        }

        for (var i: i32 = 0; i < constraints.length; i++) {
            world.removeConstraint(constraints[i]);
        }
    }

    /**
     * Get current rotational velocity of a wheel
     */
    getWheelSpeed(wheelIndex: i32) {
        const axis = this.wheelAxes[wheelIndex];
        const wheelBody = this.wheelBodies[wheelIndex];
        const w = wheelBody.angularVelocity;
        this.chassisBody.vectorToWorldFrame(axis, worldAxis);
        return w.dot(worldAxis);
    }
}

var torque = new Vec3();
var worldAxis = new Vec3();
