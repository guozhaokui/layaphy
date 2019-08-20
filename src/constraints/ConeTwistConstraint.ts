import ConeEquation from '../equations/ConeEquation.js';
import RotationalEquation from '../equations/RotationalEquation.js';
import Vec3 from '../math/Vec3.js';
import PointToPointConstraint from './PointToPointConstraint.js';
import Body from '../objects/Body.js';

/**
 * @class ConeTwistConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {Vec3} [options.pivotA]
 * @param {Vec3} [options.pivotB]
 * @param {Vec3} [options.axisA]
 * @param {Vec3} [options.axisB]
 * @param {Number} [options.maxForce=1e6]
 * @extends PointToPointConstraint
 */
export default class ConeTwistConstraint extends PointToPointConstraint {
    coneEquation:ConeEquation;
    twistEquation:RotationalEquation;
    axisA:Vec3;
    axisB:Vec3;
    angle:f32=0;
    twistAngle:f32=0;
    constructor(bodyA:Body, bodyB:Body, maxForce:f32=1e6, pivotA=new Vec3(), pivotB=new Vec3(), axisA=new Vec3(), axisB=new Vec3(), angle:f32=0, twistAngle:f32=0, collideConnected=false) {
        super(bodyA, pivotA, bodyB, pivotB, maxForce);
        // Set pivot point in between
        this.axisA = axisA.clone();
        this.axisB = axisB.clone();

        this.collideConnected = collideConnected;
        this.angle = angle;
        const c = this.coneEquation = new ConeEquation(bodyA, bodyB, maxForce, axisA, axisB, angle);
        const t = this.twistEquation = new RotationalEquation(bodyA, bodyB, maxForce, axisA, axisB);
        this.twistAngle = twistAngle;

        // Make the cone equation push the bodies toward the cone axis, not outward
        c.maxForce = 0;
        c.minForce = -maxForce;

        // Make the twist equation add torque toward the initial position
        t.maxForce = 0;
        t.minForce = -maxForce;

        this.equations.push(c, t);
    }

    update() {
        const bodyA = this.bodyA;
        const bodyB = this.bodyB;
        const cone = this.coneEquation;
        const twist = this.twistEquation;

        super.update();

        // Update the axes to the cone constraint
        bodyA.vectorToWorldFrame(this.axisA, cone.axisA);
        bodyB.vectorToWorldFrame(this.axisB, cone.axisB);

        // Update the world axes in the twist constraint
        this.axisA.tangents(twist.axisA, twist.axisA);
        bodyA.vectorToWorldFrame(twist.axisA, twist.axisA);

        this.axisB.tangents(twist.axisB, twist.axisB);
        bodyB.vectorToWorldFrame(twist.axisB, twist.axisB);

        cone.angle = this.angle;
        twist.maxAngle = this.twistAngle;
    }
}

ConeTwistConstraint.constructor = ConeTwistConstraint;

const ConeTwistConstraint_update_tmpVec1 = new Vec3();
const ConeTwistConstraint_update_tmpVec2 = new Vec3();

