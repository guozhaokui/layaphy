import { Body } from '../objects/Body.js';
import { DistanceConstraint } from './DistanceConstraint.js';
import { Vec3 } from '../math/Vec3.js';

let wp1 = new Vec3();
let wp2 = new Vec3();
let center = new Vec3();

/**
 * 两个body的任意两点间的距离限制。
 */
export class PointToPointDistanceConstraint extends DistanceConstraint {
	pivotA = new Vec3();	// A上的相对位置
    pivotB = new Vec3();	// B上的相对位置
    constructor(bodyA: Body, bodyB: Body, p1:Vec3, p2:Vec3, distance?: f32, maxForce?: f32) {
		super(bodyA, bodyB,distance);
		this.pivotA.copy(p1);
		this.pivotB.copy(p2);
    }

    update() {
        const bodyA = this.bodyA;
        const bodyB = this.bodyB;
		const eq = this.distanceEquation;

        bodyA.quaternion.vmult(this.pivotA, wp1);  // pivot转换到世界空间
		bodyB.quaternion.vmult(this.pivotB, wp2);  
		bodyA.position.vadd(wp1,wp1);
		bodyB.position.vadd(wp2,wp2);

        const halfDist = this.distance * 0.5;
		const normal = eq.ni;

        wp2.vsub(wp1, normal);    // normal = B-A
		normal.normalize();
		// 希望沿着法线中点左右长度为halfDist的点
		
		wp1.addScaledVector(halfDist,normal,eq.ri);
		wp2.addScaledVector(-halfDist,normal,eq.rj);
		eq.ri.vsub(bodyA.position,eq.ri);
		eq.rj.vsub(bodyB.position,eq.rj);
    }
}