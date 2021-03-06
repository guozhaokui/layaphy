import {HingeConstraint} from '../constraints/HingeConstraint.js';
import {Vec3} from '../math/Vec3.js';
import {Box} from '../shapes/Box.js';
import {Sphere} from '../shapes/Sphere.js';
import {World} from '../world/World.js';
import {Body} from './Body.js';

/**
 * Simple vehicle helper class with spherical rigid body wheels.
 */
export class RigidVehicle {
    wheelBodies: Body[] = [];
    coordinateSystem: Vec3;
    chassisBody: Body;
    constraints: HingeConstraint[] = [];
    wheelAxes:Vec3[] = [];
    wheelForces:f32[] = [];

    constructor(coordinateSystem: Vec3|null, chassisBody: Body|null) {
        this.coordinateSystem = coordinateSystem ? coordinateSystem.clone() : new Vec3(1, 2, 3);
        chassisBody && (this.chassisBody = chassisBody);

        if (!this.chassisBody) {
            // No chassis body given. Create it!
            let chassisShape = new Box(new Vec3(5, 2, 0.5));
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
    addWheel(body: Body|null, position: Vec3 = new Vec3(), direction: Vec3|null=null, axis: Vec3 = new Vec3()) {
        let wheelBody = body;
        if (!wheelBody) {
            wheelBody = new Body(1, new Sphere(1.2));
        }
        this.wheelBodies.push(wheelBody);
        this.wheelForces.push(0);

        // Position constrain wheels
        //const zero = new Vec3();

        // Set position locally to the chassis
        const worldPosition = new Vec3();
        this.chassisBody.pointToWorldFrame(position, worldPosition);
        wheelBody.position.set(worldPosition.x, worldPosition.y, worldPosition.z);

        // Constrain wheel
        this.wheelAxes.push(axis);

		let hingeConstraint = new HingeConstraint(this.chassisBody, wheelBody, 1e6, position, Vec3.ZERO, axis, axis);
		hingeConstraint.collideConnected=false;
        this.constraints.push(hingeConstraint);
        return this.wheelBodies.length - 1;
    }

    /**
     * 方向盘控制。 按照y轴向上的坐标系。所以只是水平旋转
     * @param value 旋转弧度
     */
    setSteeringValue(value: f32, wheelIndex: i32) {
        // Set angle of the hinge axis
        const axis = this.wheelAxes[wheelIndex];

        const c = Math.cos(value);
        const s = Math.sin(value);
        const x = axis.x;
        const y = axis.z;
        this.constraints[wheelIndex].axisA.set(
            c * x - s * y,
            0,
            s * x + c * y
        );
	}
	
	/**
	 * 刹车
	 */
	brake(wheelIndex:int){
        let wheel = this.wheelBodies[wheelIndex];
	}

    /**
     * Set the target rotational speed of the hinge constraint.
     */
    setMotorSpeed(value:f32, wheelIndex:i32) {
        let hingeConstraint = this.constraints[wheelIndex];
        hingeConstraint.enableMotor();
        hingeConstraint.motorTargetVelocity = value;
    }

    /**
     * Set the target rotational speed of the hinge constraint.
     */
    disableMotor(wheelIndex: i32):void {
        const hingeConstraint = this.constraints[wheelIndex];
        hingeConstraint.disableMotor();
    }

    /**
     * Set the wheel force to apply on one of the wheels each time step
     */
    setWheelForce(value:number, wheelIndex:i32):void {
        this.wheelForces[wheelIndex] = value;
    }

    /**
     * Apply a torque on one of the wheels.
     */
    private applyWheelForce(value: f32, wheelIndex: i32) {
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

    private _update() {
        const wheelForces = this.wheelForces;
        for (let i: i32 = 0; i < wheelForces.length; i++) {
            this.applyWheelForce(wheelForces[i], i);
		}
		
		let wheels = this.wheelBodies;
		for(let i=0; i<wheels.length; i++){
			//let w = wheels[i];
			//w.force.y-=100;
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
	
	get speed(){
		return this.chassisBody.velocity.length();
	}

	/**
	 * 为了增加摩擦增加的压力
	 * @param p 
	 */
	addPressure(p:Vec3){

	}
}

var torque = new Vec3();
var worldAxis = new Vec3();
