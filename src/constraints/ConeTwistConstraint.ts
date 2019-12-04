import {ConeEquation} from '../equations/ConeEquation.js';
import {RotationalEquation} from '../equations/RotationalEquation.js';
import {Vec3} from '../math/Vec3.js';
import {PointToPointConstraint} from './PointToPointConstraint.js';
import {Body} from '../objects/Body.js';

/**
 * @class ConeTwistConstraint
 * @constructor
 * @author schteppe
 */
export class ConeTwistConstraint extends PointToPointConstraint {
    coneEquation:ConeEquation;
    twistEquation:RotationalEquation;
    axisA:Vec3;
    axisB:Vec3;
    angle:f32=0;
	twistAngle:f32=0;
	/**
	 * 
	 * @param bodyA 
	 * @param bodyB 
	 * @param maxForce 
	 * @param pivotA 
	 * @param pivotB 
	 * @param axisA 
	 * @param axisB 
	 * @param angle 
	 * @param twistAngle 	axis 允许扭曲的弧度。实际是根据axis的垂直轴来做角度限制。
	 * @param collideConnected 
	 */
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
		// TODO 感觉这个地方有问题，各自在本地空间求tangent，然后转到世界空间，那么两个向量是不是没有同一的标准，导致角度不是期望的
		// 以后实在不行就再加一个显式的tangent向量。
        this.axisA.tangents(twist.axisA, twist.axisA);
        bodyA.vectorToWorldFrame(twist.axisA, twist.axisA);

        this.axisB.tangents(twist.axisB, twist.axisB);
        bodyB.vectorToWorldFrame(twist.axisB, twist.axisB);

        cone.angle = this.angle;
        twist.maxAngle = this.twistAngle;
    }
}

ConeTwistConstraint.constructor = ConeTwistConstraint;

//const ConeTwistConstraint_update_tmpVec1 = new Vec3();
//const ConeTwistConstraint_update_tmpVec2 = new Vec3();

