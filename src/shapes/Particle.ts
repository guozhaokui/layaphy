import Shape, { SHAPETYPE } from './Shape.js';
import Vec3 from '../math/Vec3.js';
import Quaternion from '../math/Quaternion.js';

/**
 * Particle shape.
 * @author schteppe
 */
export default class Particle extends Shape {

    constructor() {
        super();
        this.type=SHAPETYPE.PARTICLE;
    }

    calculateLocalInertia(mass:number, target = new Vec3()) {
        target.set(0, 0, 0);
        return target;
    }

    volume() {
        return 0;
    }

    updateBndSphR() {
        this.boundSphR = 0;
    }

    calculateWorldAABB(pos:Vec3, quat:Quaternion, min:Vec3, max:Vec3) {
        // Get each axis max
        min.copy(pos);
        max.copy(pos);
    }
    onPreNarrowpase(stepId: number,pos:Vec3,quat:Quaternion): void {}    
}
