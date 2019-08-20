import Vec3 from '../math/Vec3.js';
import Equation from './Equation.js';
import Body from '../objects/Body.js';

/**
 * Rotational constraint. Works to keep the local vectors orthogonal to each other in world space.
 * @author schteppe
 */
export default class RotationalEquation extends Equation {
    axisA: Vec3;
    axisB: Vec3;
    maxAngle = Math.PI / 2;
    constructor(bodyA: Body, bodyB: Body, maxForce:f32=1e6, axisA=new Vec3(1,0,0), axisB=new Vec3(0,1,0)) {
        super(bodyA, bodyB);
        this.maxForce = maxForce;
        this.minForce = -maxForce;
        this.axisA = axisA.clone() ;
        this.axisB = axisB.clone() ;
        this.maxAngle = Math.PI / 2;
    }

    computeB(h:number) {
        const a = this.a;
        const b = this.b;
        const ni = this.axisA;
        const nj = this.axisB;
        const nixnj = tmpVec1;
        const njxni = tmpVec2;
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;

        // Caluclate cross products
        ni.cross(nj, nixnj);
        nj.cross(ni, njxni);

        // g = ni * nj
        // gdot = (nj x ni) * wi + (ni x nj) * wj
        // G = [0 njxni 0 nixnj]
        // W = [vi wi vj wj]
        GA.rotational.copy(njxni);
        GB.rotational.copy(nixnj);

        const g = Math.cos(this.maxAngle) - ni.dot(nj);
        const GW = this.computeGW();
        const GiMf = this.computeGiMf();

        const B = - g * a - GW * b - h * GiMf;

        return B;
    }
}

var tmpVec1 = new Vec3();
var tmpVec2 = new Vec3();

