import Vec3 from './Vec3.js';
import Quaternion from './Quaternion.js';

/**
 * A 3x3 matrix.
 * @class Mat3
 * @constructor
 * @param array elements Array of nine elements. Optional.
 * @author schteppe / http://github.com/schteppe
 */
export default class Mat3 {
    /*
    m11=1;m12=0;m13=0;
    m21=0;m22=1;m23=0;
    m31=0;m32=0;m33=1;
    */
    elements=[1,0,0, 0,1,0, 0,0,1];
    constructor(elements?:number[]) {
        if (elements) {
            //this.m11=elements[0];
            this.elements = elements;
        } 
    }

    /**
     * Sets the matrix to identity
     * @method identity
     * @todo Should perhaps be renamed to setIdentity() to be more clear.
     * @todo Create another function that immediately creates an identity matrix eg. eye()
     */
    identity() {
        const e = this.elements;
        e[0] = 1;
        e[1] = 0;
        e[2] = 0;

        e[3] = 0;
        e[4] = 1;
        e[5] = 0;

        e[6] = 0;
        e[7] = 0;
        e[8] = 1;
    }

    /**
     * Set all elements to zero
     * @method setZero
     */
    setZero() {
        const e = this.elements;
        e[0] = 0;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;
        e[4] = 0;
        e[5] = 0;
        e[6] = 0;
        e[7] = 0;
        e[8] = 0;
    }

    /**
     * Sets the matrix diagonal elements from a Vec3
     * @method setTrace
     * @param {Vec3} vec3
     */
    setTrace({ x, y, z }) {
        const e = this.elements;
        e[0] = x;
        e[4] = y;
        e[8] = z;
    }

    /**
     * Gets the matrix diagonal elements
     * @method getTrace
     * @return {Vec3}
     */
    getTrace(target) {
        var target = target || new Vec3();
        const e = this.elements;
        target.x = e[0];
        target.y = e[4];
        target.z = e[8];
    }

    /**
     * Matrix-Vector multiplication
     * @method vmult
     * @param {Vec3} v The vector to multiply with
     * @param {Vec3} target Optional, target to save the result in.
     */
    vmult(v, target = new Vec3()) {
        const e = this.elements;
        const x = v.x;
        const y = v.y;
        const z = v.z;
        target.x = e[0] * x + e[1] * y + e[2] * z;
        target.y = e[3] * x + e[4] * y + e[5] * z;
        target.z = e[6] * x + e[7] * y + e[8] * z;

        return target;
    }

    /**
     * Matrix-scalar multiplication
     */
    smult(s:number) {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i] *= s;
        }
    }

    /**
     * Matrix multiplication
     * @param  m Matrix to multiply with from left side.
     * @return  The result.
     */
    mmult( m:Mat3, target:Mat3) {
        const r = target || new Mat3();
        let e = m.elements;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let sum = 0.0;
                for (let k = 0; k < 3; k++) {
                    sum += e[i + k * 3] * this.elements[k + j * 3];
                }
                r.elements[i + j * 3] = sum;
            }
        }
        return r;
    }

    /**
     * Scale each column of the matrix
     * @method scale
     * @param {Vec3} v
     * @return {Mat3} The result.
     */
    scale({ x, y, z }, target = new Mat3()) {
        const e = this.elements;
        const t = target.elements;
        for (let i = 0; i !== 3; i++) {
            t[3 * i + 0] = x * e[3 * i + 0];
            t[3 * i + 1] = y * e[3 * i + 1];
            t[3 * i + 2] = z * e[3 * i + 2];
        }
        return target;
    }

    /**
     * Solve Ax=b
     * @method solve
     * @param  b The right hand side
     * @param  target Optional. Target vector to save in.
     * @return The solution x
     * @todo should reuse arrays
     */
    solve(b:Vec3, target = new Vec3()) {
        // Construct equations
        let i=0;
        const nr = 3; // num rows
        const nc = 4; // num cols
        const eqns = [];
        for (i = 0; i < nr * nc; i++) {
            eqns.push(0);
        }
        let j;
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                eqns[i + nc * j] = this.elements[i + 3 * j];
            }
        }
        eqns[3 + 4 * 0] = b.x;
        eqns[3 + 4 * 1] = b.y;
        eqns[3 + 4 * 2] = b.z;

        // Compute right upper triangular version of the matrix - Gauss elimination
        let n = 3;

        const k = n;
        let np;
        const kp = 4; // num rows
        let p;
        let els;
        do {
            i = k - n;
            if (eqns[i + nc * i] === 0) {
                // the pivot is null, swap lines
                for (j = i + 1; j < k; j++) {
                    if (eqns[i + nc * j] !== 0) {
                        np = kp;
                        do {  // do ligne( i ) = ligne( i ) + ligne( k )
                            p = kp - np;
                            eqns[p + nc * i] += eqns[p + nc * j];
                        } while (--np);
                        break;
                    }
                }
            }
            if (eqns[i + nc * i] !== 0) {
                for (j = i + 1; j < k; j++) {
                    const multiplier = eqns[i + nc * j] / eqns[i + nc * i];
                    np = kp;
                    do {  // do ligne( k ) = ligne( k ) - multiplier * ligne( i )
                        p = kp - np;
                        eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
                    } while (--np);
                }
            }
        } while (--n);

        // Get the solution
        target.z = eqns[2 * nc + 3] / eqns[2 * nc + 2];
        target.y = (eqns[1 * nc + 3] - eqns[1 * nc + 2] * target.z) / eqns[1 * nc + 1];
        target.x = (eqns[0 * nc + 3] - eqns[0 * nc + 2] * target.z - eqns[0 * nc + 1] * target.y) / eqns[0 * nc + 0];

        if (isNaN(target.x) || isNaN(target.y) || isNaN(target.z) || target.x === Infinity || target.y === Infinity || target.z === Infinity) {
            throw `Could not solve equation! Got x=[${target.toString()}], b=[${b.toString()}], A=[${this.toString()}]`;
        }

        return target;
    }

    /**
     * Get an element in the matrix by index. Index starts at 0, not 1!!!
     * @method e
     * @param  row
     * @param  column
     * @param  value Optional. If provided, the matrix element will be set to this value.
     */
    e(row:number, column:number, value:number) {
        if (value === undefined) {
            return this.elements[column + 3 * row];
        } else {
            // Set value
            this.elements[column + 3 * row] = value;
        }
    }

    /**
     * Copy another matrix into this matrix object.
     * @method copy
     * @param  source
     * @return  this
     */
    copy( source:Mat3) {
        for (let i = 0; i < source.elements.length; i++) {
            this.elements[i] = source.elements[i];
        }
        return this;
    }

    /**
     * Returns a string representation of the matrix.
     * @method toString
     * @return string
     */
    toString() {
        let r = "";
        const sep = ",";
        for (let i = 0; i < 9; i++) {
            r += this.elements[i] + sep;
        }
        return r;
    }

    /**
     * reverse the matrix
     * @method reverse
     * @param  target Optional. Target matrix to save in.
     * @return  The solution x
     */
    reverse(target = new Mat3()) {
        // Construct equations
        let i=0;
        const nr = 3; // num rows
        const nc = 6; // num cols
        const eqns = [];
        for (i = 0; i < nr * nc; i++) {
            eqns.push(0);
        }
        let j;
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                eqns[i + nc * j] = this.elements[i + 3 * j];
            }
        }
        eqns[3 + 6 * 0] = 1;
        eqns[3 + 6 * 1] = 0;
        eqns[3 + 6 * 2] = 0;
        eqns[4 + 6 * 0] = 0;
        eqns[4 + 6 * 1] = 1;
        eqns[4 + 6 * 2] = 0;
        eqns[5 + 6 * 0] = 0;
        eqns[5 + 6 * 1] = 0;
        eqns[5 + 6 * 2] = 1;

        // Compute right upper triangular version of the matrix - Gauss elimination
        let n = 3;

        const k = n;
        let np;
        const kp = nc; // num rows
        let p;
        do {
            i = k - n;
            if (eqns[i + nc * i] === 0) {
                // the pivot is null, swap lines
                for (j = i + 1; j < k; j++) {
                    if (eqns[i + nc * j] !== 0) {
                        np = kp;
                        do { // do line( i ) = line( i ) + line( k )
                            p = kp - np;
                            eqns[p + nc * i] += eqns[p + nc * j];
                        } while (--np);
                        break;
                    }
                }
            }
            if (eqns[i + nc * i] !== 0) {
                for (j = i + 1; j < k; j++) {
                    var multiplier = eqns[i + nc * j] / eqns[i + nc * i];
                    np = kp;
                    do { // do line( k ) = line( k ) - multiplier * line( i )
                        p = kp - np;
                        eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
                    } while (--np);
                }
            }
        } while (--n);

        // eliminate the upper left triangle of the matrix
        i = 2;
        do {
            j = i - 1;
            do {
                var multiplier = eqns[i + nc * j] / eqns[i + nc * i];
                np = nc;
                do {
                    p = nc - np;
                    eqns[p + nc * j] = eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
                } while (--np);
            } while (j--);
        } while (--i);

        // operations on the diagonal
        i = 2;
        do {
            var multiplier = 1 / eqns[i + nc * i];
            np = nc;
            do {
                p = nc - np;
                eqns[p + nc * i] = eqns[p + nc * i] * multiplier;
            } while (--np);
        } while (i--);

        i = 2;
        do {
            j = 2;
            do {
                p = eqns[nr + j + nc * i];
                if (isNaN(p) || p === Infinity) {
                    throw `Could not reverse! A=[${this.toString()}]`;
                }
                target.e(i, j, p);
            } while (j--);
        } while (i--);

        return target;
    }

    /**
     * Set the matrix from a quaterion
     */
    setRotationFromQuaternion(q:Quaternion) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const e = this.elements;

        e[3 * 0 + 0] = 1 - (yy + zz);
        e[3 * 0 + 1] = xy - wz;
        e[3 * 0 + 2] = xz + wy;

        e[3 * 1 + 0] = xy + wz;
        e[3 * 1 + 1] = 1 - (xx + zz);
        e[3 * 1 + 2] = yz - wx;

        e[3 * 2 + 0] = xz - wy;
        e[3 * 2 + 1] = yz + wx;
        e[3 * 2 + 2] = 1 - (xx + yy);

        return this;
    }

    /**
     * Transpose the matrix
     * @method transpose
     * @param   target Where to store the result.
     * @return  The target Mat3, or a new Mat3 if target was omitted.
     */
    transpose(target = new Mat3()) {
        const Mt = target.elements;
        const M = this.elements;

        for (let i = 0; i !== 3; i++) {
            for (let j = 0; j !== 3; j++) {
                Mt[3 * i + j] = M[3 * j + i];
            }
        }

        return target;
    }
}
