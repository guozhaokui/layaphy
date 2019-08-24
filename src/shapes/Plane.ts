import Shape, { SHAPETYPE } from './Shape.js';
import Vec3 from '../math/Vec3.js';
import Quaternion from '../math/Quaternion.js';

/**
 * A plane, facing in the Z direction. The plane has its surface at z=0 and everything below z=0 is assumed to be solid plane. To make the plane face in some other direction than z, you must put it inside a Body and rotate that body. See the demos.
 */
export default class Plane extends Shape {
    // World oriented normal
    worldNormal = new Vec3();
    worldNormalNeedsUpdate = true;

    boundingSphereRadius = Number.MAX_VALUE;
    constructor() {
        super();
        this.type = SHAPETYPE.PLANE;
    }

    computeWorldNormal(quat:Quaternion) {
        const n = this.worldNormal;
        n.set(0, 0, 1); // 法线指向z，对laya3d坐标系来说，是朝向屏幕外面
        quat.vmult(n, n);
        this.worldNormalNeedsUpdate = false;
    }

    calculateLocalInertia(mass:number, target = new Vec3()) {
        return target;
    }

    volume() {
        return Number.MAX_VALUE; // The plane is infinite...
    }

    calculateWorldAABB(pos:Vec3, quat:Quaternion, min:Vec3, max:Vec3) {
        // The plane AABB is infinite, except if the normal is pointing along any axis
        tempNormal.set(0, 0, 1); // Default plane normal is z
        quat.vmult(tempNormal, tempNormal);
        const maxVal = Number.MAX_VALUE;
        min.set(-maxVal, -maxVal, -maxVal);
        max.set(maxVal, maxVal, maxVal);

        if (tempNormal.x === 1) { max.x = pos.x; }
        if (tempNormal.y === 1) { max.y = pos.y; }
        if (tempNormal.z === 1) { max.z = pos.z; }

        if (tempNormal.x === -1) { min.x = pos.x; }
        if (tempNormal.y === -1) { min.y = pos.y; }
        if (tempNormal.z === -1) { min.z = pos.z; }
    }

    updateBoundingSphereRadius() {
        this.boundingSphereRadius = Number.MAX_VALUE;
    }
}

var tempNormal = new Vec3();