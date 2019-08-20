import Equation from './Equation.js';
import Vec3 from '../math/Vec3.js';
import Body from '../objects/Body.js';

/**
 * Constrains the slipping in a contact along a tangent
 * @author schteppe
 */
export default class FrictionEquation extends Equation {
    ri = new Vec3();
    rj = new Vec3();
    t = new Vec3();     //tangent

    /**
     * 
     * @param bodyA 
     * @param bodyB 
     * @param slipForce should be +-F_friction = +-mu * F_normal = +-mu * m * g
     */
    constructor(bodyA:Body, bodyB:Body, slipForce:number) {
        super(bodyA, bodyB, -slipForce, slipForce);
    }

    computeB(h:number) {
        const a = this.a;
        const b = this.b;
        const bi = this.bi;
        const bj = this.bj;
        const ri = this.ri;
        const rj = this.rj;
        const rixt = FrictionEquation_computeB_temp1;
        const rjxt = FrictionEquation_computeB_temp2;
        const t = this.t;

        // Caluclate cross products
        ri.cross(t, rixt);
        rj.cross(t, rjxt);

        // G = [-t -rixt t rjxt]
        // And remember, this is a pure velocity constraint, g is always zero!
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        t.negate(GA.spatial);
        rixt.negate(GA.rotational);
        GB.spatial.copy(t);
        GB.rotational.copy(rjxt);

        const GW = this.computeGW();
        const GiMf = this.computeGiMf();

        const B = - GW * b - h * GiMf;

        return B;
    }
}

var FrictionEquation_computeB_temp1 = new Vec3();
var FrictionEquation_computeB_temp2 = new Vec3();
