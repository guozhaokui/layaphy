import Constraint from './Constraint.js';
import PointToPointConstraint from './PointToPointConstraint.js';
import RotationalEquation from '../equations/RotationalEquation.js';
import RotationalMotorEquation from '../equations/RotationalMotorEquation.js';
import ContactEquation from '../equations/ContactEquation.js';
import Vec3 from '../math/Vec3.js';
import Body from '../objects/Body.js';

/**
 * Hinge constraint. Think of it as a door hinge. It tries to keep the door in the correct place and with the correct orientation.
 * @class HingeConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {Vec3} [options.pivotA] A point defined locally in bodyA. This defines the offset of axisA.
 * @param {Vec3} [options.axisA] An axis that bodyA can rotate around, defined locally in bodyA.
 * @param {Vec3} [options.pivotB]
 * @param {Vec3} [options.axisB]
 * @param {Number} [options.maxForce=1e6]
 * @extends PointToPointConstraint
 */
export default class HingeConstraint extends PointToPointConstraint {
    /**
     * Rotation axis, defined locally in bodyA.
     */
    axisA: Vec3;
    /**
     * Rotation axis, defined locally in bodyB.
     */
    axisB: Vec3;
    rotationalEquation1: RotationalEquation;
    rotationalEquation2: RotationalEquation;
    motorEquation: RotationalMotorEquation;
    motorTargetVelocity:f32=0;

    constructor(bodyA: Body, bodyB: Body, maxForce:f32=1e6, pivotA=new Vec3(), pivotB=new Vec3(), axisA=new Vec3(1,0,0), axisB=new Vec3(1,0,0)) {
        super(bodyA, pivotA, bodyB, pivotB, maxForce);

        axisA.normalize();
        this.axisA = axisA.clone();
        axisB.normalize();
        this.axisB = axisB.clone();
        const r1 = this.rotationalEquation1 = new RotationalEquation(bodyA, bodyB, maxForce, axisA, axisB);
        const r2 = this.rotationalEquation2 = new RotationalEquation(bodyA, bodyB, maxForce, axisA, axisB);
        const motor = this.motorEquation = new RotationalMotorEquation(bodyA, bodyB, maxForce);
        motor.enabled = false; // Not enabled by default

        // Equations to be fed to the solver
        this.equations.push(
            r1, // rotational1
            r2, // rotational2
            motor
        );
    }

    /**
     * @method enableMotor
     */
    enableMotor() {
        this.motorEquation.enabled = true;
    }

    /**
     * @method disableMotor
     */
    disableMotor() {
        this.motorEquation.enabled = false;
    }

    /**
     * @method setMotorSpeed
     * @param {number} speed
     */
    setMotorSpeed(speed) {
        this.motorEquation.targetVelocity = speed;
    }

    /**
     * @method setMotorMaxForce
     * @param {number} maxForce
     */
    setMotorMaxForce(maxForce: number) {
        this.motorEquation.maxForce = maxForce;
        this.motorEquation.minForce = -maxForce;
    }

    update() {
        const bodyA = this.bodyA;
        const bodyB = this.bodyB;
        const motor = this.motorEquation;
        const r1 = this.rotationalEquation1;
        const r2 = this.rotationalEquation2;
        const worldAxisA = HingeConstraint_update_tmpVec1;
        const worldAxisB = HingeConstraint_update_tmpVec2;

        const axisA = this.axisA;
        const axisB = this.axisB;

        super.update();

        // Get world axes
        bodyA.quaternion.vmult(axisA, worldAxisA);
        bodyB.quaternion.vmult(axisB, worldAxisB);

        worldAxisA.tangents(r1.axisA, r2.axisA);
        r1.axisB.copy(worldAxisB);
        r2.axisB.copy(worldAxisB);

        if (this.motorEquation.enabled) {
            bodyA.quaternion.vmult(this.axisA, motor.axisA);
            bodyB.quaternion.vmult(this.axisB, motor.axisB);
        }
    }
}

HingeConstraint.constructor = HingeConstraint;

var HingeConstraint_update_tmpVec1 = new Vec3();
var HingeConstraint_update_tmpVec2 = new Vec3();

