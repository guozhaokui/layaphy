import Shape, { SHAPETYPE } from './Shape.js';
import Vec3 from '../math/Vec3.js';
import Quaternion from '../math/Quaternion.js';

/**
 * Spherical shape
 * @class Sphere
 * @constructor
 * @extends Shape
 * @param {Number} radius The radius of the sphere, a non-negative number.
 * @author schteppe / http://github.com/schteppe
 */
export default class Sphere extends Shape {
    radius=1;
    constructor(radius:number) {
        super();
        this.type= SHAPETYPE.SPHERE;
        this.radius = radius !== undefined ? radius : 1.0;

        if (this.radius < 0) {
            throw new Error('The sphere radius cannot be negative.');
        }

        this.updateBoundingSphereRadius();
    }

    calculateLocalInertia(mass:number, target = new Vec3()) {
        const I = 2.0 * mass * this.radius * this.radius / 5.0;
        target.x = I;
        target.y = I;
        target.z = I;
        return target;
    }

    volume() {
        return 4.0 * Math.PI * this.radius / 3.0;
    }

    updateBoundingSphereRadius() {
        this.boundingSphereRadius = this.radius;
    }

    calculateWorldAABB(pos:Vec3, quat:Quaternion, min:Vec3, max:Vec3) {
        const r = this.radius;
        min.x=pos.x-r;
        max.x=pos.x+r;
        min.y=pos.y-r;
        max.y=pos.y+r;
        min.z=pos.z-r;
        max.z=pos.z+r;
    }
}
