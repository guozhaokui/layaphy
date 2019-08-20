import Vec3 from './Vec3.js';

/**
 * A Quaternion describes a rotation in 3D space. The Quaternion is mathematically defined as Q = x*i + y*j + z*k + w, where (i,j,k) are imaginary basis vectors. (x,y,z) can be seen as a vector related to the axis of rotation, while the real multiplier, w, is related to the amount of rotation.
 * @see http://en.wikipedia.org/wiki/Quaternion
 */
export default class Quaternion {
    x=0;
    y=0;
    z=0;
    w=0;
    constructor(x?:number, y?:number, z?:number, w?:number) {
        this.x = x !== undefined ? x : 0;
        this.y = y !== undefined ? y : 0;
        this.z = z !== undefined ? z : 0;
        this.w = w !== undefined ? w : 1;
    }

    set(x:number, y:number, z:number, w:number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    toString() {
        return `${this.x},${this.y},${this.z},${this.w}`;
    }

    toArray() {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * Set the quaternion components given an axis and an angle.
     * @param  angle in radians
     */
    setFromAxisAngle(axis:Vec3, angle:number) {
        const s = Math.sin(angle * 0.5);
        this.x = axis.x * s;
        this.y = axis.y * s;
        this.z = axis.z * s;
        this.w = Math.cos(angle * 0.5);
        return this;
    }

    /**
     * Converts the quaternion to axis/angle representation.
     * @method toAxisAngle
     * @param  [targetAxis] A vector object to reuse for storing the axis.
     * @return  An array, first elemnt is the axis and the second is the angle in radians.
     */
    toAxisAngle(targetAxis = new Vec3()) {
        this.normalize(); // if w>1 acos and sqrt will produce errors, this cant happen if quaternion is normalised
        const angle = 2 * Math.acos(this.w);
        const s = Math.sqrt(1 - this.w * this.w); // assuming quaternion normalised then w is less than 1, so term always positive.
        if (s < 0.001) { // test to avoid divide by zero, s is always positive due to sqrt
            // if s close to zero then direction of axis not important
            targetAxis.x = this.x; // if it is important that axis is normalised then replace with x=1; y=z=0;
            targetAxis.y = this.y;
            targetAxis.z = this.z;
        } else {
            targetAxis.x = this.x / s; // normalise axis
            targetAxis.y = this.y / s;
            targetAxis.z = this.z / s;
        }
        return [targetAxis, angle];
    }

    /**
     * Set the quaternion value given two vectors. The resulting rotation will be the needed rotation to rotate u to v.
     */
    setFromVectors(u:Vec3, v:Vec3) {
        if (u.isAntiparallelTo(v)) {
            const t1 = sfv_t1;
            const t2 = sfv_t2;

            u.tangents(t1, t2);
            this.setFromAxisAngle(t1, Math.PI);
        } else {
            const a = u.cross(v);
            this.x = a.x;
            this.y = a.y;
            this.z = a.z;
            this.w = Math.sqrt(u.length() ** 2 * (v.length() ** 2)) + u.dot(v);
            this.normalize();
        }
        return this;
    }

    mult({ x, y, z, w }, target = new Quaternion()) {
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const aw = this.w;
        const bx = x;
        const by = y;
        const bz = z;
        const bw = w;

        target.x = ax * bw + aw * bx + ay * bz - az * by;
        target.y = ay * bw + aw * by + az * bx - ax * bz;
        target.z = az * bw + aw * bz + ax * by - ay * bx;
        target.w = aw * bw - ax * bx - ay * by - az * bz;

        return target;
    }

    /**
     * Get the inverse quaternion rotation.
     */
    inverse(target?:Quaternion) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        target = target || new Quaternion();

        this.conjugate(target);
        const inorm2 = 1 / (x * x + y * y + z * z + w * w);
        target.x *= inorm2;
        target.y *= inorm2;
        target.z *= inorm2;
        target.w *= inorm2;

        return target;
    }

    /**
     * Get the quaternion conjugate
     */
    conjugate(target = new Quaternion()) {
        target.x = -this.x;
        target.y = -this.y;
        target.z = -this.z;
        target.w = this.w;

        return target;
    }

    /**
     * Normalize the quaternion. Note that this changes the values of the quaternion.
     */
    normalize() {
        let l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        if (l === 0) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 0;
        } else {
            l = 1 / l;
            this.x *= l;
            this.y *= l;
            this.z *= l;
            this.w *= l;
        }
        return this;
    }

    /**
     * Approximation of quaternion normalization. Works best when quat is already almost-normalized.
     * @see http://jsperf.com/fast-quaternion-normalization
     * @author unphased, https://github.com/unphased
     */
    normalizeFast() {
        const f = (3.0 - (this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)) / 2.0;
        if (f === 0) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 0;
        } else {
            this.x *= f;
            this.y *= f;
            this.z *= f;
            this.w *= f;
        }
        return this;
    }

    /**
     * Multiply the quaternion by a vector
     */
    vmult(v:Vec3, target = new Vec3()) {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        const qx = this.x;
        const qy = this.y;
        const qz = this.z;
        const qw = this.w;

        // q*v
        const ix = qw * x + qy * z - qz * y;

        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = -qx * x - qy * y - qz * z;

        target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return target;
    }

    /**
     * Copies value of source to this quaternion.
     */
    copy(q:Quaternion) {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;
        return this;
    }

    /**
     * Convert the quaternion to euler angle representation. Order: YZX, as this page describes: http://www.euclideanspace.com/maths/standards/index.htm
     * @param string order Three-character string e.g. "YZX", which also is default.
     */
    toEuler(target:Vec3, order = "YZX") {
        let heading:number;
        let attitude:number;
        let bank:number;
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;

        switch (order) {
            case "YZX":
                const test = x * y + z * w;
                if (test > 0.499) { // singularity at north pole
                    heading = 2 * Math.atan2(x, w);
                    attitude = Math.PI / 2;
                    bank = 0;
                }
                if (test < -0.499) { // singularity at south pole
                    heading = -2 * Math.atan2(x, w);
                    attitude = - Math.PI / 2;
                    bank = 0;
                }
                if (isNaN(heading)) {
                    const sqx = x * x;
                    const sqy = y * y;
                    const sqz = z * z;
                    heading = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz); // Heading
                    attitude = Math.asin(2 * test); // attitude
                    bank = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz); // bank
                }
                break;
            default:
                throw new Error(`Euler order ${order} not supported yet.`);
        }

        target.y = heading;
        target.z = attitude;
        target.x = bank;
    }

    /**
     * See http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
     * @method setFromEuler
     * @param  order The order to apply angles: 'XYZ' or 'YXZ' or any other combination
     */
    setFromEuler(x:number, y:number, z:number, order = "XYZ") {
        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);

        if (order === 'XYZ') {

            this.x = s1 * c2 * c3 + c1 * s2 * s3;
            this.y = c1 * s2 * c3 - s1 * c2 * s3;
            this.z = c1 * c2 * s3 + s1 * s2 * c3;
            this.w = c1 * c2 * c3 - s1 * s2 * s3;

        } else if (order === 'YXZ') {

            this.x = s1 * c2 * c3 + c1 * s2 * s3;
            this.y = c1 * s2 * c3 - s1 * c2 * s3;
            this.z = c1 * c2 * s3 - s1 * s2 * c3;
            this.w = c1 * c2 * c3 + s1 * s2 * s3;

        } else if (order === 'ZXY') {

            this.x = s1 * c2 * c3 - c1 * s2 * s3;
            this.y = c1 * s2 * c3 + s1 * c2 * s3;
            this.z = c1 * c2 * s3 + s1 * s2 * c3;
            this.w = c1 * c2 * c3 - s1 * s2 * s3;

        } else if (order === 'ZYX') {

            this.x = s1 * c2 * c3 - c1 * s2 * s3;
            this.y = c1 * s2 * c3 + s1 * c2 * s3;
            this.z = c1 * c2 * s3 - s1 * s2 * c3;
            this.w = c1 * c2 * c3 + s1 * s2 * s3;

        } else if (order === 'YZX') {

            this.x = s1 * c2 * c3 + c1 * s2 * s3;
            this.y = c1 * s2 * c3 + s1 * c2 * s3;
            this.z = c1 * c2 * s3 - s1 * s2 * c3;
            this.w = c1 * c2 * c3 - s1 * s2 * s3;

        } else if (order === 'XZY') {

            this.x = s1 * c2 * c3 - c1 * s2 * s3;
            this.y = c1 * s2 * c3 - s1 * c2 * s3;
            this.z = c1 * c2 * s3 + s1 * s2 * c3;
            this.w = c1 * c2 * c3 + s1 * s2 * s3;

        }

        return this;
    }

    /**
     */
    clone() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    /**
     * Performs a spherical linear interpolation between two quat
     *
     * @method slerp
     * @param  toQuat second operand
     * @param  t interpolation amount between the self quaternion and toQuat
     * @param  [target] A quaternion to store the result in. If not provided, a new one will be created.
     */
    slerp(toQuat:Quaternion, t:number, target = new Quaternion()) {
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const aw = this.w;
        let bx = toQuat.x;
        let by = toQuat.y;
        let bz = toQuat.z;
        let bw = toQuat.w;
        let omega:number;
        let cosom:number;
        let sinom:number;
        let scale0:number;
        let scale1:number;

        // calc cosine
        cosom = ax * bx + ay * by + az * bz + aw * bw;

        // adjust signs (if necessary)
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = - bx;
            by = - by;
            bz = - bz;
            bw = - bw;
        }

        // calculate coefficients
        if ((1.0 - cosom) > 0.000001) {
            // standard case (slerp)
            omega = Math.acos(cosom);
            sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        } else {
            // "from" and "to" quaternions are very close
            //  ... so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        }

        // calculate final values
        target.x = scale0 * ax + scale1 * bx;
        target.y = scale0 * ay + scale1 * by;
        target.z = scale0 * az + scale1 * bz;
        target.w = scale0 * aw + scale1 * bw;

        return target;
    }

    /**
     * Rotate an absolute orientation quaternion given an angular velocity and a time step.
     * 根据角速度和dt来计算新的四元数。
     * @param   angularVelocity  当前角速度
     * @param   dt      帧时间
     * @param   angularFactor 提供一个缩放系数
     * @param   target
     * @return  The "target" object
     */
    integrate(angularVelocity:Vec3, dt:number, angularFactor:Vec3, target = new Quaternion()) {
        var ax = angularVelocity.x * angularFactor.x,
            ay = angularVelocity.y * angularFactor.y,
            az = angularVelocity.z * angularFactor.z,
            bx = this.x,
            by = this.y,
            bz = this.z,
            bw = this.w;

        var half_dt = dt * 0.5;

        target.x += half_dt * (ax * bw + ay * bz - az * by);
        target.y += half_dt * (ay * bw + az * bx - ax * bz);
        target.z += half_dt * (az * bw + ax * by - ay * bx);
        target.w += half_dt * (- ax * bx - ay * by - az * bz);

        return target;
    }
}

var sfv_t1 = new Vec3();
var sfv_t2 = new Vec3();

const Quaternion_mult_va = new Vec3();
const Quaternion_mult_vb = new Vec3();
const Quaternion_mult_vaxvb = new Vec3();