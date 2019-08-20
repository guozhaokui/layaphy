import Constraint from './Constraint.js';
import ContactEquation from '../equations/ContactEquation.js';
import Vec3 from '../math/Vec3.js';
import Body from '../objects/Body.js';

/**
 * Connects two bodies at given offset points.
 * 把A的pivotA与B的pivotB连到一起。限制xyz方向三个自由度
 *
 * @example
 *     var bodyA = new Body({ mass: 1 });
 *     var bodyB = new Body({ mass: 1 });
 *     bodyA.position.set(-1, 0, 0);
 *     bodyB.position.set(1, 0, 0);
 *     bodyA.addShape(shapeA);
 *     bodyB.addShape(shapeB);
 *     world.addBody(bodyA);
 *     world.addBody(bodyB);
 *     var localPivotA = new Vec3(1, 0, 0);
 *     var localPivotB = new Vec3(-1, 0, 0);
 *     var constraint = new PointToPointConstraint(bodyA, localPivotA, bodyB, localPivotB);
 *     world.addConstraint(constraint);
 */
export default class PointToPointConstraint extends Constraint {
     // Pivot, defined locally in bodyA.
    pivotA: Vec3;
     // Pivot, defined locally in bodyB.
    pivotB: Vec3;
    equationX: ContactEquation;
    equationY: ContactEquation;
    equationZ: ContactEquation;
    
    /**
     * @param bodyA 
     * @param pivotA The point relative to the center of mass of bodyA which bodyA is constrained to.
     * @param bodyB Body that will be constrained in a similar way to the same point as bodyA. We will therefore get a link between bodyA and bodyB. If not specified, bodyA will be constrained to a static point.
     * @param pivotB See pivotA.
     * @param maxForce The maximum force that should be applied to constrain the bodies.
     * 
     * 创建了xyz三个 ContactEquation 来实现的
     */
    constructor(bodyA: Body, pivotA: Vec3, bodyB: Body, pivotB: Vec3, maxForce: number=1e6) {
        super(bodyA, bodyB,true);
        this.pivotA = pivotA ? pivotA.clone() : new Vec3();
        this.pivotB = pivotB ? pivotB.clone() : new Vec3();
        const x = this.equationX = new ContactEquation(bodyA, bodyB);
        const y = this.equationY = new ContactEquation(bodyA, bodyB);
        const z = this.equationZ = new ContactEquation(bodyA, bodyB);
        // Equations to be fed to the solver
        this.equations.push(x, y, z);

        // Make the equations bidirectional
        x.minForce = y.minForce = z.minForce = -maxForce;
        x.maxForce = y.maxForce = z.maxForce = maxForce;

        //设置碰撞法线
        x.ni.set(1, 0, 0);
        y.ni.set(0, 1, 0);
        z.ni.set(0, 0, 1);
    }

    update() {
        const x = this.equationX;
        const y = this.equationY;
        const z = this.equationZ;

        // Rotate the pivots to world space
        // 把pivot看做碰撞点，把碰撞点转换到世界空间，赋给 ContactEquation 的 ri,rj
        this.bodyA.quaternion.vmult(this.pivotA, x.ri);  // x.ri = pivotA * A.quat
        this.bodyB.quaternion.vmult(this.pivotB, x.rj);  // x.rj = pivotB * B.quat
            // 问题：这两个值不一样么

        y.ri.copy(x.ri);z.ri.copy(x.ri);    // y.ri=z.ri=x.ri
        y.rj.copy(x.rj);z.rj.copy(x.rj);    // y.rj=z.rj=x.rj
    }
}