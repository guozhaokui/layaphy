import Mat3 from './Mat3.js';

export default class Vec3 {
    static ZERO = new Vec3(0, 0, 0);
    static UNIT_X = new Vec3(1, 0, 0);
    static UNIT_Y = new Vec3(0, 1, 0);
    static UNIT_Z = new Vec3(0, 0, 1);

    x:f32 = 0;
    y:f32 = 0;
    z:f32 = 0;
    constructor(x:f32=0, y:f32=0, z:f32=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    cross(v:Vec3, target=new Vec3()) {
        const vx = v.x;
        const vy = v.y;
        const vz = v.z;
        const x = this.x;
        const y = this.y;
        const z = this.z;

        target.x = (y * vz) - (z * vy);
        target.y = (z * vx) - (x * vz);
        target.z = (x * vy) - (y * vx);

        return target;
    }

    set(x:number, y:number, z:number) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    setZero() {
        this.x = this.y = this.z = 0;
    }

    vadd( v:Vec3, target?:Vec3) {
        if (target) {
            target.x = v.x + this.x;
            target.y = v.y + this.y;
            target.z = v.z + this.z;
        } else {
            return new Vec3(this.x + v.x,
                this.y + v.y,
                this.z + v.z);
        }
    }

    vsub(v:Vec3, target?:Vec3) {
        if (target) {
            target.x = this.x - v.x;
            target.y = this.y - v.y;
            target.z = this.z - v.z;
        } else {
            return new Vec3(this.x - v.x,
                this.y - v.y,
                this.z - v.z);
        }
    }

    /**
     * Get the cross product matrix a_cross from a vector, such that a x b = a_cross * b = c
     * @see http://www8.cs.umu.se/kurser/TDBD24/VT06/lectures/Lecture6.pdf
     */
    crossmat() {
        return new Mat3([0, -this.z, this.y,
            this.z, 0, -this.x,
            -this.y, this.x, 0]);
    }

    /**
     * Normalize the vector. Note that this changes the values in the vector.
     */
    normalize() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const n = Math.sqrt(x * x + y * y + z * z);
        if (n > 0.0) {
            const invN = 1 / n;
            this.x *= invN;
            this.y *= invN;
            this.z *= invN;
        } else {
            // Make something up
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        return n;
    }

    /**
     * Get the version of this vector that is of length 1.
     * @param  target Optional target to save in
     * @return  Returns the unit vector
     */
    unit(target = new Vec3()) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        let ninv = Math.sqrt(x * x + y * y + z * z);
        if (ninv > 0.0) {
            ninv = 1.0 / ninv;
            target.x = x * ninv;
            target.y = y * ninv;
            target.z = z * ninv;
        } else {
            target.x = 1;
            target.y = 0;
            target.z = 0;
        }
        return target;
    }

    /**
     * Get the length of the vector
     */
    length() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * Get the squared length of the vector
     */
    lengthSquared() {
        return this.dot(this);
    }

    /**
     * Get distance from this point to another point
     */
    distanceTo(p:Vec3) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const px = p.x;
        const py = p.y;
        const pz = p.z;
        return Math.sqrt((px - x) * (px - x) +
            (py - y) * (py - y) +
            (pz - z) * (pz - z));
    }

    /**
     * Get squared distance from this point to another point
     */
    distanceSquared(p:Vec3) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const px = p.x;
        const py = p.y;
        const pz = p.z;
        return (px - x) * (px - x) + (py - y) * (py - y) + (pz - z) * (pz - z);
    }

    /**
     * Multiply all the components of the vector with a scalar.
     * @deprecated Use .scale instead
     * @param  target The vector to save the result in.
     * @return 
     * @deprecated Use .scale() instead
     */
    scale(scalar:number, target = new Vec3()) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        target.x = scalar * x;
        target.y = scalar * y;
        target.z = scalar * z;
        return target;
    }

    /**
     * Multiply the vector with an other vector, component-wise.
     */
    vmul(v:Vec3, target = new Vec3()) {
        target.x = v.x * this.x;
        target.y = v.y * this.y;
        target.z = v.z * this.z;
        return target;
    }

    /**
     * Scale a vector and add it to this vector. Save the result in "target". (target = this + vector * scalar)
     */
    addScaledVector(scalar:number, v:Vec3, target = new Vec3()) {
        target.x = this.x + scalar * v.x;
        target.y = this.y + scalar * v.y;
        target.z = this.z + scalar * v.z;
        return target;
    }

    /**
     * Calculate dot product
     */
    dot(v:Vec3) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    isZero() {
        return this.x === 0 && this.y === 0 && this.z === 0;
    }

    /**
     * Make the vector point in the opposite direction.
     */
    negate(target = new Vec3()) {
        target.x = -this.x;
        target.y = -this.y;
        target.z = -this.z;
        return target;
    }

    tangents(t1:Vec3, t2:Vec3) {
        const norm = this.length();
        if (norm > 0.0) {
            const n = Vec3_tangents_n;
            const inorm = 1 / norm;
            n.set(this.x * inorm, this.y * inorm, this.z * inorm);
            const randVec = Vec3_tangents_randVec;
            if (Math.abs(n.x) < 0.9) {
                randVec.set(1, 0, 0);
                n.cross(randVec, t1);
            } else {
                randVec.set(0, 1, 0);
                n.cross(randVec, t1);
            }
            n.cross(t1, t2);
        } else {
            // The normal length is zero, make something up
            t1.set(1, 0, 0);
            t2.set(0, 1, 0);
        }
    }

    /**
     * Converts to a more readable format
     */
    toString() {
        return `${this.x},${this.y},${this.z}`;
    }

    /**
     * Converts to an array
     */
    toArray() {
        return [this.x, this.y, this.z];
    }

    /**
     * Copies value of source to this vector.
     */
    copy(v:Vec3) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    /**
     * Do a linear interpolation between two vectors
     */
    lerp(v:Vec3, t:number, target:Vec3) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        target.x = x + (v.x - x) * t;
        target.y = y + (v.y - y) * t;
        target.z = z + (v.z - z) * t;
    }

    /**
     * Check if a vector equals is almost equal to another one.
     */
    almostEquals(v:Vec3, precision:number) {
        if (precision === undefined) {
            precision = 1e-6;
        }
        if (Math.abs(this.x - v.x) > precision ||
            Math.abs(this.y - v.y) > precision ||
            Math.abs(this.z - v.z) > precision) {
            return false;
        }
        return true;
    }

    /**
     * Check if a vector is almost zero
     */
    almostZero(precision=1e-6) {
        if (Math.abs(this.x) > precision ||
            Math.abs(this.y) > precision ||
            Math.abs(this.z) > precision) {
            return false;
        }
        return true;
    }

    /**
     * Check if the vector is anti-parallel to another vector.
     * @param    precision Set to zero for exact comparisons
     */
    isAntiparallelTo(v:Vec3, precision:number=0) {
        this.negate(antip_neg);
        return antip_neg.almostEquals(v, precision);
    }

    /**
     * Clone the vector
     */
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
}

var Vec3_tangents_n = new Vec3();
var Vec3_tangents_randVec = new Vec3();

var antip_neg = new Vec3();