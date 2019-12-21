var cannon = (function (exports) {
    'use strict';

    /**
     * A 3x3 matrix.
     * @class Mat3
     * @constructor
     * @param array elements Array of nine elements. Optional.
     * @author schteppe / http://github.com/schteppe
     * TODO  实现太啰嗦，有时间改一下
     */
    class Mat3 {
        constructor(elements) {
            /*
            m11=1;m12=0;m13=0;
            m21=0;m22=1;m23=0;
            m31=0;m32=0;m33=1;
            */
            this.ele = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 为什么不初始化为I
            if (elements) {
                //this.m11=elements[0];
                this.ele = elements;
            }
        }
        /**
         * Sets the matrix to identity
         * @method identity
         * @todo Should perhaps be renamed to setIdentity() to be more clear.
         * @todo Create another function that immediately creates an identity matrix eg. eye()
         */
        identity() {
            const e = this.ele;
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
            const e = this.ele;
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
         */
        setTrace(vec3) {
            const e = this.ele;
            e[0] = vec3.x;
            e[4] = vec3.y;
            e[8] = vec3.z;
        }
        /**
         * Matrix-Vector multiplication
         * @method vmult
         * @param  v The vector to multiply with
         * @param  target Optional, target to save the result in.
         */
        vmult(v, target = new Vec3()) {
            const e = this.ele;
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
        smult(s) {
            let e = this.ele;
            for (let i = 0; i < this.ele.length; i++) {
                e[i] *= s;
            }
        }
        /**
         * Matrix multiplication
         * 结果是 this*m ?
         * @param  m Matrix to multiply with from left side.
         * @return  The result.
         */
        mmult(m, target = new Mat3()) {
            const r = target;
            let re = r.ele;
            let ae = this.ele;
            let be = m.ele;
            let a0 = ae[0], a1 = ae[1], a2 = ae[2], a3 = ae[3], a4 = ae[4], a5 = ae[5], a6 = ae[6], a7 = ae[7], a8 = ae[8];
            let b0 = be[0], b1 = be[1], b2 = be[2], b3 = be[3], b4 = be[4], b5 = be[5], b6 = be[6], b7 = be[7], b8 = be[8];
            re[0] = b0 * a0 + b3 * a1 + b6 * a2; // ae[0,1,2].be[0,3,6]
            re[3] = b0 * a3 + b3 * a4 + b6 * a5;
            re[6] = b0 * a6 + b3 * a7 + b6 * a8;
            re[1] = b1 * a0 + b4 * a1 + b7 * a2;
            re[4] = b1 * a3 + b4 * a4 + b7 * a5;
            re[7] = b1 * a6 + b4 * a7 + b7 * a8;
            re[2] = b2 * a0 + b5 * a1 + b8 * a2;
            re[5] = b2 * a3 + b5 * a4 + b8 * a5;
            re[8] = b2 * a6 + b5 * a7 + b8 * a8;
            return r;
            /*
                    const r = target ;
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
            */
        }
        /**
         * Scale each column of the matrix
         * 相当于把v当成一个对角矩阵，然后 this * diag(v)
         * @method scale
         * @param  v
         * @return  The result.
         */
        scale(v, target = new Mat3()) {
            const e = this.ele;
            const t = target.ele;
            for (let i = 0; i !== 3; i++) {
                t[3 * i + 0] = v.x * e[3 * i + 0];
                t[3 * i + 1] = v.y * e[3 * i + 1];
                t[3 * i + 2] = v.z * e[3 * i + 2];
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
        solve(b, target = new Vec3()) {
            // Construct equations
            let i = 0;
            const nr = 3; // num rows
            const nc = 4; // num cols
            const eqns = [];
            for (i = 0; i < nr * nc; i++) {
                eqns.push(0);
            }
            let j;
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    eqns[i + nc * j] = this.ele[i + 3 * j];
                }
            }
            eqns[3 + 4 * 0] = b.x;
            eqns[3 + 4 * 1] = b.y;
            eqns[3 + 4 * 2] = b.z;
            // Compute right upper triangular version of the matrix - Gauss elimination
            // 用高斯消元法计算上三角矩阵
            let n = 3;
            const k = n;
            let np;
            const kp = 4; // num rows
            let p;
            do {
                i = k - n;
                if (eqns[i + nc * i] === 0) {
                    // the pivot is null, swap lines
                    // 主元为0，交换行
                    for (j = i + 1; j < k; j++) {
                        if (eqns[i + nc * j] !== 0) {
                            np = kp;
                            do { // do ligne( i ) = ligne( i ) + ligne( k )
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
                        do { // do ligne( k ) = ligne( k ) - multiplier * ligne( i )
                            p = kp - np;
                            eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
                        } while (--np);
                    }
                }
            } while (--n);
            // Get the solution 反向回代
            target.z = eqns[2 * nc + 3] / eqns[2 * nc + 2];
            target.y = (eqns[1 * nc + 3] - eqns[1 * nc + 2] * target.z) / eqns[1 * nc + 1];
            target.x = (eqns[0 * nc + 3] - eqns[0 * nc + 2] * target.z - eqns[0 * nc + 1] * target.y) / eqns[0 * nc + 0];
            if (isNaN(target.x) || isNaN(target.y) || isNaN(target.z) || target.x === Infinity || target.y === Infinity || target.z === Infinity) {
                throw `Could not solve equation! Got x=[${target.toString()}], b=[${b.toString()}], A=[${this.toString()}]`;
            }
            return target;
        }
        static solve3x4(eqns, target = new Vec3()) {
            // Construct equations
            let i = 0;
            let j = 0;
            //const nr = 3; // num rows
            const nc = 4; // num cols
            // Compute right upper triangular version of the matrix - Gauss elimination
            // 用高斯消元法计算上三角矩阵
            let n = 3;
            const k = n;
            let np;
            const kp = 4; // num rows
            let p;
            do {
                i = k - n;
                if (eqns[i + nc * i] === 0) {
                    // the pivot is null, swap lines
                    // 主元为0，交换行
                    for (j = i + 1; j < k; j++) {
                        if (eqns[i + nc * j] !== 0) {
                            np = kp;
                            do { // do ligne( i ) = ligne( i ) + ligne( k )
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
                        do { // do ligne( k ) = ligne( k ) - multiplier * ligne( i )
                            p = kp - np;
                            eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
                        } while (--np);
                    }
                }
            } while (--n);
            // Get the solution 反向回代
            target.z = eqns[2 * nc + 3] / eqns[2 * nc + 2];
            target.y = (eqns[1 * nc + 3] - eqns[1 * nc + 2] * target.z) / eqns[1 * nc + 1];
            target.x = (eqns[0 * nc + 3] - eqns[0 * nc + 2] * target.z - eqns[0 * nc + 1] * target.y) / eqns[0 * nc + 0];
            if (isNaN(target.x) || isNaN(target.y) || isNaN(target.z) || target.x === Infinity || target.y === Infinity || target.z === Infinity) {
                return false;
            }
            return true;
        }
        /**
         * Get an element in the matrix by index. Index starts at 0, not 1!!!
         * @method e
         * @param  row
         * @param  column
         * @param  value Optional. If provided, the matrix element will be set to this value.
         */
        e(row, column, value) {
            if (value === undefined) {
                return this.ele[column + 3 * row];
            }
            else {
                // Set value
                this.ele[column + 3 * row] = value;
            }
            return undefined;
        }
        /**
         * Copy another matrix into this matrix object.
         * @method copy
         * @param  source
         * @return  this
         */
        copy(source) {
            let a = this.ele;
            let b = source.ele;
            for (let i = 0; i < source.ele.length; i++) {
                a[i] = b[i];
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
                r += this.ele[i] + sep;
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
            let i = 0;
            const nr = 3; // num rows
            const nc = 6; // num cols
            const eqns = [];
            for (i = 0; i < nr * nc; i++) {
                eqns.push(0);
            }
            let j;
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    eqns[i + nc * j] = this.ele[i + 3 * j];
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
        setRotationFromQuaternion(q) {
            const { x, y, z, w } = q;
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
            const e = this.ele;
            e[0] = 1 - (yy + zz);
            e[1] = xy - wz;
            e[2] = xz + wy;
            e[3] = xy + wz;
            e[4] = 1 - (xx + zz);
            e[5] = yz - wx;
            e[6] = xz - wy;
            e[7] = yz + wx;
            e[8] = 1 - (xx + yy);
            return this;
        }
        /**
         * Transpose the matrix
         * @method transpose
         * @param   target Where to store the result.
         * @return  The target Mat3, or a new Mat3 if target was omitted.
         */
        transpose(target = new Mat3()) {
            const Mt = target.ele;
            const M = this.ele;
            Mt[1] = M[3];
            Mt[3] = M[1];
            Mt[2] = M[6];
            Mt[6] = M[2];
            Mt[5] = M[7];
            Mt[7] = M[5];
            Mt[0] = M[0];
            Mt[4] = M[4];
            Mt[8] = M[8];
            /*
            for (let i = 0; i !== 3; i++) {
                for (let j = 0; j !== 3; j++) {
                    Mt[3 * i + j] = M[3 * j + i];
                }
            }
            */
            return target;
        }
    }

    class Vec3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        cross(v, target = new Vec3()) {
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
        set(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        setZero() {
            this.x = this.y = this.z = 0;
        }
        vadd(v, target) {
            if (target) {
                target.x = v.x + this.x;
                target.y = v.y + this.y;
                target.z = v.z + this.z;
                return target;
            }
            else {
                return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
            }
        }
        vsub(v, target) {
            if (target) {
                target.x = this.x - v.x;
                target.y = this.y - v.y;
                target.z = this.z - v.z;
                return target;
            }
            else {
                return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
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
            }
            else {
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
            }
            else {
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
        distanceTo(p) {
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
        distanceSquared(p) {
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
        scale(scalar, target = new Vec3()) {
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
        vmul(v, target = new Vec3()) {
            target.x = v.x * this.x;
            target.y = v.y * this.y;
            target.z = v.z * this.z;
            return target;
        }
        /**
         * Scale a vector and add it to this vector. Save the result in "target". (target = this + vector * scalar)
         * target = this + scalar*v
         */
        addScaledVector(scalar, v, target = new Vec3()) {
            target.x = this.x + scalar * v.x;
            target.y = this.y + scalar * v.y;
            target.z = this.z + scalar * v.z;
            return target;
        }
        /**
         * Calculate dot product
         */
        dot(v) {
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
        /**
         * 计算这个向量的两个tangent
         * @param t1
         * @param t2
         */
        tangents(t1, t2) {
            const norm = this.length();
            if (norm > 0.0) {
                const n = Vec3_tangents_n;
                const inorm = 1 / norm;
                n.set(this.x * inorm, this.y * inorm, this.z * inorm);
                const randVec = Vec3_tangents_randVec;
                if (Math.abs(n.x) < 0.9) {
                    // 如果没有与x轴重合，则可以用x轴来计算与n垂直的t1
                    randVec.set(1, 0, 0);
                    n.cross(randVec, t1);
                }
                else {
                    randVec.set(0, 1, 0);
                    n.cross(randVec, t1);
                }
                n.cross(t1, t2);
            }
            else {
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
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }
        /**
         * Do a linear interpolation between two vectors
         */
        lerp(v, t, target) {
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
        almostEquals(v, precision = 1e-6) {
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
        almostZero(precision = 1e-6) {
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
        isAntiparallelTo(v, precision = 0) {
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
    Vec3.ZERO = new Vec3(0, 0, 0);
    Vec3.UNIT_X = new Vec3(1, 0, 0);
    Vec3.UNIT_Y = new Vec3(0, 1, 0);
    Vec3.UNIT_Z = new Vec3(0, 0, 1);
    var Vec3_tangents_n = new Vec3();
    var Vec3_tangents_randVec = new Vec3();
    var antip_neg = new Vec3();

    /**
     * An element containing 6 entries, 3 spatial and 3 rotational degrees of freedom.
     */
    class JacobianElement {
        constructor() {
            this.spatial = new Vec3();
            this.rotational = new Vec3();
        }
        /**
         * Multiply with other JacobianElement
         */
        multiplyElement(element) {
            return element.spatial.dot(this.spatial) + element.rotational.dot(this.rotational);
        }
        /**
         * Multiply with two vectors
         */
        multiplyVectors(spatial, rotational) {
            return spatial.dot(this.spatial) + rotational.dot(this.rotational);
        }
    }

    /**
     * Equation base class
     * @author schteppe
     * @param  minForce Minimum (read: negative max) force to be applied by the constraint.
     * @param  maxForce Maximum (read: positive max) force to be applied by the constraint.
     */
    class Equation {
        constructor(bi, bj, minForce, maxForce) {
            this.id = Equation.ID++;
            this.minForce = -1e6;
            this.maxForce = 1e6;
            //SPOOK parameter
            this.a = 0;
            this.b = 0;
            this.eps = 0;
            this.jacobianElementA = new JacobianElement();
            this.jacobianElementB = new JacobianElement();
            this.enabled = true;
            /**
             * A number, proportional to the force added to the bodies.
             */
            this.multiplier = 0;
            this.minForce = typeof (minForce) === "undefined" ? -1e6 : minForce;
            this.maxForce = typeof (maxForce) === "undefined" ? 1e6 : maxForce;
            this.bi = bi;
            this.bj = bj;
            // Set typical spook params
            this.setSpookParams(1e7, 4, 1 / 60);
        }
        /**
         * Recalculates a,b,eps.
         * @param stiffness
         * @param relaxation 	d 几步稳定约束。>0
         * @param timeStep      单位是秒
         */
        setSpookParams(stiffness, relaxation, timeStep) {
            const d = relaxation;
            const k = stiffness;
            const h = timeStep;
            this.a = 4.0 / (h * (1 + 4 * d));
            this.b = (4.0 * d) / (1 + 4 * d);
            this.eps = 4.0 / (h * h * k * (1 + 4 * d));
        }
        /**
         * Computes the RHS of the SPOOK equation
         * SPOOK式子的右半部分
         *  Sλ = B = -aGq - bGW -hGiMf
         */
        computeB(h) {
            let a = this.a;
            let b = this.b;
            const GW = this.computeGW();
            const Gq = this.computeGq();
            const GiMf = this.computeGiMf();
            return -Gq * a - GW * b - GiMf * h;
        }
        /**
         * Computes G*q, where q are the generalized body coordinates
         */
        computeGq() {
            const GA = this.jacobianElementA;
            const GB = this.jacobianElementB;
            const xi = this.bi.position;
            const xj = this.bj.position;
            return GA.spatial.dot(xi) + GB.spatial.dot(xj);
        }
        /**
         * Computes G*W, where W are the body velocities
         */
        computeGW() {
            const GA = this.jacobianElementA;
            const GB = this.jacobianElementB;
            const bi = this.bi;
            const bj = this.bj;
            const vi = bi.velocity;
            const vj = bj.velocity;
            const wi = bi.angularVelocity;
            const wj = bj.angularVelocity;
            return GA.multiplyVectors(vi, wi) + GB.multiplyVectors(vj, wj);
        }
        /**
         * Computes G*Wlambda, where W are the body velocities
         */
        computeGWlambda() {
            const GA = this.jacobianElementA;
            const GB = this.jacobianElementB;
            const bi = this.bi;
            const bj = this.bj;
            const vi = bi.vlambda;
            const vj = bj.vlambda;
            const wi = bi.wlambda;
            const wj = bj.wlambda;
            //dot(GA.s,vi)+dot(GA.r,wi) + dot(GB.s,vj) + dot(GB.r,wj)
            return GA.multiplyVectors(vi, wi) + GB.multiplyVectors(vj, wj);
        }
        /**
         * Computes G*inv(M)*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
         */
        computeGiMf() {
            const GA = this.jacobianElementA;
            const GB = this.jacobianElementB;
            const bi = this.bi;
            const bj = this.bj;
            const fi = bi.force;
            const ti = bi.torque;
            const fj = bj.force;
            const tj = bj.torque;
            const invMassi = bi.invMassSolve;
            const invMassj = bj.invMassSolve;
            fi.scale(invMassi, iMfi);
            fj.scale(invMassj, iMfj);
            bi.invInertiaWorldSolve.vmult(ti, invIi_vmult_taui);
            bj.invInertiaWorldSolve.vmult(tj, invIj_vmult_tauj);
            return GA.multiplyVectors(iMfi, invIi_vmult_taui) + GB.multiplyVectors(iMfj, invIj_vmult_tauj);
        }
        /**
         * Computes G*inv(M)*G'
         */
        computeGiMGt() {
            const GA = this.jacobianElementA;
            const GB = this.jacobianElementB;
            const bi = this.bi;
            const bj = this.bj;
            const invMassi = bi.invMassSolve;
            const invMassj = bj.invMassSolve;
            const invIi = bi.invInertiaWorldSolve;
            const invIj = bj.invInertiaWorldSolve;
            let result = invMassi + invMassj;
            invIi.vmult(GA.rotational, tmp);
            result += tmp.dot(GA.rotational);
            invIj.vmult(GB.rotational, tmp);
            result += tmp.dot(GB.rotational);
            return result;
        }
        /**
         * Add constraint velocity to the bodies.
         * 由于约束力而产生的的对速度的修改
         */
        addToWlambda(deltalambda) {
            const GA = this.jacobianElementA;
            const GB = this.jacobianElementB;
            const bi = this.bi;
            const bj = this.bj;
            const temp = addToWlambda_temp;
            // 更新 bi和bj的 vlambda
            // delta_lamba * G 相当于约束产生的力（这里的是delta，外面累加），然后乘以 invM 就是速度
            // Add to linear velocity
            // v_lambda += inv(M) * delta_lamba * G
            bi.vlambda.addScaledVector(bi.invMassSolve * deltalambda, GA.spatial, bi.vlambda);
            bj.vlambda.addScaledVector(bj.invMassSolve * deltalambda, GB.spatial, bj.vlambda);
            // 更新bi和bj的 wlambda
            // Add to angular velocity
            bi.invInertiaWorldSolve.vmult(GA.rotational, temp);
            bi.wlambda.addScaledVector(deltalambda, temp, bi.wlambda);
            bj.invInertiaWorldSolve.vmult(GB.rotational, temp);
            bj.wlambda.addScaledVector(deltalambda, temp, bj.wlambda);
        }
        /**
         * Compute the denominator part of the SPOOK equation: C = G*inv(M)*G' + eps
         */
        computeC() {
            return this.computeGiMGt() + this.eps;
        }
    }
    Equation.ID = 0;
    var iMfi = new Vec3();
    var iMfj = new Vec3();
    var invIi_vmult_taui = new Vec3();
    var invIj_vmult_tauj = new Vec3();
    var tmp = new Vec3();
    var addToWlambda_temp = new Vec3();

    /**
     * Cone equation. Works to keep the given body world vectors aligned, or tilted within a given angle from each other.
     * 限定两个轴之间的夹角，angle是弧度
     */
    class ConeEquation extends Equation {
        constructor(bodyA, bodyB, maxForce = 1e6, axisA = new Vec3(1, 0, 0), axisB = new Vec3(0, 1, 0), angle = 0) {
            super(bodyA, bodyB, -maxForce, maxForce);
            this.angle = 0; //The cone angle to keep
            this.axisA = axisA.clone();
            this.axisB = axisB.clone();
            this.angle = angle;
        }
        computeB(h) {
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
            // The angle between two vector is:
            // cos(theta) = a * b / (length(a) * length(b) = { len(a) = len(b) = 1 } = a * b
            // g = a * b
            // gdot = (b x a) * wi + (a x b) * wj
            // G = [0 bxa 0 axb]
            // W = [vi wi vj wj]
            GA.rotational.copy(njxni);
            GB.rotational.copy(nixnj);
            const g = Math.cos(this.angle) - ni.dot(nj);
            const GW = this.computeGW();
            const GiMf = this.computeGiMf();
            const B = -g * a - GW * b - h * GiMf;
            // Gq = cos(ang)-dot(ni,nj) 么， 右边的值可以认为是角度差
            // q是pos,即当前的位置和角度
            //
            return B;
        }
    }
    var tmpVec1 = new Vec3();
    var tmpVec2 = new Vec3();

    /**
     * Rotational constraint. Works to keep the local vectors orthogonal to each other in world space.
     * 旋转约束。A只能绕着axisA旋转，B只能绕着axisB旋转。
     * @author schteppe
     */
    class RotationalEquation extends Equation {
        constructor(bodyA, bodyB, maxForce = 1e6, axisA = new Vec3(1, 0, 0), axisB = new Vec3(0, 1, 0)) {
            super(bodyA, bodyB);
            this.maxAngle = Math.PI / 2;
            this.maxForce = maxForce;
            this.minForce = -maxForce;
            this.axisA = axisA.clone();
            this.axisB = axisB.clone();
        }
        computeB(h) {
            const a = this.a;
            const b = this.b;
            const ni = this.axisA;
            const nj = this.axisB;
            const nixnj = tmpVec1$1;
            const njxni = tmpVec2$1;
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
            const B = -g * a - GW * b - h * GiMf;
            return B;
        }
    }
    var tmpVec1$1 = new Vec3();
    var tmpVec2$1 = new Vec3();

    /**
     * Constraint base class
     * @author schteppe
     */
    class Constraint {
        constructor(bodyA, bodyB, wakeupBodies) {
            /**
             * Equations to be solved in this constraint
             */
            this.equations = [];
            this.id = Constraint.idCounter++;
            /**
             * Set to true if you want the bodies to collide when they are connected.
             */
            this.collideConnected = true;
            this.bodyA = bodyA;
            this.bodyB = bodyB;
            if (wakeupBodies) {
                if (bodyA) {
                    bodyA.wakeUp();
                }
                if (bodyB) {
                    bodyB.wakeUp();
                }
            }
        }
        /**
         * Update all the equations with data.
         */
        update() {
            throw new Error("method update() not implmemented in this Constraint subclass!");
        }
        /**
         * Enables all equations in the constraint.
         */
        enable() {
            const eqs = this.equations;
            for (let i = 0; i < eqs.length; i++) {
                eqs[i].enabled = true;
            }
        }
        /**
         * Disables all equations in the constraint.
         */
        disable() {
            const eqs = this.equations;
            for (let i = 0; i < eqs.length; i++) {
                eqs[i].enabled = false;
            }
        }
    }
    Constraint.idCounter = 0;

    /**
     * Contact/non-penetration constraint equation
     * 接触公式，目标是希望保持两个点保持接触，而不是分开，所以也可以用来做连接约束。
     * @author schteppe
     * TODO 复用
     */
    class ContactEquation extends Equation {
        constructor(bodyA, bodyB, maxForce = 1e6) {
            super(bodyA, bodyB, 0, maxForce);
            /** 补偿值。保持一定距离 公式中的 e? */
            this.restitution = 0.0; // "bounciness": u1 = -e*u0
            /**
             * World-oriented vector that goes from the center of bi to the contact point.
             * 从bi中心指向碰撞点的向量。世界空间。
             */
            this.ri = new Vec3();
            /**
             * World-oriented vector that starts in body j position and goes to the contact point.
             * 从bj中心指向碰撞点的向量。世界空间。
             */
            this.rj = new Vec3();
            /**
             * Contact normal, pointing out of body i.
             * 碰撞法线，指向第一个对象外面。世界空间
             */
            this.ni = new Vec3();
        }
        computeB(h) {
            const a = this.a;
            const b = this.b;
            const bi = this.bi;
            const bj = this.bj;
            const ri = this.ri;
            const rj = this.rj;
            const rixn = ContactEquation.rixn;
            const rjxn = ContactEquation.rjxn;
            const vi = bi.velocity;
            const wi = bi.angularVelocity;
            const vj = bj.velocity;
            const wj = bj.angularVelocity;
            const penetrationVec = ContactEquation.temp3;
            const GA = this.jacobianElementA;
            const GB = this.jacobianElementB;
            const n = this.ni;
            // Caluclate cross products
            ri.cross(n, rixn); // rixn = ri X n
            rj.cross(n, rjxn); // rjxn = rj X n
            // g = xj+rj -(xi+ri)
            // G = [ -ni  -rixn  ni  rjxn ]
            n.negate(GA.spatial); //GA.s = -n
            rixn.negate(GA.rotational); //GA.r = -rixn
            GB.spatial.copy(n); //GB.s = n
            GB.rotational.copy(rjxn); //GB.r = rjxn
            // Calculate the penetration vector
            // 计算插入深度，实际就是两个碰撞点的距离
            penetrationVec.copy(bj.position);
            penetrationVec.vadd(rj, penetrationVec); // posj+rj
            penetrationVec.vsub(bi.position, penetrationVec); // 
            penetrationVec.vsub(ri, penetrationVec); // posi+ri - (posj+rj)
            // g 就是约束函数的值。希望这个值=0, <0表示插入了
            const g = n.dot(penetrationVec); // .n
            // Compute iteration
            const ePlusOne = this.restitution + 1;
            const GW = ePlusOne * (vj.dot(n) - vi.dot(n)) + wj.dot(rjxn) - wi.dot(rixn); // = dg/dt 去掉第二部分，约等于这个
            const GiMf = this.computeGiMf();
            const B = -g * a - GW * b - h * GiMf; //? TODO 为什么是 ga, g=Gq么。 Gq的计算没有考虑旋转部分，所以确实相等，这里需要继续理解
            return B;
        }
        /**
         * Get the current relative velocity in the contact point.
         * 计算相撞在法线方向的速度的力量 dot(relv, normal) ,相对于i
         */
        getImpactVelocityAlongNormal() {
            const vi = ContactEquation._vi;
            const vj = ContactEquation._vj;
            const xi = ContactEquation._xi;
            const xj = ContactEquation._xj;
            const relVel = ContactEquation._relVel;
            this.bi.position.vadd(this.ri, xi); // xi = bi.pos + this.ri
            this.bj.position.vadd(this.rj, xj); // xj = bj.pos + this.rj
            this.bi.getVelocityAtWorldPoint(xi, vi);
            this.bj.getVelocityAtWorldPoint(xj, vj);
            vi.vsub(vj, relVel); // relVel = vi-vj
            return this.ni.dot(relVel);
        }
    }
    ContactEquation.rixn = new Vec3();
    ContactEquation.rjxn = new Vec3();
    ContactEquation.temp3 = new Vec3();
    ContactEquation._vi = new Vec3();
    ContactEquation._vj = new Vec3();
    ContactEquation._xi = new Vec3();
    ContactEquation._xj = new Vec3();
    ContactEquation._relVel = new Vec3();

    /**
     * Connects two bodies at given offset points.
     * 把A的pivotA与B的pivotB连到一起。限制xyz方向三个自由度,只允许旋转
     * 为什么不用distance=0来实现呢
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
    class PointToPointConstraint extends Constraint {
        /**
         * @param bodyA
         * @param pivotA The point relative to the center of mass of bodyA which bodyA is constrained to.
         * @param bodyB Body that will be constrained in a similar way to the same point as bodyA. We will therefore get a link between bodyA and bodyB. If not specified, bodyA will be constrained to a static point.
         * @param pivotB See pivotA.
         * @param maxForce The maximum force that should be applied to constrain the bodies.
         *
         * 创建了xyz三个 ContactEquation 来实现的，保持三个方向的连接。
         */
        constructor(bodyA, pivotA, bodyB, pivotB, maxForce = 1e6) {
            super(bodyA, bodyB, true);
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
            this.bodyA.quaternion.vmult(this.pivotA, x.ri); // x.ri = pivotA * A.quat
            this.bodyB.quaternion.vmult(this.pivotB, x.rj); // x.rj = pivotB * B.quat
            y.ri.copy(x.ri);
            z.ri.copy(x.ri); // y.ri=z.ri=x.ri
            y.rj.copy(x.rj);
            z.rj.copy(x.rj); // y.rj=z.rj=x.rj
        }
    }

    /**
     * @class ConeTwistConstraint
     * @constructor
     * @author schteppe
     */
    class ConeTwistConstraint extends PointToPointConstraint {
        /**
         *
         * @param bodyA
         * @param bodyB
         * @param maxForce
         * @param pivotA
         * @param pivotB
         * @param axisA
         * @param axisB
         * @param angle
         * @param twistAngle 	axis 允许扭曲的弧度。实际是根据axis的垂直轴来做角度限制。
         * @param collideConnected
         */
        constructor(bodyA, bodyB, maxForce = 1e6, pivotA = new Vec3(), pivotB = new Vec3(), axisA = new Vec3(), axisB = new Vec3(), angle = 0, twistAngle = 0, collideConnected = false) {
            super(bodyA, pivotA, bodyB, pivotB, maxForce);
            this.angle = 0;
            this.twistAngle = 0;
            // Set pivot point in between
            this.axisA = axisA.clone();
            this.axisB = axisB.clone();
            this.collideConnected = collideConnected;
            this.angle = angle;
            const c = this.coneEquation = new ConeEquation(bodyA, bodyB, maxForce, axisA, axisB, angle);
            const t = this.twistEquation = new RotationalEquation(bodyA, bodyB, maxForce, axisA, axisB);
            this.twistAngle = twistAngle;
            // Make the cone equation push the bodies toward the cone axis, not outward
            c.maxForce = 0;
            c.minForce = -maxForce;
            // Make the twist equation add torque toward the initial position
            t.maxForce = 0;
            t.minForce = -maxForce;
            this.equations.push(c, t);
        }
        update() {
            const bodyA = this.bodyA;
            const bodyB = this.bodyB;
            const cone = this.coneEquation;
            const twist = this.twistEquation;
            super.update();
            // Update the axes to the cone constraint
            bodyA.vectorToWorldFrame(this.axisA, cone.axisA);
            bodyB.vectorToWorldFrame(this.axisB, cone.axisB);
            // Update the world axes in the twist constraint
            // TODO 感觉这个地方有问题，各自在本地空间求tangent，然后转到世界空间，那么两个向量是不是没有同一的标准，导致角度不是期望的
            // 以后实在不行就再加一个显式的tangent向量。
            this.axisA.tangents(twist.axisA, twist.axisA);
            bodyA.vectorToWorldFrame(twist.axisA, twist.axisA);
            this.axisB.tangents(twist.axisB, twist.axisB);
            bodyB.vectorToWorldFrame(twist.axisB, twist.axisB);
            cone.angle = this.angle;
            twist.maxAngle = this.twistAngle;
        }
    }
    ConeTwistConstraint.constructor = ConeTwistConstraint;
    //const ConeTwistConstraint_update_tmpVec1 = new Vec3();
    //const ConeTwistConstraint_update_tmpVec2 = new Vec3();

    /**
     * Constrains two bodies to be at a constant distance from each others center of mass.
     * @author schteppe
     * @param  [distance] The distance to keep. If undefined, it will be set to the current distance between bodyA and bodyB
     * @param  [maxForce=1e6]
     * 用distance中点方作为碰撞点来实现
     */
    class DistanceConstraint extends Constraint {
        constructor(bodyA, bodyB, distance, maxForce) {
            super(bodyA, bodyB, true);
            this.distance = 0;
            if (typeof (distance) === "undefined") {
                distance = bodyA.position.distanceTo(bodyB.position);
            }
            if (typeof (maxForce) === "undefined") {
                maxForce = 1e6;
            }
            this.distance = distance;
            const eq = this.distanceEquation = new ContactEquation(bodyA, bodyB);
            this.equations.push(eq);
            // Make it bidirectional
            eq.minForce = -maxForce;
            eq.maxForce = maxForce;
        }
        update() {
            const bodyA = this.bodyA;
            const bodyB = this.bodyB;
            const eq = this.distanceEquation;
            const halfDist = this.distance * 0.5;
            const normal = eq.ni;
            bodyB.position.vsub(bodyA.position, normal); // normal = B-A
            normal.normalize();
            normal.scale(halfDist, eq.ri);
            normal.scale(-halfDist, eq.rj);
        }
    }

    /**
     * Constrains two bodies to be at a constant distance from each others center of mass.
     * @author schteppe
     * @param  [distance] The distance to keep. If undefined, it will be set to the current distance between bodyA and bodyB
     * @param  [maxForce=1e6]
     * 用distance中点方作为碰撞点来实现
     */
    class DistanceConstraint$1 extends Constraint {
        constructor(bodyA, bodyB, distance, maxForce) {
            super(bodyA, bodyB, true);
            this.distance = 0;
            if (typeof (distance) === "undefined") {
                distance = bodyA.position.distanceTo(bodyB.position);
            }
            if (typeof (maxForce) === "undefined") {
                maxForce = 1e6;
            }
            this.distance = distance;
            const eq = this.distanceEquation = new ContactEquation(bodyA, bodyB);
            this.equations.push(eq);
            // Make it bidirectional
            eq.minForce = -maxForce;
            eq.maxForce = maxForce;
        }
        update() {
            const bodyA = this.bodyA;
            const bodyB = this.bodyB;
            const eq = this.distanceEquation;
            const halfDist = this.distance * 0.5;
            const normal = eq.ni;
            bodyB.position.vsub(bodyA.position, normal); // normal = B-A
            normal.normalize();
            normal.scale(halfDist, eq.ri);
            normal.scale(-halfDist, eq.rj);
        }
    }

    /**
     * Rotational motor constraint. Tries to keep the relative angular velocity of the bodies to a given value.
     * @author schteppe
     */
    class RotationalMotorEquation extends Equation {
        constructor(bodyA, bodyB, maxForce = 1e6) {
            super(bodyA, bodyB, -maxForce, maxForce);
            /**
             * World oriented rotational axis
             */
            this.axisA = new Vec3();
            /**
             * World oriented rotational axis
             */
            this.axisB = new Vec3(); // World oriented rotational axis
            /**
             * Motor velocity
             * @property {Number} targetVelocity
             */
            this.targetVelocity = 0;
        }
        computeB(h) {
            //const a = this.a;
            const b = this.b;
            //const bi = this.bi;
            //const bj = this.bj;
            const axisA = this.axisA;
            const axisB = this.axisB;
            const GA = this.jacobianElementA;
            const GB = this.jacobianElementB;
            // g = 0
            // gdot = axisA * wi - axisB * wj
            // gdot = G * W = G * [vi wi vj wj]
            // =>
            // G = [0 axisA 0 -axisB]
            GA.rotational.copy(axisA);
            axisB.negate(GB.rotational);
            const GW = this.computeGW() - this.targetVelocity;
            const GiMf = this.computeGiMf();
            const B = -GW * b - h * GiMf;
            return B;
        }
    }

    /**
     * Hinge constraint. Think of it as a door hinge. It tries to keep the door in the correct place and with the correct orientation.
     * @class HingeConstraint
     * @constructor
     * @author schteppe
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {object} [options]
     * @param {Vec3} [options.pivotA] A point defined locally in bodyA. This defines the offset of axisA.
     *                                A的连接点，本地坐标
     * @param {Vec3} [options.axisA] An axis that bodyA can rotate around, defined locally in bodyA.
     *                                A的连接轴，系统会保持AB的连接点重合，并且AB的连接轴重合
     * @param {Vec3} [options.pivotB]
     * @param {Vec3} [options.axisB]
     * @param {Number} [options.maxForce=1e6]
     * @extends PointToPointConstraint
     */
    class HingeConstraint extends PointToPointConstraint {
        constructor(bodyA, bodyB, maxForce = 1e6, pivotA = new Vec3(), pivotB = new Vec3(), axisA = new Vec3(1, 0, 0), axisB = new Vec3(1, 0, 0)) {
            super(bodyA, pivotA, bodyB, pivotB, maxForce);
            /** TODO 这个目前还没有实现 */
            this.motorTargetVelocity = 0;
            axisA.normalize();
            this.axisA = axisA.clone();
            axisB.normalize();
            this.axisB = axisB.clone();
            const r1 = this.rotationalEquation1 = new RotationalEquation(bodyA, bodyB, maxForce, axisA, axisB);
            const r2 = this.rotationalEquation2 = new RotationalEquation(bodyA, bodyB, maxForce, axisA, axisB);
            const motor = this.motorEquation = new RotationalMotorEquation(bodyA, bodyB, maxForce);
            motor.enabled = false; // Not enabled by default
            // Equations to be fed to the solver
            this.equations.push(r1, // rotational1
            r2, // rotational2
            motor);
        }
        /**
         * @method enableMotor
         */
        enableMotor() {
            this.motorEquation.enabled = true;
        }
        /**
         * @method disableMotor
         */
        disableMotor() {
            this.motorEquation.enabled = false;
        }
        setMotorSpeed(speed) {
            this.motorEquation.targetVelocity = speed;
        }
        setMotorMaxForce(maxForce) {
            this.motorEquation.maxForce = maxForce;
            this.motorEquation.minForce = -maxForce;
        }
        update() {
            const bodyA = this.bodyA;
            const bodyB = this.bodyB;
            const motor = this.motorEquation;
            const r1 = this.rotationalEquation1;
            const r2 = this.rotationalEquation2;
            const worldAxisA = HingeConstraint_update_tmpVec1;
            const worldAxisB = HingeConstraint_update_tmpVec2;
            const axisA = this.axisA;
            const axisB = this.axisB;
            super.update();
            // Get world axes
            bodyA.quaternion.vmult(axisA, worldAxisA);
            bodyB.quaternion.vmult(axisB, worldAxisB);
            worldAxisA.tangents(r1.axisA, r2.axisA);
            r1.axisB.copy(worldAxisB);
            r2.axisB.copy(worldAxisB);
            if (this.motorEquation.enabled) {
                bodyA.quaternion.vmult(this.axisA, motor.axisA);
                bodyB.quaternion.vmult(this.axisB, motor.axisB);
            }
        }
    }
    HingeConstraint.constructor = HingeConstraint;
    var HingeConstraint_update_tmpVec1 = new Vec3();
    var HingeConstraint_update_tmpVec2 = new Vec3();

    class Muscle extends DistanceConstraint$1 {
    }

    let wp1 = new Vec3();
    let wp2 = new Vec3();
    /**
     * 两个body的任意两点间的距离限制。
     */
    class PointToPointDistanceConstraint extends DistanceConstraint$1 {
        constructor(bodyA, bodyB, p1, p2, distance, maxForce) {
            super(bodyA, bodyB, distance);
            this.pivotA = new Vec3(); // A上的相对位置
            this.pivotB = new Vec3(); // B上的相对位置
            this.pivotA.copy(p1);
            this.pivotB.copy(p2);
        }
        update() {
            const bodyA = this.bodyA;
            const bodyB = this.bodyB;
            const eq = this.distanceEquation;
            bodyA.quaternion.vmult(this.pivotA, wp1); // pivot转换到世界空间
            bodyB.quaternion.vmult(this.pivotB, wp2);
            bodyA.position.vadd(wp1, wp1);
            bodyB.position.vadd(wp2, wp2);
            const halfDist = this.distance * 0.5;
            const normal = eq.ni;
            wp2.vsub(wp1, normal); // normal = B-A
            normal.normalize();
            // 希望沿着法线中点左右长度为halfDist的点
            wp1.addScaledVector(halfDist, normal, eq.ri);
            wp2.addScaledVector(-halfDist, normal, eq.rj);
            eq.ri.vsub(bodyA.position, eq.ri);
            eq.rj.vsub(bodyB.position, eq.rj);
        }
    }

    /**
     * Lock constraint. Will remove all degrees of freedom between the bodies.
     * 把A和B l固定到一起
     * @author schteppe
     */
    class LockConstraint extends PointToPointConstraint {
        //motorEquation;
        constructor(bodyA, bodyB, maxForce = 1e6, axisA, axisB) {
            // Set pivot point in between
            const pivotA = new Vec3();
            const pivotB = new Vec3();
            const halfWay = new Vec3();
            bodyA.position.vadd(bodyB.position, halfWay);
            halfWay.scale(0.5, halfWay);
            bodyB.pointToLocalFrame(halfWay, pivotB);
            bodyA.pointToLocalFrame(halfWay, pivotA);
            // The point-to-point constraint will keep a point shared between the bodies
            super(bodyA, pivotA, bodyB, pivotB, maxForce);
            // Store initial rotation of the bodies as unit vectors in the local body spaces
            this.xA = bodyA.vectorToLocalFrame(Vec3.UNIT_X);
            this.xB = bodyB.vectorToLocalFrame(Vec3.UNIT_X);
            this.yA = bodyA.vectorToLocalFrame(Vec3.UNIT_Y);
            this.yB = bodyB.vectorToLocalFrame(Vec3.UNIT_Y);
            this.zA = bodyA.vectorToLocalFrame(Vec3.UNIT_Z);
            this.zB = bodyB.vectorToLocalFrame(Vec3.UNIT_Z);
            // ...and the following rotational equations will keep all rotational DOF's in place
            const r1 = this.rotationalEquation1 = new RotationalEquation(bodyA, bodyB, maxForce, axisA, axisB);
            const r2 = this.rotationalEquation2 = new RotationalEquation(bodyA, bodyB, maxForce, axisA, axisB);
            const r3 = this.rotationalEquation3 = new RotationalEquation(bodyA, bodyB, maxForce, axisA, axisB);
            this.equations.push(r1, r2, r3);
        }
        update() {
            const bodyA = this.bodyA;
            const bodyB = this.bodyB;
            //const motor = this.motorEquation;
            const r1 = this.rotationalEquation1;
            const r2 = this.rotationalEquation2;
            const r3 = this.rotationalEquation3;
            //const worldAxisA = LockConstraint_update_tmpVec1;
            //const worldAxisB = LockConstraint_update_tmpVec2;
            super.update();
            // These vector pairs must be orthogonal
            bodyA.vectorToWorldFrame(this.xA, r1.axisA);
            bodyB.vectorToWorldFrame(this.yB, r1.axisB);
            bodyA.vectorToWorldFrame(this.yA, r2.axisA);
            bodyB.vectorToWorldFrame(this.zB, r2.axisB);
            bodyA.vectorToWorldFrame(this.zA, r3.axisA);
            bodyB.vectorToWorldFrame(this.xB, r3.axisB);
        }
    }
    LockConstraint.constructor = LockConstraint;
    //var LockConstraint_update_tmpVec1 = new Vec3();
    //var LockConstraint_update_tmpVec2 = new Vec3();

    /**
     * @author schteppe
     */
    class Material {
        constructor(name, friction = 0.3, restitution = 0) {
            this.id = Material.idCounter++;
            this.friction = 0.3;
            this._restitution = 0;
            this.name = name;
            this.friction = friction;
            this.restitution = restitution;
        }
        set restitution(v) {
            this._restitution = v;
        }
        get restitution() {
            return this._restitution;
        }
    }
    Material.idCounter = 0;
    Material.infiniteFriction = 1e6;

    /**
     * Defines what happens when two materials meet.
     * @class ContactMaterial
     * @constructor
     * @param {Material} m1
     * @param {Material} m2
     * @param {object} [options]
     * @param {Number} [options.friction=0.3]
     * @param {Number} [options.restitution=0.3]
     * @param {number} [options.contactEquationStiffness=1e7]
     * @param {number} [options.contactEquationRelaxation=3]
     * @param {number} [options.frictionEquationStiffness=1e7]
     * @param {Number} [options.frictionEquationRelaxation=3]
     */
    class ContactMaterial extends Material {
        constructor(m1, m2, friction, restitution) {
            super('contactMaterial', friction, restitution);
            /**
             * Identifier of this material
             */
            this.id = ContactMaterial.idCounter++;
            /**
             * Friction coefficient
             */
            //friction: number = 0.3;
            /**
             * Restitution coefficient
             * 范围是0到1， 1的弹性最大
             */
            //restitution: number = 0.3;
            /**
             The stiffness approximately corresponds to the stiffness of a spring, which gives a force F=-k*x where x is the displacement of the spring.
             Regularization time is corresponds to the number of time steps you need to take to stabilize the constraint (larger value => softer contact).
            */
            /**
             * Stiffness of the produced contact equations
             */
            this.contactEquationStiffness = 1e7; // SPOOK: ε = .. k
            /**
             * Relaxation time of the produced contact equations
             */
            this.contactEquationRelaxation = 3; // SPOOK : d
            /**
             * Stiffness of the produced friction equations
             */
            this.frictionEquationStiffness = 1e7;
            /**
             * Relaxation time of the produced friction equations
             */
            this.frictionEquationRelaxation = 3;
            if (m1 && m2)
                this.materials = [m1, m2];
            else
                this.materials = [];
        }
    }
    ContactMaterial.idCounter = 0;

    /**
     * Constrains the slipping in a contact along a tangent
     * @author schteppe
     */
    class FrictionEquation extends Equation {
        /**
         *
         * @param bodyA
         * @param bodyB
         * @param slipForce should be +-F_friction = +-mu * F_normal = +-mu * m * g
         */
        constructor(bodyA, bodyB, slipForce) {
            super(bodyA, bodyB, -slipForce, slipForce);
            this.ri = new Vec3(); //质心到碰撞点
            this.rj = new Vec3(); //质心到碰撞点
            this.t = new Vec3(); //tangent
        }
        computeB(h) {
            //const a = this.a;
            const b = this.b;
            //const bi = this.bi;
            //const bj = this.bj;
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
            const B = -GW * b - h * GiMf;
            return B;
        }
    }
    var FrictionEquation_computeB_temp1 = new Vec3();
    var FrictionEquation_computeB_temp2 = new Vec3();

    /**
     * A Quaternion describes a rotation in 3D space. The Quaternion is mathematically defined as Q = x*i + y*j + z*k + w, where (i,j,k) are imaginary basis vectors. (x,y,z) can be seen as a vector related to the axis of rotation, while the real multiplier, w, is related to the amount of rotation.
     * @see http://en.wikipedia.org/wiki/Quaternion
     */
    class Quaternion {
        constructor(x, y, z, w) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 0;
            this.x = x !== undefined ? x : 0;
            this.y = y !== undefined ? y : 0;
            this.z = z !== undefined ? z : 0;
            this.w = w !== undefined ? w : 1;
        }
        set(x, y, z, w) {
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
        setFromAxisAngle(axis, angle) {
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
            }
            else {
                targetAxis.x = this.x / s; // normalise axis
                targetAxis.y = this.y / s;
                targetAxis.z = this.z / s;
            }
            return [targetAxis, angle];
        }
        /**
         * Set the quaternion value given two vectors. The resulting rotation will be the needed rotation to rotate u to v.
         */
        setFromVectors(u, v) {
            if (u.isAntiparallelTo(v)) {
                const t1 = sfv_t1;
                const t2 = sfv_t2;
                u.tangents(t1, t2);
                this.setFromAxisAngle(t1, Math.PI);
            }
            else {
                const a = u.cross(v);
                this.x = a.x;
                this.y = a.y;
                this.z = a.z;
                this.w = Math.sqrt(u.length() ** 2 * (v.length() ** 2)) + u.dot(v);
                this.normalize();
            }
            return this;
        }
        mult(q, target = new Quaternion()) {
            const ax = this.x;
            const ay = this.y;
            const az = this.z;
            const aw = this.w;
            const bx = q.x;
            const by = q.y;
            const bz = q.z;
            const bw = q.w;
            target.x = ax * bw + aw * bx + ay * bz - az * by;
            target.y = ay * bw + aw * by + az * bx - ax * bz;
            target.z = az * bw + aw * bz + ax * by - ay * bx;
            target.w = aw * bw - ax * bx - ay * by - az * bz;
            return target;
        }
        /**
         * Get the inverse quaternion rotation.
         */
        inverse(target) {
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
            }
            else {
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
            }
            else {
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
        vmult(v, target = new Vec3()) {
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
        //同时旋转三个坐标轴
        vmultAxis(x, y, z) {
            const qx = this.x;
            const qy = this.y;
            const qz = this.z;
            const qw = this.w;
            let w2 = qw * qw, x2 = qx * qx, y2 = qy * qy, z2 = qz * qz;
            let zw = 2 * qz * qw;
            let xy = 2 * qx * qy;
            let yw = 2 * qy * qw;
            let xz = 2 * qx * qz;
            let yz = 2 * qy * qz;
            let xw = 2 * qx * qw;
            // x 1,0,0
            x.x = w2 + x2 - z2 - y2;
            x.y = zw + xy;
            x.z = -yw + xz;
            // y 0,1,0
            y.x = -zw + xy;
            y.y = w2 + y2 - x2 - z2;
            y.z = xw + yz;
            // z 0,0,1
            z.x = yw + xz;
            z.y = -xw + yz;
            z.z = w2 + z2 - y2 - x2;
        }
        /**
         * Copies value of source to this quaternion.
         */
        copy(q) {
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
        toEuler(target, order = "YZX") {
            let heading = 0;
            let attitude = 0;
            let bank = 0;
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
                        attitude = -Math.PI / 2;
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
        setFromEuler(x, y, z, order = "XYZ") {
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
            }
            else if (order === 'YXZ') {
                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 - s1 * c2 * s3;
                this.z = c1 * c2 * s3 - s1 * s2 * c3;
                this.w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            else if (order === 'ZXY') {
                this.x = s1 * c2 * c3 - c1 * s2 * s3;
                this.y = c1 * s2 * c3 + s1 * c2 * s3;
                this.z = c1 * c2 * s3 + s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            else if (order === 'ZYX') {
                this.x = s1 * c2 * c3 - c1 * s2 * s3;
                this.y = c1 * s2 * c3 + s1 * c2 * s3;
                this.z = c1 * c2 * s3 - s1 * s2 * c3;
                this.w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            else if (order === 'YZX') {
                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 + s1 * c2 * s3;
                this.z = c1 * c2 * s3 - s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            else if (order === 'XZY') {
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
        slerp(toQuat, t, target = new Quaternion()) {
            const ax = this.x;
            const ay = this.y;
            const az = this.z;
            const aw = this.w;
            let bx = toQuat.x;
            let by = toQuat.y;
            let bz = toQuat.z;
            let bw = toQuat.w;
            let omega;
            let cosom;
            let sinom;
            let scale0;
            let scale1;
            // calc cosine
            cosom = ax * bx + ay * by + az * bz + aw * bw;
            // adjust signs (if necessary)
            if (cosom < 0.0) {
                cosom = -cosom;
                bx = -bx;
                by = -by;
                bz = -bz;
                bw = -bw;
            }
            // calculate coefficients
            if ((1.0 - cosom) > 0.000001) {
                // standard case (slerp)
                omega = Math.acos(cosom);
                sinom = Math.sin(omega);
                scale0 = Math.sin((1.0 - t) * omega) / sinom;
                scale1 = Math.sin(t * omega) / sinom;
            }
            else {
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
        integrate(angularVelocity, dt, angularFactor, target = new Quaternion()) {
            var ax = angularVelocity.x * angularFactor.x, ay = angularVelocity.y * angularFactor.y, az = angularVelocity.z * angularFactor.z, bx = this.x, by = this.y, bz = this.z, bw = this.w;
            var half_dt = dt * 0.5;
            target.x += half_dt * (ax * bw + ay * bz - az * by);
            target.y += half_dt * (ay * bw + az * bx - ax * bz);
            target.z += half_dt * (az * bw + ax * by - ay * bx);
            target.w += half_dt * (-ax * bx - ay * by - az * bz);
            return target;
        }
    }
    var sfv_t1 = new Vec3();
    var sfv_t2 = new Vec3();
    //const Quaternion_mult_va = new Vec3();
    //const Quaternion_mult_vb = new Vec3();
    //const Quaternion_mult_vaxvb = new Vec3();

    class Transform {
        constructor(options) {
            this.position = new Vec3();
            this.quaternion = new Quaternion();
            if (options) {
                if (options.position) {
                    this.position.copy(options.position);
                }
                if (options.quaternion) {
                    this.quaternion.copy(options.quaternion);
                }
            }
        }
        /**
         * Get a global point in local transform coordinates.
         */
        pointToLocal(worldPoint, result) {
            return Transform.pointToLocalFrame(this.position, this.quaternion, worldPoint, result);
        }
        /**
         * Get a local point in global transform coordinates.
         */
        pointToWorld(localPoint, result) {
            return Transform.pointToWorldFrame(this.position, this.quaternion, localPoint, result);
        }
        vectorToWorldFrame(localVector, result) {
            var result = result || new Vec3();
            this.quaternion.vmult(localVector, result);
            return result;
        }
        /**
         * 把一个世界空间的点转换到本地空间
         * @param position
         * @param quaternion
         * @param worldPoint
         * @param result
         */
        static pointToLocalFrame(position, quaternion, worldPoint, result) {
            var result = result || new Vec3();
            worldPoint.vsub(position, result);
            quaternion.conjugate(tmpQuat);
            tmpQuat.vmult(result, result);
            return result;
        }
        /**
         * 把一个本地空间的点转到世界空间
         * @param position
         * @param quaternion
         * @param localPoint
         * @param result
         */
        static pointToWorldFrame(position, quaternion, localPoint, result) {
            var result = result || new Vec3();
            quaternion.vmult(localPoint, result);
            result.vadd(position, result);
            return result;
        }
        ;
        static vectorToWorldFrame(quaternion, localVector, result) {
            quaternion.vmult(localVector, result);
            return result;
        }
        static vectorToLocalFrame(position, quaternion, worldVector, result) {
            var result = result || new Vec3();
            quaternion.w *= -1;
            quaternion.vmult(worldVector, result);
            quaternion.w *= -1;
            return result;
        }
        /**
         * 把旋转和位置转换成本地的一个矩阵和相对位置
         * @param pos
         * @param q
         * @param rpos 本地相对坐标
         * @param mat 本地矩阵
         */
        toLocalMat(pos, q, rpos, mat) {
            pos.vsub(this.position, rpos); // 转成相对位置
            let invQ = tolocalMatInvQ;
            this.quaternion.conjugate(invQ); // 自己的旋转的逆
            let invMat = tolocalMat;
            invMat.setRotationFromQuaternion(invQ); // 自己的逆矩阵
            // 对方的矩阵
            mat.setRotationFromQuaternion(q);
            // 把对方的矩阵映射到本地空间
            mat.mmult(invMat, mat);
        }
        static posQToLocalMat(mypos, myQ, pos, q, rpos, mat) {
            pos.vsub(mypos, rpos); // 转成相对位置
            let invQ = tolocalMatInvQ;
            myQ.conjugate(invQ); // 自己的旋转的逆
            let invMat = tolocalMat;
            invMat.setRotationFromQuaternion(invQ); // 自己的逆矩阵
            // 对方的矩阵
            mat.setRotationFromQuaternion(q);
            // 把对方的矩阵映射到本地空间
            mat.mmult(invMat, mat);
        }
    }
    const tmpQuat = new Quaternion();
    const tolocalMatInvQ = new Quaternion();
    const tolocalMat = new Mat3();

    class AABB {
        constructor(lowerBound, upperBound) {
            this.lowerBound = new Vec3();
            this.upperBound = new Vec3();
            lowerBound && this.lowerBound.copy(lowerBound);
            upperBound && this.upperBound.copy(upperBound);
        }
        /**
         * Set the AABB bounds from a set of points.
         */
        setFromPoints(points, position, quaternion, skinSize) {
            const l = this.lowerBound;
            const u = this.upperBound;
            const q = quaternion;
            // Set to the first point
            l.copy(points[0]);
            if (q) {
                q.vmult(l, l);
            }
            u.copy(l);
            for (let i = 1; i < points.length; i++) {
                let p = points[i];
                if (q) {
                    q.vmult(p, tmp$1);
                    p = tmp$1;
                }
                if (p.x > u.x) {
                    u.x = p.x;
                }
                if (p.x < l.x) {
                    l.x = p.x;
                }
                if (p.y > u.y) {
                    u.y = p.y;
                }
                if (p.y < l.y) {
                    l.y = p.y;
                }
                if (p.z > u.z) {
                    u.z = p.z;
                }
                if (p.z < l.z) {
                    l.z = p.z;
                }
            }
            // Add offset
            if (position) {
                position.vadd(l, l);
                position.vadd(u, u);
            }
            if (skinSize) {
                l.x -= skinSize;
                l.y -= skinSize;
                l.z -= skinSize;
                u.x += skinSize;
                u.y += skinSize;
                u.z += skinSize;
            }
            return this;
        }
        /**
         * Copy bounds from an AABB to this AABB
         */
        copy(aabb) {
            this.lowerBound.copy(aabb.lowerBound);
            this.upperBound.copy(aabb.upperBound);
            return this;
        }
        /**
         * Clone an AABB
         */
        clone() {
            return new AABB().copy(this);
        }
        combine(a, b) {
            let min = this.lowerBound;
            let max = this.upperBound;
            let amin = a.lowerBound;
            let bmin = b.lowerBound;
            let amax = a.upperBound;
            let bmax = b.upperBound;
            min.x = Math.min(amin.x, bmin.x);
            min.y = Math.min(amin.y, bmin.y);
            min.z = Math.min(amin.z, bmin.z);
            max.x = Math.max(amax.x, bmax.x);
            max.y = Math.max(amax.y, bmax.y);
            max.z = Math.max(amax.z, bmax.z);
        }
        /**
         * Extend this AABB so that it covers the given AABB too.
         */
        extend(aabb) {
            this.lowerBound.x = Math.min(this.lowerBound.x, aabb.lowerBound.x);
            this.upperBound.x = Math.max(this.upperBound.x, aabb.upperBound.x);
            this.lowerBound.y = Math.min(this.lowerBound.y, aabb.lowerBound.y);
            this.upperBound.y = Math.max(this.upperBound.y, aabb.upperBound.y);
            this.lowerBound.z = Math.min(this.lowerBound.z, aabb.lowerBound.z);
            this.upperBound.z = Math.max(this.upperBound.z, aabb.upperBound.z);
        }
        static Overlaps(min1, max1, min2, max2) {
            throw '';
        }
        /**
         * Returns true if the given AABB overlaps this AABB.
         */
        overlaps(aabb) {
            let l1 = this.lowerBound;
            let u1 = this.upperBound;
            let l2 = aabb.lowerBound;
            let u2 = aabb.upperBound;
            //      l2        u2
            //      |---------|
            // |--------|
            // l1       u1
            /*
            const overlapsX = ((l2.x <= u1.x && u1.x <= u2.x) || (l1.x <= u2.x && u2.x <= u1.x));
            const overlapsY = ((l2.y <= u1.y && u1.y <= u2.y) || (l1.y <= u2.y && u2.y <= u1.y));
            const overlapsZ = ((l2.z <= u1.z && u1.z <= u2.z) || (l1.z <= u2.z && u2.z <= u1.z));

            return overlapsX && overlapsY && overlapsZ;
            */
            return l1.x > u2.x || l1.y > u2.y || l1.z > u2.z || u1.x < l2.x || u1.y < l2.y || u1.z < l2.z ? false : true;
        }
        // Mostly for debugging
        volume() {
            const l = this.lowerBound;
            const u = this.upperBound;
            return (u.x - l.x) * (u.y - l.y) * (u.z - l.z);
        }
        // 返回AABB的表面积
        surfaceArea() {
            let min = this.lowerBound;
            let max = this.upperBound;
            let dx = max.x - min.x;
            let dy = max.y - min.y;
            let dz = max.z - min.z;
            return 2.0 * (dx * (dy + dz) + dy * dz);
        }
        /**
         * Returns true if the given AABB is fully contained in this AABB.
         */
        contains(aabb) {
            const l1 = this.lowerBound;
            const u1 = this.upperBound;
            const l2 = aabb.lowerBound;
            const u2 = aabb.upperBound;
            //      l2        u2
            //      |---------|
            // |---------------|
            // l1              u1
            return ((l1.x <= l2.x && u1.x >= u2.x) &&
                (l1.y <= l2.y && u1.y >= u2.y) &&
                (l1.z <= l2.z && u1.z >= u2.z));
        }
        getCorners(a, b, c, d, e, f, g, h) {
            const l = this.lowerBound;
            const u = this.upperBound;
            a.copy(l);
            b.set(u.x, l.y, l.z);
            c.set(u.x, u.y, l.z);
            d.set(l.x, u.y, u.z);
            e.set(u.x, l.y, l.z);
            f.set(l.x, u.y, l.z);
            g.set(l.x, l.y, u.z);
            h.copy(u);
        }
        /**
         * Get the representation of an AABB in another frame.
         */
        toLocalFrame(frame, target) {
            const corners = transformIntoFrame_corners;
            const a = corners[0];
            const b = corners[1];
            const c = corners[2];
            const d = corners[3];
            const e = corners[4];
            const f = corners[5];
            const g = corners[6];
            const h = corners[7];
            // Get corners in current frame
            this.getCorners(a, b, c, d, e, f, g, h);
            // Transform them to new local frame
            for (let i = 0; i !== 8; i++) {
                const corner = corners[i];
                frame.pointToLocal(corner, corner);
            }
            return target.setFromPoints(corners);
        }
        /**
         * Get the representation of an AABB in the global frame.
         */
        toWorldFrame(frame, target) {
            const corners = transformIntoFrame_corners;
            const a = corners[0];
            const b = corners[1];
            const c = corners[2];
            const d = corners[3];
            const e = corners[4];
            const f = corners[5];
            const g = corners[6];
            const h = corners[7];
            // Get corners in current frame
            this.getCorners(a, b, c, d, e, f, g, h);
            // Transform them to new local frame
            for (let i = 0; i !== 8; i++) {
                const corner = corners[i];
                frame.pointToWorld(corner, corner);
            }
            return target.setFromPoints(corners);
        }
        /**
         * Check if the AABB is hit by a ray.
         */
        overlapsRay(ray) {
            // ray.direction is unit direction vector of ray
            var d = ray._direction;
            var f = ray.from;
            const dirFracX = 1 / d.x;
            const dirFracY = 1 / d.y;
            const dirFracZ = 1 / d.z;
            // this.lowerBound is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
            const t1 = (this.lowerBound.x - f.x) * dirFracX;
            const t2 = (this.upperBound.x - f.x) * dirFracX;
            const t3 = (this.lowerBound.y - f.y) * dirFracY;
            const t4 = (this.upperBound.y - f.y) * dirFracY;
            const t5 = (this.lowerBound.z - f.z) * dirFracZ;
            const t6 = (this.upperBound.z - f.z) * dirFracZ;
            // var tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
            // var tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));
            const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
            const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
            // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
            if (tmax < 0) {
                //t = tmax;
                return false;
            }
            // if tmin > tmax, ray doesn't intersect AABB
            if (tmin > tmax) {
                //t = tmax;
                return false;
            }
            return true;
        }
        // 把aabb扩展一下边界
        margin(m) {
            let l = this.lowerBound;
            let u = this.upperBound;
            l.x -= m;
            l.y -= m;
            l.z -= m;
            u.x += m;
            u.y += m;
            u.z += m;
        }
    }
    var tmp$1 = new Vec3();
    var transformIntoFrame_corners = [
        new Vec3(),
        new Vec3(),
        new Vec3(),
        new Vec3(),
        new Vec3(),
        new Vec3(),
        new Vec3(),
        new Vec3()
    ];

    // 优化的时候避免对象重用导致被多个其他对象的修改
    // 由于 ContactEquation 会重用，且为了保证api的封装性，碰撞信息不保留ContactEquation
    class ContactInfo {
        constructor() {
            this.hitpos = new Vec3(); // 自己的碰撞点
            this.hitnorm = new Vec3(); // 对方的法线
            this.myshape = null; // 自己的shape
            this.othershape = null; // 对方的shape
        }
    }
    var hitpos = new Vec3();
    var hitnorm = new Vec3();
    /**
     * 每个body保留一份所有的碰撞信息。不能按照碰撞对保存，因为可能a-b, b-a,c
     */
    class ContactInfoMgr {
        constructor() {
            this.added = [];
            this.addlen = 0;
            this.removed = []; // 一开始记录上次碰撞的，每发现一个碰撞就从这里删掉所有的相关的，最后剩下的就是表示exit的
            this.removedLen = 0;
            this.allc = []; // 当前所有接触的
            this.allcLen = 0;
        }
        newTick() {
            // 交换一下all和remove
            let tmp = this.removed;
            this.removed = this.allc;
            this.removedLen = this.allcLen; // 上次的所有的碰撞信息
            this.allc = tmp;
            this.allcLen = 0;
            // 新增清零
            this.addlen = 0;
            //console.log('newtick lastnum=',this.removedLen);
        }
        /**
         * 通知与b发生碰撞了， 这个函数维护remove列表，
         * 如果与b碰撞了，必须把上次记录的所有的与b相关的碰撞信息都从removed列表中移除
         * @param b
         */
        hitBody(b) {
            let sz = this.removedLen;
            let rm = this.removed;
            let find = false;
            for (let i = 0; i < sz; i++) {
                let v = this.removed[i];
                if (v.body == b) {
                    // 由于重用的问题，不能直接覆盖，需要交换，覆盖会导致两个元素其实指向同一个对象
                    let tmp = rm[i];
                    rm[i] = rm[this.removedLen - 1];
                    rm[this.removedLen - 1] = tmp;
                    this.removedLen--;
                    sz--;
                    i--;
                    find = true;
                }
            }
            //console.log('hitbody remove removedlen=',this.removedLen);
            return find;
        }
        /**
         * 触发器碰撞事件
         * @param other
         * @param si
         * @param sj
         */
        addTriggerContact(other, si, sj) {
            this._addC(other, null, null, si, sj);
        }
        /**
         * 普通接触的碰撞事件
         * @param me
         * @param c
         */
        addContact(me, c) {
            let other;
            if (c.bi == me) {
                //me=i
                other = c.bj;
                me.position.vadd(c.ri, hitpos);
                c.ni.negate(hitnorm); //hitnorm = -c.ni
            }
            else {
                other = c.bi;
                me.position.vadd(c.rj, hitpos);
                hitnorm.copy(c.ni); //hitnorm = c.ni
            }
            this._addC(other, hitpos, hitnorm, null, null);
            /*
            // 添加全部碰撞信息
            let addall:ContactInfo;
            if(this.allcLen>=this.allc.length){
                addall = new ContactInfo();
                this.allc.push(addall);
            }else{
                addall = this.allc[this.allcLen];
            }
            addall.body=other;
            addall.hitpos.copy(hitpos);
            addall.hitnorm.copy(hitnorm);
            this.allcLen++;

            //现在还有，所以需要从remove中删除
            let lastC = this.hitBody(other);	// 删除对方
            if(!lastC){
                // 上次没有，所以是新增加的
                let add:ContactInfo;
                if(this.addlen>=this.added.length){
                    add = new ContactInfo();
                    this.added.push(add);
                }else{
                    add = this.added[this.addlen];
                }
                add.body = other;
                add.hitpos.copy(hitpos);
                add.hitnorm.copy(hitnorm);
                this.addlen++;
            }
            */
        }
        _addC(other, hitpos, hitnorm, shapei, shapej) {
            // 添加全部碰撞信息
            let addall;
            if (this.allcLen >= this.allc.length) {
                addall = new ContactInfo();
                this.allc.push(addall);
            }
            else {
                addall = this.allc[this.allcLen];
            }
            addall.body = other;
            hitpos && addall.hitpos.copy(hitpos);
            hitnorm && addall.hitnorm.copy(hitnorm);
            if (shapei)
                addall.myshape = shapei;
            if (shapej)
                addall.othershape = shapej;
            this.allcLen++;
            //如果发生碰撞了，看是否需要从remove中删除
            let lastC = this.hitBody(other);
            if (!lastC) {
                // 上次没有，所以是新增加的
                let add;
                if (this.addlen >= this.added.length) {
                    add = new ContactInfo();
                    this.added.push(add);
                }
                else {
                    add = this.added[this.addlen];
                }
                add.body = other;
                hitpos && add.hitpos.copy(hitpos);
                hitnorm && add.hitnorm.copy(hitnorm);
                if (shapei)
                    add.myshape = shapei;
                if (shapej)
                    add.othershape = shapej;
                this.addlen++;
            }
        }
    }

    class HitPointInfo {
        constructor() {
            this.posi = new Vec3();
            this.posj = new Vec3();
            this.normal = new Vec3();
        }
    }
    //为了重用提高效率
    class HitPointInfoArray {
        constructor() {
            this.data = [];
            this._length = 0;
        }
        getnew() {
            if (this.data.length > this._length) {
                return this.data[this._length++];
            }
            let n = new HitPointInfo();
            this.data.push(n);
            this._length++;
            return n;
        }
        set length(n) {
            this._length = n;
        }
        get length() {
            return this._length;
        }
        reserve(n) {
            if (n > this.data.length) {
                for (let i = this.data.length; i < n; i++) {
                    this.data.push(new HitPointInfo());
                }
            }
            else {
                this.data.length = n;
                if (this._length > n)
                    this._length = n;
            }
        }
    }
    /**
     * Base class for shapes
     */
    class Shape {
        constructor(options) {
            this.id = Shape.idCounter++;
            this.type = 0;
            /**
             * The local bounding sphere radius of this shape.
             */
            this.boundSphR = 0;
            //aabb:BoundBox
            /**
             * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
             */
            this.collisionResponse = true;
            this.collisionFilterGroup = 1;
            this.collisionFilterMask = -1;
            this.material = null;
            this.hasPreNarrowPhase = false; // 是否要执行 onPreNarrowpase
            this.minkowski = null;
            this.margin = 0.04; // 缺省的margin，如果形状过小或者有其他特殊特点，可以在子类里面设置
            this.enable = true;
            if (options) {
                this.type = options.type || 0;
                this.collisionResponse = options.collisionResponse ? options.collisionResponse : true;
                this.collisionFilterGroup = options.collisionFilterGroup !== undefined ? options.collisionFilterGroup : 1;
                this.collisionFilterMask = options.collisionFilterMask !== undefined ? options.collisionFilterMask : -1;
                this.material = options.material ? options.material : null;
            }
        }
        /**
         * Computes the bounding sphere radius. The result is stored in the property .boundingSphereRadius
         */
        updateBndSphR() { }
        ;
        calculateWorldAABB(pos, quat, min, max) { }
        ;
        /**
         * Get the volume of this shape
         */
        volume() { return 0; }
        ;
        /**
         * Calculates the inertia in the local frame for this shape.
         * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        calculateLocalInertia(mass, target) { }
        ;
        onPreNarrowpase(stepId, pos, quat) { }
        ;
        setScale(x, y, z, recalcMassProp = false) { }
    }
    Shape.idCounter = 0;

    class hitInfo {
        constructor(point, normal, depth) {
            this.point = point;
            this.normal = normal;
            this.depth = depth;
        }
    }
    class ConvexPolyhedron extends Shape {
        /**
         *
         * @param points
         * @param faces 二维数组。每个面由那几个顶点组成
         * @param uniqueAxes
         */
        constructor(points, faces, uniqueAxes) {
            super();
            /**
             * Array of Vec3
             */
            this.vertices = [];
            this.worldVertices = []; // World transformed version of .vertices
            this.worldVerticesNeedsUpdate = true;
            /**
             * Array of integer arrays, indicating which vertices each face consists of
             */
            this.faces = [];
            /**
             * Array of Vec3
             */
            this.faceNormals = [];
            this.worldFaceNormalsNeedsUpdate = true;
            this.worldFaceNormals = []; // World transformed version of .faceNormals
            /**
             * Array of Vec3
             */
            this.uniqueEdges = [];
            /**
             * If given, these locally defined, normalized axes are the only ones being checked when doing separating axis check.
             */
            this.uniqueAxes = null;
            this.type = 16 /* CONVEXPOLYHEDRON */;
            this.vertices = points || [];
            this.faces = faces || [];
            this.computeNormals();
            this.uniqueAxes = uniqueAxes ? uniqueAxes.slice() : null;
            this.computeEdges();
            this.updateBndSphR();
        }
        /**
         * Computes uniqueEdges
         */
        computeEdges() {
            const faces = this.faces;
            const vertices = this.vertices;
            //const nv = vertices.length;
            const edges = this.uniqueEdges;
            edges.length = 0;
            const edge = computeEdges_tmpEdge;
            for (let i = 0; i !== faces.length; i++) {
                const face = faces[i];
                const numVertices = face.length;
                for (let j = 0; j !== numVertices; j++) {
                    const k = (j + 1) % numVertices;
                    vertices[face[j]].vsub(vertices[face[k]], edge);
                    edge.normalize();
                    let found = false;
                    for (let p = 0; p !== edges.length; p++) {
                        if (edges[p].almostEquals(edge) || edges[p].almostEquals(edge)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        edges.push(edge.clone());
                    }
                }
            }
        }
        /**
         * Compute the normals of the faces. Will reuse existing Vec3 objects in the .faceNormals array if they exist.
         */
        computeNormals() {
            this.faceNormals.length = this.faces.length;
            // Generate normals
            for (let i = 0; i < this.faces.length; i++) {
                // Check so all vertices exists for this face
                /*
                for (var j = 0; j < this.faces[i].length; j++) {
                    if (!this.vertices[this.faces[i][j]]) {
                        throw new Error(`Vertex ${this.faces[i][j]} not found!`);
                    }
                }
                */
                const n = this.faceNormals[i] || new Vec3();
                this.getFaceNormal(i, n);
                n.negate(n); //TODO 为什么要CCW然后这里取反了，直接规定CW不就行了
                this.faceNormals[i] = n;
                const vertex = this.vertices[this.faces[i][0]];
                if (n.dot(vertex) < 0) {
                    console.error(`faceNormals[${i}] = Vec3(${n}) looks like it points into the shape? 
                    The vertices follow. 
                    Make sure they are ordered CCW around the normal, using the right hand rule.`);
                    for (var j = 0; j < this.faces[i].length; j++) {
                        console.warn(`.vertices[${this.faces[i][j]}] = Vec3(${this.vertices[this.faces[i][j]].toString()})`);
                    }
                }
            }
        }
        /**
         * Compute the normal of a face from its vertices
         */
        getFaceNormal(i, target) {
            const f = this.faces[i];
            const va = this.vertices[f[0]];
            const vb = this.vertices[f[1]];
            const vc = this.vertices[f[2]];
            return ConvexPolyhedron.computeNormal(va, vb, vc, target);
        }
        /**
         * @method clipAgainstHull
         * @param {Vec3} posA
         * @param {Quaternion} quatA
         * @param {ConvexPolyhedron} hullB
         * @param {Vec3} posB
         * @param {Quaternion} quatB
         * @param {Vec3} separatingNormal
         * @param {Number} minDist Clamp distance
         * @param {Number} maxDist
         * @param {array} result The an array of contact point objects, see clipFaceAgainstHull
         * @see http://bullet.googlecode.com/svn/trunk/src/BulletCollision/NarrowPhaseCollision/btPolyhedralContactClipping.cpp
         */
        clipAgainstHull(posA, quatA, hullB, //{ faces, faceNormals, vertices },
        posB, quatB, separatingNormal, minDist, maxDist, result) {
            const WorldNormal = cah_WorldNormal;
            //const hullA = this;
            //const curMaxDist = maxDist;
            let closestFaceB = -1;
            let dmax = -Number.MAX_VALUE;
            for (let face = 0; face < hullB.faces.length; face++) {
                WorldNormal.copy(hullB.faceNormals[face]);
                quatB.vmult(WorldNormal, WorldNormal);
                //posB.vadd(WorldNormal,WorldNormal);
                const d = WorldNormal.dot(separatingNormal);
                if (d > dmax) {
                    dmax = d;
                    closestFaceB = face;
                }
            }
            const worldVertsB1 = [];
            const polyB = hullB.faces[closestFaceB];
            const numVertices = polyB.length;
            for (let e0 = 0; e0 < numVertices; e0++) {
                const b = hullB.vertices[polyB[e0]];
                const worldb = new Vec3();
                worldb.copy(b);
                quatB.vmult(worldb, worldb);
                posB.vadd(worldb, worldb);
                worldVertsB1.push(worldb);
            }
            if (closestFaceB >= 0) {
                this.clipFaceAgainstHull(separatingNormal, posA, quatA, worldVertsB1, minDist, maxDist, result);
            }
        }
        /**
         * Find the separating axis between this hull and another
         * 查找两个hull的分离轴
         * @param  hullB
         * @param  posA
         * @param  quatA
         * @param  posB
         * @param  quatB
         * @param  target The target vector to save the axis in 。 如果发生了碰撞，这个深度最浅的分离轴
         * @return Returns false if a separation is found, else true
         */
        findSeparatingAxis(hullB, posA, quatA, posB, quatB, target, faceListA, faceListB) {
            const faceANormalWS3 = fsa_faceANormalWS3;
            const Worldnormal1 = fsa_Worldnormal1;
            const deltaC = fsa_deltaC;
            const worldEdge0 = fsa_worldEdge0;
            const worldEdge1 = fsa_worldEdge1;
            const Cross = fsa_Cross;
            let dmin = Number.MAX_VALUE;
            const hullA = this;
            //let curPlaneTests = 0;
            if (!hullA.uniqueAxes) {
                const numFacesA = faceListA ? faceListA.length : hullA.faces.length;
                // Test face normals from hullA
                for (var i = 0; i < numFacesA; i++) {
                    var fi = faceListA ? faceListA[i] : i; // face i
                    // Get world face normal
                    faceANormalWS3.copy(hullA.faceNormals[fi]);
                    quatA.vmult(faceANormalWS3, faceANormalWS3); // 转到世界空间
                    var d = hullA.testSepAxis(faceANormalWS3, hullB, posA, quatA, posB, quatB);
                    if (d < -1) {
                        return false; // 找到一个分离轴了，立即返回。
                    }
                    if (d < dmin) {
                        dmin = d;
                        target.copy(faceANormalWS3);
                    }
                }
            }
            else {
                // Test unique axes
                for (var i = 0; i !== hullA.uniqueAxes.length; i++) {
                    // Get world axis
                    quatA.vmult(hullA.uniqueAxes[i], faceANormalWS3);
                    var d = hullA.testSepAxis(faceANormalWS3, hullB, posA, quatA, posB, quatB);
                    if (d < -1) {
                        return false;
                    }
                    if (d < dmin) {
                        dmin = d;
                        target.copy(faceANormalWS3);
                    }
                }
            }
            if (!hullB.uniqueAxes) {
                // Test face normals from hullB
                const numFacesB = faceListB ? faceListB.length : hullB.faces.length;
                for (var i = 0; i < numFacesB; i++) {
                    var fi = faceListB ? faceListB[i] : i;
                    Worldnormal1.copy(hullB.faceNormals[fi]);
                    quatB.vmult(Worldnormal1, Worldnormal1);
                    //curPlaneTests++;
                    var d = hullA.testSepAxis(Worldnormal1, hullB, posA, quatA, posB, quatB);
                    if (d < -1) {
                        return false;
                    }
                    if (d < dmin) {
                        dmin = d;
                        target.copy(Worldnormal1);
                    }
                }
            }
            else {
                // Test unique axes in B
                for (var i = 0; i !== hullB.uniqueAxes.length; i++) {
                    quatB.vmult(hullB.uniqueAxes[i], Worldnormal1);
                    //curPlaneTests++;
                    var d = hullA.testSepAxis(Worldnormal1, hullB, posA, quatA, posB, quatB);
                    if (d < -1) {
                        return false;
                    }
                    if (d < dmin) {
                        dmin = d;
                        target.copy(Worldnormal1);
                    }
                }
            }
            // Test edges 再检查两两边cross后的向量作为分离轴
            for (let e0 = 0; e0 !== hullA.uniqueEdges.length; e0++) {
                // Get world edge
                quatA.vmult(hullA.uniqueEdges[e0], worldEdge0);
                for (let e1 = 0; e1 !== hullB.uniqueEdges.length; e1++) {
                    // Get world edge 2
                    quatB.vmult(hullB.uniqueEdges[e1], worldEdge1);
                    worldEdge0.cross(worldEdge1, Cross);
                    if (!Cross.almostZero()) {
                        Cross.normalize();
                        const dist = hullA.testSepAxis(Cross, hullB, posA, quatA, posB, quatB);
                        if (dist < -1) {
                            return false;
                        }
                        if (dist < dmin) {
                            dmin = dist;
                            target.copy(Cross);
                        }
                    }
                }
            }
            // 没有找到，一定相交。分离轴要从B指向A
            posB.vsub(posA, deltaC);
            if ((deltaC.dot(target)) > 0.0) {
                target.negate(target);
            }
            return true;
        }
        /**
         * Test separating axis against two hulls. Both hulls are projected onto the axis and the overlap size is returned if there is one.
         * 用axis来投影两个hull，看是否发生重叠
         * @parame axis 世界空间的向量
         * @return  The overlap depth, or -10 if no penetration.
         */
        testSepAxis(axis, hullB, posA, quatA, posB, quatB) {
            const hullA = this;
            ConvexPolyhedron.project(hullA, axis, posA, quatA, maxminA);
            ConvexPolyhedron.project(hullB, axis, posB, quatB, maxminB);
            const maxA = maxminA[0];
            const minA = maxminA[1];
            const maxB = maxminB[0];
            const minB = maxminB[1];
            if (maxA < minB || maxB < minA) {
                return -10; // Separated
            }
            const d0 = maxA - minB;
            const d1 = maxB - minA;
            // 两个中取小的那个才是碰撞的距离
            const depth = d0 < d1 ? d0 : d1;
            return depth;
        }
        /**
         * @method calculateLocalInertia
         * @param   mass
         * @param   target
         */
        calculateLocalInertia(mass, target) {
            // Approximate with box inertia
            // Exact inertia calculation is overkill, but see http://geometrictools.com/Documentation/PolyhedralMassProperties.pdf for the correct way to do it
            this.computeLocalAABB(cli_aabbmin, cli_aabbmax);
            const x = cli_aabbmax.x - cli_aabbmin.x;
            const y = cli_aabbmax.y - cli_aabbmin.y;
            const z = cli_aabbmax.z - cli_aabbmin.z;
            target.x = 1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * z * 2 * z);
            target.y = 1.0 / 12.0 * mass * (2 * x * 2 * x + 2 * z * 2 * z);
            target.z = 1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * x * 2 * x);
        }
        /**
         * @method getPlaneConstantOfFace
         * @param   face_i Index of the face
         */
        getPlaneConstantOfFace(face_i) {
            const f = this.faces[face_i];
            const n = this.faceNormals[face_i];
            const v = this.vertices[f[0]];
            const c = -n.dot(v);
            return c;
        }
        /**
         * Clip a face against a hull.
         * @param  separatingNormal
         * @param  posA
         * @param  quatA
         * @param  worldVertsB1 An array of Vec3 with vertices in the world frame.
         * @param  minDist Distance clamping
         * @param  maxDist
         * @param Array result Array to store resulting contact points in. Will be objects with properties: point, depth, normal. These are represented in world coordinates.
         */
        clipFaceAgainstHull(separatingNormal, posA, quatA, worldVertsB1, minDist, maxDist, result) {
            const faceANormalWS = cfah_faceANormalWS;
            const edge0 = cfah_edge0;
            const WorldEdge0 = cfah_WorldEdge0;
            const worldPlaneAnormal1 = cfah_worldPlaneAnormal1;
            const planeNormalWS1 = cfah_planeNormalWS1;
            const worldA1 = cfah_worldA1;
            const localPlaneNormal = cfah_localPlaneNormal;
            const planeNormalWS = cfah_planeNormalWS;
            const hullA = this;
            const worldVertsB2 = [];
            const pVtxIn = worldVertsB1;
            const pVtxOut = worldVertsB2;
            // Find the face with normal closest to the separating axis
            let closestFaceA = -1;
            let dmin = Number.MAX_VALUE;
            for (let face = 0; face < hullA.faces.length; face++) {
                faceANormalWS.copy(hullA.faceNormals[face]);
                quatA.vmult(faceANormalWS, faceANormalWS);
                //posA.vadd(faceANormalWS,faceANormalWS);
                const d = faceANormalWS.dot(separatingNormal);
                if (d < dmin) {
                    dmin = d;
                    closestFaceA = face;
                }
            }
            if (closestFaceA < 0) {
                // console.log("--- did not find any closest face... ---");
                return;
            }
            //console.log("closest A: ",closestFaceA);
            // Get the face and construct connected faces
            const polyA = hullA.faces[closestFaceA];
            polyA.connectedFaces = [];
            for (var i = 0; i < hullA.faces.length; i++) {
                for (let j = 0; j < hullA.faces[i].length; j++) {
                    if (polyA.includes(hullA.faces[i][j]) && i !== closestFaceA /* Not the one we are looking for connections from */ && !polyA.connectedFaces.includes(i) /* Not already added */) {
                        polyA.connectedFaces.push(i);
                    }
                }
            }
            // Clip the polygon to the back of the planes of all faces of hull A, that are adjacent to the witness face
            //const numContacts = pVtxIn.length;
            const numVerticesA = polyA.length;
            //const res = [];
            for (let e0 = 0; e0 < numVerticesA; e0++) {
                const a = hullA.vertices[polyA[e0]];
                const b = hullA.vertices[polyA[(e0 + 1) % numVerticesA]];
                a.vsub(b, edge0);
                WorldEdge0.copy(edge0);
                quatA.vmult(WorldEdge0, WorldEdge0);
                posA.vadd(WorldEdge0, WorldEdge0);
                worldPlaneAnormal1.copy(this.faceNormals[closestFaceA]); //transA.getBasis()* btVector3(polyA.m_plane[0],polyA.m_plane[1],polyA.m_plane[2]);
                quatA.vmult(worldPlaneAnormal1, worldPlaneAnormal1);
                posA.vadd(worldPlaneAnormal1, worldPlaneAnormal1);
                WorldEdge0.cross(worldPlaneAnormal1, planeNormalWS1);
                planeNormalWS1.negate(planeNormalWS1);
                worldA1.copy(a);
                quatA.vmult(worldA1, worldA1);
                posA.vadd(worldA1, worldA1);
                const planeEqWS1 = -worldA1.dot(planeNormalWS1);
                var planeEqWS;
                if (true) {
                    const otherFace = polyA.connectedFaces[e0];
                    localPlaneNormal.copy(this.faceNormals[otherFace]);
                    var localPlaneEq = this.getPlaneConstantOfFace(otherFace);
                    planeNormalWS.copy(localPlaneNormal);
                    quatA.vmult(planeNormalWS, planeNormalWS);
                    //posA.vadd(planeNormalWS,planeNormalWS);
                    planeEqWS = localPlaneEq - planeNormalWS.dot(posA);
                }
                else {
                    planeNormalWS.copy(planeNormalWS1);
                    planeEqWS = planeEqWS1;
                }
                // Clip face against our constructed plane
                this.clipFaceAgainstPlane(pVtxIn, pVtxOut, planeNormalWS, planeEqWS);
                // Throw away all clipped points, but save the reamining until next clip
                while (pVtxIn.length) {
                    pVtxIn.shift();
                }
                while (pVtxOut.length) {
                    pVtxIn.push(pVtxOut.shift());
                }
            }
            //console.log("Resulting points after clip:",pVtxIn);
            // only keep contact points that are behind the witness face
            localPlaneNormal.copy(this.faceNormals[closestFaceA]);
            var localPlaneEq = this.getPlaneConstantOfFace(closestFaceA);
            planeNormalWS.copy(localPlaneNormal);
            quatA.vmult(planeNormalWS, planeNormalWS);
            planeEqWS = localPlaneEq - planeNormalWS.dot(posA);
            for (var i = 0; i < pVtxIn.length; i++) {
                let depth = planeNormalWS.dot(pVtxIn[i]) + planeEqWS; //???
                /*console.log("depth calc from normal=",planeNormalWS.toString()," and constant "+planeEqWS+" and vertex ",pVtxIn[i].toString()," gives "+depth);*/
                if (depth <= minDist) {
                    console.log(`clamped: depth=${depth} to minDist=${minDist}`);
                    depth = minDist;
                }
                if (depth <= maxDist) {
                    const point = pVtxIn[i];
                    if (depth <= 0) {
                        /*console.log("Got contact point ",point.toString(),
                          ", depth=",depth,
                          "contact normal=",separatingNormal.toString(),
                          "plane",planeNormalWS.toString(),
                          "planeConstant",planeEqWS);*/
                        result.push(new hitInfo(point, planeNormalWS, depth));
                    }
                }
            }
        }
        /**
         * Clip a face in a hull against the back of a plane.
         * @method clipFaceAgainstPlane
         * @param {Array} inVertices
         * @param {Array} outVertices
         * @param {Vec3} planeNormal
         * @param {Number} planeConstant The constant in the mathematical plane equation
         */
        clipFaceAgainstPlane(inVertices, outVertices, planeNormal, planeConstant) {
            let n_dot_first;
            let n_dot_last;
            const numVerts = inVertices.length;
            if (numVerts < 2) {
                return outVertices;
            }
            let firstVertex = inVertices[inVertices.length - 1];
            let lastVertex = inVertices[0];
            n_dot_first = planeNormal.dot(firstVertex) + planeConstant;
            for (let vi = 0; vi < numVerts; vi++) {
                lastVertex = inVertices[vi];
                n_dot_last = planeNormal.dot(lastVertex) + planeConstant;
                if (n_dot_first < 0) {
                    if (n_dot_last < 0) {
                        // Start < 0, end < 0, so output lastVertex
                        var newv = new Vec3();
                        newv.copy(lastVertex);
                        outVertices.push(newv);
                    }
                    else {
                        // Start < 0, end >= 0, so output intersection
                        var newv = new Vec3();
                        firstVertex.lerp(lastVertex, n_dot_first / (n_dot_first - n_dot_last), newv);
                        outVertices.push(newv);
                    }
                }
                else {
                    if (n_dot_last < 0) {
                        // Start >= 0, end < 0 so output intersection and end
                        var newv = new Vec3();
                        firstVertex.lerp(lastVertex, n_dot_first / (n_dot_first - n_dot_last), newv);
                        outVertices.push(newv);
                        outVertices.push(lastVertex);
                    }
                }
                firstVertex = lastVertex;
                n_dot_first = n_dot_last;
            }
            return outVertices;
        }
        // Updates .worldVertices and sets .worldVerticesNeedsUpdate to false.
        computeWorldVertices(position, quat) {
            const N = this.vertices.length;
            while (this.worldVertices.length < N) {
                this.worldVertices.push(new Vec3());
            }
            const verts = this.vertices;
            const worldVerts = this.worldVertices;
            for (let i = 0; i !== N; i++) {
                quat.vmult(verts[i], worldVerts[i]);
                position.vadd(worldVerts[i], worldVerts[i]);
            }
            this.worldVerticesNeedsUpdate = false;
        }
        computeLocalAABB(aabbmin, aabbmax) {
            const n = this.vertices.length;
            const vertices = this.vertices;
            //const worldVert = computeLocalAABB_worldVert;
            aabbmin.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            aabbmax.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
            for (let i = 0; i < n; i++) {
                const v = vertices[i];
                if (v.x < aabbmin.x) {
                    aabbmin.x = v.x;
                }
                else if (v.x > aabbmax.x) {
                    aabbmax.x = v.x;
                }
                if (v.y < aabbmin.y) {
                    aabbmin.y = v.y;
                }
                else if (v.y > aabbmax.y) {
                    aabbmax.y = v.y;
                }
                if (v.z < aabbmin.z) {
                    aabbmin.z = v.z;
                }
                else if (v.z > aabbmax.z) {
                    aabbmax.z = v.z;
                }
            }
        }
        /**
         * Updates .worldVertices and sets .worldVerticesNeedsUpdate to false.
         */
        computeWorldFaceNormals(quat) {
            const N = this.faceNormals.length;
            while (this.worldFaceNormals.length < N) {
                this.worldFaceNormals.push(new Vec3());
            }
            const normals = this.faceNormals;
            const worldNormals = this.worldFaceNormals;
            for (let i = 0; i !== N; i++) {
                quat.vmult(normals[i], worldNormals[i]);
            }
            this.worldFaceNormalsNeedsUpdate = false;
        }
        /**
         * @method updateBndSphR
         */
        updateBndSphR() {
            // Assume points are distributed with local (0,0,0) as center
            let max2 = 0;
            const verts = this.vertices;
            for (let i = 0, N = verts.length; i !== N; i++) {
                const norm2 = verts[i].lengthSquared();
                if (norm2 > max2) {
                    max2 = norm2;
                }
            }
            this.boundSphR = Math.sqrt(max2);
        }
        calculateWorldAABB(pos, quat, min, max) {
            const n = this.vertices.length;
            const verts = this.vertices;
            let minx = 1e6;
            let miny = 1e6;
            let minz = 1e6;
            let maxx = -1e6;
            let maxy = -1e6;
            let maxz = -1e6;
            for (let i = 0; i < n; i++) {
                tempWorldVertex.copy(verts[i]);
                quat.vmult(tempWorldVertex, tempWorldVertex);
                pos.vadd(tempWorldVertex, tempWorldVertex);
                const v = tempWorldVertex;
                if (v.x < minx) {
                    minx = v.x;
                }
                else if (v.x > maxx) {
                    maxx = v.x;
                }
                if (v.y < miny) {
                    miny = v.y;
                }
                else if (v.y > maxy) {
                    maxy = v.y;
                }
                if (v.z < minz) {
                    minz = v.z;
                }
                else if (v.z > maxz) {
                    maxz = v.z;
                }
            }
            min.set(minx, miny, minz);
            max.set(maxx, maxy, maxz);
        }
        /**
         * Get approximate convex volume
         * @method volume
         * @return {Number}
         */
        volume() {
            return 4.0 * Math.PI * this.boundSphR / 3.0;
        }
        /**
         * Get an average of all the vertices positions
         */
        getAveragePointLocal(target = new Vec3()) {
            const verts = this.vertices;
            const n = verts.length;
            for (let i = 0; i < n; i++) {
                target.vadd(verts[i], target);
            }
            target.x /= n;
            target.y /= n;
            target.z /= n;
            return target;
        }
        /**
         * Transform all local points. Will change the .vertices
         */
        transformAllPoints(offset, quat) {
            const n = this.vertices.length;
            const verts = this.vertices;
            // Apply rotation
            if (quat) {
                // Rotate vertices
                for (var i = 0; i < n; i++) {
                    var v = verts[i];
                    quat.vmult(v, v);
                }
                // Rotate face normals
                for (var i = 0; i < this.faceNormals.length; i++) {
                    var v = this.faceNormals[i];
                    quat.vmult(v, v);
                }
                /*
                // Rotate edges
                for(var i=0; i<this.uniqueEdges.length; i++){
                    var v = this.uniqueEdges[i];
                    quat.vmult(v,v);
                }*/
            }
            // Apply offset
            if (offset) {
                for (var i = 0; i < n; i++) {
                    var v = verts[i];
                    v.vadd(offset, v);
                }
            }
        }
        /**
         * Checks whether p is inside the polyhedra. Must be in local coords. The point lies outside of the convex hull of the other points
         *  if and only if the direction of all the vectors from it to those other points are on less than one half of a sphere around it.
         * @param   p      A point given in local coordinates
         * @return
         */
        pointIsInside(p) {
            //var n = this.vertices.length;
            const verts = this.vertices;
            const faces = this.faces;
            const normals = this.faceNormals;
            const positiveResult = null;
            const N = this.faces.length;
            const pointInside = ConvexPolyhedron_pointIsInside;
            this.getAveragePointLocal(pointInside); // 平均点一定在内部
            for (let i = 0; i < N; i++) {
                var n = normals[i];
                const v = verts[faces[i][0]]; // We only need one point in the face
                // This dot product determines which side of the edge the point is
                const vToP = ConvexPolyhedron_vToP;
                p.vsub(v, vToP); // vToP = p-v
                const r1 = n.dot(vToP);
                const vToPointInside = ConvexPolyhedron_vToPointInside;
                pointInside.vsub(v, vToPointInside);
                const r2 = n.dot(vToPointInside);
                if ((r1 < 0 && r2 > 0) || (r1 > 0 && r2 < 0)) {
                    return false; // Encountered some other sign. Exit.
                }
                else {
                }
            }
            // If we got here, all dot products were of the same sign.
            return positiveResult ? 1 : -1;
        }
        /**
         * Get face normal given 3 vertices
         */
        static computeNormal(va, vb, vc, target) {
            vb.vsub(va, ab);
            vc.vsub(vb, cb);
            cb.cross(ab, target);
            if (!target.isZero()) {
                target.normalize();
            }
        }
        /**
         * Get max and min dot product of a convex hull at position (pos,quat) projected onto an axis. Results are saved in the array maxmin.
         * @param {ConvexPolyhedron} hull
         * @param  axis 投射轴，世界空间
         * @param  pos  hull的位置
         * @param  quat hull的朝向
         * @param  result result[0] and result[1] will be set to maximum and minimum, respectively.
         */
        static project(hull, axis, pos, quat, result) {
            const n = hull.vertices.length;
            //const worldVertex = project_worldVertex;
            const localAxis = project_localAxis;
            let max = 0;
            let min = 0;
            const localOrigin = project_localOrigin;
            const vs = hull.vertices;
            localOrigin.setZero();
            // Transform the axis to local
            // 把axis转换到本地空间
            Transform.vectorToLocalFrame(pos, quat, axis, localAxis);
            Transform.pointToLocalFrame(pos, quat, localOrigin, localOrigin);
            const add = localOrigin.dot(localAxis);
            min = max = vs[0].dot(localAxis);
            for (let i = 1; i < n; i++) {
                const val = vs[i].dot(localAxis);
                if (val > max) {
                    max = val;
                }
                if (val < min) {
                    min = val;
                }
            }
            min -= add;
            max -= add;
            if (min > max) {
                // Inconsistent - swap
                const temp = min;
                min = max;
                max = temp;
            }
            // Output
            result[0] = max;
            result[1] = min;
        }
        onPreNarrowpase(stepId, pos, quat) { }
    }
    var computeEdges_tmpEdge = new Vec3();
    const cb = new Vec3();
    const ab = new Vec3();
    var cah_WorldNormal = new Vec3();
    var fsa_faceANormalWS3 = new Vec3();
    var fsa_Worldnormal1 = new Vec3();
    var fsa_deltaC = new Vec3();
    var fsa_worldEdge0 = new Vec3();
    var fsa_worldEdge1 = new Vec3();
    var fsa_Cross = new Vec3();
    var maxminA = [];
    var maxminB = [];
    var cli_aabbmin = new Vec3();
    var cli_aabbmax = new Vec3();
    var cfah_faceANormalWS = new Vec3();
    var cfah_edge0 = new Vec3();
    var cfah_WorldEdge0 = new Vec3();
    var cfah_worldPlaneAnormal1 = new Vec3();
    var cfah_planeNormalWS1 = new Vec3();
    var cfah_worldA1 = new Vec3();
    var cfah_localPlaneNormal = new Vec3();
    var cfah_planeNormalWS = new Vec3();
    //var computeLocalAABB_worldVert = new Vec3();
    var tempWorldVertex = new Vec3();
    var ConvexPolyhedron_pointIsInside = new Vec3();
    var ConvexPolyhedron_vToP = new Vec3();
    var ConvexPolyhedron_vToPointInside = new Vec3();
    //const project_worldVertex = new Vec3();
    const project_localAxis = new Vec3();
    const project_localOrigin = new Vec3();

    // v可以与target相同
    function quat_AABBExt_mult(q, v, target = new Vec3()) {
        const { x, y, z } = v;
        const qx = q.x;
        const qy = q.y;
        const qz = q.z;
        const qw = q.w;
        let qx2 = qx * qx, qy2 = qy * qy, qz2 = qz * qz, qw2 = qw * qw;
        let xy = 2 * qx * qy, zw = 2 * qz * qw, yw = 2 * qy * qw, xw = 2 * qx * qw, xz = 2 * qx * qz, yz = 2 * qy * qz;
        // q*v
        //const ix = qw * x + qy * z - qz * y;
        //const iy = qw * y + qz * x - qx * z;
        //const iz = qw * z + qx * y - qy * x;
        //const iw = -qx * x - qy * y - qz * z;
        //target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        //target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        //target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        // 其实就相当于把四元数转成矩阵了
        //(qw*x - qz*y + qy*z )*qw + (qx*x + qy*y + qz*z)*qx - (qz*x + qw*y  - qx*z)*qz + (-qy*x + qx*y + qw*z  )*qy
        // Math.abs((qw*qw + qx*qx - qz*qz -qy*qy)*x) +Math.abs(( 2*qx*qy -2*qz*qw)*y) + Math.abs((2*qy*qw + 2*qx*qz )*z);
        target.x = Math.abs((qw2 + qx2 - qz2 - qy2) * x) + Math.abs((xy - zw) * y) + Math.abs((yw + xz) * z);
        //(qw*y + qz*x - qx*z)*qw + (-qx*x - qy*y - qz*z)*-qy + (qw*z + qx*y - qy*x)*-qx + (qw*x + qy*z - qz*y)*qz
        //target.y = Math.abs((2*qz*qw +2*qx*qy)*x) + Math.abs((qw*qw +qy*qy -qx*qx -qz*qz)*y) + Math.abs((-2*qx*qw +2*qy*qz)*z);
        target.y = Math.abs((zw + xy) * x) + Math.abs((qw2 + qy2 - qx2 - qz2) * y) + Math.abs((-xw + yz) * z);
        //(qw * z + qx * y - qy * x) * qw + (qx * x + qy * y + qz * z) * qz + (-qw * x - qy * z + qz * y) * qy + (qw * y + qz * x - qx * z) * qx;
        //target.z = Math.abs((-2*qy*qw   +2*qx*qz)*x) + Math.abs((2*qx*qw  +2*qy*qz ) *y) +  Math.abs((qw2 +qz2 -qy2 -qx2)*z);
        target.z = Math.abs((-yw + xz) * x) + Math.abs((xw + yz) * y) + Math.abs((qw2 + qz2 - qy2 - qx2) * z);
        return target;
    }
    function _ptInBox(pt, min, max) {
        return (pt.x >= min.x && pt.y < max.x &&
            pt.y >= min.y && pt.y < max.y &&
            pt.z >= min.z && pt.z < max.z);
    }
    function _ptInQuad(x, y, minx, miny, maxx, maxy) {
        return (x >= minx && x <= maxx && y >= miny && y <= maxy);
    }
    var _segHitBox = new Array(4);
    /** 射线与box检测的当前的碰撞点的个数。 */
    var _segHitBoxNum = 0;
    /**
     * A 3d box shape.
     */
    class Box extends Shape {
        constructor(halfExtents) {
            super();
            this.origHalfExt = null; // 原始大小。如果有缩放，则这个就会有值
            this.minkowski = this;
            this.type = 4 /* BOX */;
            this.halfExtents = halfExtents;
            this.updateConvexPolyhedronRepresentation();
            this.updateBndSphR();
        }
        getSupportVertex(dir, sup) {
            let sz = this.halfExtents;
            sup.x = dir.x >= 0 ? sz.x : -sz.x;
            sup.y = dir.y >= 0 ? sz.y : -sz.y;
            sup.z = dir.z >= 0 ? sz.z : -sz.z;
            return sup;
        }
        getSupportVertexWithoutMargin(dir, sup) {
            let sz = this.halfExtents;
            let margin = this.margin;
            let lx = sz.x - margin;
            let ly = sz.y - margin;
            let lz = sz.z - margin;
            sup.x = dir.x >= 0 ? lx : -lx;
            sup.y = dir.y >= 0 ? ly : -ly;
            sup.z = dir.z >= 0 ? lz : -lz;
            return sup;
        }
        onPreNarrowpase(stepId, pos, quat) { }
        /**
         * Updates the local convex polyhedron representation used for some collisions.
         */
        updateConvexPolyhedronRepresentation() {
            const sx = this.halfExtents.x;
            const sy = this.halfExtents.y;
            const sz = this.halfExtents.z;
            const V = Vec3;
            const vertices = [
                new V(-sx, -sy, -sz),
                new V(sx, -sy, -sz),
                new V(sx, sy, -sz),
                new V(-sx, sy, -sz),
                new V(-sx, -sy, sz),
                new V(sx, -sy, sz),
                new V(sx, sy, sz),
                new V(-sx, sy, sz)
            ];
            const indices = [
                [3, 2, 1, 0],
                [4, 5, 6, 7],
                [5, 4, 0, 1],
                [2, 3, 7, 6],
                [0, 4, 7, 3],
                [1, 2, 6, 5],
            ];
            /*
            const axes = [
                new V(0, 0, 1),
                new V(0, 1, 0),
                new V(1, 0, 0)
            ];
            */
            const h = new ConvexPolyhedron(vertices, indices);
            this.convexPolyhedronRepresentation = h;
            h.material = this.material;
        }
        calculateLocalInertia(mass, target = new Vec3()) {
            Box.calculateInertia(this.halfExtents, mass, target);
            return target;
        }
        /**
         * Get the box 6 side normals
         * @param       sixTargetVectors An array of 6 vectors, to store the resulting side normals in.
         * @param quat             Orientation to apply to the normal vectors. If not provided, the vectors will be in respect to the local frame.
         */
        getSideNormals(sixTargetVectors, quat) {
            const sides = sixTargetVectors;
            const ex = this.halfExtents;
            sides[0].set(ex.x, 0, 0);
            sides[1].set(0, ex.y, 0);
            sides[2].set(0, 0, ex.z);
            sides[3].set(-ex.x, 0, 0);
            sides[4].set(0, -ex.y, 0);
            sides[5].set(0, 0, -ex.z);
            if (quat !== undefined) {
                for (let i = 0; i !== sides.length; i++) {
                    quat.vmult(sides[i], sides[i]);
                }
            }
            return sides;
        }
        volume() {
            return 8.0 * this.halfExtents.x * this.halfExtents.y * this.halfExtents.z;
        }
        updateBndSphR() {
            this.boundSphR = this.halfExtents.length();
        }
        forEachWorldCorner(pos, quat, callback) {
            const e = this.halfExtents;
            const corners = [[e.x, e.y, e.z],
                [-e.x, e.y, e.z],
                [-e.x, -e.y, e.z],
                [-e.x, -e.y, -e.z],
                [e.x, -e.y, -e.z],
                [e.x, e.y, -e.z],
                [-e.x, e.y, -e.z],
                [e.x, -e.y, e.z]];
            for (let i = 0; i < corners.length; i++) {
                worldCornerTempPos.set(corners[i][0], corners[i][1], corners[i][2]);
                quat.vmult(worldCornerTempPos, worldCornerTempPos);
                pos.vadd(worldCornerTempPos, worldCornerTempPos);
                callback(worldCornerTempPos.x, worldCornerTempPos.y, worldCornerTempPos.z);
            }
        }
        calculateWorldAABB(pos, quat, min, max) {
            const e = this.halfExtents;
            let newext = Box.boxext1;
            quat_AABBExt_mult(quat, e, newext);
            pos.vsub(newext, min);
            pos.vadd(newext, max);
            return;
            /*
            worldCornersTemp[0].set(e.x, e.y, e.z);
            worldCornersTemp[1].set(-e.x, e.y, e.z);
            worldCornersTemp[2].set(-e.x, -e.y, e.z);
            worldCornersTemp[3].set(-e.x, -e.y, -e.z);
            worldCornersTemp[4].set(e.x, -e.y, -e.z);
            worldCornersTemp[5].set(e.x, e.y, -e.z);
            worldCornersTemp[6].set(-e.x, e.y, -e.z);
            worldCornersTemp[7].set(e.x, -e.y, e.z);

            var wc = worldCornersTemp[0];
            quat.vmult(wc, wc);
            pos.vadd(wc, wc);
            max.copy(wc);
            min.copy(wc);
            for (let i = 1; i < 8; i++) {
                var wc = worldCornersTemp[i];
                quat.vmult(wc, wc);
                pos.vadd(wc, wc);
                const x = wc.x;
                const y = wc.y;
                const z = wc.z;
                if (x > max.x) {
                    max.x = x;
                }
                if (y > max.y) {
                    max.y = y;
                }
                if (z > max.z) {
                    max.z = z;
                }

                if (x < min.x) {
                    min.x = x;
                }
                if (y < min.y) {
                    min.y = y;
                }
                if (z < min.z) {
                    min.z = z;
                }
            }
            */
        }
        /**
         * 如果原点不在中心的包围盒的更新
         * @param pos
         * @param quat
         * @param scale
         * @param min 	相对于原点的min
         * @param max 	相对于原点的max
         */
        static calculateWorldAABB1(pos, quat, scale, min, max, outmin, outmax) {
            let ext = Box.boxext1;
            ext.x = (max.x - min.x) / 2;
            ext.y = (max.y - min.y) / 2;
            ext.z = (max.z - min.z) / 2;
            let off = Box.orioff;
            off.x = (max.x + min.x) / 2;
            off.y = (max.y + min.y) / 2;
            off.z = (max.z + min.z) / 2;
            quat.vmult(off, off);
            if (scale)
                off.vmul(scale, off); // 把这个偏移旋转一下  rot(off)*scale
            quat_AABBExt_mult(quat, ext, ext);
            if (scale)
                ext.vmul(scale, ext); // 旋转原点在中心的包围盒	rot(ext)*scale
            pos.vsub(ext, outmin).vadd(off, outmin); // 计算原点在中心的包围盒	(pos+ext)+off
            pos.vadd(ext, outmax).vadd(off, outmax); // (pos-ext)+off
            return;
        }
        //原始的包围盒计算，用来验证算法的
        static calculateWorldAABB11(pos, quat, scale, min, max, outmin, outmax) {
            let conr = new Array(8).fill(new Vec3());
            conr.forEach((v, i, arr) => { conr[i] = new Vec3(); });
            conr[0].set(min.x, min.y, min.z);
            conr[1].set(min.x, max.y, min.z);
            conr[2].set(min.x, max.y, max.z);
            conr[3].set(min.x, min.y, max.z);
            conr[4].set(max.x, min.y, min.z);
            conr[5].set(max.x, max.y, min.z);
            conr[6].set(max.x, max.y, max.z);
            conr[7].set(max.x, min.y, max.z);
            // 第一个点
            var wc = conr[0];
            quat.vmult(wc, wc).vmul(scale, wc);
            pos.vadd(wc, wc);
            outmax.copy(wc);
            outmin.copy(wc);
            // 剩下的7个点
            for (let i = 1; i < 8; i++) {
                var wc = conr[i];
                quat.vmult(wc, wc).vmul(scale, wc);
                pos.vadd(wc, wc);
                const x = wc.x;
                const y = wc.y;
                const z = wc.z;
                if (x > outmax.x) {
                    outmax.x = x;
                }
                if (y > outmax.y) {
                    outmax.y = y;
                }
                if (z > outmax.z) {
                    outmax.z = z;
                }
                if (x < outmin.x) {
                    outmin.x = x;
                }
                if (y < outmin.y) {
                    outmin.y = y;
                }
                if (z < outmin.z) {
                    outmin.z = z;
                }
            }
        }
        setScale(x, y, z, recalcMassProp = false) {
            let orig = this.origHalfExt;
            let ext = this.halfExtents;
            if (x != 1 || y != 1 || z != 1) {
                if (!orig) {
                    this.origHalfExt = orig = new Vec3();
                    orig.copy(ext);
                }
                // 注意处理负的缩放的问题 .TODO 先临时处理负的情况，以后遇到实际问题再说
                ext.set(Math.abs(orig.x * x), Math.abs(orig.y * y), Math.abs(orig.z * z));
            }
            else {
                if (orig) {
                    ext.copy(orig);
                    this.origHalfExt = null;
                }
            }
            this.updateConvexPolyhedronRepresentation();
            this.updateBndSphR();
        }
        static calculateInertia(halfExtents, mass, target) {
            const e = halfExtents;
            target.x = 1.0 / 12.0 * mass * (2 * e.y * 2 * e.y + 2 * e.z * 2 * e.z);
            target.y = 1.0 / 12.0 * mass * (2 * e.x * 2 * e.x + 2 * e.z * 2 * e.z);
            target.z = 1.0 / 12.0 * mass * (2 * e.y * 2 * e.y + 2 * e.x * 2 * e.x);
        }
        /**
         * 球与本地空间的盒子的碰撞信息
         * 这个与sphere.ts中的hitbox有点重复了
         * @param pos 球的位置
         * @param r     球的半径
         * @param hitpos1   球的碰撞点
         * @param hitpos2   盒子的碰撞点
         * @param hitNormal  碰撞法线，推开球的方向
         */
        static sphereHitBox(pos, r, halfext, hitpos, hitpost2, hitNormal) {
            /*
            let dir=0;
            let pdist=[];
            let szx = halfext.x;
            let szy = halfext.y;
            let szz = halfext.z;
            let pxd = pos.x-szx;
            let nxd = szx+szx;
            let pyd = pos.y-szy;
            let nyd = pos.y+szy;
            let pzd = pos.z-szz;
            let nzd = pos.z+szz;
            */
            return -1;
        }
        /**
         *
         * @param myPos
         * @param myQ
         * @param voxel
         * @param voxPos
         * @param voxQuat
         * @param hitpoints  其中的法线是推开voxel的
         * @param justtest
         */
        hitVoxel(myPos, myQ, voxel, voxPos, voxQuat, hitpoints, justtest) {
            /*
            // 把voxel转换到box空间
            let rPos = hitVoxelTmpVec1;
            let rMat = hitVoxelTmpMat;
            Transform.posQToLocalMat(myPos,myQ,voxPos,voxQuat, rPos,rMat);  //TODO 这个还没有验证
            // 先用最笨的方法验证流程
            let voxdt = voxel.voxData.data;
            if(!voxdt)
                return false;
            let gridw = voxel.gridw;//.voxData.gridsz;
            let r = gridw/2;
            let min = voxel.voxData.aabbmin;    //原始包围盒
            //let max = voxel.voxData.aabbmax;
            let tmpV = new Vec3();  //xyz格子坐标
            let hitpos = new Vec3();
            let hitpos1 = new Vec3();
            let hitnorm = new Vec3();
            let boxpos = new Vec3(0,0,0);
            let boxQ = new Quaternion(0,0,0,1);
            let hit = false;
            
            for( let i=0,sz=voxdt.length; i<sz; i++){
                let dt = voxdt[i];
                // 把xyz映射到box空间
                tmpV.set(dt.x+0.5,dt.y+0.5,dt.z+0.5);// 在格子的中心
                min.addScaledVector(gridw,tmpV,tmpV);// tmpV = min + (vox.xyz+0.5)*gridw
                //tmpV现在是在vox空间内的一个点
                //转换到box空间
                rMat.vmult(tmpV,tmpV);
                tmpV.vadd(rPos,tmpV);
                //tmpV现在是box空间的点了，计算碰撞信息
                // 这里的法线是推开sphere的
                let deep = Sphere.hitBox(tmpV, r, this.halfExtents,boxpos,boxQ,hitpos,hitpos1,hitnorm,justtest);
                if(deep<0)
                    continue;
                if(justtest)
                    return true;
                //转换回世界空间
                let hi = new HitPointInfo();
                myQ.vmult(hitpos, hi.posi); myPos.vadd(hi.posi,hi.posi);
                myQ.vmult(hitpos1,hi.posj); myPos.vadd(hi.posj,hi.posj);
                myQ.vmult(hitnorm,hi.normal);
                hitpoints.push(hi);
                hit=true;
            }
            return hit;
            */
            return false;
        }
        hitAAQuad(mypos, myQ, minx, miny, maxx, maxy) {
        }
        /**
         * 收集射线检测的结果，排除重复点，一旦到达两个碰撞点就给newst和newed赋值，并返回true
         * @param t 碰撞点的时间
         * @param x 碰撞点的位置
         * @param y
         * @param z
         * @param newst
         * @param newed
         */
        static _rayHitBoxChkHitInfo(t, x, y, z, newst, newed) {
            // 只要找到两个有效交点就停止
            let hitinfo = _segHitBox;
            if (_segHitBoxNum == 0 && t >= 0 && t <= 1) { //第一个点
                hitinfo[0] = t;
                hitinfo[1] = x;
                hitinfo[2] = y;
                hitinfo[3] = z;
                _segHitBoxNum++;
                return false;
            }
            // 在有效范围内，且与已有的不重合，则是第二个点
            if (t >= 0 && t <= 1 && Math.abs(t - hitinfo[0]) > 1e-6) {
                if (t > hitinfo[0]) { //时间更靠后
                    newst.set(hitinfo[1], hitinfo[2], hitinfo[3]);
                    newed.set(x, y, z);
                }
                else { // 时间更靠前，颠倒st，ed
                    newst.set(x, y, z);
                    newed.set(hitinfo[1], hitinfo[2], hitinfo[3]);
                }
                return true;
            }
            return false;
        }
        /**
         * 计算线段和box的两个交点。如果起点或者终点在内部，则直接使用。
         * 返回false 则无碰撞
         * @param st
         * @param ed
         * @param min
         * @param max
         * @param newSt
         * @param newEd
         */
        static rayHitBox(st, ed, min, max, newSt, newEd) {
            let hitinfo = _segHitBox;
            _segHitBoxNum = 0;
            // 计算与6个面的交点，然后判断每个交点是否在范围内
            if (_ptInBox(st, min, max)) { //起点的判断
                Box._rayHitBoxChkHitInfo(0, st.x, st.y, st.z, newSt, newEd);
            }
            if (_ptInBox(ed, min, max)) { //终点的判断
                if (Box._rayHitBoxChkHitInfo(1, ed.x, ed.y, ed.z, newSt, newEd)) {
                    return true;
                }
            }
            let dirx = ed.x - st.x;
            let diry = ed.y - st.y;
            let dirz = ed.z - st.z;
            let eps = 1e-10;
            let t = 0;
            let hitx = 0;
            let hity = 0;
            let hitz = 0;
            // minx
            // maxx
            if (Math.abs(dirx) > eps) {
                t = (min.x - st.x) / dirx;
                if (t > 0 && t < 1) {
                    hity = st.y + diry * t;
                    hitz = st.z + dirz * t;
                    if (_ptInQuad(hity, hitz, min.y, min.z, max.y, max.z)) {
                        if (Box._rayHitBoxChkHitInfo(t, min.x, hity, hitz, newSt, newEd)) {
                            return true;
                        }
                    }
                }
                t = (max.x - st.x) / dirx;
                if (t > 0 && t < 1) {
                    hity = st.y + diry * t;
                    hitz = st.z + dirz * t;
                    if (_ptInQuad(hity, hitz, min.y, min.z, max.y, max.z)) {
                        if (Box._rayHitBoxChkHitInfo(t, max.x, hity, hitz, newSt, newEd)) {
                            return true;
                        }
                    }
                }
            }
            // miny
            // maxy
            if (Math.abs(diry) > eps) {
                t = (min.y - st.y) / diry;
                if (t > 0 && t < 1) {
                    hitx = st.x + dirx * t;
                    hitz = st.z + dirz * t;
                    if (_ptInQuad(hitx, hitz, min.x, min.z, max.x, max.z)) {
                        if (Box._rayHitBoxChkHitInfo(t, hitx, min.y, hitz, newSt, newEd)) {
                            return true;
                        }
                    }
                }
                t = (max.y - st.y) / diry;
                if (t > 0 && t < 1) {
                    hitx = st.x + dirx * t;
                    hitz = st.z + dirz * t;
                    if (_ptInQuad(hitx, hitz, min.x, min.z, max.x, max.z)) {
                        if (Box._rayHitBoxChkHitInfo(t, hitx, max.y, hitz, newSt, newEd)) {
                            return true;
                        }
                    }
                }
            }
            // minz
            // maxz
            if (Math.abs(dirz) > eps) {
                t = (min.z - st.z) / dirz;
                if (t > 0 && t < 1) {
                    hitx = st.x + dirx * t;
                    hity = st.y + diry * t;
                    if (_ptInQuad(hitx, hity, min.x, min.y, max.x, max.y)) {
                        if (Box._rayHitBoxChkHitInfo(t, hitx, hity, min.z, newSt, newEd)) {
                            return true;
                        }
                    }
                }
                t = (max.z - st.z) / dirz;
                if (t > 0 && t < 1) {
                    hitx = st.x + dirx * t;
                    hity = st.y + diry * t;
                    if (_ptInQuad(hitx, hity, min.x, min.y, max.x, max.y)) {
                        if (Box._rayHitBoxChkHitInfo(t, hitx, hity, max.z, newSt, newEd)) {
                            return true;
                        }
                    }
                }
            }
            // 可能没有碰撞，或者只有一个碰撞点
            if (_segHitBoxNum == 1) {
                newSt.set(hitinfo[1], hitinfo[2], hitinfo[3]);
                newEd.set(newSt.x, newSt.y, newSt.z);
                return true;
            }
            return false;
        }
    }
    /*
    private _rotateExtents(extents:Vector3, rotation:Matrix4x4, out:Vector3):void {
        var extentsX:number = extents.x;
        var extentsY:number = extents.y;
        var extentsZ:number = extents.z;
        var matElements:Float32Array = rotation.elements;
        out.x = Math.abs(matElements[0] * extentsX) + Math.abs(matElements[4] * extentsY) + Math.abs(matElements[8] * extentsZ);
        out.y = Math.abs(matElements[1] * extentsX) + Math.abs(matElements[5] * extentsY) + Math.abs(matElements[9] * extentsZ);
        out.z = Math.abs(matElements[2] * extentsX) + Math.abs(matElements[6] * extentsY) + Math.abs(matElements[10] * extentsZ);
    }
    */
    Box.boxext1 = new Vec3();
    Box.orioff = new Vec3();
    var worldCornerTempPos = new Vec3();
    //const worldCornerTempNeg = new Vec3();
    var hitVoxelTmpVec1 = new Vec3();
    var hitVoxelTmpMat = new Mat3();

    /**
     * Base class for objects that dispatches events.
     * @class EventTarget
     * @constructor
     */
    class EventTarget {
        constructor() {
            this._listeners = null;
        }
        /**
         * Add an event listener
         * @method addEventListener
         * @param  {String} type
         * @param  {Function} listener
         * @return {EventTarget} The self object, for chainability.
         */
        addEventListener(type, listener) {
            if (!this._listeners) {
                this._listeners = {};
            }
            const listeners = this._listeners;
            if (listeners[type] === undefined) {
                listeners[type] = [];
            }
            if (!listeners[type].includes(listener)) {
                listeners[type].push(listener);
            }
            return this;
        }
        /**
         * Check if an event listener is added
         * @method hasEventListener
         * @param  {String} type
         * @param  {Function} listener
         * @return {Boolean}
         */
        hasEventListener(type, listener) {
            if (!this._listeners)
                return false;
            const listeners = this._listeners;
            if (listeners[type] !== undefined && listeners[type].includes(listener)) {
                return true;
            }
            return false;
        }
        /**
         * Check if any event listener of the given type is added
         * @method hasAnyEventListener
         * @param  {String} type
         * @return {Boolean}
         */
        hasAnyEventListener(type) {
            if (!this._listeners) {
                return false;
            }
            const listeners = this._listeners;
            return (listeners[type] !== undefined);
        }
        /**
         * Remove an event listener
         * @method removeEventListener
         * @param  {String} type
         * @param  {Function} listener
         * @return {EventTarget} The self object, for chainability.
         */
        removeEventListener(type, listener) {
            if (!this._listeners) {
                return this;
            }
            const listeners = this._listeners;
            if (listeners[type] === undefined) {
                return this;
            }
            const index = listeners[type].indexOf(listener);
            if (index !== -1) {
                listeners[type].splice(index, 1);
            }
            return this;
        }
        /**
         * Emit an event.
         * @method dispatchEvent
         * @param  {Object} event
         * @param  {String} event.type
         * @return {EventTarget} The self object, for chainability.
         */
        dispatchEvent(event) {
            if (!this._listeners) {
                return this;
            }
            const listeners = this._listeners;
            const listenerArray = listeners[event.type];
            if (listenerArray !== undefined) {
                event.target = this;
                for (let i = 0, l = listenerArray.length; i < l; i++) {
                    listenerArray[i].call(this, event);
                }
            }
            return this;
        }
    }

    /**
     * Base class for all body types.
     * @example
     *     var body = new Body({
     *         mass: 1
     *     });
     *     var shape = new Sphere(1);
     *     body.addShape(shape);
     *     world.addBody(body);
     */
    class Body extends EventTarget {
        constructor(mass = 1, shape = null, pos = null, options) {
            super();
            this.id = Body.idCounter++;
            this.index = 0; //index in world bodies
            this.name = 'noname'; // for debug
            this.enable = true;
            /** 是否允许射线检测。 TODO 用collisionResponse*/
            this.enableRayTest = true;
            this.world = null; // null 表示没有加到world中
            /** 每次resolve计算的v增量 */
            this.vlambda = new Vec3();
            this.collisionFilterGroup = 1;
            this.collisionFilterMask = -1;
            /**
             * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
             */
            this.collisionResponse = true;
            /**
             * World space position of the body.
             */
            this.position = new Vec3();
            this.previousPosition = new Vec3(); // 上次的位置
            /**
             * Interpolated position of the body.
             * 在上次位置和这次位置之间的插值的值,还不知道有什么用
             */
            this.interpolatedPosition = new Vec3();
            /**
             * Initial position of the body
             */
            this.initPosition = new Vec3();
            /**
             * World space velocity of the body.
             */
            this.velocity = new Vec3();
            this.initVelocity = new Vec3();
            /**
             * Linear force on the body in world space.
             */
            this.force = new Vec3();
            this._mass = 0;
            this.invMass = 0;
            this.material = null;
            /** 线速度衰减系数，0到1 */
            this._linearDamping = 0.01;
            this.ldampPow = 0.9998325084307209;
            this.type = 2 /* STATIC */;
            /**
             * If true, the body will automatically fall to sleep.
             */
            this.allowSleep = true;
            /**
             * Current sleep state.
             */
            this.sleepState = 0 /* AWAKE */;
            /**
             * If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
             */
            this.sleepSpeedLimit = 0.1;
            /**
             * If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
             */
            this.sleepTimeLimit = 1;
            this.timeLastSleepy = 0;
            /** 由于碰撞后满足wakeup条件，需要wakeup了。 一次性的 */
            this._wakeUpAfterNarrowphase = false;
            /**
             * World space rotational force on the body, around center of mass.
             */
            this.torque = new Vec3();
            /**
             * World space orientation of the body.
             */
            this.quaternion = new Quaternion();
            //initQuaternion = new Quaternion();
            this.previousQuaternion = new Quaternion();
            /**
             * Interpolated orientation of the body.
             */
            this.interpolatedQuaternion = new Quaternion();
            this._scale = null; // 可能有缩放。 只是保存用来缩放新添加的shape的。不在其他地方使用
            /**
             * Angular velocity of the body, in world space. Think of the angular velocity as a vector, which the body rotates around. The length of this vector determines how fast (in radians per second) the body rotates.
             */
            this.angularVelocity = new Vec3();
            this.initAngularVelocity = new Vec3();
            this.shapes = [];
            /**
             * Position of each Shape in the body, given in local Body space.
             */
            this.shapeOffsets = [];
            /**
             * Orientation of each Shape, given in local Body space.
             */
            this.shapeOrientations = [];
            this.inertia = new Vec3();
            this.invInertia = new Vec3();
            this.invInertiaWorld = new Mat3();
            this.invMassSolve = 0;
            this.invInertiaSolve = new Vec3();
            this.invInertiaWorldSolve = new Mat3();
            /**
             * Set to true if you don't want the body to rotate. Make sure to run .updateMassProperties() after changing this.
             */
            this.fixedRotation = false;
            this._angularDamping = 0.01; // 旋转速度的衰减，现在没有材质能提供转动摩擦
            this.adampPow = 0.9998325084307209;
            /**
             * Use this property to limit the motion along any world axis. (1,1,1) will allow motion along all axes while (0,0,0) allows none.
             * 1,1,1可以理解，就是一切按照物理来，0,0,0可以理解，就是关掉受力，其他的无法理解，建议不要用。
             */
            this.linearFactor = new Vec3(1, 1, 1);
            /**
             * Use this property to limit the rotational motion along any world axis. (1,1,1) will allow rotation along all axes while (0,0,0) allows none.
             */
            this.angularFactor = new Vec3(1, 1, 1);
            /**
             * World space bounding box of the body and its shapes.
             */
            this.aabb = new AABB();
            this.aabbNeedsUpdate = true;
            /**
             * Total bounding radius of the Body including its shapes, relative to body.position.
             */
            this.boundingRadius = 0;
            /** 每次resolve计算的w增量 */
            this.wlambda = new Vec3();
            /** 如果是kinematic对象，用速度控制还是用位置控制。 */
            this.kinematicUsePos = false;
            this.userData = null; // 保存游戏逻辑对象
            this.dbgData = null;
            this.contact = new ContactInfoMgr();
            /** 每个刚体自定义的重力，设置以后，不再受到全局重力影响 */
            this.bodyGravity = null;
            /** 控制是否显示包围盒 */
            this.dbgShow = true;
            this._mass = mass;
            this.invMass = mass > 0 ? 1.0 / mass : 0;
            this.type = (mass <= 0.0 ? 2 /* STATIC */ : 1 /* DYNAMIC */);
            if (pos) {
                this.position.copy(pos);
                this.previousPosition.copy(pos);
                this.interpolatedPosition.copy(pos);
                this.initPosition.copy(pos);
            }
            if (options) {
                this.collisionFilterGroup = typeof (options.collisionFilterGroup) === 'number' ? options.collisionFilterGroup : 1;
                this.collisionFilterMask = typeof (options.collisionFilterMask) === 'number' ? options.collisionFilterMask : -1;
                this.material = options.material || null;
                this.linearDamping = typeof (options.linearDamping) === 'number' ? options.linearDamping : 0.01;
                this.allowSleep = typeof (options.allowSleep) !== 'undefined' ? options.allowSleep : true;
                this.sleepSpeedLimit = typeof (options.sleepSpeedLimit) !== 'undefined' ? options.sleepSpeedLimit : 0.1;
                this.sleepTimeLimit = typeof (options.sleepTimeLimit) !== 'undefined' ? options.sleepTimeLimit : 1;
                this.fixedRotation = typeof (options.fixedRotation) !== "undefined" ? options.fixedRotation : false;
                this.angularDamping = typeof (options.angularDamping) !== 'undefined' ? options.angularDamping : 0.01;
                if (options.velocity) {
                    this.velocity.copy(options.velocity);
                }
                if (typeof (options.type) === typeof (2 /* STATIC */)) {
                    this.type = options.type;
                }
                if (options.quaternion) {
                    this.quaternion.copy(options.quaternion);
                    //this.initQuaternion.copy(options.quaternion);
                    this.previousQuaternion.copy(options.quaternion);
                    this.interpolatedQuaternion.copy(options.quaternion);
                }
                if (options.angularVelocity) {
                    this.angularVelocity.copy(options.angularVelocity);
                }
                if (options.linearFactor) {
                    this.linearFactor.copy(options.linearFactor);
                }
                if (options.angularFactor) {
                    this.angularFactor.copy(options.angularFactor);
                }
            }
            if (shape) {
                this.addShape(shape);
            }
            this.updateMassProperties();
        }
        get linearDamping() {
            return this._linearDamping;
        }
        set linearDamping(v) {
            this._linearDamping = v;
            this.ldampPow = Math.pow(1.0 - this._linearDamping, 1 / 60);
        }
        set angularDamping(v) {
            this._linearDamping = v;
            this.adampPow = Math.pow(1 - v, 1 / 60);
        }
        get angularDamping() {
            return this._angularDamping;
        }
        set mass(v) {
            if (v == undefined)
                console.error('set mass error');
            this._mass = v;
            this.updateMassProperties();
        }
        get mass() {
            return this._mass;
        }
        setPos(x, y, z) {
            this.position.set(x, y, z);
            this.aabbNeedsUpdate = true;
        }
        setScale(x, y, z) {
            let shapes = this.shapes;
            let sn = shapes.length;
            for (let i = 0; i < sn; i++) {
                shapes[i].setScale(x, y, z);
            }
            if (x == 1 && y == 1 && z == 1) {
                this._scale = null;
                return;
            }
            if (!this._scale) {
                this._scale = new Vec3(x, y, z);
            }
            else {
                this._scale.set(x, y, z);
            }
            this.updateBoundingRadius();
        }
        /**
         * Wake the body up.
         * @method wakeUp
         */
        wakeUp() {
            const s = this.sleepState;
            this.sleepState = 0 /* AWAKE */;
            this._wakeUpAfterNarrowphase = false;
            if (s === 2 /* SLEEPING */) {
                this.dispatchEvent(Body.wakeupEvent);
            }
        }
        /**
         * Force body sleep
         * @method sleep
         */
        sleep() {
            this.sleepState = 2 /* SLEEPING */;
            this.velocity.set(0, 0, 0);
            this.angularVelocity.set(0, 0, 0);
            this._wakeUpAfterNarrowphase = false;
        }
        isSleep() {
            return this.sleepState === 2 /* SLEEPING */;
        }
        /**
         * Called every timestep to update internal sleep timer and change sleep state if needed.
         * @param time The world time in seconds
         */
        sleepTick(time) {
            if (this.allowSleep) {
                const sleepState = this.sleepState;
                const speedSquared = this.velocity.lengthSquared() + this.angularVelocity.lengthSquared();
                const speedLimitSquared = this.sleepSpeedLimit ** 2;
                if (sleepState === 0 /* AWAKE */ && speedSquared < speedLimitSquared) {
                    this.sleepState = 1 /* SLEEPY */; // Sleepy
                    this.timeLastSleepy = time;
                    this.dispatchEvent(Body.sleepyEvent);
                }
                else if (sleepState === 1 /* SLEEPY */ && speedSquared > speedLimitSquared) {
                    this.wakeUp(); // Wake up
                }
                else if (sleepState === 1 /* SLEEPY */ && (time - this.timeLastSleepy) > this.sleepTimeLimit) {
                    this.sleep(); // Sleeping
                    this.dispatchEvent(Body.sleepEvent);
                }
            }
        }
        /**
         * If the body is sleeping, it should be immovable / have infinite mass during solve. We solve it by having a separate "solve mass".
         * @TODO 问题：sleeping状态下，如果要solve，则必然会被唤醒，所以感觉这里有问题
         */
        updateSolveMassProperties() {
            if (this.sleepState === 2 /* SLEEPING */ || this.type === 4 /* KINEMATIC */) {
                this.invMassSolve = 0;
                this.invInertiaSolve.setZero();
                this.invInertiaWorldSolve.setZero();
            }
            else {
                this.invMassSolve = this.invMass;
                this.invInertiaSolve.copy(this.invInertia);
                this.invInertiaWorldSolve.copy(this.invInertiaWorld);
            }
        }
        /**
         * Convert a world point to local body frame.
         */
        pointToLocalFrame(worldPoint, result = new Vec3()) {
            worldPoint.vsub(this.position, result);
            this.quaternion.conjugate().vmult(result, result);
            return result;
        }
        /**
         * Convert a world vector to local body frame.
         */
        vectorToLocalFrame(worldVector, result = new Vec3()) {
            this.quaternion.conjugate().vmult(worldVector, result);
            return result;
        }
        /**
         * Convert a local body point to world frame.
         */
        pointToWorldFrame(localPoint, result = new Vec3()) {
            this.quaternion.vmult(localPoint, result);
            result.vadd(this.position, result);
            return result;
        }
        /**
         * Convert a local body point to world frame.
         */
        vectorToWorldFrame(localVector, result) {
            var result = result || new Vec3();
            this.quaternion.vmult(localVector, result);
            return result;
        }
        /**
         * Add a shape to the body with a local offset and orientation.
         * 注意，这个shape目前不要共享，因为1. 如果有缩放，这个shape会被修改，2.。。
         * @return The body object, for chainability.
         */
        addShape(shape, _offset, _orientation) {
            let offset = null;
            let orientation = null; // = new Quaternion();
            if (_offset) {
                offset = new Vec3();
                offset.copy(_offset);
            }
            if (_orientation) {
                orientation = new Quaternion();
                orientation.copy(_orientation);
            }
            let scale = this._scale;
            if (scale) {
                shape.setScale(scale.x, scale.y, scale.z);
            }
            this.shapes.push(shape);
            this.shapeOffsets.push(offset);
            this.shapeOrientations.push(orientation);
            this.updateMassProperties();
            this.updateBoundingRadius();
            this.aabbNeedsUpdate = true;
            shape.body = this;
            this.onShapeChange();
            return this;
        }
        onShapeChange() {
            this.shapes.forEach(s => { });
        }
        /**
         * 同时添加多个shape，避免每次都重新计算转动惯量
         */
        addShapes() {
        }
        /**
         * Update the bounding radius of the body. Should be done if any of the shapes are changed.
         */
        updateBoundingRadius() {
            const shapes = this.shapes;
            const shapeOffsets = this.shapeOffsets;
            const N = shapes.length;
            let radius = 0;
            for (let i = 0; i !== N; i++) {
                const shape = shapes[i];
                shape.updateBndSphR();
                let offset = 0;
                let off = shapeOffsets[i];
                if (off) {
                    offset = off.length();
                }
                const r = shape.boundSphR;
                if (offset + r > radius) {
                    radius = offset + r;
                }
            }
            this.boundingRadius = radius;
        }
        /**
         * Updates the .aabb
         * 计算世界空间的AABB
         */
        updateAABB() {
            const shapes = this.shapes;
            const shapeOffsets = this.shapeOffsets;
            const shapeOrientations = this.shapeOrientations;
            const N = shapes.length;
            const offset = tmpVec;
            const orientation = tmpQuat$1;
            const bodyQuat = this.quaternion;
            const aabb = this.aabb;
            const shapeAABB = computeAABB_shapeAABB;
            for (let i = 0; i !== N; i++) {
                const shape = shapes[i];
                // Get shape world position
                var shapeoff = shapeOffsets[i];
                var shapeQ = shapeOrientations[i];
                if (shapeoff) {
                    bodyQuat.vmult(shapeoff, offset);
                    offset.vadd(this.position, offset);
                }
                else {
                    offset.copy(this.position);
                }
                // Get shape world quaternion
                if (shapeQ) {
                    shapeQ.mult(bodyQuat, orientation);
                }
                else {
                    orientation.copy(bodyQuat);
                }
                // Get shape AABB
                shape.calculateWorldAABB(offset, orientation, shapeAABB.lowerBound, shapeAABB.upperBound);
                if (i === 0) {
                    aabb.copy(shapeAABB);
                }
                else {
                    aabb.extend(shapeAABB);
                }
            }
            this.aabbNeedsUpdate = false;
        }
        /**
         * Update .inertiaWorld and .invInertiaWorld
         * 转动惯量转到世界空间 I'=RIR'
         */
        updateInertiaWorld(force = false) {
            const I = this.invInertia;
            if (I.x === I.y && I.y === I.z && !force) {
                // If inertia M = s*I, where I is identity and s a scalar, then
                //    R*M*R' = R*(s*I)*R' = s*R*I*R' = s*R*R' = s*I = M
                // where R is the rotation matrix.
                // In other words, we don't have to transform the inertia if all
                // inertia diagonal entries are equal.
            }
            else {
                // = worldRotMat * diag(I) * invWorldRotMat
                const m1 = uiw_m1;
                const m2 = uiw_m2;
                //const m3 = uiw_m3;
                m1.setRotationFromQuaternion(this.quaternion);
                m1.transpose(m2);
                m1.scale(I, m1);
                m1.mmult(m2, this.invInertiaWorld);
            }
        }
        /**
         * Apply force to a world point. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.torque.
         * @param  force The amount of force to add.
         * @param   relativePoint A point relative to the center of mass to apply the force on.
         */
        applyForce(force, relativePoint) {
            if (this.type !== 1 /* DYNAMIC */) { // Needed?
                return;
            }
            // Compute produced rotational force
            const rotForce = Body_applyForce_rotForce;
            relativePoint.cross(force, rotForce);
            // Add linear force
            this.force.vadd(force, this.force);
            // Add rotational force
            this.torque.vadd(rotForce, this.torque);
        }
        /**
         * Apply force to a local point in the body.
         * @param   force The force vector to apply, defined locally in the body frame.
         * @param   localPoint A local point in the body to apply the force on.
         */
        applyLocalForce(localForce, localPoint) {
            if (this.type !== 1 /* DYNAMIC */) {
                return;
            }
            const worldForce = Body_applyLocalForce_worldForce;
            const relativePointWorld = Body_applyLocalForce_relativePointWorld;
            // Transform the force vector to world space
            this.vectorToWorldFrame(localForce, worldForce);
            this.vectorToWorldFrame(localPoint, relativePointWorld);
            this.applyForce(worldForce, relativePointWorld);
        }
        /**
         * Apply impulse to a world point. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
         * 施加一个本地坐标系下的冲量。影响线速度和角速度。
         * @param   impulse The amount of impulse to add.
         * @param   relativePoint A point relative to the center of mass to apply the force on.
         */
        applyImpulse(impulse, relativePoint) {
            if (this.type !== 1 /* DYNAMIC */) {
                return;
            }
            // Compute point position relative to the body center
            const r = relativePoint;
            // Compute produced central impulse velocity
            const velo = Body_applyImpulse_velo;
            velo.copy(impulse);
            velo.scale(this.invMass, velo);
            // Add linear impulse
            this.velocity.vadd(velo, this.velocity);
            // Compute produced rotational impulse velocity
            const rotVelo = Body_applyImpulse_rotVelo;
            r.cross(impulse, rotVelo);
            /*
            rotVelo.x *= this.invInertia.x;
            rotVelo.y *= this.invInertia.y;
            rotVelo.z *= this.invInertia.z;
            */
            this.invInertiaWorld.vmult(rotVelo, rotVelo);
            // Add rotational Impulse
            this.angularVelocity.vadd(rotVelo, this.angularVelocity);
        }
        /**
         * Apply locally-defined impulse to a local point in the body.
         * @param  force The force vector to apply, defined locally in the body frame.
         * @param  localPoint A local point in the body to apply the force on.
         */
        applyLocalImpulse(localImpulse, localPoint) {
            if (this.type !== 1 /* DYNAMIC */) {
                return;
            }
            const worldImpulse = Body_applyLocalImpulse_worldImpulse;
            const relativePointWorld = Body_applyLocalImpulse_relativePoint;
            // Transform the force vector to world space
            this.vectorToWorldFrame(localImpulse, worldImpulse);
            this.vectorToWorldFrame(localPoint, relativePointWorld);
            this.applyImpulse(worldImpulse, relativePointWorld);
        }
        set isTrigger(b) {
            if (b)
                this.type |= 8 /* TRIGGER */;
            else {
                this.type &= (~8 /* TRIGGER */);
            }
        }
        get isTrigger() {
            return (this.type & 8 /* TRIGGER */) != 0;
        }
        /** 获得整体的接触法线。这里不判断是否接触 */
        getContactNormal(norm) {
            norm.set(0, 0, 0);
            let contact = this.contact;
            let n = contact.allcLen;
            if (n <= 0)
                return;
            for (let i = 0; i < n; i++) {
                let c = contact.allc[i];
                norm.vadd(c.hitnorm, norm);
            }
            norm.scale(1 / n, norm);
        }
        /**
         * Should be called whenever you change the body shape or mass.
         * 更新对象的转动惯量相关值
         */
        updateMassProperties() {
            if (this.type & 8 /* TRIGGER */)
                return;
            this.type = (this._mass <= 0.0 ? 2 /* STATIC */ : 1 /* DYNAMIC */);
            this.invMass = this._mass > 0 ? 1.0 / this._mass : 0;
            const halfExtents = Body_updateMassProperties_halfExtents;
            const I = this.inertia;
            const fixed = this.fixedRotation;
            let shapes = this.shapes;
            if (shapes.length <= 0)
                return;
            // 要算转动惯量的包围盒，因此需要忽略旋转。（位置也要忽略，由于不影响下面的计算所以不管）
            let cq = this.quaternion;
            let oqx = cq.x;
            let oqy = cq.y;
            let oqz = cq.z;
            let oqw = cq.w;
            cq.set(0, 0, 0, 1);
            this.updateAABB();
            cq.set(oqx, oqy, oqz, oqw); //恢复旋转
            halfExtents.set((this.aabb.upperBound.x - this.aabb.lowerBound.x) / 2, (this.aabb.upperBound.y - this.aabb.lowerBound.y) / 2, (this.aabb.upperBound.z - this.aabb.lowerBound.z) / 2);
            if (this.type == 2 /* STATIC */) {
                // statci 不要旋转
                this.invInertia.set(0, 0, 0);
            }
            else {
                // 组合形状的话，先用包围盒的转动惯量来模拟
                Box.calculateInertia(halfExtents, this._mass, I);
                /* 如果要精确的话，考虑offset的影响则无法用Vec3来描述转动惯量了 所以先不精确处理了
                if(this.shapes.length>1){
                    Box.calculateInertia(halfExtents, this._mass, I);
                }else{
                    //TODO 测试
                    this.shapes[0].calculateLocalInertia(this.mass,I);
                    // 受到shape偏移的影响
                    let offpos = this.shapeOffsets[0];
                    let offq = this.shapeOrientations[0];
                    if(offq){

                    }
                }
                */
                this.invInertia.set(I.x > 0 && !fixed ? 1.0 / I.x : 0, I.y > 0 && !fixed ? 1.0 / I.y : 0, I.z > 0 && !fixed ? 1.0 / I.z : 0);
                this.updateInertiaWorld(true);
                if (this.world && this.type == 1 /* DYNAMIC */) {
                    this.world._noDynamic = false;
                }
            }
        }
        /**
         * Get world velocity of a point in the body.
         */
        getVelocityAtWorldPoint(worldPoint, result) {
            const r = new Vec3();
            worldPoint.vsub(this.position, r);
            this.angularVelocity.cross(r, result);
            this.velocity.vadd(result, result);
            return result;
        }
        /**
         * Move the body forward in time.
         * 先更新速度，使用新的速度计算位置
         * @param  dt Time step
         * @param  quatNormalize Set to true to normalize the body quaternion
         * @param  quatNormalizeFast If the quaternion should be normalized using "fast" quaternion normalization
         */
        integrate(dt, quatNormalize, quatNormalizeFast) {
            // Save previous position
            this.previousPosition.copy(this.position);
            this.previousQuaternion.copy(this.quaternion);
            if (this.type === 2 /* STATIC */ || this.sleepState === 2 /* SLEEPING */) { // Only for dynamic
                return;
            }
            // kinematic用位置控制的话，不需要integrate
            if (this.type == 4 /* KINEMATIC */ && this.kinematicUsePos) {
                return;
            }
            const velo = this.velocity;
            const angularVelo = this.angularVelocity;
            const pos = this.position;
            const force = this.force;
            const torque = this.torque;
            const quat = this.quaternion;
            const invMass = this.invMass;
            const invInertia = this.invInertiaWorld;
            const linearFactor = this.linearFactor;
            const iMdt = invMass * dt;
            velo.x += force.x * iMdt * linearFactor.x;
            velo.y += force.y * iMdt * linearFactor.y;
            velo.z += force.z * iMdt * linearFactor.z;
            const e = invInertia.ele;
            const angularFactor = this.angularFactor;
            const tx = torque.x * angularFactor.x;
            const ty = torque.y * angularFactor.y;
            const tz = torque.z * angularFactor.z;
            angularVelo.x += dt * (e[0] * tx + e[1] * ty + e[2] * tz);
            angularVelo.y += dt * (e[3] * tx + e[4] * ty + e[5] * tz);
            angularVelo.z += dt * (e[6] * tx + e[7] * ty + e[8] * tz);
            // Use new velocity  - leap frog
            pos.x += velo.x * dt;
            pos.y += velo.y * dt;
            pos.z += velo.z * dt;
            quat.integrate(this.angularVelocity, dt, this.angularFactor, quat);
            if (quatNormalize) {
                if (quatNormalizeFast) {
                    quat.normalizeFast();
                }
                else {
                    quat.normalize();
                }
            }
            this.aabbNeedsUpdate = true;
            // Update world inertia
            this.updateInertiaWorld();
        }
    }
    /**
     * Dispatched after two bodies collide. This event is dispatched on each
     * of the two bodies involved in the collision.
     */
    Body.EVENT_COLLIDE_ENTER = "collideEnter";
    Body.EVENT_COLLIDE_EXIT = "collideExit";
    Body.idCounter = 0;
    /**
     * Dispatched after a sleeping body has woken up.
     */
    Body.wakeupEvent = {
        type: "wakeup"
    };
    /**
     * Dispatched after a body has gone in to the sleepy state.
     */
    Body.sleepyEvent = {
        type: "sleepy"
    };
    /**
     * Dispatched after a body has fallen asleep.
     */
    Body.sleepEvent = {
        type: "sleep"
    };
    var tmpVec = new Vec3();
    var tmpQuat$1 = new Quaternion();
    var computeAABB_shapeAABB = new AABB();
    var uiw_m1 = new Mat3();
    var uiw_m2 = new Mat3();
    //var uiw_m3 = new Mat3();
    //const Body_applyForce_r = new Vec3();
    var Body_applyForce_rotForce = new Vec3();
    var Body_applyLocalForce_worldForce = new Vec3();
    var Body_applyLocalForce_relativePointWorld = new Vec3();
    //const Body_applyImpulse_r = new Vec3();
    var Body_applyImpulse_velo = new Vec3();
    var Body_applyImpulse_rotVelo = new Vec3();
    var Body_applyLocalImpulse_worldImpulse = new Vec3();
    var Body_applyLocalImpulse_relativePoint = new Vec3();
    var Body_updateMassProperties_halfExtents = new Vec3();
    //const torque = new Vec3();
    //const invI_tau_dt = new Vec3();
    //const w = new Quaternion();
    //const wq = new Quaternion();

    /**
     * Storage for Ray casting data.
     */
    class RaycastResult {
        constructor() {
            this.rayFromWorld = new Vec3();
            this.rayToWorld = new Vec3();
            this.hitNormalWorld = new Vec3();
            this.hitPointWorld = new Vec3();
            this.hasHit = false;
            this.shape = null;
            this.suspensionLength = 0;
            /**
             * The hit body, or null.
             */
            this.body = null;
            /**
             * The index of the hit triangle, if the hit shape was a trimesh.
             */
            this.hitFaceIndex = -1;
            /**
             * Distance to the hit. Will be set to -1 if there was no hit.
             */
            this.distance = -1;
            /**
             * If the ray should stop traversing the bodies.
             */
            this._shouldStop = false;
        }
        /**
         * Reset all result data.
         * @method reset
         */
        reset() {
            this.rayFromWorld.setZero();
            this.rayToWorld.setZero();
            this.hitNormalWorld.setZero();
            this.hitPointWorld.setZero();
            this.hasHit = false;
            this.shape = null;
            this.body = null;
            this.hitFaceIndex = -1;
            this.distance = -1;
            this._shouldStop = false;
        }
        /**
         * @method abort
         */
        abort() {
            this._shouldStop = true;
        }
        set(rayFromWorld, rayToWorld, hitNormalWorld, hitPointWorld, shape, body, distance) {
            this.rayFromWorld.copy(rayFromWorld);
            this.rayToWorld.copy(rayToWorld);
            this.hitNormalWorld.copy(hitNormalWorld);
            this.hitPointWorld.copy(hitPointWorld);
            this.shape = shape;
            this.body = body;
            this.distance = distance;
        }
    }

    /**
     * @class WheelInfo
     * @constructor
     * @param {Object} [options]
     *
     * @param {Vec3} [options.chassisConnectionPointLocal]
     * @param {Vec3} [options.chassisConnectionPointWorld]
     * @param {Vec3} [options.directionLocal]
     * @param {Vec3} [options.directionWorld]
     * @param {Vec3} [options.axleLocal]
     * @param {Vec3} [options.axleWorld]
     * @param {number} [options.suspensionRestLength=1]
     * @param {number} [options.suspensionMaxLength=2]
     * @param {number} [options.radius=1]
     * @param {number} [options.suspensionStiffness=100]
     * @param {number} [options.dampingCompression=10]
     * @param {number} [options.dampingRelaxation=10]
     * @param {number} [options.frictionSlip=10000]
     * @param {number} [options.steering=0]
     * @param {number} [options.rotation=0]
     * @param {number} [options.deltaRotation=0]
     * @param {number} [options.rollInfluence=0.01]
     * @param {number} [options.maxSuspensionForce]
     * @param {boolean} [options.isFrontWheel=true]
     * @param {number} [options.clippedInvContactDotSuspension=1]
     * @param {number} [options.suspensionRelativeVelocity=0]
     * @param {number} [options.suspensionForce=0]
     * @param {number} [options.skidInfo=0]
     * @param {number} [options.suspensionLength=0]
     * @param {number} [options.maxSuspensionTravel=1]
     * @param {boolean} [options.useCustomSlidingRotationalSpeed=false]
     * @param {number} [options.customSlidingRotationalSpeed=-0.1]
     */
    class WheelInfo {
        constructor(options) {
            this.id = 0;
            /**
             * Max travel distance of the suspension, in meters.
             * 悬挂系统允许移动的最大范围。
             */
            this.maxSuspensionTravel = 1;
            /**
             * Speed to apply to the wheel rotation when the wheel is sliding.
             * 当滑动的时候，设置的轮胎转速
             */
            this.customSlidingRotationalSpeed = -0.1;
            /**
             * If the customSlidingRotationalSpeed should be used.
             */
            this.useCustomSlidingRotationalSpeed = false;
            this.sliding = false;
            /**
             * 轮子与底盘的连接点。
             * 世界空间的是以后更新的时候计算出来的
             */
            this.chassisConnectionPointLocal = new Vec3();
            this.chassisConnectionPointWorld = new Vec3();
            /** 向下的方向 */
            this.directionLocal = new Vec3();
            this.directionWorld = new Vec3();
            /** 轮轴方向 */
            this.axleLocal = new Vec3();
            this.axleWorld = new Vec3();
            /** 悬挂系统在正常状态下的长度。还可以伸长和压缩，范围是 maxSuspensionTravel */
            this.suspensionRestLength = 1;
            /** 悬挂系统允许的最大长度 */
            this.suspensionMaxLength = 2;
            /** 轮胎半径 */
            this.radius = 1;
            /** 悬挂系统的硬度。变形*硬度=提供的悬挂力 */
            this.suspensionStiffness = 100;
            /** 悬挂压缩过程中的阻尼 */
            this.dampingCompression = 10;
            /** 悬挂放松过程中的阻尼 */
            this.dampingRelaxation = 10;
            /** 静摩擦系数。悬挂力乘这个系数表示提供的静摩擦力，超过了就开始打滑 */
            this.frictionSlip = 1000;
            /** 方向盘方向，0表示向前 */
            this.steering = 0;
            /**
             * 当前轮子的转动弧度
             */
            this.rotation = 0;
            this.deltaRotation = 0;
            /** 转速 */
            //rpm=0; 	
            /** 侧滑力作用位置，0表示在质心，不易翻车，1表示在接触点，易翻车 */
            this.rollInfluence = 0.01;
            this.maxSuspensionForce = Number.MAX_VALUE;
            this.engineForce = 0;
            this.brake = 0;
            this.isFrontWheel = true;
            this.clippedInvContactDotSuspension = 1;
            /** 悬挂系统的相对速度。 */
            this.suspensionRelativeVelocity = 0;
            /** 悬挂系统提供的力，>0 */
            this.suspensionForce = 0;
            /** 当前的悬挂系统的长度 */
            this.suspensionLength = 0;
            /** 由于侧滑导致的力 */
            this.sideImpulse = 0;
            /** 提供的向前的力 */
            this.forwardImpulse = 0;
            this.raycastResult = new RaycastResult();
            /** 轮子的世界空间的位置和旋转  */
            this.worldTransform = new Transform();
            /** 轮胎是否接触地面 */
            this.isInContact = false;
            /** 打滑比例 */
            this.slipInfo = 0;
            /** 侧滑比例 */
            this.skidInfo = 0;
            if (options) {
                this.maxSuspensionTravel = options.maxSuspensionTravel;
                this.customSlidingRotationalSpeed = options.customSlidingRotationalSpeed;
                this.useCustomSlidingRotationalSpeed = options.useCustomSlidingRotationalSpeed;
                this.chassisConnectionPointLocal = options.chassisConnectionPointLocal.clone();
                options.chassisConnectionPointWorld && (this.chassisConnectionPointWorld.copy(options.chassisConnectionPointWorld));
                this.directionLocal = options.directionLocal.clone();
                options.directionWorld && this.directionWorld.copy(options.directionWorld);
                this.axleLocal = options.axleLocal.clone();
                options.axleWorld && this.axleWorld.copy(options.axleWorld);
                this.suspensionRestLength = options.suspensionRestLength;
                this.suspensionMaxLength = options.suspensionMaxLength;
                this.radius = options.radius;
                this.suspensionStiffness = options.suspensionStiffness;
                this.dampingCompression = options.dampingCompression;
                this.dampingRelaxation = options.dampingRelaxation;
                this.frictionSlip = options.frictionSlip;
                this.rollInfluence = options.rollInfluence;
                this.maxSuspensionForce = options.maxSuspensionForce;
                this.isFrontWheel = options.isFrontWheel;
            }
        }
        updateWheel(chassis) {
            const raycastResult = this.raycastResult;
            if (this.isInContact) {
                // 接触中
                const project = raycastResult.hitNormalWorld.dot(raycastResult.directionWorld);
                raycastResult.hitPointWorld.vsub(chassis.position, relpos);
                chassis.getVelocityAtWorldPoint(relpos, chassis_velocity_at_contactPoint);
                const projVel = raycastResult.hitNormalWorld.dot(chassis_velocity_at_contactPoint);
                if (project >= -0.1) {
                    this.suspensionRelativeVelocity = 0.0;
                    this.clippedInvContactDotSuspension = 1.0 / 0.1;
                }
                else {
                    const inv = -1 / project;
                    this.suspensionRelativeVelocity = projVel * inv;
                    this.clippedInvContactDotSuspension = inv;
                }
            }
            else {
                // Not in contact : position wheel in a nice (rest length) position
                raycastResult.suspensionLength = this.suspensionRestLength;
                this.suspensionRelativeVelocity = 0.0;
                raycastResult.directionWorld.scale(-1, raycastResult.hitNormalWorld);
                this.clippedInvContactDotSuspension = 1.0;
            }
        }
    }
    var chassis_velocity_at_contactPoint = new Vec3();
    var relpos = new Vec3();
    var chassis_velocity_at_contactPoint = new Vec3();

    const gAxle = new Vec3(1, 0, 0); // 本地空间的轴向量
    const gForward = new Vec3(0, 0, 1); // 本地空间的前向量
    /**
     * Vehicle helper class that casts rays from the wheel positions towards the ground and applies forces.
     * @class RaycastVehicle
     * @constructor
     * @param {object} [options]
     * @param {Body} [options.chassisBody] The car chassis body.
     * @param {integer} [options.indexRightAxis] Axis to use for right. x=0, y=1, z=2
     * @param {integer} [options.indexLeftAxis]
     * @param {integer} [options.indexUpAxis]
     */
    class RaycastVehicle {
        constructor(chassisBody, indexRightAxis = 1, indexForwardAxis = 0, indexUpAxis = 2) {
            /**
             * An array of WheelInfo objects.
             */
            this.wheelInfos = [];
            /**
             * Will be set to true if the car is sliding.
             */
            this.sliding = false;
            this.world = null; // null 表示没有加到场景中
            /** 最大轮胎转速 */
            this.wheelRPM = 0;
            this.maxSpeed = 200; //km/h
            /**
             * Index of the right axis, 0=x, 1=y, 2=z
             */
            //indexRightAxis:i32=0;
            /**
             * Index of the forward axis, 0=x, 1=y, 2=z
             */
            //indexForwardAxis:i32 = 2;
            /**
             * Index of the up axis, 0=x, 1=y, 2=z
             */
            //indexUpAxis:i32 = 1;
            this.dbgShowSlideForce = false;
            this.dbgShowSuspForce = false;
            this.dbgShowDriveForce = false;
            /** 当前速度，单位是 Km/h */
            this.currentVehicleSpeedKmHour = 0;
            this.chassisBody = chassisBody;
            //this.indexRightAxis = typeof (indexRightAxis) !== 'undefined' ? indexRightAxis : 1;
            //this.indexForwardAxis = typeof (indexForwardAxis) !== 'undefined' ? indexForwardAxis : 0;
            //this.indexUpAxis = typeof (indexUpAxis) !== 'undefined' ? indexUpAxis : 2;
        }
        /**
         * Add a wheel. For information about the options, see WheelInfo.
         * @param  [options]
         */
        addWheel(options = {}) {
            const info = new WheelInfo(options);
            const index = this.wheelInfos.length;
            info.id = index;
            this.wheelInfos.push(info);
            return index;
        }
        /**
         * Set the steering value of a wheel.
         */
        setSteeringValue(value, wheelIndex) {
            const wheel = this.wheelInfos[wheelIndex];
            wheel.steering = value;
        }
        /**
         * Set the wheel force to apply on one of the wheels each time step
         */
        applyEngineForce(value, wheelIndex) {
            this.wheelInfos[wheelIndex].engineForce = value;
        }
        /**
         * Set the braking force of a wheel
         */
        setBrake(brake, wheelIndex) {
            this.wheelInfos[wheelIndex].brake = brake;
        }
        /**
         * Add the vehicle including its constraints to the world.
         */
        addToWorld(world) {
            //const constraints = this.constraints;
            world.addBody(this.chassisBody);
            const that = this;
            this.preStepCallback = () => {
                that.updateVehicle(world.dt);
            };
            world.addEventListener('preStep', this.preStepCallback);
            this.world = world;
        }
        /**
         * Get one of the wheel axles, world-oriented.
         */
        getVehicleAxisWorld(axisIndex, result) {
            result.set(axisIndex === 0 ? 1 : 0, axisIndex === 1 ? 1 : 0, axisIndex === 2 ? 1 : 0);
            result.set(1, 0, 0);
            this.chassisBody.vectorToWorldFrame(result, result);
        }
        /**
         * 主逻辑
         * @param timeStep
         */
        updateVehicle(timeStep) {
            const wheelInfos = this.wheelInfos;
            const numWheels = wheelInfos.length;
            const chassisBody = this.chassisBody;
            for (var i = 0; i < numWheels; i++) {
                this.updateWheelTransform(i);
            }
            this.currentVehicleSpeedKmHour = 3.6 * chassisBody.velocity.length();
            const forwardWorld = new Vec3();
            //this.getVehicleAxisWorld(this.indexForwardAxis, forwardWorld);
            this.chassisBody.vectorToWorldFrame(gForward, forwardWorld);
            // 判断前进还是后退
            if (forwardWorld.dot(chassisBody.velocity) < 0) {
                this.currentVehicleSpeedKmHour *= -1;
            }
            // simulate suspension
            for (var i = 0; i < numWheels; i++) {
                this.castRay(wheelInfos[i]);
            }
            this.updateSuspension(timeStep);
            /** 每个悬挂贡献的冲击力 */
            const impulse = new Vec3();
            const relpos = new Vec3();
            for (var i = 0; i < numWheels; i++) {
                //apply suspension force
                // 悬挂提供的力，影响底盘
                var wheel = wheelInfos[i];
                let suspensionForce = wheel.suspensionForce;
                if (suspensionForce > wheel.maxSuspensionForce) {
                    suspensionForce = wheel.maxSuspensionForce;
                }
                wheel.raycastResult.hitNormalWorld.scale(suspensionForce * timeStep, impulse);
                //DEBUG
                if (this.world && this.dbgShowSuspForce) {
                    this.world.phyRender.addVec1(wheel.raycastResult.hitPointWorld, impulse, 0.05, 0xffffff00);
                }
                //DEBUG
                wheel.raycastResult.hitPointWorld.vsub(chassisBody.position, relpos);
                chassisBody.applyImpulse(impulse, relpos);
            }
            this.updateFriction(timeStep);
            const hitNormalWorldScaledWithProj = new Vec3();
            const fwd = new Vec3();
            const vel = new Vec3();
            this.wheelRPM = 0;
            for (i = 0; i < numWheels; i++) {
                var wheel = wheelInfos[i];
                //var relpos = new Vec3();
                //wheel.chassisConnectionPointWorld.vsub(chassisBody.position, relpos);
                chassisBody.getVelocityAtWorldPoint(wheel.chassisConnectionPointWorld, vel);
                // Hack to get the rotation in the correct direction
                /*
                let m = 1;
                switch (this.indexUpAxis) {
                    case 1:
                        m = -1;
                        break;
                }
                */
                // 更新轮胎旋转
                if (wheel.isInContact) {
                    //this.getVehicleAxisWorld(this.indexForwardAxis, fwd);
                    this.chassisBody.vectorToWorldFrame(gForward, fwd);
                    const proj = fwd.dot(wheel.raycastResult.hitNormalWorld);
                    wheel.raycastResult.hitNormalWorld.scale(proj, hitNormalWorldScaledWithProj);
                    fwd.vsub(hitNormalWorldScaledWithProj, fwd);
                    const proj2 = fwd.dot(vel);
                    wheel.deltaRotation = proj2 * timeStep / wheel.radius; // 如果转反了改-1
                }
                // 给油中，侧滑中，允许CustomSlidingRotationalSpeed 的情况下
                if ((wheel.sliding || !wheel.isInContact) && wheel.engineForce !== 0 && wheel.useCustomSlidingRotationalSpeed) {
                    // Apply custom rotation when accelerating and sliding
                    wheel.deltaRotation = (wheel.engineForce > 0 ? 1 : -1) * wheel.customSlidingRotationalSpeed * timeStep;
                }
                // Lock wheels
                if (Math.abs(wheel.brake) > Math.abs(wheel.engineForce)) {
                    wheel.deltaRotation = 0;
                }
                wheel.rotation += wheel.deltaRotation; // Use the old value
                // 每分钟转速
                let rpm = wheel.deltaRotation / timeStep * 60 / (2 * Math.PI);
                if (this.wheelRPM < rpm) {
                    this.wheelRPM = rpm;
                }
                wheel.deltaRotation *= 0.99; // damping of rotation when not in contact
            }
            //console.log('转速:',this.wheelRPM);
        }
        updateSuspension(deltaTime) {
            const chassisBody = this.chassisBody;
            const chassisMass = chassisBody.mass;
            const wheelInfos = this.wheelInfos;
            const numWheels = wheelInfos.length;
            for (let w_it = 0; w_it < numWheels; w_it++) {
                const wheel = wheelInfos[w_it];
                if (wheel.isInContact) {
                    // Spring
                    const length_diff = (wheel.suspensionRestLength - wheel.suspensionLength);
                    let force = wheel.suspensionStiffness * length_diff * wheel.clippedInvContactDotSuspension;
                    // Damper
                    const projected_rel_vel = wheel.suspensionRelativeVelocity;
                    let susp_damping;
                    if (projected_rel_vel < 0) {
                        susp_damping = wheel.dampingCompression;
                    }
                    else {
                        susp_damping = wheel.dampingRelaxation;
                    }
                    // 阻尼与速度成正比
                    force -= susp_damping * projected_rel_vel;
                    wheel.suspensionForce = force * chassisMass;
                    if (wheel.suspensionForce < 0) {
                        wheel.suspensionForce = 0;
                    }
                }
                else {
                    wheel.suspensionForce = 0;
                }
            }
        }
        /**
         * Remove the vehicle including its constraints from the world.
         */
        removeFromWorld(world) {
            //const constraints = this.constraints;
            world.remove(this.chassisBody);
            world.removeEventListener('preStep', this.preStepCallback);
            this.world = null;
        }
        /**
         * wheel做射线检测
         * @param wheel
         * @return 返回距离地面的高度，-1表示没有接触地面
         */
        castRay(wheel) {
            if (!this.world)
                return -1;
            /** 射线朝向 */
            const rayvector = castRay_rayvector;
            /** 射线终点 */
            const target = castRay_target;
            wheel.isInContact = false;
            this.updateWheelTransformWorld(wheel);
            const chassisBody = this.chassisBody;
            let depth = -1;
            // 射线检测长度是悬挂缺省长度+轮胎半径
            const raylen = wheel.suspensionRestLength + wheel.radius;
            wheel.directionWorld.scale(raylen, rayvector);
            const source = wheel.chassisConnectionPointWorld;
            source.vadd(rayvector, target);
            const raycastResult = wheel.raycastResult;
            //const param = 0;
            raycastResult.reset();
            // Turn off ray collision with the chassis temporarily
            // 先关掉底盘的射线检测，测完再恢复
            const oldState = chassisBody.collisionResponse;
            chassisBody.collisionResponse = false;
            // Cast ray against world
            this.world.rayTest(source, target, raycastResult);
            chassisBody.collisionResponse = oldState;
            const object = raycastResult.body;
            raycastResult.groundObject = 0;
            if (object) {
                // 如果检测到物体了，表示轮胎接触地面
                wheel.isInContact = true;
                //wheel.raycastResult.hitNormalWorld = raycastResult.hitNormalWorld;
                depth = raycastResult.distance;
                wheel.suspensionLength = depth - wheel.radius;
                // clamp on max suspension travel
                const minSuspensionLength = wheel.suspensionRestLength - wheel.maxSuspensionTravel;
                const maxSuspensionLength = wheel.suspensionRestLength + wheel.maxSuspensionTravel;
                if (wheel.suspensionLength < minSuspensionLength) {
                    wheel.suspensionLength = minSuspensionLength;
                }
                if (wheel.suspensionLength > maxSuspensionLength) {
                    // 超过最大长度了 。 ？？
                    wheel.suspensionLength = maxSuspensionLength;
                    raycastResult.reset();
                }
                // 当前接触点的贡献值
                const denominator = raycastResult.hitNormalWorld.dot(wheel.directionWorld);
                // 当前接触点的速度
                const chassis_velocity_at_contactPoint = new Vec3();
                chassisBody.getVelocityAtWorldPoint(raycastResult.hitPointWorld, chassis_velocity_at_contactPoint);
                // 速度到碰撞法线的投影
                const projVel = raycastResult.hitNormalWorld.dot(chassis_velocity_at_contactPoint);
                if (denominator >= -0.1) {
                    wheel.suspensionRelativeVelocity = 0;
                    wheel.clippedInvContactDotSuspension = 1 / 0.1;
                }
                else {
                    const inv = -1 / denominator;
                    wheel.suspensionRelativeVelocity = projVel * inv;
                    wheel.clippedInvContactDotSuspension = inv;
                }
            }
            else {
                //put wheel info as in rest position
                wheel.suspensionLength = wheel.suspensionRestLength + 0 * wheel.maxSuspensionTravel;
                wheel.suspensionRelativeVelocity = 0.0;
                wheel.directionWorld.scale(-1, raycastResult.hitNormalWorld);
                wheel.clippedInvContactDotSuspension = 1.0;
            }
            return depth;
        }
        updateWheelTransformWorld(wheel) {
            const chassisBody = this.chassisBody;
            // 把轮子的相对连接点、上方向、轴都转到世界空间
            chassisBody.pointToWorldFrame(wheel.chassisConnectionPointLocal, wheel.chassisConnectionPointWorld);
            chassisBody.vectorToWorldFrame(wheel.directionLocal, wheel.directionWorld);
            chassisBody.vectorToWorldFrame(wheel.axleLocal, wheel.axleWorld);
        }
        /**
         * Update one of the wheel transform.
         * Note when rendering wheels: during each step, wheel transforms are updated BEFORE the chassis; ie. their position becomes invalid after the step.
         * Thus when you render wheels, you must update wheel transforms before rendering them. See raycastVehicle demo for an example.
         * @param wheelIndex The wheel index to update.
         */
        updateWheelTransform(wheelIndex) {
            let up = tmpVec4;
            let right = tmpVec5;
            //let fwd = tmpVec6;
            let wheel = this.wheelInfos[wheelIndex];
            // 转到世界空间
            this.updateWheelTransformWorld(wheel);
            // 计算本地空间的前和右
            wheel.directionLocal.scale(-1, up);
            right.copy(wheel.axleLocal);
            //up.cross(right, fwd);
            //fwd.normalize();
            right.normalize();
            // 先在本地空间控制方向，然后再转到世界空间
            // Rotate around steering over the wheelAxle
            let steering = wheel.steering;
            let steeringOrn = new Quaternion(); //TODO 去掉new
            steeringOrn.setFromAxisAngle(up, steering);
            let rotatingOrn = new Quaternion();
            rotatingOrn.setFromAxisAngle(right, wheel.rotation);
            // World rotation of the wheel
            // 轮子的世界空间的旋转 = 底盘旋转*方向盘*轮子旋转
            let q = wheel.worldTransform.quaternion;
            this.chassisBody.quaternion.mult(steeringOrn, q);
            q.mult(rotatingOrn, q);
            q.normalize();
            // world position of the wheel
            // 位置=世界空间位置+悬挂偏移
            let p = wheel.worldTransform.position;
            p.copy(wheel.directionWorld);
            p.scale(wheel.suspensionLength, p);
            p.vadd(wheel.chassisConnectionPointWorld, p);
        }
        /**
         * Get the world transform of one of the wheels
         * @param   wheelIndex
         */
        getWheelTransformWorld(wheelIndex) {
            return this.wheelInfos[wheelIndex].worldTransform;
        }
        updateFriction(timeStep) {
            const surfNormalWS_scaled_proj = updateFriction_surfNormalWS_scaled_proj;
            //calculate the impulse, so that the wheels don't move sidewards
            const wheelInfos = this.wheelInfos;
            const numWheels = wheelInfos.length;
            const chassisBody = this.chassisBody;
            const forwardWS = updateFriction_forwardWS;
            const axle = updateFriction_axle;
            // 初始化。 TODO 合并到下面
            for (var i = 0; i < numWheels; i++) {
                var wheel = wheelInfos[i];
                wheel.sideImpulse = 0;
                wheel.forwardImpulse = 0;
                if (!forwardWS[i]) {
                    forwardWS[i] = new Vec3();
                }
                if (!axle[i]) {
                    axle[i] = new Vec3();
                }
            }
            // 计算每个轮胎的侧滑摩擦力
            for (var i = 0; i < numWheels; i++) {
                var wheel = wheelInfos[i];
                var groundObject = wheel.raycastResult.body;
                if (groundObject) {
                    const axlei = axle[i];
                    const wheelTrans = this.getWheelTransformWorld(i);
                    // Get world axle
                    //wheelTrans.vectorToWorldFrame(directions[this.indexRightAxis], axlei);
                    wheelTrans.vectorToWorldFrame(gAxle, axlei); // 轮轴
                    // 下面计算axle和forward。
                    /** 接触面法线 */
                    const surfNormalWS = wheel.raycastResult.hitNormalWorld;
                    const proj = axlei.dot(surfNormalWS);
                    surfNormalWS.scale(proj, surfNormalWS_scaled_proj); // axle投影到normal上的部分
                    axlei.vsub(surfNormalWS_scaled_proj, axlei); // 平行于接触面的分量，作为axle
                    axlei.normalize();
                    // 计算forward。如果axle=1,0,0, normal=0,1,0则forward指向 -z
                    surfNormalWS.cross(axlei, forwardWS[i]);
                    forwardWS[i].normalize();
                    // 计算侧滑导致的摩擦力。沿着车轴方向
                    wheel.sideImpulse = resolveSingleBilateral(chassisBody, wheel.raycastResult.hitPointWorld, groundObject, wheel.raycastResult.hitPointWorld, axlei);
                    wheel.sideImpulse *= sideFrictionStiffness;
                }
            }
            const sideFactor = 1;
            const fwdFactor = 0.5;
            this.sliding = false;
            // 速度越快引擎拉力越少
            let speedK = this.currentVehicleSpeedKmHour / this.maxSpeed;
            if (speedK > 1)
                speedK = 1;
            speedK = 1 - speedK;
            for (var i = 0; i < numWheels; i++) {
                var wheel = wheelInfos[i];
                var groundObject = wheel.raycastResult.body;
                let rollingFriction = 0;
                wheel.slipInfo = 1;
                if (groundObject) {
                    const defaultRollingFrictionImpulse = 0;
                    // 允许的最大冲量 = 0或者刹车的力
                    const maxImpulse = wheel.brake ? wheel.brake : defaultRollingFrictionImpulse;
                    // btWheelContactPoint contactPt(chassisBody,groundObject,wheelInfraycastInfo.hitPointWorld,forwardWS[wheel],maxImpulse);
                    // rollingFriction = calcRollingFriction(contactPt);
                    // 保持相对静止需要的摩擦力。非刹车的情况为0
                    rollingFriction = calcRollingFriction(chassisBody, groundObject, wheel.raycastResult.hitPointWorld, forwardWS[i], maxImpulse);
                    // 刹车的情况这个从很大的值逐渐减少，目前会最终反向导致震荡
                    // 加上引擎拉力。引擎提供的力与速度有关
                    rollingFriction += wheel.engineForce * timeStep * speedK;
                    // rollingFriction = 0;
                    var factor = maxImpulse / rollingFriction;
                    wheel.slipInfo *= factor;
                }
                //switch between active rolling (throttle), braking and non-active rolling friction (nthrottle/break)
                wheel.forwardImpulse = 0;
                wheel.skidInfo = 1;
                if (groundObject) {
                    //wheel.skidInfo = 1;
                    let mtlf = 1.0;
                    if (groundObject.material) {
                        mtlf = groundObject.material.friction; // 受到地面材质的影响
                    }
                    const maximp = wheel.suspensionForce * timeStep * wheel.frictionSlip * mtlf; //*0.01;
                    const maximpSide = maximp;
                    const maximpSquared = maximp * maximpSide;
                    wheel.forwardImpulse = rollingFriction; //wheelInfo.engineForce* timeStep;
                    const x = wheel.forwardImpulse * fwdFactor;
                    const y = wheel.sideImpulse * sideFactor;
                    const impulseSquared = x * x + y * y;
                    wheel.sliding = false;
                    if (impulseSquared > maximpSquared) {
                        // 超过了最大冲量，则产生滑动了
                        this.sliding = true;
                        wheel.sliding = true;
                        wheel.skidInfo *= maximp / Math.sqrt(impulseSquared);
                    }
                }
            }
            if (this.sliding) {
                // 打滑的情况下，提供的动力会减少
                for (var i = 0; i < numWheels; i++) {
                    var wheel = wheelInfos[i];
                    if (wheel.sideImpulse !== 0) {
                        if (wheel.skidInfo < 1) {
                            wheel.forwardImpulse *= wheel.skidInfo;
                            wheel.sideImpulse *= wheel.skidInfo;
                        }
                    }
                }
            }
            // apply the impulses
            for (var i = 0; i < numWheels; i++) {
                var wheel = wheelInfos[i];
                const rel_pos = new Vec3();
                wheel.raycastResult.hitPointWorld.vsub(chassisBody.position, rel_pos);
                // cannons applyimpulse is using world coord for the position
                //rel_pos.copy(wheel.raycastResult.hitPointWorld);
                if (wheel.forwardImpulse !== 0) {
                    const impulse = new Vec3();
                    forwardWS[i].scale(wheel.forwardImpulse, impulse);
                    chassisBody.applyImpulse(impulse, rel_pos);
                    //DEBUG
                    if (this.world && this.dbgShowDriveForce) {
                        this.world.phyRender.addVec1(wheel.raycastResult.hitPointWorld, impulse, 2, 0xffff0000);
                    }
                    //DEBUG
                }
                if (wheel.sideImpulse !== 0) {
                    var groundObject = wheel.raycastResult.body;
                    if (groundObject) {
                        const rel_pos2 = new Vec3();
                        wheel.raycastResult.hitPointWorld.vsub(groundObject.position, rel_pos2);
                        //rel_pos2.copy(wheel.raycastResult.hitPointWorld);
                        const sideImp = new Vec3();
                        axle[i].scale(wheel.sideImpulse, sideImp);
                        // Scale the relative position in the up direction with rollInfluence.
                        // If rollInfluence is 1, the impulse will be applied on the hitPoint (easy to roll over), if it is zero it will be applied in the same plane as the center of mass (not easy to roll over).
                        chassisBody.vectorToLocalFrame(rel_pos, rel_pos);
                        rel_pos.y *= wheel.rollInfluence;
                        chassisBody.vectorToWorldFrame(rel_pos, rel_pos);
                        chassisBody.applyImpulse(sideImp, rel_pos);
                        //DEBUG
                        if (this.world && this.dbgShowSlideForce) {
                            this.world.phyRender.addVec1(wheel.raycastResult.hitPointWorld, sideImp, 0.05, 0xffff0000);
                        }
                        //DEBUG
                        //apply friction impulse on the ground
                        sideImp.scale(-1, sideImp);
                        groundObject.applyImpulse(sideImp, rel_pos2);
                    }
                }
            }
        }
    }
    //const tmpVec1 = new Vec3();
    //const tmpVec2 = new Vec3();
    //const tmpVec3 = new Vec3();
    var tmpVec4 = new Vec3();
    var tmpVec5 = new Vec3();
    var tmpVec6 = new Vec3();
    //const tmpRay = new Ray();
    //const torque = new Vec3();
    var castRay_rayvector = new Vec3();
    var castRay_target = new Vec3();
    var updateFriction_surfNormalWS_scaled_proj = new Vec3();
    var updateFriction_axle = [];
    var updateFriction_forwardWS = [];
    var sideFrictionStiffness = 1;
    const calcRollingFriction_vel1 = new Vec3();
    const calcRollingFriction_vel2 = new Vec3();
    const calcRollingFriction_vel = new Vec3();
    /**
     * 计算保持不滑动需要的滚动摩擦力
     * @param body0
     * @param body1
     * @param frictionPosWorld 			接触点的坐标
     * @param frictionDirectionWorld 	前向量，就是摩擦力会产生的方向
     * @param maxImpulse 				最大冲力
     */
    function calcRollingFriction(body0, body1, frictionPosWorld, frictionDirectionWorld, maxImpulse) {
        let j1 = 0;
        const contactPosWorld = frictionPosWorld;
        // var rel_pos1 = new Vec3();
        // var rel_pos2 = new Vec3();
        const vel1 = calcRollingFriction_vel1;
        const vel2 = calcRollingFriction_vel2;
        const vel = calcRollingFriction_vel;
        // contactPosWorld.vsub(body0.position, rel_pos1);
        // contactPosWorld.vsub(body1.position, rel_pos2);
        body0.getVelocityAtWorldPoint(contactPosWorld, vel1);
        body1.getVelocityAtWorldPoint(contactPosWorld, vel2);
        // 碰撞点的相对速度
        vel1.vsub(vel2, vel);
        // 相对速度在摩擦力方向上的投影
        const vrel = frictionDirectionWorld.dot(vel);
        //console.log('vrel',vel.length());
        const denom0 = computeImpulseDenominator(body0, frictionPosWorld, frictionDirectionWorld);
        const denom1 = computeImpulseDenominator(body1, frictionPosWorld, frictionDirectionWorld);
        const relaxation = 1;
        const jacDiagABInv = relaxation / (denom0 + denom1);
        // calculate j that moves us to zero relative velocity
        // 为了达到相对速度为0需要的j
        j1 = -vrel * jacDiagABInv;
        if (j1 > maxImpulse) {
            j1 = maxImpulse;
        }
        if (j1 < -maxImpulse) {
            j1 = -maxImpulse;
        }
        return j1;
    }
    const computeImpulseDenominator_r0 = new Vec3();
    const computeImpulseDenominator_c0 = new Vec3();
    const computeImpulseDenominator_vec = new Vec3();
    const computeImpulseDenominator_m = new Vec3();
    /**
     * 计算body在pos位置，normal方向上的冲量的贡献量，这个位置和方向越容易引起旋转，则贡献越大？
     * @param body
     * @param pos
     * @param normal
     */
    function computeImpulseDenominator(body, pos, normal) {
        /** r0 质心->pos */
        const r0 = computeImpulseDenominator_r0;
        const c0 = computeImpulseDenominator_c0;
        const vec = computeImpulseDenominator_vec;
        const m = computeImpulseDenominator_m;
        pos.vsub(body.position, r0);
        r0.cross(normal, c0);
        body.invInertiaWorld.vmult(c0, m);
        m.cross(r0, vec);
        return body.invMass + normal.dot(vec);
    }
    const resolveSingleBilateral_vel1 = new Vec3();
    const resolveSingleBilateral_vel2 = new Vec3();
    const resolveSingleBilateral_vel = new Vec3();
    //bilateral constraint between two dynamic objects
    function resolveSingleBilateral(body1, pos1, body2, pos2, normal) {
        const normalLenSqr = normal.lengthSquared();
        if (normalLenSqr > 1.1) {
            return 0; // no impulse
        }
        // var rel_pos1 = new Vec3();
        // var rel_pos2 = new Vec3();
        // pos1.vsub(body1.position, rel_pos1);
        // pos2.vsub(body2.position, rel_pos2);
        const vel1 = resolveSingleBilateral_vel1;
        const vel2 = resolveSingleBilateral_vel2;
        const vel = resolveSingleBilateral_vel;
        body1.getVelocityAtWorldPoint(pos1, vel1);
        body2.getVelocityAtWorldPoint(pos2, vel2);
        // 两个点之间的相对速度
        vel1.vsub(vel2, vel);
        // 相对速度在normal上的大小
        const rel_vel = normal.dot(vel);
        const contactDamping = 0.2;
        const massTerm = 1 / (body1.invMass + body2.invMass);
        var impulse = -contactDamping * rel_vel * massTerm;
        return impulse;
    }

    var tempQ = new Quaternion();
    // 车面向屏幕外面。位置是模型的全局坐标
    var carData = {
        modelUrl: 'res/car/car.lh',
        chassisNode: 'SM_Veh_Convertable_01',
        wheelflNode: 'Wheel_fl',
        wheelfrNode: 'Wheel_fr',
        wheelrlNode: 'Wheel_rl',
        wheelrrNode: 'Wheel_rr',
        /**
         * 重心。是整个车的原点，其他的位置都根据他来算
         * 	1. 车身物理的shape根据这个来偏移
         *  2. 车身模型根据这个来偏移：模型原点在000，所以移动模型的时候，要减去这个
         */
        center: new Vec3(0, 0.1, 0),
        chassisBox: new Vec3(2 / 2, 0.791 / 2, 4.68 / 2),
        chassisBoxPos: new Vec3(0.00716, 0.570108, -0.170404),
        mass: 1500,
        /** 单轮拉力 */
        DanLunLaLi: 10000,
        /** 脚刹力 */
        JiaoShaLi: 1000,
        /** 手刹力 */
        ShouShaLi: 100,
        radius: 0.4,
        /** 悬挂平时长度:0.2, */
        suspensionRestLength: 0.2,
        /** 悬挂最大移动范围:0.3 */
        maxSuspensionTravel: 0.3,
        /** 悬挂提供的最大力 */
        maxSuspensionForce: 100000,
        /** 悬挂硬度 */
        suspensionStiffness: 30,
        /** 悬挂压缩阻尼 */
        dampingCompression: 4.4,
        /** 悬挂放松阻尼 */
        dampingRelaxation: 2.3,
        /** 侧滑翻滚系数 */
        rollInfluence: 0.1,
        /** 滑动时轮胎转速 */
        customSlidingRotationalSpeed: -30,
        /** 开启滑动时轮胎转速 */
        useCustomSlidingRotationalSpeed: true,
        /** 轮胎静摩擦系数 */
        StaticFric: 4,
        /** 最大速度 */
        MaxSpeed: 300,
        flpos: new Vec3(0.773268, 0.406936, 1.41364),
        frpos: new Vec3(-0.773268, 0.406936, 1.41364),
        rlpos: new Vec3(0.773268, 0.406936, -1.5505),
        rrpos: new Vec3(-0.773268, 0.406936, -1.5505),
    };
    /*
    Laya.loader.create("url",Handler.create(null,function(mesh:Mesh):void{
        var meshSprite3D:MeshSprite3D = new MeshSprite3D(mesh);
        var mat:BlinnPhongMaterial = new BlinnPhongMaterial();
        meshSprite3D.meshRenderer.sharedMaterial = mat;
        meshSprite3D.getChildByName
    }),null,Loader.MESH)
    */
    class Car {
        constructor(sce, world) {
            this.chassisoffq = new Quaternion();
            this.chassisoffp = new Vec3(); // 车身偏移，即重心的位置取反。车身的原点在000
            // 轮胎
            this.wheels = []; // TODO 对于轮子可以做到不需要这个。
            this.wheelsOffQuat = [];
            // 调试轨迹
            this.wheelstrackf = []; // 前轮
            this.wheelstrackr = []; // 后轮
            this.wheelstrackslid = []; // 侧滑
            this.tracklen = 1000;
            // 刹车tween
            this.wheelBrake = [];
            this.isBraking = false;
            this.showTrack = false;
            this.showCenter = false;
            this.op_steerLeft = false;
            this.op_steerRight = false;
            this.op_acc = false;
            this.op_rev = false;
            this.op_handbrake = false;
            this.op_brake = false;
            this.scene3D = sce;
            this.world = world;
        }
        set showSlideForce(b) {
            this.phyCar.dbgShowSlideForce = b;
        }
        get showSlideForce() {
            return this.phyCar.dbgShowSlideForce;
        }
        set showSuspForce(b) {
            this.phyCar.dbgShowSuspForce = b;
        }
        get showSuspForce() {
            return this.phyCar.dbgShowSuspForce;
        }
        set showDriveForce(b) {
            this.phyCar.dbgShowDriveForce = b;
        }
        get showDriveForce() {
            return this.phyCar.dbgShowDriveForce;
        }
        /**
         *
         * @param data
         * @param renderModel 如果传入这个参数，则不再自己加载。外部负责加载并加到场景中。模型必须符合制定的规则。
         */
        parse(data, renderModel) {
            this.carData = data;
            // 创建物理对象
            var options = {
                radius: carData.radius,
                directionLocal: new Vec3(0, -1, 0),
                suspensionStiffness: carData.suspensionStiffness,
                suspensionRestLength: carData.suspensionRestLength,
                frictionSlip: carData.StaticFric,
                dampingRelaxation: carData.dampingRelaxation,
                dampingCompression: carData.dampingCompression,
                maxSuspensionForce: carData.maxSuspensionForce,
                rollInfluence: carData.rollInfluence,
                axleLocal: new Vec3(1, 0, 0),
                chassisConnectionPointLocal: new Vec3(1, 0, 1),
                maxSuspensionTravel: carData.maxSuspensionTravel,
                customSlidingRotationalSpeed: carData.customSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                isFrontWheel: true
            };
            //let chassisBody = addBox( new Vec3(1.8,0.5,4), new Vec3(-5,7,0),carData.mass,cmtl1);
            let chassisBody = new Body(data.mass);
            let chassisOff = new Vec3();
            carData.chassisBoxPos.vsub(carData.center, chassisOff);
            chassisBody.addShape(new Box(carData.chassisBox), chassisOff);
            chassisBody.allowSleep = false; //TODO 现在加力不能唤醒，先禁止sleep
            chassisBody.position.copy(carData.center);
            var car = this.phyCar = new RaycastVehicle(chassisBody);
            car.maxSpeed = carData.MaxSpeed;
            // 前轮，方向
            options.isFrontWheel = true;
            carData.flpos.vsub(carData.center, options.chassisConnectionPointLocal);
            car.addWheel(options);
            carData.frpos.vsub(carData.center, options.chassisConnectionPointLocal);
            car.addWheel(options);
            // 后轮，动力
            options.isFrontWheel = false;
            carData.rlpos.vsub(carData.center, options.chassisConnectionPointLocal);
            car.addWheel(options);
            carData.rrpos.vsub(carData.center, options.chassisConnectionPointLocal);
            car.addWheel(options);
            this.wheelsOffQuat = [new Quaternion(), new Quaternion(), new Quaternion(), new Quaternion()];
            this.wheelBrake.length = car.wheelInfos.length;
            car.addToWorld(this.world);
            this.world.addEventListener('postStep', () => {
                this.updatePose();
            });
            if (renderModel) {
                this.onModelLoaded(renderModel, false);
            }
            else {
                // 加载渲染对象
                data.modelUrl && Laya.Sprite3D.load(data.modelUrl, Laya.Handler.create(this, this.onModelLoaded));
            }
        }
        /** 获得当前速度，单位是Km/H */
        getSpeed() {
            return this.phyCar.currentVehicleSpeedKmHour;
        }
        onModelLoaded(model, addtoSce = true) {
            if (addtoSce)
                this.scene3D.addChild(model); //TODO
            let dt = this.carData;
            let chassis = model.getChildByName(dt.chassisNode);
            let wheelfl = model.getChildByName(dt.wheelflNode);
            let wheelfr = model.getChildByName(dt.wheelfrNode);
            let wheelrl = model.getChildByName(dt.wheelrlNode);
            let wheelrr = model.getChildByName(dt.wheelrrNode);
            this.chassis = chassis;
            this.wheels[0] = wheelfl;
            this.wheels[1] = wheelfr;
            this.wheels[2] = wheelrl;
            this.wheels[3] = wheelrr;
            // 计算偏移。 
            // 车身主偏移。在物理和显示重合的情况下，显示的旋转
            let rquat = chassis.transform.rotation;
            this.chassisoffq.set(rquat.x, rquat.y, rquat.z, rquat.w);
            let offq = this.wheelsOffQuat[0];
            rquat = wheelfl.transform.rotation;
            offq.set(rquat.x, rquat.y, rquat.z, rquat.w);
            offq = this.wheelsOffQuat[1];
            rquat = wheelfr.transform.rotation;
            offq.set(rquat.x, rquat.y, rquat.z, rquat.w);
            offq = this.wheelsOffQuat[2];
            rquat = wheelrl.transform.rotation;
            offq.set(rquat.x, rquat.y, rquat.z, rquat.w);
            offq = this.wheelsOffQuat[3];
            rquat = wheelrr.transform.rotation;
            offq.set(rquat.x, rquat.y, rquat.z, rquat.w);
        }
        enable() {
        }
        // 加油前进
        accel(k) {
            let maxForce = this.carData.DanLunLaLi;
            this.phyCar.applyEngineForce(-maxForce * k, 2);
            this.phyCar.applyEngineForce(-maxForce * k, 3);
        }
        // 后退
        reversing(k) {
            let maxForce = this.carData.DanLunLaLi;
            this.phyCar.applyEngineForce(maxForce * k, 2);
            this.phyCar.applyEngineForce(maxForce * k, 3);
        }
        // 方向盘。v=0是直行。单位是弧度
        steer(v, isDeg = false) {
            if (isDeg) {
                v = v * Math.PI / 180;
            }
            this.phyCar.setSteeringValue(v, 0);
            this.phyCar.setSteeringValue(v, 1);
        }
        // 手刹
        handbrake(f) {
            if (f == null || f == undefined) {
                f = this.carData.ShouShaLi;
            }
            this.phyCar.setBrake(f, 2);
            this.phyCar.setBrake(f, 3);
        }
        // 刹车
        brake(b) {
            if (b == this.isBraking)
                return;
            this.isBraking = b;
            let phy = this.phyCar;
            let n = this.wheelBrake.length;
            for (let i = 0; i < n; i++) {
                let tn = this.wheelBrake[i];
                if (tn) {
                    tn.clear();
                }
                else {
                    tn = this.wheelBrake[i] = new Laya.Tween();
                }
            }
            if (b) {
                let force = carData.JiaoShaLi;
                for (let i = 0; i < n; i++) {
                    let tn = this.wheelBrake[i];
                    tn.to(phy.wheelInfos[i], { brake: force }, 2000, Laya.Ease.linearInOut);
                }
            }
            else {
                phy.setBrake(0, 0);
                phy.setBrake(0, 1);
                phy.setBrake(0, 2);
                phy.setBrake(0, 3);
            }
        }
        updatePose() {
            let car = this.phyCar;
            if (this.chassis) {
                let phypos = car.chassisBody.position;
                let phyquat = car.chassisBody.quaternion;
                let rpos = this.chassis.transform.position;
                let rquat = this.chassis.transform.rotation;
                let poff = carData.center;
                var npoff = Car.tmpV1;
                phyquat.vmult(poff, npoff);
                rpos.setValue(phypos.x - npoff.x, phypos.y - npoff.y, phypos.z - npoff.z);
                this.chassis.transform.position = rpos;
                phyquat.mult(this.chassisoffq, tempQ);
                rquat.x = tempQ.x;
                rquat.y = tempQ.y;
                rquat.z = tempQ.z;
                rquat.w = tempQ.w;
                this.chassis.transform.rotation = rquat;
                if (this.onUpdatePoseEnd) {
                    this.onUpdatePoseEnd(phypos, phyquat);
                }
            }
            for (var i = 0; i < car.wheelInfos.length; i++) {
                let wheelr = this.wheels[i];
                if (!wheelr)
                    continue;
                let wheeloffq = this.wheelsOffQuat[i];
                car.updateWheelTransform(i);
                var t = car.wheelInfos[i].worldTransform;
                let phypos = t.position;
                let phyquat = t.quaternion;
                let rtranns = wheelr.transform;
                let rpos = rtranns.position;
                let rquat = rtranns.rotation;
                rpos.setValue(phypos.x, phypos.y, phypos.z);
                rtranns.position = rpos;
                phyquat.mult(wheeloffq, tempQ);
                rquat.x = tempQ.x;
                rquat.y = tempQ.y;
                rquat.z = tempQ.z;
                rquat.w = tempQ.w;
                rtranns.rotation = rquat;
                let wheelinfo = car.wheelInfos[i];
                if (wheelinfo.sliding) {
                    this.wheelstrackslid.push(wheelinfo.raycastResult.hitPointWorld.clone());
                    if (this.wheelstrackslid.length > this.tracklen) {
                        this.wheelstrackslid.shift();
                    }
                }
                else {
                    if (wheelinfo.isInContact && this.showTrack) {
                        if (wheelinfo.isFrontWheel) {
                            this.wheelstrackf.push(wheelinfo.raycastResult.hitPointWorld.clone());
                            if (this.wheelstrackf.length > this.tracklen) {
                                this.wheelstrackf.shift();
                            }
                        }
                        else {
                            this.wheelstrackr.push(wheelinfo.raycastResult.hitPointWorld.clone());
                            if (this.wheelstrackr.length > this.tracklen) {
                                this.wheelstrackr.shift();
                            }
                        }
                    }
                }
                /*
                var wheelBody = wheelBodies[i];
                wheelBody.position.copy(t.position);
                wheelBody.quaternion.copy(t.quaternion);
                */
            }
            let phyr = this.world.phyRender;
            if (this.showTrack) {
                this.wheelstrackf.forEach((v) => {
                    phyr.addVec(v.x, v.y, v.z, 0, .1, 0, 0xff6666);
                });
                this.wheelstrackr.forEach((v) => {
                    phyr.addVec(v.x, v.y, v.z, 0, .1, 0, 0x66ff66);
                });
                this.wheelstrackslid.forEach((v) => {
                    phyr.addVec(v.x, v.y, v.z, 0, .2, 0, 0x000000);
                });
            }
            if (this.showCenter)
                phyr.addPoint1(this.phyCar.chassisBody.position, 0xff0000);
        }
        onkeyEvent(e, down) {
            switch (e.keyCode) {
                case 38: // forward
                    this.op_acc = down;
                    break;
                case 40: // backward
                    this.op_rev = down;
                    break;
                case 66: // b
                    this.op_brake = down;
                    break;
                case 'V'.charCodeAt(0):
                    this.op_handbrake = down;
                    break;
                case 39: // right
                    this.op_steerRight = down;
                    break;
                case 37: // left
                    this.op_steerLeft = down;
                    break;
                case 'R'.charCodeAt(0):
                    this.phyCar.chassisBody.quaternion.set(0, 0, 0, 1);
                    break;
                case ' '.charCodeAt(0):
                    /*
                    car.wheelInfos[0].frictionSlip=0.01;
                    car.wheelInfos[1].frictionSlip=0.01;
                    car.wheelInfos[2].frictionSlip=0.01;
                    car.wheelInfos[3].frictionSlip=0.01;
                    */
                    break;
                default:
                    break;
            }
            this.updateCtrl();
        }
        updateCtrl() {
            var maxSteerVal = 0.5;
            if (this.op_steerLeft) {
                this.steer(maxSteerVal);
            }
            else if (this.op_steerRight) {
                this.steer(-maxSteerVal);
            }
            else {
                this.steer(0);
            }
            if (this.op_acc) {
                this.accel(1);
            }
            else if (this.op_rev) {
                this.reversing(1);
            }
            else {
                this.accel(0);
            }
            if (this.op_brake) {
                this.brake(true);
            }
            else if (this.op_handbrake) {
                this.handbrake(null);
            }
            else {
                this.brake(false);
            }
        }
    }
    Car.tmpV1 = new Vec3();

    var box_to_sphere = new Vec3();
    var hitbox_tmpVec1 = new Vec3();
    var boxInvQ = new Quaternion();
    var ptdist = new Vec3();
    var qtoax_x = new Vec3();
    var qtoax_y = new Vec3();
    var qtoax_z = new Vec3();
    var boxFaceNorml = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0),
        new Vec3(0, 1, 0), new Vec3(0, -1, 0),
        new Vec3(0, 0, 1), new Vec3(0, 0, -1)];
    var boxFaceDist = [0, 0, 0, 0, 0, 0];
    var extsubpos = new Vec3();
    /**
     * Spherical shape
     * @class Sphere
     * @constructor
     * @extends Shape
     * @param {Number} radius The radius of the sphere, a non-negative number.
     * @author schteppe / http://github.com/schteppe
     */
    class Sphere extends Shape {
        constructor(radius) {
            super();
            this.radius = 1;
            this.oriRadius = 1; // 原始半径，用来应用缩放的
            this.margin = radius;
            this.type = 1 /* SPHERE */;
            this.radius = radius !== undefined ? radius : 1.0;
            this.oriRadius = this.radius;
            if (this.radius < 0) {
                throw new Error('The sphere radius cannot be negative.');
            }
            this.updateBndSphR();
        }
        onPreNarrowpase(stepId, pos, quat) { }
        calculateLocalInertia(mass, target = new Vec3()) {
            const I = 2.0 * mass * this.radius * this.radius / 5.0;
            target.x = I;
            target.y = I;
            target.z = I;
            return target;
        }
        volume() {
            return 4.0 * Math.PI * this.radius / 3.0;
        }
        updateBndSphR() {
            this.boundSphR = this.radius;
        }
        calculateWorldAABB(pos, quat, min, max) {
            const r = this.radius;
            min.x = pos.x - r;
            max.x = pos.x + r;
            min.y = pos.y - r;
            max.y = pos.y + r;
            min.z = pos.z - r;
            max.z = pos.z + r;
        }
        /** 只取最大的 */
        setScale(x, y, z, recalcMassProp = false) {
            let s = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
            this.radius = this.oriRadius * s;
        }
        /**
         *
         * @param pos1
         * @param other
         * @param pos2
         * @param hitpos 	自己身上的全局碰撞点
         * @param hitnorm 	把自己推开的方向，即对方的法线
         * @param otherhitpos 对方的全局碰撞点
         * @return 返回碰撞深度，<0表示没有碰撞
         */
        static SpherehitSphere(r1, pos1, r2, pos2, hitpos, hitnorm, otherhitpos, justtest) {
            let p1 = pos1;
            let p2 = pos2;
            let dx = p1.x - p2.x; // 从对方指向自己
            let dy = p1.y - p2.y;
            let dz = p1.z - p2.z;
            let r = r1 + r2;
            let rr = r * r;
            let dd = dx * dx + dy * dy + dz * dz;
            let deep = -1;
            if (rr < dd)
                return -1;
            if (justtest)
                return 1;
            if (dd < 1e-6) { //重合了
                deep = r;
                if (hitnorm)
                    hitnorm.set(0, 1, 0);
                if (hitpos)
                    hitpos.set(p1.x, p1.y - r1, p1.z);
                if (otherhitpos)
                    otherhitpos.set(p2.x, p2.y + r2, p2.z);
                return deep;
            }
            let d = Math.sqrt(dd);
            deep = r - d;
            let nx = dx / d;
            let ny = dy / d;
            let nz = dz / d;
            if (hitpos) {
                hitpos.set(p1.x - nx * r1, p1.y - ny * r1, p1.z - nz * r1);
            }
            if (hitnorm) {
                hitnorm.set(nx, ny, nz);
            }
            if (otherhitpos) {
                otherhitpos.set(p2.x + nx * r2, p2.y + ny * r2, p2.z + nz * r2);
            }
            return d;
        }
        /**
         * sphere和box的碰撞检测
         * @param myPos
         * @param boxHalf
         * @param boxPos
         * @param boxQuat
         * @param hitPos 	球的碰撞点
         * @param hitpos1 	box的 碰撞点
         * @param hitNormal 把球推开的方向，即box的法线
         * @param justtest
         *
         * TODO 可以考虑用点到面的距离来实现，可能会简单一些
         * d:number[6]=signeddist(faces,P)
         * 外部距离:
         * 	+d:number[] = d 中>0的
         * dist = ||+d||  // 最多是三个平方和的开方
         * 内部距离：
         * 	最大的一个，或者abs后最小的一个
         */
        static hitBox(myPos, R, boxHalf, boxPos, boxQuat, hitPos, hitpos1, hitNormal, justtest) {
            // 转到盒子空间
            myPos.vsub(boxPos, box_to_sphere);
            let invQbox = boxInvQ;
            boxQuat.conjugate(invQbox); // 求逆
            invQbox.vmult(box_to_sphere, box_to_sphere); //把圆心转到box空间
            //判断球心在哪个区间
            let half = boxHalf;
            let wx = half.x;
            let wy = half.y;
            let wz = half.z;
            let x = box_to_sphere.x;
            let y = box_to_sphere.y;
            let z = box_to_sphere.z;
            let nearpt = hitbox_tmpVec1;
            let setpt = false;
            /** 碰撞深度，即推开这个距离就能解除碰撞 */
            let deep = -1;
            //debug
            let ax = qtoax_x;
            let ay = qtoax_y;
            let az = qtoax_z;
            boxQuat.vmultAxis(ax, ay, az); //TODO 可以用四元数转mat3来做
            /*
            let phyr = PhyRender.inst;
            phyr.addVec1(boxPos,ax,10,0xff0000);
            phyr.addVec1(boxPos,ay,10, 0x00ff00);
            phyr.addVec1(boxPos,az,10, 0x0000ff);
            */
            //debug
            if (x < -wx) { // x 轴左侧
                if (y < -wy) { // y轴下侧
                    if (z < -wz) {
                        //min点 球心到min的距离<R则碰撞
                        nearpt.set(-wx, -wy, -wz);
                        setpt = true;
                    }
                    else if (z >= -wz && z <= wz) {
                        //-x,-y,-z -> -x,-y, z 线段 。-z到z
                        nearpt.set(-wx, -wy, z);
                        setpt = true;
                    }
                    else {
                        // -x,-y, z点
                        nearpt.set(-wx, -wy, wz);
                        setpt = true;
                    }
                }
                else if (y >= -wy && y <= wy) { // y 中间
                    if (z < -wz) {
                        //-x,-y,-z,   -x,y,-z 线段
                        nearpt.set(-wx, y, -wz);
                        setpt = true;
                    }
                    else if (z >= -wz && z <= wz) {
                        // -x 面
                        deep = x + R + wx;
                        if (deep > 0) {
                            if (justtest)
                                return 1;
                            hitNormal.set(-ax.x, -ax.y, -ax.z);
                            myPos.addScaledVector(-R, hitNormal, hitPos);
                            myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
                            return deep;
                        }
                        else {
                            return -1;
                        }
                    }
                    else {
                        // -x,-y,z -> -x,y,z 线段	-y -> y
                        nearpt.set(-wx, y, wz);
                        setpt = true;
                    }
                }
                else {
                    if (z < -wz) {
                        // -x,y,-z 点
                        nearpt.set(-wx, wy, -wz);
                        setpt = true;
                    }
                    else if (z >= -wz && z <= wz) {
                        //-x,y,-z -> -x,y,z 线段
                        nearpt.set(-wx, wy, z);
                        setpt = true;
                    }
                    else {
                        //-x,y,z点
                        nearpt.set(-wx, wy, wz);
                        setpt = true;
                    }
                }
            }
            else if (x >= -wx && x <= wx) {
                if (y < -wy) {
                    if (z < -wz) {
                        //-x,-y,-z   x,-y,-z 线段
                        nearpt.set(x, -wy, -wz);
                        setpt = true;
                    }
                    else if (z >= -wz && z <= wz) {
                        //-y面
                        deep = y + R + wy;
                        if (deep > 0) {
                            //碰撞
                            if (justtest)
                                return 1;
                            hitNormal.set(-ay.x, -ay.y, -ay.z);
                            myPos.addScaledVector(-R, hitNormal, hitPos);
                            myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
                            return deep;
                        }
                        else {
                            return -1;
                        }
                    }
                    else {
                        // -x,-y,z -> x,-y,z 线段
                        nearpt.set(x, -wy, wz);
                        setpt = true;
                    }
                }
                else if (y >= -wy && y <= wy) {
                    if (z < -wz) {
                        // -z 面
                        deep = z + R + wz;
                        if (deep > 0) {
                            if (justtest)
                                return 1;
                            hitNormal.set(-az.x, -az.y, -az.z);
                            myPos.addScaledVector(-R, hitNormal, hitPos);
                            myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
                            return deep;
                        }
                        else {
                            return -1;
                        }
                    }
                    else if (z >= -wz && z <= wz) {
                        // box内部
                        let minidist = 100000;
                        let miniface = -1;
                        for (let fi = 0; fi < 6; fi++) {
                            box_to_sphere.vsub(half, extsubpos);
                            let dist = boxFaceDist[fi] = Math.abs(extsubpos.dot(boxFaceNorml[fi])); // dot(ext,norm) - dot(mypos,norm)
                            if (minidist > dist) {
                                minidist = dist;
                                miniface = fi;
                            }
                        }
                        if (miniface >= 0 && miniface < 6) {
                            deep = minidist + R;
                            //hitNormal.copy(boxFaceNorml[miniface]);
                            boxQuat.vmult(boxFaceNorml[miniface], hitNormal);
                            myPos.addScaledVector(-R, hitNormal, hitPos);
                            myPos.addScaledVector(minidist, hitNormal, hitpos1);
                        }
                        return deep;
                        // kkk
                    }
                    else {
                        // +z 面
                        deep = wz - (z - R);
                        if (deep > 0) {
                            if (justtest)
                                return 1;
                            hitNormal.set(az.x, az.y, az.z);
                            myPos.addScaledVector(-R, hitNormal, hitPos);
                            myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
                            return deep;
                        }
                        else {
                            return -1;
                        }
                    }
                }
                else {
                    if (z < -wz) {
                        //-x,y,-z -> x,y,-z 线段
                        nearpt.set(x, wy, -wz);
                        setpt = true;
                    }
                    else if (z >= -wz && z <= wz) {
                        // +y 面
                        deep = wy - (y - R);
                        if (deep > 0) {
                            if (justtest)
                                return 1;
                            hitNormal.set(ay.x, ay.y, ay.z);
                            myPos.addScaledVector(-R, hitNormal, hitPos);
                            myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
                            return deep;
                        }
                        else {
                            return -1;
                        }
                    }
                    else {
                        // -x,y,z -> x,y,z 线段
                        nearpt.set(x, wy, wz);
                        setpt = true;
                    }
                }
            }
            else {
                if (y < -wy) {
                    if (z < -wz) {
                        //x,-y,-z 点
                        setpt = true;
                        nearpt.set(wx, -wy, -wz);
                    }
                    else if (z >= -wz && z <= wz) {
                        //x,-y,-z -> x,-y,z 线段
                        nearpt.set(wx, -wy, z);
                        setpt = true;
                    }
                    else {
                        // x,-y,z 点
                        nearpt.set(wx, -wy, wz);
                        setpt = true;
                    }
                }
                else if (y >= -wy && y <= wy) {
                    if (z < -wz) {
                        //x,-y,-z  ->  x,y,-z 线段
                        nearpt.set(wx, y, -wz);
                        setpt = true;
                    }
                    else if (z >= -wz && z <= wz) {
                        // +x 面
                        deep = wx - (x - R);
                        if (deep > 0) {
                            if (justtest)
                                return 1;
                            hitNormal.set(ax.x, ax.y, ax.z);
                            myPos.addScaledVector(-R, hitNormal, hitPos);
                            myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
                            return deep;
                        }
                        else {
                            return -1;
                        }
                    }
                    else {
                        // x,-y,z  -> x,y,z 线段
                        nearpt.set(wx, y, wz);
                        setpt = true;
                    }
                }
                else {
                    if (z < -wz) {
                        //x,y,-z 点
                        nearpt.set(wx, wy, -wz);
                        setpt = true;
                    }
                    else if (z >= -wz && z <= wz) {
                        //x,y,-z  -> x,y,z 线段
                        nearpt.set(wx, wy, z);
                        setpt = true;
                    }
                    else {
                        //max点
                        nearpt.set(wx, wy, wz);
                        setpt = true;
                    }
                }
            }
            // 把nearpt转回世界空间
            if (!setpt)
                return -1;
            boxQuat.vmult(nearpt, nearpt);
            nearpt.vadd(boxPos, nearpt);
            // 计算距离和碰撞点
            myPos.vsub(nearpt, ptdist); // ptdits 指向球心
            let l2 = ptdist.lengthSquared();
            if (l2 > R * R) {
                return -1;
            }
            let l = Math.sqrt(l2);
            deep = R - l;
            let invl = 1 / l;
            ptdist.scale(invl, hitNormal);
            myPos.addScaledVector(-R, hitNormal, hitPos);
            hitpos1.copy(nearpt);
            //console.log('deep',deep)
            return deep;
        }
        hitVoxel(myPos, voxel, voxPos, voxQuat, hitpoints, justtest) {
            // 只需与外壳
            /**
             * 与所有的格子比较，取正的最小距离，法线是当前距离的法线
             * 由于voxel可能是凹的，可能会有多个点
             */
            // 把voxel转换到sphere空间
            let rPos = hitVoxelTmpVec1$1;
            voxPos.vsub(myPos, rPos);
            /*
            // 先用最笨的方法验证流程
            let voxdt = voxel.voxData.data;
            if(!voxdt)
                return false;
            let gridw = voxel.gridw;//.voxData.gridsz;
            let r = gridw / 2;
            let min = voxel.voxData.aabbmin;    //原始包围盒
            //let max = voxel.voxData.aabbmax;
            let tmpV = new Vec3();  //xyz格子坐标
            let hitpos = new Vec3();
            let hitpos1 = new Vec3();
            let hitnorm = new Vec3();
            let hit = false;

            for (let i = 0, sz = voxdt.length; i < sz; i++) {
                let dt = voxdt[i];
                // 把xyz映射到box空间
                tmpV.set(dt.x + 0.5, dt.y + 0.5, dt.z + 0.5);// 在格子的中心
                min.addScaledVector(gridw, tmpV, tmpV);// tmpV = min + (vox.xyz+0.5)*gridw
                //tmpV现在是在vox空间内的一个点
                voxQuat.vmult(tmpV, tmpV);//TODO 直接用矩阵的方向
                tmpV.vadd(voxPos, tmpV);
                //tmpV现在是box空间的点了，计算碰撞信息
                // 这里的法线是推开自己的
                let deep = Sphere.SpherehitSphere(this.radius, myPos, r, tmpV, hitpos, hitnorm, hitpos1, justtest);
                if (deep < 0)
                    continue;
                if (justtest)
                    return true;
                //转换回世界空间
                let hi = new HitPointInfo();
                hi.posi.copy(hitpos);
                hi.posj.copy(hitpos1);
                hi.normal.copy(hitnorm);
                hitpoints.push(hi);
                hit = true;
            }
            return hit;
            */
            return false;
        }
        /**
         *
         * @param hitpoints
         * @param voxPos
         * @param voxQuat
         * @param scale   voxel 的缩放
         */
        _voxHitInfoToWorld(hitpoints, voxPos, voxQuat, scale) {
            let hl = hitpoints.length;
            for (let i = 0; i < hl; i++) {
                let hi = hitpoints.data[i];
                voxQuat.vmult(hi.posi, hi.posi);
                if (scale) {
                    hi.posi.vmul(scale, hi.posi);
                }
                voxPos.vadd(hi.posi, hi.posi);
                voxQuat.vmult(hi.posj, hi.posj);
                if (scale) {
                    hi.posj.vmul(scale, hi.posj);
                }
                voxPos.vadd(hi.posj, hi.posj);
                voxQuat.vmult(hi.normal, hi.normal);
                // 法线不用缩放,除非有镜像
                if (scale) {
                    if (scale.x < 0)
                        hi.normal.x *= -1;
                    if (scale.y < 0)
                        hi.normal.y *= -1;
                    if (scale.z < 0)
                        hi.normal.z *= -1;
                }
            }
        }
        // 球主要检测6个方向是否正面碰撞，非正面碰撞的，每个格子元素用球模拟
        // hiti 球的碰撞点， hitj voxel的碰撞点
        hitVoxel1(myPos, voxel, voxPos, voxQuat, hitpoints, justtest) {
            //DEBUG
            //myPos.x = -0.47377423035846794;
            //myPos.y = -0.028011225545816587;
            //myPos.z = 3.8401824198470447;
            //DEBUG
            hitpoints.length = 0;
            let scale = voxel.scale;
            let invScale = voxel.invScale;
            let R = this.radius;
            let voxmin = voxel.voxData.aabbmin; // voxel.aabbmin;  要用原始aabb，因为计算相对
            let voxmax = voxel.voxData.aabbmax; // voxel.aabbmax;
            // 把球转换到voxel空间
            /** 球在vox空间的坐标 */
            let sphInVox = hitVoxelTmpVec1$1;
            myPos.vsub(voxPos, sphInVox);
            // 旋转相对位置
            let invQ = hitvoxelInvQ;
            voxQuat.conjugate(invQ);
            invQ.vmult(sphInVox, sphInVox);
            // 缩放
            if (invScale) {
                sphInVox.vmul(invScale, sphInVox);
                R /= voxel.maxScale; // 半径也要修改
            }
            let gridw = voxel.gridw;
            let voxr = gridw / 2;
            // 计算球占用的范围
            let sphminx = sphInVox.x - R;
            let sphminy = sphInVox.y - R;
            let sphminz = sphInVox.z - R;
            let sphmaxx = sphInVox.x + R;
            let sphmaxy = sphInVox.y + R;
            let sphmaxz = sphInVox.z + R;
            // 球心所在格子
            let cgridx = Math.floor((sphInVox.x - voxmin.x) / gridw);
            let cgridy = Math.floor((sphInVox.y - voxmin.y) / gridw);
            let cgridz = Math.floor((sphInVox.z - voxmin.z) / gridw);
            let voxszx = voxel.dataxsize;
            let voxszy = voxel.dataysize;
            let voxszz = voxel.datazsize;
            let cgridxvalid = cgridx >= 0 && cgridx < voxszx;
            let cgridyvalid = cgridy >= 0 && cgridy < voxszy;
            let cgridzvalid = cgridz >= 0 && cgridz < voxszz;
            // 球的包围盒的格子范围
            let gridminx = Math.floor((sphminx - voxmin.x) / gridw);
            if (gridminx >= voxszx)
                return false;
            if (gridminx < 0)
                gridminx = 0;
            let gridminy = Math.floor((sphminy - voxmin.y) / gridw);
            if (gridminy >= voxszy)
                return false;
            if (gridminy < 0)
                gridminy = 0;
            let gridminz = Math.floor((sphminz - voxmin.z) / gridw);
            if (gridminz >= voxszz)
                return false;
            if (gridminz < 0)
                gridminz = 0;
            let gridmaxx = Math.floor((sphmaxx - voxmin.x) / gridw);
            if (gridmaxx < 0)
                return false;
            if (gridmaxx >= voxszx)
                gridmaxx = voxszx - 1;
            let gridmaxy = Math.floor((sphmaxy - voxmin.y) / gridw);
            if (gridmaxy < 0)
                return false;
            if (gridmaxy >= voxszy)
                gridmaxy = voxszy - 1;
            let gridmaxz = Math.floor((sphmaxz - voxmin.z) / gridw);
            if (gridmaxz < 0)
                return false;
            if (gridmaxz >= voxszz)
                gridmaxz = voxszz - 1;
            let i = 0;
            // 如果球形已经进入盒子了，找一个最近面出来
            if (cgridxvalid && cgridyvalid && cgridzvalid && voxel.getVox(cgridx, cgridy, cgridz)) {
                if (justtest)
                    return true;
                // 如果球心已经撞到实心的格子中了，朝着6个方向寻找最近出点
                // 如果边缘也是实心的话的处理
                let velInVox = hitVoxelTmpVel;
                let sphvel = this.body.velocity;
                //console.log('球进入格子了',sphvel.x,sphvel.y,sphvel.z)
                // 把球的速度转换到vox空间 
                if (scale) {
                    if (scale.x < 0)
                        velInVox.x *= -1;
                    if (scale.y < 0)
                        velInVox.y *= -1;
                    if (scale.z < 0)
                        velInVox.z *= -1;
                }
                invQ.vmult(sphvel, velInVox);
                let NotCheckSphVel = false;
                let mindist = 1e6;
                let mindistid = 0;
                let dist1 = 0;
                // x正方向
                if (NotCheckSphVel || velInVox.x <= 0) {
                    dist1 = Math.abs(voxmax.x - sphInVox.x); // 先假设是到aabb的距离
                    if (dist1 < mindist) {
                        mindist = dist1;
                        mindistid = 0;
                    }
                    // 然后从当前格子向后（相对于速度）遍历，找到第一个空的，这就是这个速度方向的最近的*外*面
                    for (i = cgridx + 1; i < voxszx; i++) {
                        if (!voxel.getVox(i, cgridy, cgridz)) {
                            mindist = gridw * i + voxmin.x - sphInVox.x;
                            break;
                        }
                    }
                }
                // x负方向
                if (NotCheckSphVel || velInVox.x >= 0) {
                    dist1 = Math.abs(sphInVox.x - voxmin.x);
                    if (dist1 < mindist) {
                        mindist = dist1;
                        mindistid = 1;
                    }
                    for (i = cgridx - 1; i >= 0; i--) {
                        if (!voxel.getVox(i, cgridy, cgridz)) {
                            dist1 = sphInVox.x - (gridw * (i + 1) + voxmin.x);
                            if (dist1 < mindist) {
                                mindist = dist1;
                                mindistid = 1;
                            }
                            break;
                        }
                    }
                }
                //y+
                if (NotCheckSphVel || velInVox.y <= 0) {
                    dist1 = Math.abs(voxmax.y - sphInVox.y);
                    if (dist1 < mindist) {
                        mindist = dist1;
                        mindistid = 2;
                    }
                    for (i = cgridy + 1; i < voxszy; i++) {
                        if (!voxel.getVox(cgridx, i, cgridz)) {
                            dist1 = i * gridw + voxmin.y - sphInVox.y;
                            if (dist1 < mindist) {
                                mindist = dist1;
                                mindistid = 2;
                            }
                            break; // 找到空的以后就要停止
                        }
                    }
                }
                //y-
                if (NotCheckSphVel || velInVox.y >= 0) {
                    dist1 = Math.abs(sphInVox.y - voxmin.y);
                    if (dist1 < mindist) {
                        mindist = dist1;
                        mindistid = 3;
                    }
                    for (i = cgridy - 1; i >= 0; i--) {
                        if (!voxel.getVox(cgridx, i, cgridy)) {
                            dist1 = sphInVox.y - ((i + 1) * gridw + voxmin.y);
                            if (dist1 < mindist) {
                                mindist = dist1;
                                mindistid = 3;
                            }
                            break;
                        }
                    }
                }
                //z+
                if (NotCheckSphVel || velInVox.z <= 0) {
                    dist1 = Math.abs(voxmax.z - sphInVox.z);
                    if (dist1 < mindist) {
                        mindist = dist1;
                        mindistid = 4;
                    }
                    for (i = cgridz + 1; i < voxszz; i++) {
                        if (!voxel.getVox(cgridx, cgridy, i)) {
                            dist1 = i * gridw + voxmin.z - sphInVox.z;
                            if (dist1 < mindist) {
                                mindist = dist1;
                                mindistid = 4;
                            }
                            break;
                        }
                    }
                }
                //z-
                if (NotCheckSphVel || velInVox.z >= 0) {
                    dist1 = Math.abs(sphInVox.z - voxmin.z);
                    if (dist1 < mindist) {
                        mindist = dist1;
                        mindistid = 5;
                    }
                    for (i = cgridz - 1; i >= 0; i--) {
                        if (!voxel.getVox(cgridx, cgridy, i)) {
                            dist1 = sphInVox.z - ((i + 1) * gridw + voxmin.z);
                            if (dist1 < mindist) {
                                mindist = dist1;
                                mindistid = 5;
                            }
                            break;
                        }
                    }
                }
                let hitinfo = hitpoints.getnew();
                let posi = hitinfo.posi;
                let posj = hitinfo.posj;
                let norm = hitinfo.normal;
                switch (mindistid) {
                    case 0: //想从+x弹出
                        posi.set(sphminx, sphInVox.y, sphInVox.z);
                        posj.set(sphInVox.x + mindist, sphInVox.y, sphInVox.z); //不能加R，碰撞点就是sphInVox+dist
                        norm.set(1, 0, 0);
                        break;
                    case 1: //想从-x弹出
                        posi.set(sphmaxx, sphInVox.y, sphInVox.z);
                        posj.set(sphInVox.x - mindist, sphInVox.y, sphInVox.z);
                        norm.set(-1, 0, 0);
                        break;
                    case 2: //+y
                        posi.set(sphInVox.x, sphminy, sphInVox.z);
                        posj.set(sphInVox.x, sphInVox.y + mindist, sphInVox.z);
                        norm.set(0, 1, 0);
                        break;
                    case 3: //-y
                        posi.set(sphInVox.x, sphmaxy, sphInVox.z);
                        posj.set(sphInVox.x, sphInVox.y - mindist, sphInVox.z);
                        norm.set(0, -1, 0);
                        break;
                    case 4: //+z
                        posi.set(sphInVox.x, sphInVox.y, sphminz);
                        posj.set(sphInVox.x, sphInVox.y, sphInVox.z + mindist);
                        norm.set(0, 0, 1);
                        break;
                    case 5: //-z
                        posi.set(sphInVox.x, sphInVox.y, sphmaxz);
                        posj.set(sphInVox.x, sphInVox.y, sphInVox.z - mindist);
                        norm.set(0, 0, -1);
                        break;
                }
                // 转换到世界空间
                this._voxHitInfoToWorld(hitpoints, voxPos, voxQuat, scale);
            }
            else { // 如果球心在外面，先进一步缩小范围
                // 注意这时候包围盒检测已经通过了，所以不用再做包围盒相关检测
                //maxx
                // 判断x的话，必须yz都在有效范围内，否则不会相交
                //console.log('waimian')
                //console.log('spherepos:', myPos.x, myPos.y, myPos.z);
                if (cgridyvalid && cgridzvalid) {
                    for (i = Math.max(cgridx + 1, gridminx); i <= gridmaxx; i++) { //cgridx必须 从有效点开始，但是又不能修改cgridx，因为下面要用，所以用max
                        if (voxel.getVox(i, cgridy, cgridz)) {
                            // 添加碰撞信息 注意这时候是voxel空间的
                            let hitinfo = hitpoints.getnew();
                            hitinfo.posi.set(sphmaxx, sphInVox.y, sphInVox.z); // 球的碰撞点
                            hitinfo.posj.set(gridw * i + voxmin.x, sphInVox.y, sphInVox.z);
                            hitinfo.normal.set(-1, 0, 0); // 推开球
                            gridmaxx = i - 1;
                            if (justtest)
                                return true;
                            break;
                        }
                    }
                    //minx
                    for (i = Math.min(cgridx - 1, gridmaxx); i >= gridminx; i--) {
                        if (voxel.getVox(i, cgridy, cgridz)) {
                            let hitinfo = hitpoints.getnew();
                            hitinfo.posi.set(sphminx, sphInVox.y, sphInVox.z); // 球的碰撞点
                            hitinfo.posj.set(gridw * (i + 1) + voxmin.x, sphInVox.y, sphInVox.z);
                            hitinfo.normal.set(1, 0, 0);
                            gridminx = i + 1;
                            if (justtest)
                                return true;
                            break;
                        }
                    }
                }
                //maxy
                if (cgridxvalid && cgridzvalid) {
                    for (i = Math.max(cgridy + 1, gridminy); i <= gridmaxy; i++) {
                        if (voxel.getVox(cgridx, i, cgridz)) {
                            let hitinfo = hitpoints.getnew();
                            hitinfo.posi.set(sphInVox.x, sphmaxy, sphInVox.z); // 球的碰撞点
                            hitinfo.posj.set(sphInVox.x, gridw * i + voxmin.y, sphInVox.z);
                            hitinfo.normal.set(0, -1, 0);
                            gridmaxy = i - 1;
                            if (justtest)
                                return true;
                            break;
                        }
                    }
                    //miny
                    for (i = Math.min(cgridy - 1, gridmaxy); i >= gridminy; i--) {
                        if (voxel.getVox(cgridx, i, cgridz)) {
                            let hitinfo = hitpoints.getnew();
                            hitinfo.posi.set(sphInVox.x, sphminy, sphInVox.z); // 球的碰撞点
                            hitinfo.posj.set(sphInVox.x, gridw * (i + 1) + voxmin.y, sphInVox.z);
                            hitinfo.normal.set(0, 1, 0);
                            gridminy = i + 1;
                            if (justtest)
                                return true;
                            break;
                        }
                    }
                }
                if (cgridxvalid && cgridyvalid) {
                    //maxz
                    for (i = Math.max(cgridz + 1, gridminz); i <= gridmaxz; i++) {
                        if (voxel.getVox(cgridx, cgridy, i)) {
                            let hitinfo = hitpoints.getnew();
                            hitinfo.posi.set(sphInVox.x, sphInVox.y, sphmaxz); // 球的碰撞点
                            hitinfo.posj.set(sphInVox.x, sphInVox.y, gridw * i + voxmin.z);
                            hitinfo.normal.set(0, 0, -1);
                            gridmaxz = i - 1;
                            if (justtest)
                                return true;
                            break;
                        }
                    }
                    //minz 
                    for (i = Math.min(cgridz - 1, gridmaxz); i >= gridminz; i--) {
                        if (voxel.getVox(cgridx, cgridy, i)) {
                            let hitinfo = hitpoints.getnew();
                            hitinfo.posi.set(sphInVox.x, sphInVox.y, sphminz); // 球的碰撞点
                            hitinfo.posj.set(sphInVox.x, sphInVox.y, gridw * (i + 1) + voxmin.z);
                            hitinfo.normal.set(0, 0, 1);
                            gridminz = i + 1;
                            if (justtest)
                                return true;
                            break;
                        }
                    }
                }
                // 先把上面的碰撞转换到世界空间，因为下面用的是球的碰撞，都是在世界空间进行的
                this._voxHitInfoToWorld(hitpoints, voxPos, voxQuat, scale);
                /*
                let hl = hitpoints.length;
                for (i = 0; i < hl; i++) {
                    let hi = hitpoints.data[i];
                    voxQuat.vmult(hi.posi, hi.posi);
                    if(scale){
                        hi.posi.vmul(scale,hi.posi);
                    }
                    voxPos.vadd(hi.posi, hi.posi);

                    voxQuat.vmult(hi.posj, hi.posj);
                    if(scale){
                        hi.posj.vmul(scale,hi.posj);
                    }
                    voxPos.vadd(hi.posj, hi.posj);

                    voxQuat.vmult(hi.normal, hi.normal);
                    // 法线不用缩放,除非有镜像
                    if(scale) {
                        if(scale.x<0) hi.normal.x*=-1;
                        if(scale.y<0) hi.normal.y*=-1;
                        if(scale.z<0) hi.normal.z*=-1;
                    }
                }
                */
                let tmpV = hitVoxelTmpVec2;
                let hitpos = hitvoxHitPos1;
                let hitpos1 = hitVoxHitPos2;
                let hitnorm = hitVoxHitNorm;
                if (scale) {
                    // 要在世界空间碰撞，恢复一些数据
                    R = this.radius;
                    voxr = gridw / 2 * voxel.maxScale;
                }
                // 把缩小后的范围中的所有的格子当做球来处理
                for (let z = gridminz; z <= gridmaxz; z++) {
                    for (let y = gridminy; y <= gridmaxy; y++) {
                        for (let x = gridminx; x <= gridmaxx; x++) {
                            //TODO 上面检查的几个点就不用做了
                            if (voxel.getVox(x, y, z)) {
                                // 把xyz映射到box空间
                                tmpV.set(x + 0.5, y + 0.5, z + 0.5); // 在格子的中心
                                voxmin.addScaledVector(gridw, tmpV, tmpV); // tmpV = min + (vox.xyz+0.5)*gridw
                                if (scale) {
                                    tmpV.vmul(scale, tmpV); //缩放
                                }
                                //tmpV现在是在vox空间内的一个点
                                voxQuat.vmult(tmpV, tmpV); //TODO 直接用矩阵的方向
                                tmpV.vadd(voxPos, tmpV);
                                //tmpV现在是世界空间的点了，计算碰撞信息
                                // 这里的法线是推开自己的
                                let deep = Sphere.SpherehitSphere(R, myPos, voxr, tmpV, hitpos, hitnorm, hitpos1, justtest);
                                if (deep < 0)
                                    continue;
                                if (justtest)
                                    return true;
                                let hi = hitpoints.getnew();
                                hi.posi.copy(hitpos);
                                hi.posj.copy(hitpos1);
                                hi.normal.copy(hitnorm);
                            }
                        }
                    }
                }
            }
            //debug
            if (hitpoints.length > 0) {
                //console.log('hit num=', hitpoints.length);
                /*
                for (let i = 0; i < hitpoints.length; i++) {
                    let hi = hitpoints.data[i];
                    if (hi.posi.x < voxmin.x) {
                        debugger;
                    }
                }
                */
            }
            //debug
            return hitpoints.length > 0;
            //let lodnum = voxel.bitDataLod.length;
            // 根据自己的包围盒确定用那一层lod，lod主要是用来过滤空白的
            // 采用平面的方法，不要用点的方法
            // 根据球心的位置来决定遍历方向
            // 计算应该从什么lod开始
            //voxel.getLOD()
            // 怎么把碰撞分散到多帧中
            // 计算包围盒包含的voxel之中的所有的平面（补全），顶点，边
            // 某个方向如果碰撞点在平面下，则使用，多个平面取最深的
        }
    }
    var hitVoxelTmpVec1$1 = new Vec3();
    var hitVoxelInvScale = new Vec3();
    var hitVoxelTmpVec2 = new Vec3();
    var hitVoxelTmpVel = new Vec3();
    var hitvoxHitPos1 = new Vec3();
    var hitVoxHitPos2 = new Vec3();
    var hitVoxHitNorm = new Vec3();
    var hitvoxelInvQ = new Quaternion();

    /**
     * Simple vehicle helper class with spherical rigid body wheels.
     */
    class RigidVehicle {
        constructor(coordinateSystem, chassisBody) {
            this.wheelBodies = [];
            this.constraints = [];
            this.wheelAxes = [];
            this.wheelForces = [];
            this.coordinateSystem = coordinateSystem ? coordinateSystem.clone() : new Vec3(1, 2, 3);
            chassisBody && (this.chassisBody = chassisBody);
            if (!this.chassisBody) {
                // No chassis body given. Create it!
                let chassisShape = new Box(new Vec3(5, 2, 0.5));
                this.chassisBody = new Body(1, chassisShape);
            }
        }
        /**
         * Add a wheel
         * @method addWheel
         * @param {object} options
         * @param {boolean} [options.isFrontWheel]
         * @param {Vec3} [options.position] Position of the wheel, locally in the chassis body.
         * @param {Vec3} [options.direction] Slide direction of the wheel along the suspension.
         * @param {Vec3} [options.axis] Axis of rotation of the wheel, locally defined in the chassis.
         * @param {Body} [options.body] The wheel body.
         */
        addWheel(body, position = new Vec3(), direction = null, axis = new Vec3()) {
            let wheelBody = body;
            if (!wheelBody) {
                wheelBody = new Body(1, new Sphere(1.2));
            }
            this.wheelBodies.push(wheelBody);
            this.wheelForces.push(0);
            // Position constrain wheels
            //const zero = new Vec3();
            // Set position locally to the chassis
            const worldPosition = new Vec3();
            this.chassisBody.pointToWorldFrame(position, worldPosition);
            wheelBody.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
            // Constrain wheel
            this.wheelAxes.push(axis);
            let hingeConstraint = new HingeConstraint(this.chassisBody, wheelBody, 1e6, position, Vec3.ZERO, axis, axis);
            hingeConstraint.collideConnected = false;
            this.constraints.push(hingeConstraint);
            return this.wheelBodies.length - 1;
        }
        /**
         * 方向盘控制。 按照y轴向上的坐标系。所以只是水平旋转
         * @param value 旋转弧度
         */
        setSteeringValue(value, wheelIndex) {
            // Set angle of the hinge axis
            const axis = this.wheelAxes[wheelIndex];
            const c = Math.cos(value);
            const s = Math.sin(value);
            const x = axis.x;
            const y = axis.z;
            this.constraints[wheelIndex].axisA.set(c * x - s * y, 0, s * x + c * y);
        }
        /**
         * 刹车
         */
        brake(wheelIndex) {
            let wheel = this.wheelBodies[wheelIndex];
        }
        /**
         * Set the target rotational speed of the hinge constraint.
         */
        setMotorSpeed(value, wheelIndex) {
            let hingeConstraint = this.constraints[wheelIndex];
            hingeConstraint.enableMotor();
            hingeConstraint.motorTargetVelocity = value;
        }
        /**
         * Set the target rotational speed of the hinge constraint.
         */
        disableMotor(wheelIndex) {
            const hingeConstraint = this.constraints[wheelIndex];
            hingeConstraint.disableMotor();
        }
        /**
         * Set the wheel force to apply on one of the wheels each time step
         */
        setWheelForce(value, wheelIndex) {
            this.wheelForces[wheelIndex] = value;
        }
        /**
         * Apply a torque on one of the wheels.
         */
        applyWheelForce(value, wheelIndex) {
            const axis = this.wheelAxes[wheelIndex];
            const wheelBody = this.wheelBodies[wheelIndex];
            const bodyTorque = wheelBody.torque;
            axis.scale(value, torque);
            wheelBody.vectorToWorldFrame(torque, torque);
            bodyTorque.vadd(torque, bodyTorque);
        }
        /**
         * Add the vehicle including its constraints to the world.
         */
        addToWorld(world) {
            const constraints = this.constraints;
            const bodies = this.wheelBodies.concat([this.chassisBody]);
            for (var i = 0; i < bodies.length; i++) {
                world.addBody(bodies[i]);
            }
            for (var i = 0; i < constraints.length; i++) {
                world.addConstraint(constraints[i]);
            }
            world.addEventListener('preStep', this._update.bind(this));
        }
        _update() {
            const wheelForces = this.wheelForces;
            for (let i = 0; i < wheelForces.length; i++) {
                this.applyWheelForce(wheelForces[i], i);
            }
            let wheels = this.wheelBodies;
            for (let i = 0; i < wheels.length; i++) {
                //let w = wheels[i];
                //w.force.y-=100;
            }
        }
        /**
         * Remove the vehicle including its constraints from the world.
         */
        removeFromWorld(world) {
            const constraints = this.constraints;
            const bodies = this.wheelBodies.concat([this.chassisBody]);
            for (var i = 0; i < bodies.length; i++) {
                world.remove(bodies[i]);
            }
            for (var i = 0; i < constraints.length; i++) {
                world.removeConstraint(constraints[i]);
            }
        }
        /**
         * Get current rotational velocity of a wheel
         */
        getWheelSpeed(wheelIndex) {
            const axis = this.wheelAxes[wheelIndex];
            const wheelBody = this.wheelBodies[wheelIndex];
            const w = wheelBody.angularVelocity;
            this.chassisBody.vectorToWorldFrame(axis, worldAxis);
            return w.dot(worldAxis);
        }
        get speed() {
            return this.chassisBody.velocity.length();
        }
        /**
         * 为了增加摩擦增加的压力
         * @param p
         */
        addPressure(p) {
        }
    }
    var torque = new Vec3();
    var worldAxis = new Vec3();

    /**
     * Smoothed-particle hydrodynamics system
     * 光滑粒子流体系统
     */
    class SPHSystem {
        constructor() {
            this.particles = [];
            /**
             * Density of the system (kg/m3).
             */
            this.density = 1;
            /**
             * Distance below which two particles are considered to be neighbors.
             * It should be adjusted so there are about 15-20 neighbor particles within this radius.
             * 光滑长度，所在范围是一个粒子的基本单元
             */
            this.smoothingRadius = 1;
            this.speedOfSound = 1;
            /**
             * Viscosity of the system.
             * 粘度
             */
            this.viscosity = 0.01;
            this.eps = 0.000001;
            // Stuff Computed per particle
            this.pressures = [];
            this.densities = [];
            this.neighbors = [];
        }
        /**
         * Add a particle to the system.
         */
        add(particle) {
            this.particles.push(particle);
            if (this.neighbors.length < this.particles.length) {
                this.neighbors.push([]);
            }
        }
        /**
         * Remove a particle from the system.
         */
        remove(particle) {
            const idx = this.particles.indexOf(particle);
            if (idx !== -1) {
                this.particles.splice(idx, 1);
                if (this.neighbors.length > this.particles.length) {
                    this.neighbors.pop();
                }
            }
        }
        /**
         * Get neighbors within smoothing volume, save in the array neighbors
         */
        getNeighbors(particle, neighbors) {
            const N = this.particles.length;
            const id = particle.id;
            const R2 = this.smoothingRadius * this.smoothingRadius;
            const dist = SPHSystem_getNeighbors_dist;
            for (let i = 0; i !== N; i++) {
                const p = this.particles[i];
                p.position.vsub(particle.position, dist);
                if (id !== p.id && dist.lengthSquared() < R2) {
                    neighbors.push(p);
                }
            }
        }
        update() {
            const N = this.particles.length;
            const dist = SPHSystem_update_dist;
            const cs = this.speedOfSound;
            const eps = this.eps;
            for (var i = 0; i !== N; i++) {
                const p = this.particles[i]; // Current particle
                var neighbors = this.neighbors[i];
                // Get neighbors
                neighbors.length = 0;
                this.getNeighbors(p, neighbors);
                neighbors.push(this.particles[i]); // Add current too
                var numNeighbors = neighbors.length;
                // Accumulate density for the particle
                let sum = 0.0;
                for (var j = 0; j !== numNeighbors; j++) {
                    //printf("Current particle has position %f %f %f\n",objects[id].pos.x(),objects[id].pos.y(),objects[id].pos.z());
                    p.position.vsub(neighbors[j].position, dist);
                    const len = dist.length();
                    const weight = this.w(len);
                    sum += neighbors[j]._mass * weight;
                }
                // Save
                this.densities[i] = sum;
                this.pressures[i] = cs * cs * (this.densities[i] - this.density);
            }
            // Add forces
            // Sum to these accelerations
            const a_pressure = SPHSystem_update_a_pressure;
            const a_visc = SPHSystem_update_a_visc;
            const gradW = SPHSystem_update_gradW;
            const r_vec = SPHSystem_update_r_vec;
            const u = SPHSystem_update_u;
            for (var i = 0; i !== N; i++) {
                const particle = this.particles[i];
                a_pressure.set(0, 0, 0);
                a_visc.set(0, 0, 0);
                // Init vars
                let Pij;
                let nabla;
                //let Vij: number;
                // Sum up for all other neighbors
                var neighbors = this.neighbors[i];
                var numNeighbors = neighbors.length;
                //printf("Neighbors: ");
                for (var j = 0; j !== numNeighbors; j++) {
                    const neighbor = neighbors[j];
                    //printf("%d ",nj);
                    // Get r once for all..
                    particle.position.vsub(neighbor.position, r_vec);
                    const r = r_vec.length();
                    // Pressure contribution
                    Pij = -neighbor._mass * (this.pressures[i] / (this.densities[i] * this.densities[i] + eps) + this.pressures[j] / (this.densities[j] * this.densities[j] + eps));
                    this.gradw(r_vec, gradW);
                    // Add to pressure acceleration
                    gradW.scale(Pij, gradW);
                    a_pressure.vadd(gradW, a_pressure);
                    // Viscosity contribution
                    neighbor.velocity.vsub(particle.velocity, u);
                    u.scale(1.0 / (0.0001 + this.densities[i] * this.densities[j]) * this.viscosity * neighbor._mass, u);
                    nabla = this.nablaw(r);
                    u.scale(nabla, u);
                    // Add to viscosity acceleration
                    a_visc.vadd(u, a_visc);
                }
                // Calculate force
                a_visc.scale(particle._mass, a_visc);
                a_pressure.scale(particle._mass, a_pressure);
                // Add force to particles
                particle.force.vadd(a_visc, particle.force);
                particle.force.vadd(a_pressure, particle.force);
            }
        }
        // Calculate the weight using the W(r) weightfunction
        w(r) {
            // 315
            const h = this.smoothingRadius;
            return 315.0 / (64.0 * Math.PI * (h ** 9)) * ((h * h - r * r) ** 3);
        }
        // calculate gradient of the weight function
        gradw(rVec, resultVec) {
            const r = rVec.length();
            const h = this.smoothingRadius;
            rVec.scale(945.0 / (32.0 * Math.PI * (h ** 9)) * ((h * h - r * r) ** 2), resultVec);
        }
        // Calculate nabla(W)
        nablaw(r) {
            const h = this.smoothingRadius;
            const nabla = 945.0 / (32.0 * Math.PI * (h ** 9)) * (h * h - r * r) * (7 * r * r - 3 * h * h);
            return nabla;
        }
    }
    var SPHSystem_getNeighbors_dist = new Vec3();
    var SPHSystem_update_dist = new Vec3(); // Relative velocity
    var SPHSystem_update_a_pressure = new Vec3();
    var SPHSystem_update_a_visc = new Vec3();
    var SPHSystem_update_gradW = new Vec3();
    var SPHSystem_update_r_vec = new Vec3();
    var SPHSystem_update_u = new Vec3();

    /**
     * A spring, connecting two bodies.
     *
     * @class Spring
     * @constructor
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {number} [options.restLength]   A number > 0. Default: 1
     * @param {number} [options.stiffness]    A number >= 0. Default: 100
     * @param {number} [options.damping]      A number >= 0. Default: 1
     * @param {Vec3}  [options.worldAnchorA] Where to hook the spring to body A, in world coordinates.
     * @param {Vec3}  [options.worldAnchorB]
     * @param {Vec3}  [options.localAnchorA] Where to hook the spring to body A, in local body coordinates.
     * @param {Vec3}  [options.localAnchorB]
     */
    class Spring {
        constructor(bodyA, bodyB, options = {}) {
            /**
             * Rest length of the spring.
             */
            this.restLength = 1;
            /**
             * Stiffness of the spring.
             */
            this.stiffness = 100;
            /**
             * Damping of the spring.
             */
            this.damping = 1;
            /**
             * Anchor for bodyA in local bodyA coordinates.
             */
            this.localAnchorA = new Vec3();
            /**
             * Anchor for bodyB in local bodyB coordinates.
             */
            this.localAnchorB = new Vec3();
            this.restLength = typeof (options.restLength) === "number" ? options.restLength : 1;
            this.stiffness = options.stiffness || 100;
            this.damping = options.damping || 1;
            this.bodyA = bodyA;
            this.bodyB = bodyB;
            if (options.localAnchorA) {
                this.localAnchorA.copy(options.localAnchorA);
            }
            if (options.localAnchorB) {
                this.localAnchorB.copy(options.localAnchorB);
            }
            if (options.worldAnchorA) {
                this.setWorldAnchorA(options.worldAnchorA);
            }
            if (options.worldAnchorB) {
                this.setWorldAnchorB(options.worldAnchorB);
            }
        }
        /**
         * Set the anchor point on body A, using world coordinates.
         */
        setWorldAnchorA(worldAnchorA) {
            this.bodyA.pointToLocalFrame(worldAnchorA, this.localAnchorA);
        }
        /**
         * Set the anchor point on body B, using world coordinates.
         */
        setWorldAnchorB(worldAnchorB) {
            this.bodyB.pointToLocalFrame(worldAnchorB, this.localAnchorB);
        }
        /**
         * Get the anchor point on body A, in world coordinates.
         * @param  result The vector to store the result in.
         */
        getWorldAnchorA(result) {
            this.bodyA.pointToWorldFrame(this.localAnchorA, result);
        }
        /**
         * Get the anchor point on body B, in world coordinates.
         * @param  result The vector to store the result in.
         */
        getWorldAnchorB(result) {
            this.bodyB.pointToWorldFrame(this.localAnchorB, result);
        }
        /**
         * Apply the spring force to the connected bodies.
         */
        applyForce() {
            const k = this.stiffness;
            const d = this.damping;
            const l = this.restLength;
            const bodyA = this.bodyA;
            const bodyB = this.bodyB;
            const r = applyForce_r;
            const r_unit = applyForce_r_unit;
            const u = applyForce_u;
            const f = applyForce_f;
            const tmp = applyForce_tmp;
            const worldAnchorA = applyForce_worldAnchorA;
            const worldAnchorB = applyForce_worldAnchorB;
            const ri = applyForce_ri;
            const rj = applyForce_rj;
            const ri_x_f = applyForce_ri_x_f;
            const rj_x_f = applyForce_rj_x_f;
            // Get world anchors
            this.getWorldAnchorA(worldAnchorA);
            this.getWorldAnchorB(worldAnchorB);
            // Get offset points
            worldAnchorA.vsub(bodyA.position, ri);
            worldAnchorB.vsub(bodyB.position, rj);
            // Compute distance vector between world anchor points
            worldAnchorB.vsub(worldAnchorA, r);
            const rlen = r.length();
            r_unit.copy(r);
            r_unit.normalize();
            // Compute relative velocity of the anchor points, u
            bodyB.velocity.vsub(bodyA.velocity, u);
            // Add rotational velocity
            bodyB.angularVelocity.cross(rj, tmp);
            u.vadd(tmp, u);
            bodyA.angularVelocity.cross(ri, tmp);
            u.vsub(tmp, u);
            // F = - k * ( x - L ) - D * ( u )
            r_unit.scale(-k * (rlen - l) - d * u.dot(r_unit), f);
            // Add forces to bodies
            bodyA.force.vsub(f, bodyA.force);
            bodyB.force.vadd(f, bodyB.force);
            // Angular force
            ri.cross(f, ri_x_f);
            rj.cross(f, rj_x_f);
            bodyA.torque.vsub(ri_x_f, bodyA.torque);
            bodyB.torque.vadd(rj_x_f, bodyB.torque);
        }
    }
    var applyForce_r = new Vec3();
    var applyForce_r_unit = new Vec3();
    var applyForce_u = new Vec3();
    var applyForce_f = new Vec3();
    var applyForce_worldAnchorA = new Vec3();
    var applyForce_worldAnchorB = new Vec3();
    var applyForce_ri = new Vec3();
    var applyForce_rj = new Vec3();
    var applyForce_ri_x_f = new Vec3();
    var applyForce_rj_x_f = new Vec3();
    var applyForce_tmp = new Vec3();

    //import { quat_AABBExt_mult } from "./Box";
    //let aabbExt = new Vec3();
    let tmpVec1$2 = new Vec3();
    let tmpVec2$2 = new Vec3();
    let tmpVec3 = new Vec3();
    let tmpVec4$1 = new Vec3();
    let tmpVec5$1 = new Vec3();
    let tmpVec6$1 = new Vec3();
    let tmpDir1 = new Vec3();
    let tmpDir2 = new Vec3();
    let A1 = new Vec3();
    /**
     * TODO y向上直立的capsule
     */
    /**
     * 缺省主轴是z轴
     * 测试的时候可以通过组合shape来模拟胶囊
     */
    class Capsule extends Shape {
        constructor(r = 1, h = 1) {
            super();
            this.noTrans = false; // 站立的胶囊，可以简单处理
            this.axis = new Vec3(); // 主轴。是一半
            this.voxel = null;
            //mat = new Mat3();
            this.minkowski = this;
            this.type = 512 /* CAPSULE */;
            this.radius = r;
            this.height = h;
            this.axis.set(0, 0, h / 2);
            this.hasPreNarrowPhase = true;
            this.margin = r; //对capsule来说margin可以大到r
        }
        /**
         * MinkowskiShape 的接口
         * 暂时沿着z
         * @param dir 必须是规格化的
         * @param sup
         */
        getSupportVertex(dir, sup) {
            if (dir.z > 0) { //现在假设z轴向上
                sup.set(0, 0, this.height / 2);
            }
            else {
                sup.set(0, 0, -this.height / 2);
            }
            sup.addScaledVector(this.radius, dir, sup); // 线段 + 球
            return sup;
        }
        getSupportVertexWithoutMargin(dir, sup) {
            if (dir.z > 0) { //现在假设z轴向上
                sup.set(0, 0, this.height / 2);
            }
            else {
                sup.set(0, 0, -this.height / 2);
            }
            return sup;
        }
        /**
         * 计算halfh向量变换后的值
         * @param q
         */
        calcDir(q) {
            //0,0,1 被旋转以后
            let qx = q.x, qy = q.y, qz = q.z, qw = q.w;
            let axis = this.axis;
            let h = this.height;
            let halfh = h / 2;
            //rx=(qw*qw + qx*qx - qz*qz -qy*qy)*x +( 2*qx*qy -2*qz*qw)*y + (2*qy*qw + 2*qx*qz )*z;
            axis.x = (qy * qw + qx * qz) * h;
            //ry=(2*qz*qw +2*qx*qy)*x + (qw*qw +qy*qy -qx*qx -qz*qz)*y + (-2*qx*qw +2*qy*qz)*z;
            axis.y = (-qx * qw + qy * qz) * h;
            //rz=(-2*qy*qw   +2*qx*qz)*x + (2*qx*qw  +2*qy*qz ) *y +  (qw2 +qz2 -qy2 -qx2)*z;
            axis.z = (qw * qw + qz * qz - qy * qy - qx * qx) * halfh;
            //this.mat.setRotationFromQuaternion( q );
            return axis;
        }
        /**
         * 某个方向上最远距离，相对于自己的原点。前提是已经计算了轴向了。类似于包围盒， dir*maxD 不一定在胶囊上，只有平行和垂直的时候才在表面上
         * @param pos 胶囊所在世界空间的位置
         * @param dir 世界空间的朝向
         * @param outPos 最远的地方的点。 法线就是方向
         */
        supportPoint(myPos, dir, outPos) {
            dir.normalize();
            return this.supportPoint_norm(myPos, dir, outPos);
        }
        supportPoint_norm(myPos, normDir, outPos) {
            let axis = this.axis;
            let d = axis.dot(normDir);
            let nextend = false;
            if (d < 0) {
                d = -d;
                nextend = true; //取另一头
            }
            let l = d + this.radius; //自身原点到这个点的距离
            if (outPos) {
                // 需要计算最远的点在哪
                if (d < 1e-6) { //只有垂直的时候，在圆柱上，稍微一动，就转到球上了
                    myPos.addScaledVector(this.radius, normDir, outPos);
                }
                else {
                    if (nextend) {
                        myPos.vsub(axis, outPos);
                        outPos.addScaledVector(this.radius, normDir, outPos);
                    }
                    else {
                        myPos.vadd(axis, outPos);
                        outPos.addScaledVector(this.radius, normDir, outPos);
                    }
                }
            }
            return l;
        }
        // 要求已经计算axis了    
        pointDistance(pos, p) {
            let halfh = this.height / 2;
            let dx = p.x - pos.x;
            let dy = p.y - pos.y;
            //let dz = p.z - pos.z;
            //let dist:f32=-1;
            if (this.noTrans) {
                // 如果是直立的，最简单。 需要注意坐标系，这里假设z向上
                let dz = p.z - pos.z;
                if (dz > halfh) {
                    // 超过上面的点
                    dz -= halfh;
                    return Math.sqrt(dx * dx + dy * dy + dz * dz);
                }
                else if (dz > -halfh) {
                    // 超过下面的点
                    return Math.sqrt(dx * dx + dy * dy);
                }
                else {
                    // 低于下面的点
                    dz += halfh;
                    return Math.sqrt(dx * dx + dy * dy + dz * dz);
                }
            }
            else {
            }
            return 0;
        }
        /**
         * 到一个平面的距离，如果碰撞了，取碰撞点。
         * 碰撞法线一定是平面法线
         * @param hitPos   世界坐标的碰撞位置	.在自己身上
         * @param hitNormal 碰撞点的法线，这个应该取对方的，意味着把碰撞点沿着这个法线推出
         * @return 进入深度， <0表示没有碰撞
         */
        hitPlane(myPos, planePos, planeNorm, hitPos) {
            // 反向最远的点就是距离平面最近的点
            tmpVec1$2.set(-planeNorm.x, -planeNorm.y, -planeNorm.z);
            this.supportPoint_norm(myPos, tmpVec1$2, hitPos);
            //下面判断hitPos是否在平面下面
            let planeToHit = tmpVec2$2;
            hitPos.vsub(planePos, planeToHit);
            let d = planeToHit.dot(planeNorm);
            if (d > 0) // 没有碰撞
                return -1;
            return -d;
        }
        /**
         * capsule 与BOX碰撞。 相当于一个线段与一个膨胀了的盒子做检测
         * @param myPos
         * @param boxHalf
         * @param boxPos
         * @param boxQuat
         * @param hitPos
         * @param hitpos1
         * @param hitNormal 把自己推开的法线，即对方身上的，朝向自己的。
         * @param justtest
         */
        hitBox(myPos, boxHalf, boxPos, boxQuat, hitPos, hitpos1, hitNormal, justtest) {
            let r = this.radius;
            let m33 = Capsule.boxquatmat;
            m33.setRotationFromQuaternion(boxQuat); //TODO 以后自己保存四元数，和矩阵，就可以去掉这个了
            let axis = this.axis;
            let p0 = tmpVec1$2; // 相对位置的起点
            let p1 = tmpVec2$2; // 相对位置的终点
            myPos.vsub(axis, p0).vsub(boxPos, p0); // p0 = myPos-axis-boxPos
            myPos.vadd(axis, p1).vsub(boxPos, p1); // p1 = myPos+axis-boxPos
            // 把这两个点转到box空间
            let invQ = Capsule.boxinvquat;
            boxQuat.conjugate(invQ);
            invQ.vmult(p0, p0);
            invQ.vmult(p1, p1);
            let capLocal = Capsule.boxCapLocal; // capsule的中心向量
            let w = tmpVec3; // capsule的半长向量, 从中点指向p0
            p0.vadd(p1, capLocal).scale(0.5, capLocal); // (p0+p1)/2
            p0.vsub(capLocal, w);
            let abs = Math.abs;
            // 用分离轴的方式来找到最浅碰撞深度
            let sepAx = tmpVec4$1; //分离轴
            let minD = 0; // 最小深度
            // 分离轴 A
            // box的半长投影       boxsize.x* |dot(boxX,A)| + boxsize.y*|dot(boxY,A)| + boxsize.z*|dot(boxZ,A)|
            // capsule的半长投影   dot(A,w)
            // 两个对象的中心的投影 dot(A,capLocal)
            // 深度 = box的半长投影 +capsule中心和box中心的投影 - 两个中心的投影
            // A = 1,0,0
            let overlap = boxHalf.x + abs(w.x) + r - abs(capLocal.x);
            if (overlap < 0) {
                return -1; // 没有发生碰撞
            }
            minD = overlap;
            sepAx.set(1, 0, 0);
            // 0,1,0
            overlap = boxHalf.y + abs(w.y) + r - abs(capLocal.y);
            if (overlap < 0) {
                return -1;
            }
            if (overlap < minD) {
                minD = overlap;
                sepAx.set(0, 1, 0);
            }
            // 0,0,1
            overlap = boxHalf.z + abs(w.z) + r - abs(capLocal.z);
            if (overlap < 0) {
                return -1;
            }
            if (overlap < minD) {
                minD = overlap;
                sepAx.set(0, 0, 1);
            }
            let capDir = tmpVec6$1;
            capDir.set(w.x, w.y, w.z).normalize(); // 把朝向规格化一下，以便与能与上面的深度做比较
            //A = cross({1,0,0},capDir)
            //{ (y * vz) - (z * vy),
            // (z * vx) - (x * vz),
            // (x * vy) - (y * vx) }
            let A = tmpVec5$1;
            A.set(0, -capDir.z, capDir.y);
            // dot(A,capLocal) > |dot(w,A)| + boxsize.x* |A.x| + boxsize.y*|A.y)| + boxsize.z*|A.z|
            overlap = boxHalf.y * abs(A.y) + boxHalf.z * abs(A.z) + abs(w.y * A.y + w.z * A.z) + r - abs(capLocal.y * A.y + capLocal.z * A.z);
            if (overlap < 0) {
                return -1;
            }
            if (overlap < minD) {
                minD = overlap;
                sepAx.set(A.x, A.y, A.z);
            }
            // cross({0,1,0},capDir)
            A.set(capDir.z, 0, -capDir.x);
            overlap = boxHalf.x * abs(A.x) + boxHalf.z * abs(A.z) + abs(w.x * A.x + w.z * A.z) + r - abs(capLocal.x * A.x + capLocal.z * A.z);
            if (overlap < 0) {
                return -1;
            }
            if (overlap < minD) {
                minD = overlap;
                sepAx.set(A.x, A.y, A.z);
            }
            // cross({0,0,1},capDir)
            A.set(-capDir.y, capDir.x, 0);
            overlap = boxHalf.x * abs(A.x) + boxHalf.y * abs(A.y) + abs(w.x * A.x + w.y * A.y) + r - abs(capLocal.x * A.x + capLocal.y * A.y);
            if (overlap < 0) {
                return -1;
            }
            if (overlap < minD) {
                minD = overlap;
                sepAx.set(A.x, A.y, A.z);
            }
            // 发生碰撞了，确定碰撞点和碰撞法线
            if (justtest) {
                return 1;
            }
            return minD;
        }
        /**
         *
         * @param myPos
         * @param cap
         * @param capPos
         * @param hitPos
         * @param hitPos 	另一个对象的碰撞点
         * @param hitNormal 把自己推开的法线，即对方身上的，朝向自己的。
         * @param justtest
         */
        hitCapsule(myPos, cap, capPos, hitPos, hitPos1, hitNormal, justtest) {
            let r1 = this.radius;
            let r2 = cap.radius;
            let ax1 = this.axis;
            let ax2 = cap.axis;
            let D1 = tmpDir1;
            ax1.scale(2, D1);
            let D2 = tmpDir2;
            ax2.scale(2, D2);
            let P1 = tmpVec1$2;
            myPos.vsub(ax1, P1); //我的起点
            let P2 = tmpVec2$2;
            capPos.vsub(ax2, P2); //对方的起点
            let d = tmpVec3;
            P1.vsub(P2, d);
            // 两个线段之间的距离: | P1+t1D1 -(P2+t2D2) |
            // P1-P2 = d
            // (d + t1D1-t2D2)^2 是距离的平方，对这个取全微分
            // 2(d+t1D1-t2D2)*D1, -2(d+t1D1-t2D2)*D2 这两个都是0
            // 显然这时候与D1,D2都垂直
            // -dD1 -t1D1^2 + t2D1D2  = 0
            // -dD2 -t1D1D2 + t2D2^2  = 0
            // 先用多项式的方法求解 Ax=b
            // | -D1^2  D1D2 | |t1|    |dD1|
            // |             | |  |  = |   |
            // | -D1D2  D2^2 | |t2|    |dD2|
            //
            // 如果平行，则有个方向的d永远为0
            let A = -D1.dot(D1);
            let B = D1.dot(D2);
            let C = -B;
            let D = D2.dot(D2);
            let b1 = d.dot(D1);
            let b2 = d.dot(D2);
            let adbc = A * D - B * C;
            if (adbc > -1e-6 && adbc < 1e-6) {
                //平行
                return -1;
            }
            let dd = 1 / adbc; //只要胶囊没有退化为球，这个就没有问题
            let t1 = (D * b1 - B * b2) * dd;
            let t2 = (-C * b1 + A * b2) * dd;
            let QQ = Sphere.SpherehitSphere;
            let deep = 0;
            //根据t1,t2所在范围，一共有9种组合
            if (t1 < 0) {
                if (t2 < 0) {
                    //p1和p2
                    deep = QQ(r1, P1, r2, P2, hitPos, hitNormal, hitPos1, justtest);
                }
                else if (t2 > 1) {
                    //p1和p2+D2
                    let p2e = tmpVec4$1;
                    P2.vadd(D2, p2e);
                    deep = QQ(r1, P1, r2, p2e, hitPos, hitNormal, hitPos1, justtest);
                }
                else {
                    //p1和线段2，只能取t1=0,重新计算这时候对应的t2
                    t2 = b2 / D;
                    let np = tmpVec4$1;
                    P2.addScaledVector(t2, D2, np);
                    deep = QQ(r1, P1, r2, np, hitPos, hitNormal, hitPos1, justtest);
                }
            }
            else if (t1 > 1) {
                let p1e = tmpVec4$1;
                P1.vadd(D1, p1e);
                if (t2 < 0) {
                    //p1+d1和p2
                    deep = QQ(r1, p1e, r2, P2, hitPos, hitNormal, hitPos1, justtest);
                }
                else if (t2 > 1) {
                    //p1+d1和p2+d2
                    let p2e = tmpVec5$1;
                    P2.vadd(D2, p2e);
                    deep = QQ(r1, p1e, r2, p2e, hitPos, hitNormal, hitPos1, justtest);
                }
                else {
                    //p1+d1和线段2
                    // 取t1=1, 从新计算t2
                    t2 = (b2 - C) / D;
                    let np = tmpVec5$1;
                    P2.addScaledVector(t2, D2, np);
                    deep = QQ(r1, p1e, r2, np, hitPos, hitNormal, hitPos1, justtest);
                }
            }
            else {
                let p1 = tmpVec4$1;
                let p2 = tmpVec5$1;
                P1.addScaledVector(t1, D1, p1);
                if (t2 < 0) {
                    //线段1和p2
                    //取t2=0,重新计算t1
                    t1 = b1 / A;
                    p2 = P2;
                }
                else if (t2 > 1) {
                    //线段1和p2+d2
                    //取t2=1重新计算t1
                    t1 = (b1 - B) / A;
                    P2.vadd(D2, p2);
                }
                else {
                    P2.addScaledVector(t2, D2, p2);
                }
                deep = QQ(r1, p1, r2, p2, hitPos, hitNormal, hitPos1, justtest);
            }
            //DEBUG
            if (deep >= 0) {
                //let phyr = PhyRender.inst;
                //phyr.addPoint(hitPos1.x, hitPos1.y, hitPos1.z, 0xffff00);
            }
            //DEBUG
            return deep;
        }
        /**
         *
         * @param myPos
         * @param r2  球的半径
         * @param sphPos
         * @param hitPos 	自己身上的碰撞点
         * @param hitNormal 是球上面的法线（与自己的相反）
         * @param justtest  只检测碰撞，不要具体结果
         */
        hitSphere(myPos, r2, sphPos, hitPos, hitPos1, hitNormal, justtest) {
            let p0 = tmpVec1$2;
            let dp = tmpVec2$2;
            let D = A1;
            let axis = this.axis;
            axis.scale(2, D);
            let r1 = this.radius;
            let r = r1 + r2;
            let rr = r * r;
            myPos.vsub(axis, p0); //p0=mypos-axis
            p0.vsub(sphPos, dp); //dp=p0-sph.pos
            // D=2*axis
            // px=p0+t*D
            // dist = (px-sph.pos)^2 = (p0-sph.pos+t*D)^2 = (dp+t*D)^2 
            // dist最小的情况 = (dp+tD)*D=0
            // 求出最靠近点的t t=-dp*D/(D*D) = -dot(dp,D)/dot(D,D) 
            let t = -dp.dot(D) / D.dot(D);
            let nearestPos = tmpVec3;
            if (t < 0) {
                // 直接计算p0到球的位置
                nearestPos = p0;
            }
            else if (t > 1) {
                // 直接计算p1到球的位置
                p0.vadd(D, nearestPos);
            }
            else {
                p0.addScaledVector(t, D, nearestPos);
            }
            let deep = Sphere.SpherehitSphere(r1, nearestPos, r2, sphPos, hitPos, hitNormal, hitPos1, justtest);
            return deep;
        }
        /**
         * 计算胶囊的转动惯量
         * 用圆柱和半球的转动惯量，结合平移轴原理组合出来
         * @param mass
         * @param target
         * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
         * @see https://zh.wikipedia.org/wiki/%E8%BD%89%E5%8B%95%E6%85%A3%E9%87%8F%E5%88%97%E8%A1%A8
         */
        calculateLocalInertia(mass, target) {
            let h = this.height;
            let r = this.radius;
            let r2 = r * r;
            let h2 = h * h;
            target.x = target.y = mass / 60 * (39 * r2 + 35 * h2);
            target.z = 9 / 10 * mass * r2;
        }
        updateBndSphR() {
            this.boundSphR = this.radius + this.height / 2;
        }
        calculateWorldAABB(pos, quat, min, max) {
            let r = this.radius;
            /*
            let h =this.height;
            aabbExt.set(r,r,h/2+r);
            quat_AABBExt_mult(quat,aabbExt,min);//暂存到min中
            pos.vadd(min,max);
            pos.vsub(min,min);
            */
            // calcDir后会一直重用
            let ext = this.calcDir(quat);
            let mx = Math.abs(ext.x) + r;
            let my = Math.abs(ext.y) + r;
            let mz = Math.abs(ext.z) + r;
            min.x = pos.x - mx;
            min.y = pos.y - my;
            min.z = pos.z - mz;
            max.x = pos.x + mx;
            max.y = pos.y + my;
            max.z = pos.z + mz;
        }
        volume() {
            let r = this.radius;
            let h = this.height;
            let p = Math.PI;
            return h * p * r * r + 3 / 4 * p * r * r * r;
        }
        onPreNarrowpase(stepId, pos, quat) {
            this.calcDir(quat);
        }
        voxelize() {
            throw 'NI';
        }
    }
    Capsule.boxquatmat = new Mat3();
    Capsule.boxinvquat = new Quaternion();
    Capsule.boxCapLocal = new Vec3();
    Capsule.boxX = new Vec3();
    Capsule.boxY = new Vec3();

    /**
     * Particle shape.
     * @author schteppe
     */
    class Particle extends Shape {
        constructor() {
            super();
            this.type = 64 /* PARTICLE */;
        }
        calculateLocalInertia(mass, target = new Vec3()) {
            target.set(0, 0, 0);
            return target;
        }
        volume() {
            return 0;
        }
        updateBndSphR() {
            this.boundSphR = 0;
        }
        calculateWorldAABB(pos, quat, min, max) {
            // Get each axis max
            min.copy(pos);
            max.copy(pos);
        }
        onPreNarrowpase(stepId, pos, quat) { }
    }

    /**
     * 现在是用一个convex来做圆柱
     * z向上。
     * @author schteppe / https://github.com/schteppe
     * @param {Number} numSegments The number of segments to build the cylinder out of
     */
    class Cylinder extends ConvexPolyhedron {
        constructor(radiusTop, radiusBottom, height, numSegments) {
            const N = numSegments;
            const verts = [];
            const axes = [];
            const faces = [];
            const bottomface = [];
            const topface = [];
            const cos = Math.cos;
            const sin = Math.sin;
            // First bottom point
            verts.push(new Vec3(radiusBottom * cos(0), radiusBottom * sin(0), -height * 0.5));
            bottomface.push(0);
            // First top point
            verts.push(new Vec3(radiusTop * cos(0), radiusTop * sin(0), height * 0.5));
            topface.push(1);
            for (var i = 0; i < N; i++) {
                const theta = 2 * Math.PI / N * (i + 1);
                const thetaN = 2 * Math.PI / N * (i + 0.5);
                if (i < N - 1) {
                    // Bottom
                    verts.push(new Vec3(radiusBottom * cos(theta), radiusBottom * sin(theta), -height * 0.5));
                    bottomface.push(2 * i + 2);
                    // Top
                    verts.push(new Vec3(radiusTop * cos(theta), radiusTop * sin(theta), height * 0.5));
                    topface.push(2 * i + 3);
                    // Face
                    faces.push([2 * i + 2, 2 * i + 3, 2 * i + 1, 2 * i]);
                }
                else {
                    faces.push([0, 1, 2 * i + 1, 2 * i]); // Connect
                }
                // Axis: we can cut off half of them if we have even number of segments
                if (N % 2 === 1 || i < N / 2) {
                    axes.push(new Vec3(cos(thetaN), sin(thetaN), 0));
                }
            }
            faces.push(topface);
            axes.push(new Vec3(0, 0, 1));
            // Reorder bottom face
            const temp = [];
            for (var i = 0; i < bottomface.length; i++) {
                temp.push(bottomface[bottomface.length - i - 1]);
            }
            faces.push(temp);
            super(verts, faces, axes);
        }
    }

    /**
     * A plane, facing in the Z direction. The plane has its surface at z=0 and everything below z=0 is assumed to be solid plane. To make the plane face in some other direction than z, you must put it inside a Body and rotate that body. See the demos.
     */
    class Plane extends Shape {
        constructor() {
            super();
            // World oriented normal
            this.worldNormal = new Vec3();
            this.worldNormalNeedsUpdate = true;
            this.boundSphR = Number.MAX_VALUE;
            this.type = 2 /* PLANE */;
        }
        computeWorldNormal(quat) {
            const n = this.worldNormal;
            n.set(0, 0, 1); // 法线指向z，对laya3d坐标系来说，是朝向屏幕外面
            quat.vmult(n, n);
            this.worldNormalNeedsUpdate = false;
        }
        calculateLocalInertia(mass, target = new Vec3()) {
            return target;
        }
        volume() {
            return Number.MAX_VALUE; // The plane is infinite...
        }
        onPreNarrowpase(stepId, pos, quat) { }
        calculateWorldAABB(pos, quat, min, max) {
            // The plane AABB is infinite, except if the normal is pointing along any axis
            tempNormal.set(0, 0, 1); // Default plane normal is z
            quat.vmult(tempNormal, tempNormal);
            const maxVal = Number.MAX_VALUE;
            min.set(-maxVal, -maxVal, -maxVal);
            max.set(maxVal, maxVal, maxVal);
            if (tempNormal.x === 1) {
                max.x = pos.x;
            }
            if (tempNormal.y === 1) {
                max.y = pos.y;
            }
            if (tempNormal.z === 1) {
                max.z = pos.z;
            }
            if (tempNormal.x === -1) {
                min.x = pos.x;
            }
            if (tempNormal.y === -1) {
                min.y = pos.y;
            }
            if (tempNormal.z === -1) {
                min.z = pos.z;
            }
        }
        updateBndSphR() {
            this.boundSphR = Number.MAX_VALUE;
        }
    }
    var tempNormal = new Vec3();

    /**
     * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a given distance.
     * @class Heightfield
     * @extends Shape
     * @constructor
     * @param {Array} data An array of Y values that will be used to construct the terrain.
     * @param {object} options
     * @param {Number} [options.minValue] Minimum value of the data points in the data array. Will be computed automatically if not given.
     * @param {Number} [options.maxValue] Maximum value.
     * @param {Number} [options.elementSize=0.1] World spacing between the data points in X direction.
     * @todo Should be possible to use along all axes, not just y
     * @todo should be possible to scale along all axes
     *
     * @example
     *     // Generate some height data (y-values).
     *     var data = [];
     *     for(var i = 0; i < 1000; i++){
     *         var y = 0.5 * Math.cos(0.2 * i);
     *         data.push(y);
     *     }
     *
     *     // Create the heightfield shape
     *     var heightfieldShape = new Heightfield(data, {
     *         elementSize: 1 // Distance between the data points in X and Y directions
     *     });
     *     var heightfieldBody = new Body();
     *     heightfieldBody.addShape(heightfieldShape);
     *     world.addBody(heightfieldBody);
     */
    class Heightfield extends Shape {
        constructor(data, minValue, maxValue, elementSize) {
            super();
            /**
             * The width of each element
             * 每个格子的宽度
             * @todo elementSizeX and Y
             */
            this.elementSize = 1;
            this.cacheEnabled = true;
            this.pillarConvex = new ConvexPolyhedron();
            this.pillarOffset = new Vec3();
            this._cachedPillars = {};
            this.type = 32 /* HEIGHTFIELD */;
            this.data = data;
            this.elementSize = elementSize;
            if (minValue === null || minValue === undefined) {
                this.updateMinValue();
            }
            else {
                this.minValue = minValue;
            }
            if (maxValue === null || maxValue === undefined) {
                this.updateMaxValue();
            }
            else {
                this.minValue = maxValue;
            }
            this.updateBndSphR();
            this._cachedPillars = {};
        }
        /**
         * Call whenever you change the data array.
         */
        update() {
            this._cachedPillars = {};
        }
        onPreNarrowpase(stepId, pos, quat) {
        }
        /**
         * Update the .minValue property
         */
        updateMinValue() {
            const data = this.data;
            let minValue = data[0][0];
            for (let i = 0, yl = data.length; i < yl; i++) {
                for (let j = 0, xl = data[i].length; j < xl; j++) {
                    const v = data[i][j];
                    if (v < minValue) {
                        minValue = v;
                    }
                }
            }
            this.minValue = minValue;
        }
        /**
         * Update the .maxValue property
         */
        updateMaxValue() {
            const data = this.data;
            let maxValue = data[0][0];
            for (let i = 0; i !== data.length; i++) {
                for (let j = 0; j !== data[i].length; j++) {
                    const v = data[i][j];
                    if (v > maxValue) {
                        maxValue = v;
                    }
                }
            }
            this.maxValue = maxValue;
        }
        /**
         * Set the height value at an index. Don't forget to update maxValue and minValue after you're done.
         */
        setHeightValueAtIndex(xi, yi, value) {
            const data = this.data;
            data[yi][xi] = value;
            // Invalidate cache
            this.clearCachedConvexTrianglePillar(xi, yi, false);
            if (xi > 0) {
                this.clearCachedConvexTrianglePillar(xi - 1, yi, true);
                this.clearCachedConvexTrianglePillar(xi - 1, yi, false);
            }
            if (yi > 0) {
                this.clearCachedConvexTrianglePillar(xi, yi - 1, true);
                this.clearCachedConvexTrianglePillar(xi, yi - 1, false);
            }
            if (yi > 0 && xi > 0) {
                this.clearCachedConvexTrianglePillar(xi - 1, yi - 1, true);
            }
        }
        /**
         * Get max/min in a rectangle in the matrix data
         * @param   [result] An array to store the results in.
         * @return  The result array, if it was passed in. Minimum will be at position 0 and max at 1.
         */
        getRectMinMax(iMinX, iMinY, iMaxX, iMaxY, result = []) {
            // Get max and min of the data
            const data = this.data; // Set first value
            let max = this.minValue;
            for (let j = iMinY; j <= iMaxY; j++) {
                for (let i = iMinX; i <= iMaxX; i++) {
                    const height = data[j][i];
                    if (height > max) {
                        max = height;
                    }
                }
            }
            result[0] = this.minValue;
            result[1] = max;
        }
        /**
         * Get the index of a local position on the heightfield. The indexes indicate the rectangles, so if your terrain is made of N x N height data points, you will have rectangle indexes ranging from 0 to N-1.
         * 根据空间位置来确定对应的数据的位置
         * @param   result Two-element array
         * @param   clamp If the position should be clamped to the heightfield edge.
         * @return 如果不在范围内，则false
         */
        getIndexOfPosition(x, y, result, clamp) {
            // Get the index of the data points to test against
            const w = this.elementSize;
            const data = this.data;
            let xi = Math.floor(x / w);
            let yi = Math.floor(y / w);
            result[0] = xi;
            result[1] = yi;
            if (clamp) {
                // Clamp index to edges
                if (xi < 0) {
                    xi = 0;
                }
                if (yi < 0) {
                    yi = 0;
                }
                if (yi >= data.length - 1) {
                    yi = data.length - 1;
                }
                if (xi >= data[0].length - 1) {
                    xi = data[0].length - 1;
                }
            }
            // Bail out if we are out of the terrain
            if (xi < 0 || yi < 0 || yi >= data.length - 1 || xi >= data[0].length - 1) {
                return false;
            }
            return true;
        }
        /**
         * 返回x,y所在位置的三角形，返回三角形的三个点
         * @param x
         * @param y
         * @param edgeClamp
         * @param a
         * @param b
         * @param c
         * 返回是否在上半三角形
         */
        getTriangleAt(x, y, edgeClamp, a, b, c) {
            const idx = getHeightAt_idx;
            this.getIndexOfPosition(x, y, idx, edgeClamp);
            let xi = idx[0];
            let yi = idx[1];
            const data = this.data;
            if (edgeClamp) {
                yi = Math.min(data.length - 2, Math.max(0, yi));
                xi = Math.min(data[0].length - 2, Math.max(0, xi));
            }
            const elementSize = this.elementSize;
            // 落点到左上角的距离
            const upperDist2 = (x / elementSize - xi) ** 2 + (y / elementSize - yi) ** 2;
            // 落点到右下角的距离
            const lowerDist2 = (x / elementSize - (xi + 1)) ** 2 + (y / elementSize - (yi + 1)) ** 2;
            const upper = lowerDist2 > upperDist2;
            this.getTriangle(xi, yi, upper, a, b, c);
            return upper;
        }
        getNormalAt(x, y, edgeClamp, result) {
            const a = getNormalAt_a;
            const b = getNormalAt_b;
            const c = getNormalAt_c;
            const e0 = getNormalAt_e0;
            const e1 = getNormalAt_e1;
            this.getTriangleAt(x, y, edgeClamp, a, b, c);
            b.vsub(a, e0);
            c.vsub(a, e1);
            e0.cross(e1, result);
            result.normalize();
        }
        getNormal(x, y, result) {
            const a = getNormalAt_a;
            const b = getNormalAt_b;
            const c = getNormalAt_c;
            const e0 = getNormalAt_e0;
            const e1 = getNormalAt_e1;
            this.getTriangleAt(x, y, true, a, b, c);
            b.vsub(a, e0);
            c.vsub(a, e1);
            e0.cross(e1, result);
            result.normalize();
        }
        /**
         * Get an AABB of a square in the heightfield
         * @param  {number} xi
         * @param  {number} yi
         * @param  {AABB} result
         */
        getAabbAtIndex(xi, yi, result) {
            const data = this.data;
            const elementSize = this.elementSize;
            result.lowerBound.set(xi * elementSize, data[yi][xi], yi * elementSize);
            result.upperBound.set((xi + 1) * elementSize, data[yi + 1][xi + 1], (yi + 1) * elementSize);
        }
        /**
         * Get the height in the heightfield at a given position
         * 获取xy位置的高度
         */
        getHeightAt(x, y, edgeClamp) {
            const data = this.data;
            const a = getHeightAt_a;
            const b = getHeightAt_b;
            const c = getHeightAt_c;
            const idx = getHeightAt_idx;
            this.getIndexOfPosition(x, y, idx, edgeClamp);
            let xi = idx[0];
            let yi = idx[1];
            if (edgeClamp) {
                yi = Math.min(data.length - 2, Math.max(0, yi));
                xi = Math.min(data[0].length - 2, Math.max(0, xi));
            }
            const upper = this.getTriangleAt(x, y, edgeClamp, a, b, c);
            barycentricWeights(x, y, a.x, a.z, b.x, b.z, c.x, c.z, getHeightAt_weights);
            const w = getHeightAt_weights;
            if (upper) {
                //TODO 验证
                // Top triangle verts
                return data[yi + 1][xi + 1] * w.x + data[yi][xi + 1] * w.y + data[yi + 1][xi] * w.z;
            }
            else {
                // Top triangle verts
                return data[yi][xi] * w.x + data[yi + 1][xi] * w.y + data[yi][xi + 1] * w.z;
            }
        }
        getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle) {
            return `${xi}_${yi}_${getUpperTriangle ? 1 : 0}`;
        }
        getCachedConvexTrianglePillar(xi, yi, getUpperTriangle) {
            return this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)];
        }
        setCachedConvexTrianglePillar(xi, yi, getUpperTriangle, convex, offset) {
            this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)] = {
                convex,
                offset
            };
        }
        clearCachedConvexTrianglePillar(xi, yi, getUpperTriangle) {
            delete this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)];
        }
        // 返回d。注意这里的平面公式是 n.p=d,而不是 n.p+d=0
        getPlane(xi, yi, upper, a, b, c, norm) {
            this.getTriangle(xi, yi, upper, a, b, c);
            let e0 = getPlane_e0;
            let e1 = getPlane_e1;
            b.vsub(a, e0);
            c.vsub(a, e1);
            e0.cross(e1, norm);
            norm.normalize();
            //d 是平面任意一点与法线的点积 norm.p = d
            return a.dot(norm);
        }
        /**
         * Get a triangle from the heightfield
         */
        getTriangle(xi, yi, upper, a, b, c) {
            const data = this.data;
            const elementSize = this.elementSize;
            if (upper) {
                // Top triangle verts
                a.set(xi * elementSize, data[yi][xi], yi * elementSize);
                b.set((xi + 1) * elementSize, data[yi + 1][xi], yi * elementSize);
                c.set(xi * elementSize, data[yi][xi + 1], (yi + 1) * elementSize);
            }
            else {
                // Top triangle verts
                a.set((xi + 1) * elementSize, data[yi + 1][xi + 1], (yi + 1) * elementSize);
                b.set(xi * elementSize, data[yi][xi + 1], (yi + 1) * elementSize);
                c.set((xi + 1) * elementSize, data[yi + 1][xi], yi * elementSize);
            }
        }
        /**
         * Get a triangle in the terrain in the form of a triangular convex shape.
         * 把xy位置的地块转成一个convex，保存到 this.pllarConvex中
         * xi,yi定位到data中的索引
         */
        getConvexTrianglePillar(xi, yi, getUpperTriangle) {
            let result = this.pillarConvex;
            let offsetResult = this.pillarOffset;
            if (this.cacheEnabled) {
                // 检查是否有缓存
                let data = this.getCachedConvexTrianglePillar(xi, yi, getUpperTriangle);
                if (data) {
                    this.pillarConvex = data.convex;
                    this.pillarOffset = data.offset;
                    return;
                }
                result = new ConvexPolyhedron();
                offsetResult = new Vec3();
                this.pillarConvex = result;
                this.pillarOffset = offsetResult;
            }
            let data = this.data;
            const elementSize = this.elementSize;
            const faces = result.faces;
            // Reuse verts if possible
            // 多面体是一个三棱柱，有6个顶点，5个面
            result.vertices.length = 6;
            for (var i = 0; i < 6; i++) {
                if (!result.vertices[i]) {
                    result.vertices[i] = new Vec3();
                }
            }
            // Reuse faces if possible
            faces.length = 5;
            for (var i = 0; i < 5; i++) {
                if (!faces[i]) {
                    faces[i] = []; // 每个面的多边形索引
                }
            }
            const verts = result.vertices;
            // 四个点的最低点到整体最低点的中点
            const h = (Math.min(data[yi][xi], data[yi + 1][xi], data[yi][xi + 1], data[yi + 1][xi + 1]) - this.minValue) / 2 + this.minValue;
            if (getUpperTriangle) {
                // Center of the triangle pillar - all polygons are given relative to this one
                offsetResult.set((xi + 0.25) * elementSize, // sort of center of a triangle
                h, // vertical center
                (yi + 0.25) * elementSize);
                // Top triangle verts
                // 0        1
                //  *-----*
                //  | . /  . 是offsetResult
                //  | /
                //  *  
                // 2
                verts[0].set(-0.25 * elementSize, // 相对于offsetResult，所以是 -0.25,-0.25
                data[yi][xi] - h, -0.25 * elementSize);
                verts[1].set(0.75 * elementSize, data[yi][xi + 1] - h, -0.25 * elementSize);
                verts[2].set(-0.25 * elementSize, data[yi + 1][xi] - h, 0.75 * elementSize);
                // bottom triangle verts
                verts[3].set(-0.25 * elementSize, -h - 1, // 本来是-h， -1是为了加厚么?
                -0.25 * elementSize);
                verts[4].set(0.75 * elementSize, -h - 1, -0.25 * elementSize);
                verts[5].set(-0.25 * elementSize, -h - 1, 0.75 * elementSize);
                // top triangle
                faces[0][0] = 1;
                faces[0][1] = 0;
                faces[0][2] = 2;
                // bottom triangle
                faces[1][0] = 3;
                faces[1][1] = 4;
                faces[1][2] = 5;
                // -x facing quad
                faces[2][0] = 2;
                faces[2][1] = 0;
                faces[2][2] = 3;
                faces[2][3] = 5;
                // -y facing quad
                faces[3][0] = 0;
                faces[3][1] = 1;
                faces[3][2] = 4;
                faces[3][3] = 3;
                // +xy facing quad
                faces[4][0] = 1;
                faces[4][1] = 2;
                faces[4][2] = 5;
                faces[4][3] = 4;
            }
            else {
                //         2
                //        *
                //      / | 
                //    / . | 是offsetResult
                //  * --- *
                //  1      0
                // Center of the triangle pillar - all polygons are given relative to this one
                offsetResult.set((xi + 0.75) * elementSize, // sort of center of a triangle
                h, // vertical center
                (yi + 0.75) * elementSize);
                // Top triangle verts
                verts[0].set(0.25 * elementSize, data[yi + 1][xi + 1] - h, 0.25 * elementSize);
                verts[1].set(-0.75 * elementSize, data[yi + 1][xi] - h, 0.25 * elementSize);
                verts[2].set(0.25 * elementSize, data[yi][xi + 1] - h, -0.75 * elementSize);
                // bottom triangle verts
                verts[3].set(0.25 * elementSize, -h - 1, 0.25 * elementSize);
                verts[4].set(-0.75 * elementSize, -h - 1, 0.25 * elementSize);
                verts[5].set(0.25 * elementSize, -h - 1, -0.75 * elementSize);
                // Top triangle  符合后面convex的要求，要CCW
                faces[0][0] = 0;
                faces[0][1] = 2;
                faces[0][2] = 1;
                // bottom triangle
                faces[1][0] = 3;
                faces[1][1] = 4;
                faces[1][2] = 5;
                // +x facing quad
                faces[2][0] = 0;
                faces[2][1] = 3;
                faces[2][2] = 5;
                faces[2][3] = 2;
                // +z facing quad
                faces[3][0] = 0;
                faces[3][1] = 1;
                faces[3][2] = 4;
                faces[3][3] = 3;
                // -xz facing quad
                faces[4][0] = 1;
                faces[4][1] = 2;
                faces[4][2] = 5;
                faces[4][3] = 4;
            }
            result.computeNormals(); //TODO 只有一个面需要计算法线，其他都是已知的
            result.computeEdges();
            result.updateBndSphR();
            // 加到缓存
            this.setCachedConvexTrianglePillar(xi, yi, getUpperTriangle, result, offsetResult);
        }
        calculateLocalInertia(mass, target = new Vec3()) {
            target.set(0, 0, 0);
            return target;
        }
        volume() {
            return Number.MAX_VALUE; // The terrain is infinite
        }
        calculateWorldAABB(pos, quat, min, max) {
            // TODO: do it properly
            min.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
            max.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        }
        updateBndSphR() {
            // Use the bounding box of the min/max values
            const data = this.data;
            const s = this.elementSize;
            this.boundSphR = new Vec3(data[0].length * s, data.length * s, Math.max(Math.abs(this.maxValue), Math.abs(this.minValue))).length();
        }
        /**
         * 根据所在位置和球的半径，计算加厚以后的新的xi,yi处的点。用来进行球和地面的碰撞检测
         * 周围四个点可能在一个平面，也可能再两个，三个，四个。。，假设最多4个
         *  + ---------------> x
         *  |      1
         *  | 2  xi,yi  3
         *  |      4
         *  v
         *  z
         * 所有的平面都沿着自己的法线增厚R，则新的交点一定在各个法线的合向量方向，沿着这个方向直到到达d的投影距离
         * @param xi
         * @param yi
         * @param p
         */
        _getRPoint(R, xi, yi, p) {
            let tnorm = Heightfield.getRPoitnTNorm; // 合法线
            let norm1 = Heightfield.getRPointTmpN;
            let setnorm1 = false;
            let gw = this.elementSize;
            let e0 = getPlane_e0;
            let e1 = getPlane_e1;
            let vec0 = _getRPoint_v0;
            let data = this.data;
            let w = data[0].length;
            let h = data.length;
            let norm = _getRPoint_norm;
            let v0 = data[yi][xi];
            let v1 = 0;
            let v2 = 0;
            let v3 = 0;
            let v4 = 0;
            vec0.set(xi * gw, v0, yi * gw);
            if (yi > 0 && xi > 0) {
                //v1,v0,v2
                v1 = data[yi - 1][xi];
                v2 = data[yi][xi - 1];
                e0.set(0, v1 - v0, -gw); //v1-v0;
                e1.set(-gw, v2 - v0, 0); //v2-v0;
                e0.cross(e1, norm);
                norm.normalize();
                norm1.copy(norm);
                setnorm1 = true;
                tnorm.vadd(norm, tnorm);
            }
            if (yi > 0 && xi < w - 1) {
                //v3,v0,v1
                v3 = data[yi][xi + 1];
                v1 = data[yi - 1][xi];
                e0.set(gw, v3 - v0, 0);
                e1.set(0, v1 - v0, -gw);
                e0.cross(e1, norm);
                norm.normalize();
                if (!setnorm1) {
                    norm1.copy(norm);
                    setnorm1 = true;
                }
                tnorm.vadd(norm, tnorm);
            }
            if (yi < h - 1 && xi < w - 1) {
                //v4,v0,v3
                v3 = data[yi][xi + 1];
                v4 = data[yi + 1][xi];
                e0.set(0, v4 - v0, gw);
                e1.set(gw, v3 - v0, 0);
                e0.cross(e1, norm);
                norm.normalize();
                if (!setnorm1) {
                    norm1.copy(norm);
                    setnorm1 = true;
                }
                tnorm.vadd(norm, tnorm);
            }
            if (xi > 0 && yi < h - 1) {
                //v2,v0,v4
                v2 = data[yi][xi - 1];
                v4 = data[yi + 1][xi];
                e0.set(-gw, v2 - v0, 0);
                e1.set(0, v4 - v0, gw);
                e0.cross(e1, norm);
                norm.normalize();
                if (!setnorm1) {
                    norm1.copy(norm);
                    setnorm1 = true;
                }
                tnorm.vadd(norm, tnorm);
            }
            // 计算总法线
            tnorm.normalize();
            // 沿着新的法线移动l就能到达交点 dot(tnorm,norm1)=R/l
            // 随便一个平面的法线
            if (setnorm1) {
                let d = norm1.dot(tnorm);
                if (d > 0) {
                    let l = R / d;
                    p.copy(tnorm);
                    p.addScaledVector(l, p, p);
                }
                else {
                    // 不可能。就算是尖也不会<0
                }
            }
            else {
                console.error('error no norm1');
            }
            return p;
        }
        /**
         * 最简假设的情况。地形很大，球一定小于格子
         * 在大于blockAng的情况下只能下滑
         * 返回 0 没有碰撞 1 碰撞了 2 碰撞了，但是不允许控制，处于下滑状态
         * 太陡的地方的处理：不能直接推出去，比如从一个缓坡走到悬崖
         * 按理说悬崖的处理应该是逻辑做的，需要判断整体的高度
         * @param pos
         * @param R
         * @param cliffAng
         * @param stopOnCliff
         * @param stepHeight
         * @param hitPos
         * @param hitDeep 碰撞结果，需要回退的值
         */
        hitSmallSphere(pos, R, cliffAng, stopOnCliff, stepHeight, hitPos, hitDeep) {
            const w = this.elementSize;
            const data = this.data;
            if (pos.x < 0)
                return 0;
            if (pos.x > w * data[0].length)
                return 0;
            if (pos.z < 0)
                return 0;
            if (pos.z > w * data.length)
                return 0;
            let maxdot = Math.cos(Math.PI / 2 - cliffAng); // 与{0,1,0}矢量的夹角,越大越陡
            let xi = Math.floor(pos.x / w);
            let yi = Math.floor(pos.z / w);
            let idx = getHeightAt_idx;
            this.getIndexOfPosition(pos.x, pos.z, idx, true);
            const a = getNormalAt_a;
            const b = getNormalAt_b;
            const c = getNormalAt_c;
            let norm = sphereHitSimple_norm;
            let d = this.getPlane(xi, yi, true, a, b, c, norm);
            //球在这个平面的投影的区域
            let d0 = sphereHitSimple_d0;
            pos.vsub(a, d0);
            let dist = d0.dot(norm); // pos到平面的距离
            pos.addScaledVector(-dist, norm, hitPos); // 投影到平面的点
            // 判断是否在三角形内
            this.getTriangle(xi, yi, true, a, b, c);
            this.getTriangle(xi, yi, false, a, b, c);
            // 
            //if(hitNorm.y>maxdot){
            // 当前所在位置太陡了,只能下滑
            //	return 2;
            //}
            return 0;
        }
        /**
         * 与本地空间的一个球相撞，给角色控制器用的。因此只要一个等效的碰撞点和碰撞法线就行
         * @param pos
         * @param R
         * @param blockAng  多大角度会阻挡前进，按照与地面的夹角算。单位是弧度
         * @param stepHeight  开跨越多高的障碍
         * @param hitPos
         * @param hitNorm
         */
        hitSphere1(pos, R, blockAng, stepHeight, hitPos, hitNorm) {
            if (pos.y - R > this.maxValue)
                return false;
            let minx = pos.x - R;
            let minz = pos.z - R;
            let maxx = pos.x + R;
            let maxz = pos.z + R;
            let data = this.data;
            if (maxx < 0)
                return false;
            if (maxz < 0)
                return false;
            let w = this.elementSize;
            if (minx > data[0].length * w)
                return false;
            if (minz > data.length * w)
                return false;
            // 先根据覆盖范围合并数据
            let idx = getHeightAt_idx;
            this.getIndexOfPosition(minx, minz, idx, true);
            let minpx = idx[0];
            let minpz = idx[1];
            this.getIndexOfPosition(maxx, maxz, idx, true);
            let maxpx = idx[0];
            let maxpz = idx[1];
            let gw = maxx - minx;
            let gh = maxz - minz;
            let maxdot = Math.cos(Math.PI / 2 - blockAng); // 与{0,1,0}矢量的夹角,越大越陡
            // if(normal.y>maxdot) face=|
            for (let z = minpz; z <= maxpz; z++) {
                for (let x = minpx; x <= maxpx; x++) {
                    let h0 = data[z][x];
                    let h1 = data[z][x + 1];
                    let h2 = data[z + 1][x];
                    let h3 = data[z + 1][x + 1];
                }
            }
            return true;
        }
        /**
         * Sets the height values from an image. Currently only supported in browser.
         * @param
         * @param scale 地形的大小,z是高度。以后改成y是高度 TODO yz
         */
        setHeightsFromImage(image, scale) {
            const canvas = document.createElement('canvas');
            let w = canvas.width = image.width;
            let h = canvas.height = image.height;
            const context = canvas.getContext('2d');
            if (!context) {
                console.error('get context 2d error');
                return;
            }
            context.drawImage(image, 0, 0);
            const imageData = context.getImageData(0, 0, w, h);
            const matrix = this.data;
            matrix.length = 0;
            this.elementSize = Math.abs(scale.x) / w;
            let hscale = scale.y / 255;
            for (let i = 0; i < h; i++) {
                const row = [];
                for (let j = 0; j < w; j++) {
                    const a = imageData.data[(i * w + j) * 4];
                    //const b = imageData.data[(i * h + j) * 4 + 1];
                    //const c = imageData.data[(i * h + j) * 4 + 2];
                    const height = a * hscale;
                    if (scale.x < 0) {
                        row.unshift(height);
                    }
                    else {
                        row.push(height);
                    }
                }
                if (scale.y < 0) {
                    matrix.unshift(row);
                }
                else {
                    matrix.push(row);
                }
            }
            this.updateMaxValue();
            this.updateMinValue();
            this.update();
            return imageData;
        }
    }
    Heightfield.getRPoitnTNorm = new Vec3();
    Heightfield.getRPointTmpN = new Vec3();
    var getHeightAt_idx = [];
    var getHeightAt_weights = new Vec3();
    var getHeightAt_a = new Vec3();
    var getHeightAt_b = new Vec3();
    var getHeightAt_c = new Vec3();
    var getNormalAt_a = new Vec3();
    var getNormalAt_b = new Vec3();
    var getNormalAt_c = new Vec3();
    var getNormalAt_e0 = new Vec3();
    var getNormalAt_e1 = new Vec3();
    var getPlane_a = new Vec3();
    var getPlane_b = new Vec3();
    var getPlane_c = new Vec3();
    var getPlane_e0 = new Vec3();
    var getPlane_e1 = new Vec3();
    var _getRPoint_v0 = new Vec3();
    var _getRPoint_v1 = new Vec3();
    var _getRPoint_v3 = new Vec3();
    var _getRPoint_v4 = new Vec3();
    var _getRPoint_norm = new Vec3();
    var sphereHitSimple_norm = new Vec3();
    var sphereHitSimple_d0 = new Vec3();
    /**
     * from https://en.wikipedia.org/wiki/Barycentric_coordinate_system
     * 计算二维三角形的重心坐标
     */
    function barycentricWeights(x, y, ax, ay, bx, by, cx, cy, result) {
        result.x = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / ((by - cy) * (ax - cx) + (cx - bx) * (ay - cy));
        result.y = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / ((by - cy) * (ax - cx) + (cx - bx) * (ay - cy));
        result.z = 1 - result.x - result.y;
    }

    /**
     * 三维空间最简形
     */
    var tmpMat3 = new Mat3();
    class Tetrahedron {
        constructor(v0, v1, v2, v3) {
            //verts: Vec3[] = [new Vec3(), new Vec3(), new Vec3(), new Vec3()];   // 四个顶点
            this.v0 = new Vec3();
            this.v1 = new Vec3();
            this.v2 = new Vec3();
            this.v3 = new Vec3();
            this.invA = new Mat3();
            let e = tmpMat3.ele;
            e[0] = v1.x - v0.x;
            e[1] = v2.x - v0.x;
            e[2] = v3.x - v0.x;
            e[3] = v1.y - v0.y;
            e[4] = v2.y - v0.y;
            e[5] = v3.y - v0.y;
            e[6] = v1.z - v0.z;
            e[7] = v2.z - v0.z;
            e[8] = v3.z - v0.z;
            tmpMat3.reverse(this.invA); // TODO 修改reverse的实现
            this.v0 = v0;
            this.v1 = v1;
            this.v2 = v2;
            this.v3 = v3;
        }
        barycentricCoord(x, y, z, out) {
            let v0 = this.v0;
            let dx = x - v0.x;
            let dy = y - v0.y;
            let dz = z - v0.z;
            out.set(dx, dy, dz);
            this.invA.vmult(out, out); //TODO 这里可能不对
            return out;
        }
    }

    function POT(v) {
        let r = 1;
        while (v > r) {
            r = r << 1;
        }
        return r;
    }
    /**
     * 求vec3的哈希值
     * http://www.beosil.com/download/CollisionDetectionHashing_VMV03.pdf
     * @param x
     * @param y
     * @param z
     * @param l 格子的大小
     * @param n hash表的大小
     */
    function hashVec3(x, y, z, l, n) {
        let ix = (x / l) | 0;
        let iy = (y / l) | 0;
        let iz = (z / l) | 0;
        let p1 = 73856093;
        let p2 = 19349663; //TODO 这个并不是一个质数 19349669 
        let p3 = 83492791;
        return ((ix * p1) ^ (iy * p2) ^ (iz * p3)) % n;
    }
    function hashIGrid(x, y, z, n) {
        return (((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) & 0x7fffffff) % n;
    }
    class hashData {
    }
    // 把 SparseVoxData 转成普通的 hash数组
    function hashSparseVox(vox) {
        let solidnum = vox.data.length;
        let data = new Array(solidnum);
        vox.data.forEach(v => {
            let hashi = hashIGrid(v.x, v.y, v.z, solidnum);
            let cdt = data[hashi];
            if (!cdt) {
                data[hashi] = cdt = [];
            }
            cdt.push({ x: v.x, y: v.y, z: v.z, v: v.color });
        });
        return data;
    }
    /**
     * 原始数据构造
     * 除了第一层以外都是完整八叉树  用来做大块的判断 上层完整的话，占0层的1/7的内存
     * 第一层用hash来保存
     */
    class SparseVoxData {
        constructor(dt, xn, yn, zn, min, max) {
            this.dataLod = [];
            /** local坐标的包围盒。相对于本地原点 */
            this.aabbmin = new Vec3();
            this.aabbmax = new Vec3();
            this.data = dt;
            this.dataszx = xn;
            this.dataszy = yn;
            this.dataszz = zn;
            this.aabbmin.copy(min);
            this.aabbmax.copy(max);
            this.gridsz = (max.x - min.x) / xn;
            this.hashdata = SparseVoxData.hashSparseVox(this);
        }
        // 把 SparseVoxData 转成普通的 hash数组
        static hashSparseVox(vox) {
            let solidnum = vox.data.length;
            let data = new Array(solidnum);
            vox.data.forEach(v => {
                let hashi = hashIGrid(v.x, v.y, v.z, solidnum);
                let cdt = data[hashi];
                if (!cdt) {
                    cdt = data[hashi] = [];
                }
                cdt.push({ x: v.x, y: v.y, z: v.z, v: v.color });
            });
            return data;
        }
        travAll(cb) {
            this.data.forEach(v => {
                cb(v.x, v.y, v.z, v.color);
            });
        }
        // 0表示没有
        getRaw(x, y, z) {
            let dt = this.data;
            for (let i = 0, sz = dt.length; i < sz; i++) {
                let cd = dt[i];
                if (cd.x == x && cd.y == y && cd.z == z)
                    return cd.color;
            }
            return 0;
        }
        get(x, y, z) {
            let dt = this.hashdata;
            let hashsz = this.hashdata.length;
            let id = hashIGrid(x, y, z, hashsz);
            let bin = dt[id];
            if (bin) {
                for (let i = 0, sz = bin.length; i < sz; i++) {
                    let cdt = bin[i];
                    if (cdt.x == x && cdt.y == y && cdt.z == z)
                        return cdt.v;
                }
            }
            return 0;
        }
        // 生成各级LOD信息,也就是八叉树。这是为了做大范围检测用的。
        genLOD() {
            let maxs = this.maxsz = Math.max(this.dataszx, this.dataszy, this.dataszz);
            let lodlv = POT(maxs);
            this.dataLod.length = lodlv;
            this.dataLod.map;
            this.dataLod[0] = this.data; //0级就是原始数据
            let dictobj = {};
            this.travAll((x, y, z, v) => {
                //while()
                //x>>1,y>>1,z>>1
            });
        }
        OBBCheck(min, max, mat) {
            // 一级一级找
        }
    }
    /**
     * 每一级的voxel数据
     */
    class VoxelBitData {
        /**
         * xyzsize是数据个数，这里会用bit来保存，所以里面每个轴会除以2
         * @param xsize
         * @param ysize
         * @param zsize
         * @param min  原始包围盒大小
         * @param max
         */
        constructor(xsize, ysize, zsize, min, max) {
            this.xs = 0; //uint8数据的xsize，是实际数据长度的一半
            this.ys = 0;
            this.zs = 0;
            /** 由于上面为了对齐可能有多余的，这里记录实际数据 */
            this.rx = 0;
            this.ry = 0;
            this.rz = 0;
            /**
             * 由于不是POT
             * 可能会扩展bbx，例如 上一级x有6个格子,对应的xs=3, bbx=0~6， 每个格子宽度为1
             * 下一级的时候，xs=2，表示4个格子，比直接除2多出一个来，所以要扩展 上一级gridx*2 = 2
             * 如果下一级没有扩展，则不变，例如 8->4->2->1
             */
            this.max = new Vec3(); // 注意这个只是原始包围盒，没有被变换
            this.min = new Vec3(); //
            this.rx = xsize;
            this.ry = ysize;
            this.rz = zsize;
            this.xs = (xsize + 1) >> 1;
            this.ys = (ysize + 1) >> 1;
            this.zs = (zsize + 1) >> 1;
            this.dt = new Uint8Array(this.xs * this.ys * this.zs);
            this.min.copy(min);
            this.max.copy(max);
            // 是否扩展了bbx
            if ((xsize & 1) == 1) {
                let dx = (max.x - min.x) / xsize;
                this.max.x += dx;
            }
            if ((ysize & 1) == 1) {
                let dy = (max.y - min.y) / ysize;
                this.max.y += dy;
            }
            if ((zsize & 1) == 1) {
                let dz = (max.z - min.z) / zsize;
                this.max.z += dz;
            }
        }
        //设置。这里的xyz可以是 this.xs的两倍
        setBit(x, y, z) {
            //z,y,x
            let xs = this.xs, ys = this.ys;
            let pos = (z >> 1) * (xs * ys) + (y >> 1) * xs + (x >> 1);
            let bit = ((z & 1) << 2) + ((y & 1) << 1) + (x & 1);
            this.dt[pos] |= (1 << bit);
        }
        getBit(x, y, z) {
            if (x >= this.rx || x < 0 || y >= this.ry || y < 0 || z >= this.rz || z < 0) {
                //debugger;
                console.error('getbit param error');
                return 0;
            }
            //bit:z,y,x, 所以是
            //      Y
            //      |     010 011
            //   110 111  000 001  
            //   100 101 ________ X
            //   /
            // Z		
            // 注意转成二进制查看的话，要倒着看，例如  00110011 表示两层，下层水平面是4个实，上层是4个空
            //                                     <-------
            //      0 0
            //  0 0 1 1
            //  1 1
            let xs = this.xs, ys = this.ys;
            let pos = (z >> 1) * (xs * ys) + (y >> 1) * xs + (x >> 1);
            let bit = ((z & 1) << 2) + ((y & 1) << 1) + (x & 1);
            return (this.dt[pos] & (1 << bit)) != 0;
        }
        /**
         * 生成上一级数据，并且填充
         */
        genParent() {
            if (this.xs <= 1 && this.ys <= 1 && this.zs <= 1)
                return null;
            let xs = this.xs, ys = this.ys, zs = this.zs;
            let ret = new VoxelBitData(xs, ys, zs, this.min, this.max); //xs等已经是除以2的了
            //给父级设值
            let dt = this.dt;
            let i = 0;
            for (let z = 0; z < zs; z++) {
                for (let y = 0; y < ys; y++) {
                    for (let x = 0; x < xs; x++) {
                        let v = dt[i++];
                        if (v) {
                            ret.setBit(x, y, z);
                        }
                    }
                }
            }
            return ret;
        }
    }

    /**
     * @class OctreeNode
     * @param {object} [options]
     * @param {Octree} [options.root]
     * @param {AABB} [options.aabb]
     */
    class OctreeNode {
        constructor(root, aabb) {
            /**
             * Boundary of this node
             */
            this.aabb = new AABB();
            /**
             * Contained data at the current node level.
             */
            this.data = [];
            this.maxDepth = 0;
            /**
             * Children to this node
             */
            this.children = [];
            if (root)
                this.root = root;
            if (aabb) {
                this.aabb = aabb.clone();
            }
        }
        reset(aabb, options) {
            this.children.length = this.data.length = 0;
        }
        /**
         * Insert data into this node
         */
        insert(aabb, elementData, level) {
            const nodeData = this.data;
            level = level || 0;
            // Ignore objects that do not belong in this node
            if (!this.aabb.contains(aabb)) {
                return false; // object cannot be added
            }
            const children = this.children;
            if (level < (this.maxDepth || this.root.maxDepth)) {
                // Subdivide if there are no children yet
                let subdivided = false;
                if (!children.length) {
                    this.subdivide();
                    subdivided = true;
                }
                // add to whichever node will accept it
                for (let i = 0; i !== 8; i++) {
                    if (children[i].insert(aabb, elementData, level + 1)) {
                        return true;
                    }
                }
                if (subdivided) {
                    // No children accepted! Might as well just remove em since they contain none
                    children.length = 0;
                }
            }
            // Too deep, or children didnt want it. add it in current node
            nodeData.push(elementData);
            return true;
        }
        /**
         * Create 8 equally sized children nodes and put them in the .children array.
         */
        subdivide() {
            const aabb = this.aabb;
            const l = aabb.lowerBound;
            const u = aabb.upperBound;
            const children = this.children;
            const root = this.root || this;
            children.push(new OctreeNode(root, new AABB(new Vec3(0, 0, 0))), new OctreeNode(root, new AABB(new Vec3(1, 0, 0))), new OctreeNode(root, new AABB(new Vec3(1, 1, 0))), new OctreeNode(root, new AABB(new Vec3(1, 1, 1))), new OctreeNode(root, new AABB(new Vec3(0, 1, 1))), new OctreeNode(root, new AABB(new Vec3(0, 0, 1))), new OctreeNode(root, new AABB(new Vec3(1, 0, 1))), new OctreeNode(root, new AABB(new Vec3(0, 1, 0))));
            u.vsub(l, halfDiagonal);
            halfDiagonal.scale(0.5, halfDiagonal);
            for (let i = 0; i !== 8; i++) {
                const child = children[i];
                // Compute bounds
                const lowerBound = child.aabb.lowerBound;
                lowerBound.x *= halfDiagonal.x;
                lowerBound.y *= halfDiagonal.y;
                lowerBound.z *= halfDiagonal.z;
                lowerBound.vadd(l, lowerBound);
                // Upper bound is always lower bound + halfDiagonal
                lowerBound.vadd(halfDiagonal, child.aabb.upperBound);
            }
        }
        /**
         * Get all data, potentially within an AABB
         * @return  The "result" object
         */
        aabbQuery(aabb, result) {
            //const nodeData = this.data;
            // abort if the range does not intersect this node
            // if (!this.aabb.overlaps(aabb)){
            //     return result;
            // }
            // Add objects at this level
            // Array.prototype.push.apply(result, nodeData);
            // Add child data
            // @todo unwrap recursion into a queue / loop, that's faster in JS
            //const children = this.children;
            // for (var i = 0, N = this.children.length; i !== N; i++) {
            //     children[i].aabbQuery(aabb, result);
            // }
            const queue = [this];
            while (queue.length) {
                const node = queue.pop();
                if (node.aabb.overlaps(aabb)) {
                    Array.prototype.push.apply(result, node.data);
                }
                Array.prototype.push.apply(queue, node.children);
            }
            return result;
        }
        /**
         * Get all data, potentially intersected by a ray.
         */
        rayQuery(ray, treeTransform, result) {
            // Use aabb query for now.
            // @todo implement real ray query which needs less lookups
            ray.getAABB(tmpAABB);
            tmpAABB.toLocalFrame(treeTransform, tmpAABB);
            this.aabbQuery(tmpAABB, result);
            return result;
        }
        /**
         * @method removeEmptyNodes
         */
        removeEmptyNodes() {
            const queue = [this];
            while (queue.length) {
                const node = queue.pop();
                for (let i = node.children.length - 1; i >= 0; i--) {
                    if (!node.children[i].data.length) {
                        node.children.splice(i, 1);
                    }
                }
                Array.prototype.push.apply(queue, node.children);
            }
        }
    }
    /**
     * @class Octree
     * @param {AABB} aabb The total AABB of the tree
     * @param {object} [options]
     * @param {number} [options.maxDepth=8]
     * @extends OctreeNode
     */
    class Octree extends OctreeNode {
        constructor(aabb, maxDepth = 8) {
            super(null, aabb);
            this.maxDepth = 8;
            this.root = this;
            /**
             * Maximum subdivision depth
             */
            this.maxDepth = maxDepth;
        }
    }
    var halfDiagonal = new Vec3();
    var tmpAABB = new AABB();

    /**
     * @class Trimesh
     * @constructor
     * @param {array} vertices
     * @param {array} indices
     * @extends Shape
     * @example
     *     // How to make a mesh with a single triangle
     *     var vertices = [
     *         0, 0, 0, // vertex 0
     *         1, 0, 0, // vertex 1
     *         0, 1, 0  // vertex 2
     *     ];
     *     var indices = [
     *         0, 1, 2  // triangle 0
     *     ];
     *     var trimeshShape = new Trimesh(vertices, indices);
     */
    class Trimesh extends Shape {
        constructor(vertices, indices) {
            super();
            /**
             * The local AABB of the mesh.
             */
            this.aabb = new AABB();
            /**
             * Local scaling of the mesh. Use .setScale() to set it.
             */
            this.scale = new Vec3(1, 1, 1);
            /**
             * The indexed triangles. Use .updateTree() to update it.
             */
            this.tree = new Octree();
            this.type = 256 /* TRIMESH */;
            this.vertices = new Float32Array(vertices);
            this.indices = new Int16Array(indices);
            this.normals = new Float32Array(indices.length);
            this.updateEdges();
            this.updateNormals();
            this.updateAABB();
            this.updateBndSphR();
            this.updateTree();
        }
        onPreNarrowpase(stepId, pos, quat) { }
        /**
         * @method updateTree
         */
        updateTree() {
            const tree = this.tree;
            tree.reset();
            tree.aabb.copy(this.aabb);
            const scale = this.scale; // The local mesh AABB is scaled, but the octree AABB should be unscaled
            tree.aabb.lowerBound.x *= 1 / scale.x;
            tree.aabb.lowerBound.y *= 1 / scale.y;
            tree.aabb.lowerBound.z *= 1 / scale.z;
            tree.aabb.upperBound.x *= 1 / scale.x;
            tree.aabb.upperBound.y *= 1 / scale.y;
            tree.aabb.upperBound.z *= 1 / scale.z;
            // Insert all triangles
            const triangleAABB = new AABB();
            const a = new Vec3();
            const b = new Vec3();
            const c = new Vec3();
            const points = [a, b, c];
            for (let i = 0; i < this.indices.length / 3; i++) {
                //this.getTriangleVertices(i, a, b, c);
                // Get unscaled triangle verts
                const i3 = i * 3;
                this._getUnscaledVertex(this.indices[i3], a);
                this._getUnscaledVertex(this.indices[i3 + 1], b);
                this._getUnscaledVertex(this.indices[i3 + 2], c);
                triangleAABB.setFromPoints(points);
                tree.insert(triangleAABB, i);
            }
            tree.removeEmptyNodes();
        }
        /**
         * Get triangles in a local AABB from the trimesh.
         * @param  result An array of integers, referencing the queried triangles.
         */
        getTrianglesInAABB(aabb, result) {
            unscaledAABB.copy(aabb);
            // Scale it to local
            const scale = this.scale;
            const isx = scale.x;
            const isy = scale.y;
            const isz = scale.z;
            const l = unscaledAABB.lowerBound;
            const u = unscaledAABB.upperBound;
            l.x /= isx;
            l.y /= isy;
            l.z /= isz;
            u.x /= isx;
            u.y /= isy;
            u.z /= isz;
            return this.tree.aabbQuery(unscaledAABB, result);
        }
        setScale(x, y, z) {
            const wasUniform = this.scale.x === this.scale.y && this.scale.y === this.scale.z;
            ;
            const isUniform = x === y && y === z;
            if (!(wasUniform && isUniform)) {
                // Non-uniform scaling. Need to update normals.
                this.updateNormals();
            }
            this.scale.set(x, y, z); //copy(scale);
            this.updateAABB();
            this.updateBndSphR();
        }
        /**
         * Compute the normals of the faces. Will save in the .normals array.
         * @method updateNormals
         */
        updateNormals() {
            const n = computeNormals_n;
            // Generate normals
            const normals = this.normals;
            for (let i = 0; i < this.indices.length / 3; i++) {
                const i3 = i * 3;
                const a = this.indices[i3];
                const b = this.indices[i3 + 1];
                const c = this.indices[i3 + 2];
                this.getVertex(a, va);
                this.getVertex(b, vb);
                this.getVertex(c, vc);
                Trimesh.computeNormal(vb, va, vc, n);
                normals[i3] = n.x;
                normals[i3 + 1] = n.y;
                normals[i3 + 2] = n.z;
            }
        }
        /**
         * Update the .edges property
         */
        updateEdges() {
            const edges = {};
            const add = (indexA, indexB) => {
                const key = a < b ? `${a}_${b}` : `${b}_${a}`;
                edges[key] = true;
            };
            for (var i = 0; i < this.indices.length / 3; i++) {
                const i3 = i * 3;
                var a = this.indices[i3];
                var b = this.indices[i3 + 1];
                const c = this.indices[i3 + 2];
                add(a, b);
                add(b, c);
                add(c, a);
            }
            const keys = Object.keys(edges);
            this.edges = new Int16Array(keys.length * 2);
            for (var i = 0; i < keys.length; i++) {
                const indices = keys[i].split('_');
                this.edges[2 * i] = parseInt(indices[0], 10);
                this.edges[2 * i + 1] = parseInt(indices[1], 10);
            }
        }
        /**
         * Get an edge vertex
         * @method getEdgeVertex
         * @param   edgeIndex
         * @param   firstOrSecond 0 or 1, depending on which one of the vertices you need.
         * @param   vertexStore Where to store the result
         */
        getEdgeVertex(edgeIndex, firstOrSecond, vertexStore) {
            const vertexIndex = this.edges[edgeIndex * 2 + (firstOrSecond ? 1 : 0)];
            this.getVertex(vertexIndex, vertexStore);
        }
        /**
         * Get a vector along an edge.
         */
        getEdgeVector(edgeIndex, vectorStore) {
            const va = getEdgeVector_va;
            const vb = getEdgeVector_vb;
            this.getEdgeVertex(edgeIndex, 0, va);
            this.getEdgeVertex(edgeIndex, 1, vb);
            vb.vsub(va, vectorStore);
        }
        /**
         * Get vertex i.
         */
        getVertex(i, out) {
            const scale = this.scale;
            this._getUnscaledVertex(i, out);
            out.x *= scale.x;
            out.y *= scale.y;
            out.z *= scale.z;
            return out;
        }
        /**
         * Get raw vertex i
         */
        _getUnscaledVertex(i, out) {
            const i3 = i * 3;
            const vertices = this.vertices;
            return out.set(vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);
        }
        /**
         * Get a vertex from the trimesh,transformed by the given position and quaternion.
         */
        getWorldVertex(i, pos, quat, out) {
            this.getVertex(i, out);
            Transform.pointToWorldFrame(pos, quat, out, out);
            return out;
        }
        /**
         * Get the three vertices for triangle i.
         */
        getTriangleVertices(i, a, b, c) {
            const i3 = i * 3;
            this.getVertex(this.indices[i3], a);
            this.getVertex(this.indices[i3 + 1], b);
            this.getVertex(this.indices[i3 + 2], c);
        }
        /**
         * Compute the normal of triangle i.
         */
        getNormal(i, target) {
            const i3 = i * 3;
            return target.set(this.normals[i3], this.normals[i3 + 1], this.normals[i3 + 2]);
        }
        calculateLocalInertia(mass, target) {
            // Approximate with box inertia
            // Exact inertia calculation is overkill, but see http://geometrictools.com/Documentation/PolyhedralMassProperties.pdf for the correct way to do it
            this.computeLocalAABB(cli_aabb);
            const x = cli_aabb.upperBound.x - cli_aabb.lowerBound.x;
            const y = cli_aabb.upperBound.y - cli_aabb.lowerBound.y;
            const z = cli_aabb.upperBound.z - cli_aabb.lowerBound.z;
            return target.set(1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * z * 2 * z), 1.0 / 12.0 * mass * (2 * x * 2 * x + 2 * z * 2 * z), 1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * x * 2 * x));
        }
        /**
         * Compute the local AABB for the trimesh
         */
        computeLocalAABB(aabb) {
            const l = aabb.lowerBound;
            const u = aabb.upperBound;
            const n = this.vertices.length;
            //const vertices = this.vertices;
            const v = computeLocalAABB_worldVert;
            this.getVertex(0, v);
            l.copy(v);
            u.copy(v);
            for (let i = 0; i !== n; i++) {
                this.getVertex(i, v);
                if (v.x < l.x) {
                    l.x = v.x;
                }
                else if (v.x > u.x) {
                    u.x = v.x;
                }
                if (v.y < l.y) {
                    l.y = v.y;
                }
                else if (v.y > u.y) {
                    u.y = v.y;
                }
                if (v.z < l.z) {
                    l.z = v.z;
                }
                else if (v.z > u.z) {
                    u.z = v.z;
                }
            }
        }
        /**
         * Update the .aabb property
         * @method updateAABB
         */
        updateAABB() {
            this.computeLocalAABB(this.aabb);
        }
        /**
         * Will update the .boundingSphereRadius property
         * @method updateBndSphR
         */
        updateBndSphR() {
            // Assume points are distributed with local (0,0,0) as center
            let max2 = 0;
            const vertices = this.vertices;
            const v = new Vec3();
            for (let i = 0, N = vertices.length / 3; i !== N; i++) {
                this.getVertex(i, v);
                const norm2 = v.lengthSquared();
                if (norm2 > max2) {
                    max2 = norm2;
                }
            }
            this.boundSphR = Math.sqrt(max2);
        }
        /**
         * @method calculateWorldAABB
         * @param {Vec3}        pos
         * @param {Quaternion}  quat
         * @param {Vec3}        min
         * @param {Vec3}        max
         */
        calculateWorldAABB(pos, quat, min, max) {
            /*
            var n = this.vertices.length / 3,
                verts = this.vertices;
            var minx,miny,minz,maxx,maxy,maxz;

            var v = tempWorldVertex;
            for(var i=0; i<n; i++){
                this.getVertex(i, v);
                quat.vmult(v, v);
                pos.vadd(v, v);
                if (v.x < minx || minx===undefined){
                    minx = v.x;
                } else if(v.x > maxx || maxx===undefined){
                    maxx = v.x;
                }

                if (v.y < miny || miny===undefined){
                    miny = v.y;
                } else if(v.y > maxy || maxy===undefined){
                    maxy = v.y;
                }

                if (v.z < minz || minz===undefined){
                    minz = v.z;
                } else if(v.z > maxz || maxz===undefined){
                    maxz = v.z;
                }
            }
            min.set(minx,miny,minz);
            max.set(maxx,maxy,maxz);
            */
            // Faster approximation using local AABB
            const frame = calculateWorldAABB_frame;
            const result = calculateWorldAABB_aabb;
            frame.position = pos;
            frame.quaternion = quat;
            this.aabb.toWorldFrame(frame, result);
            min.copy(result.lowerBound);
            max.copy(result.upperBound);
        }
        /**
         * Get approximate volume
         */
        volume() {
            return 4.0 * Math.PI * this.boundSphR / 3.0;
        }
        /**
         * Get face normal given 3 vertices
         */
        static computeNormal(va, vb, vc, target) {
            vb.vsub(va, ab$1);
            vc.vsub(vb, cb$1);
            cb$1.cross(ab$1, target);
            if (!target.isZero()) {
                target.normalize();
            }
        }
        /**
         * Create a Trimesh instance, shaped as a torus.
         */
        static createTorus(radius = 1, tube = 0.5, radialSegments = 8, tubularSegments = 6, arc = Math.PI * 2) {
            const vertices = [];
            const indices = [];
            for (var j = 0; j <= radialSegments; j++) {
                for (var i = 0; i <= tubularSegments; i++) {
                    const u = i / tubularSegments * arc;
                    const v = j / radialSegments * Math.PI * 2;
                    const x = (radius + tube * Math.cos(v)) * Math.cos(u);
                    const y = (radius + tube * Math.cos(v)) * Math.sin(u);
                    const z = tube * Math.sin(v);
                    vertices.push(x, y, z);
                }
            }
            for (var j = 1; j <= radialSegments; j++) {
                for (var i = 1; i <= tubularSegments; i++) {
                    const a = (tubularSegments + 1) * j + i - 1;
                    const b = (tubularSegments + 1) * (j - 1) + i - 1;
                    const c = (tubularSegments + 1) * (j - 1) + i;
                    const d = (tubularSegments + 1) * j + i;
                    indices.push(a, b, d);
                    indices.push(b, c, d);
                }
            }
            return new Trimesh(vertices, indices);
        }
    }
    var computeNormals_n = new Vec3();
    var unscaledAABB = new AABB();
    var getEdgeVector_va = new Vec3();
    var getEdgeVector_vb = new Vec3();
    const cb$1 = new Vec3();
    const ab$1 = new Vec3();
    var va = new Vec3();
    var vb = new Vec3();
    var vc = new Vec3();
    var cli_aabb = new AABB();
    var computeLocalAABB_worldVert = new Vec3();
    //const tempWorldVertex = new Vec3();
    var calculateWorldAABB_frame = new Transform();
    var calculateWorldAABB_aabb = new AABB();

    //// 暂时无用的voxel类 /////
    /**
     * 可以共享的数据
     * 类似八叉树管理数据
     *
     */
    class PhyVoxelData {
        /**
         *
         * @param dt
         * @param x
         * @param y
         * @param z
         * @param olddt 以前的格式，只是线性的把8个合成一个byte，
         */
        constructor(dt, x, y, z, olddt = true) {
            // 必须要POT
            let nx = POT(x);
            let ny = POT(y);
            let nz = POT(z);
            this.maxs = Math.max(nx, ny, nz);
            if (!dt) {
                dt = new Uint8Array(nx * ny * nz / 8);
            }
            else {
                this.data = dt;
                if (olddt) {
                }
                // 生成八叉树
            }
            this.xs = nx;
            this.ys = ny;
            this.zs = nz;
        }
        has(x, y, z) {
            return false;
        }
        set(x, y, z, v) {
        }
        buildOcttree() {
            let dt = this.data;
            let xs = this.xs;
            let ys = this.ys;
            let zs = this.zs;
        }
    }
    function getBit(v, p) {
        //z,y,x
        //      Y
        //      |     010 011
        //   110 111  000 001  
        //   100 101 ________ X
        //   /
        // Z
        return (v & (1 << p)) != 0;
    }
    /**
     * 层次场景的最后一级。大小是16x16x16。
     * 用hash的方式管理
     * 每个格子的信息
     *  x:4bit,y:4bit,z:4bit,objid:4bit,  aabbid:12 unused:4
     *  objid是本区域内的列表的
     *
     * 注意：这个类个数可能很多，所以要尽可能的小。
     */
    class hashRegion {
        constructor() {
            this.isSolid = true; //实心的少，所以hash的是实心的。为false则hash记录的是空，如果实心对象超过一个，必须记录实
            this.objlist = null; //实对象的id列表，如果只有一个最好了，记录空的情况
        }
        //faceinfo:{nx:f32,ny:f32,nz:f32,d:f32}[];    //分割平面。如果内存太多也可以用一个int来表示
        /**
         * 添加新的voxel。后加的会覆盖前面的。
         * 这个vox可能超越本区域大小，所以可能需要裁减
         */
        addData(vox, min, max) {
            vox.pos;
        }
        /**
         * 虽然是添加voxel，但实际上格子单位不统一，所以与添加mesh其实差不多
         * @param vox
         * @param pos
         * @param q
         * @param scale
         * @param mymin  当前区域的包围盒
         * @param mymax
         */
        addVox(vox, mymin, mymax) {
            vox.updateAABB();
            let min = vox.aabbmin;
            let max = vox.aabbmax;
            // 包围盒判断
            if (mymax.x < min.x || mymin.x > max.x ||
                mymax.y < min.y || mymin.y > max.y ||
                mymax.z < min.z || mymin.z > max.z)
                return;
            let hitmin = new Vec3();
            let hitmax = new Vec3();
            // 两个小的取大的
            hitmin.x = Math.max(min.x, mymin.x);
            hitmin.y = Math.max(min.y, mymin.y);
            hitmin.z = Math.max(min.z, mymin.z);
            // 两个大的取小的
            hitmax.x = Math.min(max.x, mymax.x);
            hitmax.y = Math.min(max.y, mymax.y);
            hitmax.z = Math.min(max.z, mymax.z);
            // 开始添加
            // 本对象是轴对齐的，vox不一定是轴对齐的
        }
        /**
         * allobj = thisgrid.objlist - thisvox;
         * 更新每个vox的空间
         * allVox.forEach( v )
         * 		grid[v]=0
         * 		allObj.forEach o
         * 			v in o?
         * 					v=o,return	// 这一步比较费，还要计算内部aabb
         * 					:coninue;
         */
        delVox() {
        }
        addAVox(pos, size, axis) {
        }
        setVox(x, y, z, v, id) {
        }
        clearData() {
        }
    }
    class GridItem {
    }
    /**
     * 格子管理。可以管理静态的八叉树，也可以管理动态的voxel
     */
    class GridScene {
        constructor() {
            this.gridSize = 64; //每个格子是 64x64x64
            this.gridw = 1024 / 64;
            this.gridnum = this.gridw ** 3;
            this.aabbmin = new Vec3(-512, -512, -512);
            this.aabbmax = new Vec3(512, 512, 512);
            this.dataoff = 0;
            let dt = GridScene.data;
            let dataoff = this.dataoff;
            let gridnum = this.gridnum;
            if (dt.length < dataoff + gridnum) {
                dt.length = dataoff + gridnum;
            }
            for (let i = dataoff, e = dataoff + gridnum; i < e; i++) {
                dt[i] = new GridItem();
            }
        }
        static getAtlas(min, max) {
            throw 'no';
        }
        addObj(obj) {
            let gsize = this.gridSize;
            let objmin = obj.aabbmin;
            let objmax = obj.aabbmax;
            let min = this.aabbmin;
            let max = this.aabbmax;
            let exp = false;
            let floor = Math.floor;
            let data = GridScene.data;
            if (objmin.x < min.x) {
                exp = true;
            }
            if (objmax.x > max.x) {
                exp = true;
            }
            if (objmin.y < min.y) {
                exp = true;
            }
            if (objmax.y > max.y) {
                exp = true;
            }
            if (objmin.z < min.z) {
                exp = true;
            }
            if (objmax.z > max.z) {
                exp = true;
            }
            if (exp) {
                throw '超出边界的还没有做呢';
            }
            // 计算在哪个格子里
            let sx = floor((objmin.x - min.x) / gsize);
            let sy = floor((objmin.y - min.y) / gsize);
            let sz = floor((objmin.z - min.z) / gsize);
            let ex = floor((objmax.x - min.x) / gsize);
            let ey = floor((objmax.y - min.y) / gsize);
            let ez = floor((objmax.z - min.z) / gsize);
            let w = this.gridw;
            let xy = w * w;
            let off = this.dataoff;
            for (let z = sz; z <= ez; z++) {
                for (let y = sy; y <= ey; y++) {
                    for (let x = sx; x <= ex; x++) {
                        let p = z * xy + y * w + x + off;
                        data[p].objlist.push(obj);
                    }
                }
            }
        }
        updateObj(obj) {
        }
        addVox() {
        }
        // 把某个格子变成八叉树
        setOctree(ix, iy, iz) {
        }
    }
    // 为了避免扩展的问题，再分成多个区域，每个区域是1024^3米，如果要，最多允许10^3个区域
    // 中心区域是-512 到512
    GridScene.gridAtlasInfo = new Array(1000);
    GridScene.gridWidth = 1024;
    GridScene.gridAtlasOri = new Vec3(-512, -512, -512);
    GridScene.data = []; //这个是全局公用，可能会扩展
    /**
     * 静态场景合并成为一个对象。
     *
     */
    class VoxelScene {
        constructor(scemin, scemax, gridsz) {
            // 统一格子管理。每个场景可以不同，基本根据主角大小来定
            this.gridsz = 0.5; // 
            this.staticVox = [];
            let lv2sz = gridsz * 16; // 最后一级是 16x16x16
            let lv1gridsz = lv2sz * 8; // 每个一级格子包含 8x8x8=512个二级格子
            //this.lv1szx = ;//TODO
            //this.lv1szy=;
            //this.lvlszz=;
            let lv1gridnum = this.lv1szx * this.lv1szy * this.lv1szz;
            this.lv1Grids = new Uint16Array(lv1gridnum);
            // 一级格子的有效个数
            let validLv1Num = 0; //TODO
            let lv2GridNum = validLv1Num * 512; //每个一级包含512个二级（8x8x8）
            // 统计二级格子中的有效格子
            let hashGridNum = 0; //TODO
            this.hashgrids.length = hashGridNum;
        }
        addStaticVoxel(vox, updateSce = true) {
            this.staticVox.push(vox);
            if (updateSce) {
                this.updateStaticSceneInfo();
            }
        }
        removeStaticVoxel(vox) {
            // 根据格子中记录的voxel来恢复
        }
        updateStaticSceneInfo() {
        }
    }
    /**
     * 占用同一个格子的多个静态模型不重复添加
     *
     */

    class Voxel extends Shape {
        constructor(dt, scale = 1) {
            super();
            this.dataxsize = 0;
            this.dataysize = 0;
            this.datazsize = 0;
            this.cpos = new Vec3(); // 重心坐标的原点。quat是相对于这个的，如果静态对象可以简单设置为包围盒的中心
            this.centroid = new Vec3(); // 在voxData坐标系下的质心 @TODO 转换
            /** 别的形状都是直接改变参数，这里为了简单通用，记下了scale。注意非均匀缩放是有问题的。动态改变的话会破坏刚体的假设 */
            this.scale = null;
            this.invScale = null;
            this.maxScale = 1;
            this.aabbmin = new Vec3(); // 当前的aabb
            this.aabbmax = new Vec3();
            this.addToSceTick = -1; // 
            this.gridw = 0;
            /** 简化为box时的情况 */
            this.box = null;
            this.type = 1024 /* VOXEL */;
            if (dt instanceof SparseVoxData) {
                this.initFromSparseVoxData(dt, scale);
            }
            else {
                this.initFromCubeModule(dt, scale);
            }
        }
        initFromSparseVoxData(sparsedt, scale) {
            var dt = this.voxData = {
                //data:sparsedt.data,
                aabbmin: sparsedt.aabbmin,
                aabbmax: sparsedt.aabbmax,
                travAll: sparsedt.travAll,
                dataszx: sparsedt.dataszx,
                dataszy: sparsedt.dataszy,
                dataszz: sparsedt.dataszz,
                fillVoxBitData: (dt) => {
                    sparsedt.data.forEach(v => {
                        dt.setBit(v.x, v.y, v.z);
                    });
                }
            };
            this.initFromVData(dt, scale);
        }
        /** 从layame的格子信息中构造。注意可能有效率问题 */
        initFromCubeModule(cubedt, scale) {
            var dt = this.voxData = {
                //data:null,
                aabbmin: new Vec3(-cubedt._dx, -cubedt._dy, -cubedt._dz),
                aabbmax: new Vec3(cubedt._lx - cubedt._dx, cubedt._ly - cubedt._dy, cubedt._lz - cubedt._dz),
                //travAll:null,
                dataszx: cubedt._lx,
                dataszy: cubedt._ly,
                dataszz: cubedt._lz,
                fillVoxBitData: (dt) => {
                    let bufdt = cubedt._data;
                    let xlen = cubedt._lx;
                    let ylen = cubedt._ly;
                    let zlen = cubedt._lz;
                    let xzlen = xlen * zlen;
                    let dtlen = xzlen * ylen;
                    let cpos = 0;
                    let num = Math.min((dtlen >> 3) + 1, bufdt.length);
                    for (let i = 0; i < num; i++) {
                        if (bufdt[i] == 0) {
                            cpos += 8;
                            continue;
                        }
                        let v = bufdt[i];
                        for (let bi = 0; bi < 8 && cpos < dtlen; bi++) {
                            let cy = (cpos / xzlen) | 0;
                            let left = (cpos % xzlen);
                            let cz = (left / xlen) | 0;
                            let cx = left % xlen;
                            if (v & (1 << bi)) {
                                dt.setBit(cx, cy, cz);
                            }
                            cpos++;
                        }
                    }
                    //@ts-ignore
                    bufdt = null;
                }
            };
            this.initFromVData(dt, scale);
        }
        /**
         * 根据定义的中间接口构造
         * @param dt
         * @param scale 每个格子的缩放，这个并不记录，相当于会直接修改形状，影响参数是每个格子的大小和包围盒。
         * 				下面的setScale是真正记录的缩放。
         */
        initFromVData(dt, scale) {
            let min = this.aabbmin;
            let max = this.aabbmax;
            dt.aabbmin.scale(scale, dt.aabbmin);
            dt.aabbmax.scale(scale, dt.aabbmax);
            min.copy(dt.aabbmin);
            max.copy(dt.aabbmax);
            this.gridw = ((max.x - min.x) / dt.dataszx);
            if (this.gridw != scale) {
                console.error('格子大小不对？');
            }
            let xs = this.dataxsize = dt.dataszx;
            let ys = this.dataysize = dt.dataszy;
            let zs = this.datazsize = dt.dataszz;
            let maxsize = Math.max(xs, ys, zs);
            let maxpot = POT(maxsize);
            let lodlv = Math.log2(maxpot);
            this.bitDataLod = new Array(lodlv);
            //let clv = lodlv - 1;
            let clv = 0;
            let cdt = this.bitDataLod[clv] = new VoxelBitData(xs, ys, zs, min, max);
            //设置末级数据
            dt.fillVoxBitData(cdt);
            //设置各级数据
            while (cdt) {
                cdt = cdt.genParent();
                if (cdt) {
                    this.bitDataLod[++clv] = cdt;
                }
            }
        }
        /**
         * 按照box来处理voxel
         * @param b
         */
        setAsBox(b) {
            let min = this.aabbmin;
            let max = this.aabbmax;
            if (b) {
                if (!this.box) {
                }
            }
            else {
            }
        }
        /**
         * voxel的缩放只能是均匀的。
         * @param x
         * @param y
         * @param z
         * @param recalcMassProp
         */
        setScale(x, y, z, recalcMassProp = false) {
            if (!this.scale) {
                this.scale = new Vec3(x, y, z);
            }
            else {
                this.scale.set(x, y, z);
            }
            if (!this.invScale) {
                this.invScale = new Vec3(1 / x, 1 / y, 1 / z);
            }
            else {
                this.invScale.set(1 / x, 1 / y, 1 / z);
            }
            this.maxScale = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
        }
        updateAABB() {
            // 变换vox的包围盒
            Box.calculateWorldAABB1(this.pos, this.quat, this.scale, this.voxData.aabbmin, this.voxData.aabbmax, this.aabbmin, this.aabbmax);
            // TODO 转成矩阵
            /*
            let mat = this.mat;
            mat.identity();
            mat.setRotationFromQuaternion(this.quat);
            mat.scale(this.scale, mat);
            */
        }
        // 不同的实现这个函数不同
        getVox(x, y, z) {
            let dt = this.bitDataLod[0];
            return dt.getBit(x, y, z);
        }
        calcCentroid() {
            console.error('not need');
            let sx = 0;
            let sy = 0;
            let sz = 0;
            if (this.voxData.travAll) {
                let i = 0;
                this.voxData.travAll((x, y, z, v) => {
                    if (v) {
                        sx += x;
                        sy += y;
                        sz += z;
                        i++;
                    }
                });
                sx /= i; // 是浮点数
                sy /= i;
                sz /= i;
                let c = this.centroid;
                c.x = sx;
                c.y = sy;
                c.z = sz;
            }
            else {
            }
        }
        // 计算相对于质心的转动惯量。
        calculateLocalInertia(mass, target) {
            console.error('not need');
            let c = this.centroid;
            target.x = 0;
            target.y = 0;
            target.z = 0;
            let grid = this.gridw; //.voxData.gridsz;
            let sx = grid;
            let sy = grid;
            let sz = grid;
            if (this.scale) {
                sx *= this.scale.x;
                sy *= this.scale.y;
                sz *= this.scale.z;
            }
            if (this.voxData.travAll) {
                this.voxData.travAll((x, y, z, v) => {
                    if (v) {
                        let dx = x - c.x; // 没有考虑实际缩放，最后集中处理
                        let dy = y - c.y;
                        let dz = z - c.z;
                        let dx2 = dx * dx;
                        let dy2 = dy * dy;
                        let dz2 = dz * dz;
                        target.x += dy2 + dz2;
                        target.y += dx2 + dz2;
                        target.z += dx2 + dy2;
                    }
                });
            }
            target.x *= (sx * sx * mass); // 根据缩放和格子大小转换为实际距离。上面是平方，所以这也是
            target.y *= (sy * sy * mass);
            target.z *= (sz * sz * mass);
        }
        // 用世界空间的包围盒来检查碰撞
        AABBCheck(min, max, onlytest = true) {
            // 在不考虑父对象导致的变形的情况下，本地只有旋转缩放，求逆可以比较容易
            // 根据包围盒大小选择合适的lod等级
            let szx = max.x - min.x;
            let szy = max.y - min.y;
            let szz = max.z - min.z;
            let lod = this.getLOD(szx, szy, szz);
            return false;
        }
        // 参数是local空间的盒子大小
        getLOD(szx, szy, szz) {
            let iscale = this.invScale;
            let sx = 1;
            let sy = 1;
            let sz = 1;
            if (iscale) {
                sx = iscale.x;
                sy = iscale.y;
                sz = iscale.z;
            }
            let szmax = Math.max(szx * sx, szy * sy, szz * sz);
            let lod = Math.round(Math.log2(szmax));
            return lod;
        }
        getLODByW(w) {
            let k = (w / this.gridw) | 0; // 0~1024对应0到10级
            this.gridw;
        }
        updateBndSphR() {
            let min = this.voxData.aabbmin;
            let max = this.voxData.aabbmax;
            let mx = Math.max(Math.abs(max.x), Math.abs(min.x));
            let my = Math.max(Math.abs(max.y), Math.abs(min.y));
            let mz = Math.max(Math.abs(max.z), Math.abs(min.z));
            this.boundSphR = Math.sqrt(mx * mx + my * my + mz * mz) * this.maxScale;
        }
        calculateWorldAABB(pos, quat, min, max) {
            this.pos = pos;
            this.quat = quat;
            this.updateAABB();
            min.copy(this.aabbmin);
            max.copy(this.aabbmax);
        }
        onPreNarrowpase(stepId, pos, quat) {
            throw new Error("Method not implemented.");
        }
        setData(dt, xnum, ynum, znum, xs, ys, zs) {
            // 重新组织数据        
            // 生成LOD数据
        }
        fill() {
        }
        volume() {
            throw new Error("Method not implemented.");
        }
        hitPlane(myPos, planePos, planeNorm, hitPos) {
            throw 'no';
        }
        hitVoxel(otherPos, otherQuat, hitPos) {
            throw 'no';
        }
        checkAABB() {
            throw 'no';
        }
        checkSphere(pos, r, hitnorm) {
            return 0;
        }
        // 获取xyz的法线
        getNormal(x, y, z, nout) {
            // 根据x,y,z的梯度变化
            throw 'NI';
        }
        hitCapsule() {
        }
        rayCast(ori, dir) {
            throw 'noimp';
        }
        /**
         * 取出某一层的某个区域边信息，注意结果不允许保存
         * @param dirid 哪个方向， 0表示yz平面  1表示xz平面 2表示xy平面
         * @param id  0表示0层的底
         */
        getEdge(dirid, id, ustart, vstart, uend, vend) {
            let edge = getEdge_edge;
            edge.length = 0;
            switch (dirid) {
                case 0: //yz平面
                    break;
                case 1: //xz平面
                    break;
                case 2: //xy平面
                    break;
            }
            return edge;
        }
        pointToWorld(pt, out) {
            if (this.scale) {
                pt.vmul(this.scale, out);
                this.quat.vmult(out, out);
            }
            else
                this.quat.vmult(pt, out);
            out.vadd(this.pos, out);
            return out;
        }
        /**
         * 把格子坐标xyz，根据pos和Q转换成世界坐标min,max
         * @param x
         * @param y
         * @param z
         * @param pos
         * @param Q
         * @param min
         * @param max
         */
        xyzToPos(x, y, z, pos, Q, min, max) {
            let w = this.gridw;
            let orimin = this.voxData.aabbmin;
            let orimax = this.voxData.aabbmax;
            let scale = this.scale;
            min.set(x * w, y * w, z * w);
            min.vadd(orimin, min);
            if (scale)
                min.vmul(scale, min);
            Q.vmult(min, min);
            min.vadd(pos, min);
            max.set(x * w + w, y * w + w, z * w + w);
            max.vadd(orimin, max);
            if (scale)
                max.vmul(scale, max);
            Q.vmult(max, max);
            max.vadd(pos, max);
        }
        //3dline
        /**
         * 射线经过voxel的路径。原理是每次根据碰撞到每个分隔面的时间取最近的。
         * @param st  voxel空间的起点
         * @param ed  voxel空间的终点
         * @param visitor 返回true则继续
         */
        rayTravel(st, ed, visitor) {
            let w = this.gridw;
            let min = this.voxData.aabbmin;
            let max = this.voxData.aabbmax;
            //先用包围盒裁剪
            let nst = trav_tmpV1;
            let ned = trav_tmpV2;
            if (!Box.rayHitBox(st, ed, min, max, nst, ned))
                return;
            //debug
            //let phyr =  getPhyRender();
            //let wpos = new Vec3();
            //phyr.addPersistPoint( this.pointToWorld(nst, wpos));
            //phyr.addPersistPoint( this.pointToWorld(ned,wpos));
            //debug
            //dir
            let nx = ned.x - nst.x;
            let ny = ned.y - nst.y;
            let nz = ned.z - nst.z;
            let len = nx * nx + ny * ny + nz * nz;
            let dirx = nx / len;
            let diry = ny / len;
            let dirz = nz / len;
            // 起点格子
            let x0 = ((nst.x - min.x) / w) | 0; // 不可能<0所以可以直接 |0
            let y0 = ((nst.y - min.y) / w) | 0;
            let z0 = ((nst.z - min.z) / w) | 0;
            // 终点格子
            let x1 = ((ned.x - min.x) / w) | 0;
            let y1 = ((ned.y - min.y) / w) | 0;
            let z1 = ((ned.z - min.z) / w) | 0;
            // 由于点可能在边缘，因此有可能正好超出，做一下保护
            let maxx = this.dataxsize - 1;
            let maxy = this.dataysize - 1;
            let maxz = this.datazsize - 1;
            if (x0 > maxx)
                x0 = maxx;
            if (x1 > maxx)
                x1 = maxx;
            if (y0 > maxy)
                y0 = maxy;
            if (y1 > maxy)
                y1 = maxy;
            if (z0 > maxz)
                z0 = maxz;
            if (z1 > maxz)
                z1 = maxz;
            //确定前进方向
            let sx = x1 > x0 ? 1 : x1 < x0 ? -1 : 0;
            let sy = y1 > y0 ? 1 : y1 < y0 ? -1 : 0;
            let sz = z1 > z0 ? 1 : z1 < z0 ? -1 : 0;
            // 从开始到结束的长度
            let fdx = Math.abs(ned.x - nst.x);
            let fdy = Math.abs(ned.y - nst.y);
            let fdz = Math.abs(ned.z - nst.z);
            let absdirx = Math.abs(dirx);
            let absdiry = Math.abs(diry);
            let absdirz = Math.abs(dirz);
            let t = Math.sqrt((fdx * fdx + fdy * fdy + fdz * fdz) / (absdirx * absdirx + absdiry * absdiry + absdirz * absdirz)); //其实也可以判断x,y,z但是由于不知道方向，所以把复杂的事情留到循环外面
            // 每经过一个格子需要的时间
            let xt = absdirx > 1e-6 ? w / absdirx : 10000;
            let yt = absdiry > 1e-6 ? w / absdiry : 10000;
            let zt = absdirz > 1e-6 ? w / absdirz : 10000;
            //由于起点不在0,0,0因此需要计算到下一个面的时间，第一次需要计算，以后直接加就行
            let maxX = (1 - (nst.x % w) / w) * xt;
            let maxY = (1 - (nst.y % w) / w) * yt;
            let maxZ = (1 - (nst.z % w) / w) * zt;
            let cx = x0;
            let cy = y0;
            let cz = z0;
            let end = false;
            let data = this.bitDataLod[0];
            while (!end) {
                if (data.getBit(cx, cy, cz))
                    end = !visitor(cx, cy, cz, true);
                //
                //let pt = new Vec3(cx*this.gridw+min.x,cy*this.gridw+min.y,cz*this.gridw+min.z);
                //phyr.addPersistPoint( this.pointToWorld(pt,pt) )
                //
                if (end) {
                    break;
                }
                //取穿过边界用的时间最少的方向，前进一格
                //同时更新当前方向的边界
                if (maxX <= maxY && maxX <= maxZ) { //x最小，表示最先遇到x面
                    end = maxX > t || cx == x1; //先判断end。否则加了delta之后可能还没有完成就end了
                    cx += sx;
                    maxX += xt;
                }
                else if (maxY <= maxX && maxY <= maxZ) { //y最小
                    end = maxY > t || cy == y1;
                    cy += sy;
                    maxY += yt;
                }
                else { // z最小
                    end = maxZ > t || cz == z1;
                    cz += sz;
                    maxZ += zt;
                }
            }
        }
        _dtToStr() {
            let a = new Uint8Array(1);
        }
        toJSON() {
            return JSON.stringify({});
        }
        fromJSON(data) {
            let o = JSON.parse(data);
        }
    }
    var getEdge_edge = [];
    var trav_tmpV1 = new Vec3();
    var trav_tmpV2 = new Vec3();

    class ArcBall {
        constructor() {
            this.lastPos = new Laya.Vector3(); // 上次的点的位置，是已经规格化的了
            this.curPos = new Laya.Vector3();
            //private halfPos: Vector3 = new Vector3();
            this.newQuat = new Laya.Quaternion();
            this.camStartWorldMat = new Laya.Matrix4x4(); //开始拖动的时候的矩阵
        }
        initStatic() {
            if (!ArcBall.xUnitVec3) {
                ArcBall.xUnitVec3 = new Laya.Vector3(1, 0, 0);
                ArcBall.yUnitVec3 = new Laya.Vector3(0, 1, 0);
                ArcBall.tmpVec3 = new Laya.Vector3();
            }
        }
        // 设置屏幕范围。可以不是方形的，对应的arcball也会变形。
        init(w, h) {
            this.initStatic();
            if (w <= ArcBall.e || h <= ArcBall.e)
                throw '设置大小不对，不能为0';
            this.width = w;
            this.height = h;
        }
        /**
         * 这是一个 glmatrix中的函数
         * a,b都是规格化以后的向量
         * Sets a quaternion to represent the shortest rotation from one
         * vector to another.
         *
         * Both vectors are assumed to be unit length.
         *
         * @param {quat} out the receiving quaternion.
         * @param {vec3} a the initial vector
         * @param {vec3} b the destination vector
         * @returns {quat} out
         */
        static rotationTo(out, a, b) {
            if (!ArcBall.xUnitVec3) {
                ArcBall.xUnitVec3 = new Laya.Vector3(1, 0, 0);
                ArcBall.yUnitVec3 = new Laya.Vector3(0, 1, 0);
                ArcBall.tmpVec3 = new Laya.Vector3();
            }
            var dot = Laya.Vector3.dot(a, b);
            if (dot < -0.999999) { // 180度了，可以选择多个轴旋转
                Laya.Vector3.cross(ArcBall.xUnitVec3, a, ArcBall.tmpVec3);
                if (Laya.Vector3.scalarLength(ArcBall.tmpVec3) < 0.000001)
                    Laya.Vector3.cross(ArcBall.yUnitVec3, a, ArcBall.tmpVec3);
                Laya.Vector3.normalize(ArcBall.tmpVec3, ArcBall.tmpVec3);
                Laya.Quaternion.createFromAxisAngle(ArcBall.tmpVec3, Math.PI, out);
                return true;
            }
            else if (dot > 0.999999) { // 没有变化
                out.x = 0;
                out.y = 0;
                out.z = 0;
                out.w = 1;
                return false;
            }
            else {
                // 下面是求这个四元数，这是一个简化求法，根据cos(a/2)=√((1+dot)/2), cos(a/2)sin(a/2)=sin(a)/2 就能推导出来
                Laya.Vector3.cross(a, b, ArcBall.tmpVec3);
                out.x = ArcBall.tmpVec3.x;
                out.y = ArcBall.tmpVec3.y;
                out.z = ArcBall.tmpVec3.z;
                out.w = 1 + dot;
                out.normalize(out);
                return true;
            }
            return false;
        }
        // 把屏幕空间换成-1,1
        normx(x) {
            return x * 2 / this.width - 1;
        }
        normy(y) {
            return -(y * 2 / this.height - 1);
        }
        // 根据屏幕坐标返回一个arcball表面上的位置。这个位置会考虑摄像机的影响。
        hitpos(x, y, out) {
            var x1 = this.normx(x);
            var y1 = this.normy(y);
            var l = x1 * x1 + y1 * y1;
            var nl = Math.sqrt(l);
            if (l > 1.0) {
                // 在球外面
                out.x = x1 / nl;
                out.y = y1 / nl;
                out.z = 0;
            }
            else {
                // 在球面上了
                out.x = x1; // x
                out.y = y1; // z
                out.z = Math.sqrt(1 - l); //y
            }
            Laya.Vector3.TransformNormal(out, this.camStartWorldMat, out);
        }
        /**
         * 开始新的拖动。
         * 记录开始拖动的位置
         * 以后调用dragTo的时候都是跟这个比较，来计算旋转
         */
        setStartPos(x, y) {
            this.hitpos(x, y, this.lastPos);
        }
        /**
         * 返回本次变化的四元数
         * 累计结果在quatResult中
         * @param	x
         * @param	y
         * @return
         */
        dragTo(x, y) {
            this.hitpos(x, y, this.curPos);
            if (ArcBall.rotationTo(this.newQuat, this.lastPos, this.curPos)) {
            }
            return this.newQuat;
        }
        startDrag(x, y, camWorldMatrix) {
            //this.isDrag = true;
            camWorldMatrix.cloneTo(this.camStartWorldMat);
            // 记录起始接触点
            this.setStartPos(x, y);
        }
    }
    ArcBall.e = 1e-6;

    /**
     * Constraint equation solver base class.
     * @author schteppe / https://github.com/schteppe
     */
    class Solver {
        constructor() {
            //All equations to be solved
            this.equations = [];
        }
        /**
         * Should be implemented in subclasses!
         */
        solve(dt, world) {
            // Should return the number of iterations done!
            return 0;
        }
        addEquation(eq) {
            if (eq.enabled) {
                this.equations.push(eq);
            }
        }
        removeEquation(eq) {
            const eqs = this.equations;
            const i = eqs.indexOf(eq);
            if (i !== -1) {
                eqs.splice(i, 1);
            }
        }
        /**
         * remove all equations
         */
        removeAllEquations() {
            this.equations.length = 0;
        }
    }

    /**
     * Constraint equation Gauss-Seidel solver.
     * @todo The spook parameters should be specified for each constraint, not globally.
     * @author schteppe / https://github.com/schteppe
     * @see https://www8.cs.umu.se/kurser/5DV058/VT09/lectures/spooknotes.pdf
     */
    class GSSolver extends Solver {
        constructor() {
            super();
            /**
             * The number of solver iterations determines quality of the constraints in the world. The more iterations, the more correct simulation. More iterations need more computations though. If you have a large gravity force in your world, you will need more iterations.
             */
            this.iterations = 10;
            /**
             * When tolerance is reached, the system is assumed to be converged.
             */
            this.tolerance = 1e-7;
            this._phyr = null;
        }
        solve(dt, world) {
            let iter = 0;
            const maxIter = this.iterations;
            const tolSquared = this.tolerance * this.tolerance;
            const equations = this.equations;
            const Neq = equations.length;
            const bodies = world.bodies;
            const Nbodies = bodies.length;
            const h = dt;
            //let q:number;
            let B;
            let invC;
            let deltalambda;
            let deltalambdaTot;
            let GWlambda;
            let lambdaj;
            // Update solve mass
            if (Neq !== 0) {
                for (var i = 0; i !== Nbodies; i++) {
                    // 准备好每个对象的invMass, invInertia, invInertiaWorld
                    bodies[i].updateSolveMassProperties();
                }
            }
            // Things that does not change during iteration can be computed once
            const invCs = GSSolver_solve_invCs; //
            const Bs = GSSolver_solve_Bs; //每个式子的Bs
            const lambda = GSSolver_solve_lambda; //
            Bs.length = lambda.length = invCs.length = Neq;
            // 把 lamba[]清零
            // 在迭代期间 B和invCs是不变的，所以可以先计算出来
            for (var i = 0; i !== Neq; i++) {
                var c = equations[i];
                lambda[i] = 0.0; // 初始λ为0
                Bs[i] = c.computeB(h);
                // C就是 λ系数，  C λ = B,
                // C = G.iM.Gt + Σ
                invCs[i] = 1.0 / c.computeC();
            }
            if (Neq !== 0) {
                // 把每个Body的vlambda和wlambda清零
                for (var i = 0; i !== Nbodies; i++) {
                    var b = bodies[i];
                    //if(b.type==BODYTYPE.DYNAMIC){		由于需要对方的vlambda和wlambda所以都要清零
                    b.vlambda.set(0, 0, 0);
                    b.wlambda.set(0, 0, 0);
                    //}
                }
                // 下面开始迭代计算 Iterate over equations
                for (iter = 0; iter !== maxIter; iter++) {
                    // 总误差先设成0。 Accumulate the total error for each iteration.
                    deltalambdaTot = 0.0;
                    for (let j = 0; j !== Neq; j++) {
                        var c = equations[j];
                        // Compute iteration
                        B = Bs[j];
                        invC = invCs[j];
                        // lambdaj 第一次是0
                        lambdaj = lambda[j];
                        // G*W
                        GWlambda = c.computeGWlambda();
                        // 计算这个公式的 λ
                        deltalambda = invC * (B - GWlambda - c.eps * lambdaj);
                        // Clamp if we are not within the min/max interval
                        if (lambdaj + deltalambda < c.minForce) {
                            deltalambda = c.minForce - lambdaj;
                        }
                        else if (lambdaj + deltalambda > c.maxForce) {
                            deltalambda = c.maxForce - lambdaj;
                        }
                        lambda[j] += deltalambda;
                        deltalambdaTot += deltalambda > 0.0 ? deltalambda : -deltalambda; // abs(deltalambda)
                        // 更新C关联的两个对象的速度 vlambda 和角速度 wlambda
                        c.addToWlambda(deltalambda);
                    }
                    // If the total error is small enough - stop iterate
                    // 所有公式的deltalambda和小于一定值，就停止循环
                    if (deltalambdaTot * deltalambdaTot < tolSquared) {
                        break;
                    }
                }
                // Add result to velocity
                let phyr = this._phyr;
                /**
                 * 已经计算出λ了，下面计算新的速度
                 */
                for (var i = 0; i !== Nbodies; i++) {
                    const b = bodies[i];
                    if (b.type != 1 /* DYNAMIC */)
                        continue;
                    const v = b.velocity;
                    const w = b.angularVelocity;
                    // 线速度
                    b.vlambda.vmul(b.linearFactor, b.vlambda);
                    v.vadd(b.vlambda, v);
                    // 角速度
                    b.wlambda.vmul(b.angularFactor, b.wlambda);
                    w.vadd(b.wlambda, w);
                    if (phyr) {
                        let cp = b.position;
                        let dv = b.vlambda;
                        phyr.addVec(cp.x, cp.y, cp.z, dv.x, 0, 0, 0xffff);
                        phyr.addVec(cp.x, cp.y, cp.z, 0, dv.y, 0, 0xffff);
                        phyr.addVec(cp.x, cp.y, cp.z, 0, 0, dv.z, 0xffff);
                    }
                }
                // Set the .multiplier property of each equation
                /* 这个没人用过，先注掉
                let l = equations.length;
                const invDt = 1 / h;
                while (l--) {
                    equations[l].multiplier = lambda[l] * invDt;
                }
                */
            }
            //console.log('Err=',deltalambdaTot,'iter=',iter);
            return iter;
        }
    }
    // Just temporary number holders that we want to reuse each solve.
    var GSSolver_solve_lambda = [];
    var GSSolver_solve_invCs = [];
    var GSSolver_solve_Bs = [];

    class _Node {
        constructor() {
            this.visited = false;
        }
    }
    /**
     * Splits the equations into islands and solves them independently. Can improve performance.
     * @param {Solver} subsolver
     */
    class SplitSolver extends Solver {
        constructor(subsolver) {
            super();
            this.iterations = 10;
            this.tolerance = 1e-7;
            this.nodes = [];
            this.nodePool = [];
            this.subsolver = subsolver;
            // Create needed nodes, reuse if possible
            while (this.nodePool.length < 128) {
                this.nodePool.push(this.createNode());
            }
        }
        createNode() {
            return { body: null, children: [], eqs: [], visited: false };
        }
        /**
         * Solve the subsystems
         */
        solve(dt, world) {
            const nodes = SplitSolver_solve_nodes;
            const nodePool = this.nodePool;
            const bodies = world.bodies;
            const equations = this.equations;
            const Neq = equations.length;
            const Nbodies = bodies.length;
            const subsolver = this.subsolver;
            // Create needed nodes, reuse if possible
            while (nodePool.length < Nbodies) {
                nodePool.push(this.createNode());
            }
            nodes.length = Nbodies;
            for (var i = 0; i < Nbodies; i++) {
                nodes[i] = nodePool[i];
            }
            // Reset node values
            for (var i = 0; i !== Nbodies; i++) {
                const node = nodes[i];
                node.body = bodies[i];
                node.children.length = 0;
                node.eqs.length = 0;
                node.visited = false;
            }
            for (let k = 0; k !== Neq; k++) {
                const eq = equations[k];
                const i = bodies.indexOf(eq.bi);
                const j = bodies.indexOf(eq.bj);
                const ni = nodes[i];
                const nj = nodes[j];
                ni.children.push(nj);
                ni.eqs.push(eq);
                nj.children.push(ni);
                nj.eqs.push(eq);
            }
            let child;
            let n = 0;
            let eqs = SplitSolver_solve_eqs;
            subsolver.tolerance = this.tolerance;
            subsolver.iterations = this.iterations;
            const dummyWorld = SplitSolver_solve_dummyWorld;
            while ((child = getUnvisitedNode(nodes))) {
                eqs.length = 0;
                dummyWorld.bodies.length = 0;
                bfs(child, visitFunc, dummyWorld.bodies, eqs);
                const Neqs = eqs.length;
                eqs = eqs.sort(sortById);
                for (var i = 0; i !== Neqs; i++) {
                    subsolver.addEquation(eqs[i]);
                }
                subsolver.solve(dt, dummyWorld);
                subsolver.removeAllEquations();
                n++;
            }
            return n;
        }
    }
    // Returns the number of subsystems
    var SplitSolver_solve_nodes = []; // All allocated node objects
    //const SplitSolver_solve_nodePool = []; // All allocated node objects
    var SplitSolver_solve_eqs = []; // Temp array
    //const SplitSolver_solve_bds = [];   // Temp array
    var SplitSolver_solve_dummyWorld = { bodies: [] }; // Temp object
    const STATIC = 2 /* STATIC */;
    function getUnvisitedNode(nodes) {
        const Nnodes = nodes.length;
        for (let i = 0; i !== Nnodes; i++) {
            const node = nodes[i];
            // 不可见，并且不是static
            if (!node.visited && node.body && !(node.body.type & STATIC)) {
                return node;
            }
        }
        return null;
    }
    const queue = [];
    function bfs(root, visitFunc, bds, eqs) {
        queue.push(root);
        root.visited = true;
        visitFunc(root, bds, eqs);
        while (queue.length) {
            const node = queue.pop();
            // Loop over unvisited child nodes
            let child;
            while ((child = getUnvisitedNode(node.children))) {
                child.visited = true;
                visitFunc(child, bds, eqs);
                queue.push(child);
            }
        }
    }
    function visitFunc(node, bds, eqs) {
        if (!node.body)
            return;
        bds.push(node.body);
        const Neqs = node.eqs.length;
        for (let i = 0; i !== Neqs; i++) {
            const eq = node.eqs[i];
            if (!eqs.includes(eq)) {
                eqs.push(eq);
            }
        }
    }
    function sortById(a, b) {
        return a.id - b.id;
    }

    class OperatorInfo {
    }
    class KeyInputAction {
        constructor() {
            this.strValue = ''; // 输入的角度
            this.useInput = false; // 一旦开始输入，鼠标就不再控制了
            this.altdown = false;
            this.shift = false;
            this.isUp = true;
        }
        onKeyEvent(keycode, down) {
            if (down && !this.isUp) // 不重复处理down消息
                return;
            this.isUp = !down;
            if (keycode >= 48 && keycode <= 57) { //0~9
                // 避免一直触发
                if (down) {
                    this.strValue += String.fromCharCode(keycode);
                    this._onInputValueChanged();
                }
            }
            switch (keycode) {
                case 190: //.
                    if (down) {
                        this.strValue += '.';
                        this._onInputValueChanged();
                    }
                    break;
                case 8: //backspace
                    if (down) {
                        this.strValue = this.strValue.substr(0, this.strValue.length - 1);
                        this._onInputValueChanged();
                    }
                    break;
                case 18:
                    this.altdown = down;
                    break;
                case 16:
                    this.shift = down;
                    break;
            }
        }
        _startAction(node, cam) {
            this.strValue = '';
        }
        _onInputValueChanged() {
            this.useInput = true;
            let v = Number(this.strValue);
            if (isNaN(v)) {
                console.log('输入错误，强制清空:', v);
                v = 0;
                this.strValue = '';
            }
            else
                this.onInputValueChanged(v);
        }
        onInputValueChanged(v) { }
    }

    class PositionAction extends KeyInputAction {
        constructor() {
            super();
            this.startPos = new Laya.Vector3();
            this.lastHitPos = new Laya.Vector3();
            this.curHitPos = new Laya.Vector3();
            this.outPos = new Laya.Vector3();
            this.rotAxis = new Laya.Vector3(); // 旋转轴：缺省是摄像机z轴，第一次切换为世界空间轴，第二次本地空间轴
            this.camDir = new Laya.Vector3(); // 摄像机朝向。作为缺省旋转轴。是摄像机朝向的反向
            this.planeD = 0; // 构造的点击平面。 平面方程是: ax+by+cz=d
            this.rayDir = new Laya.Vector3(); // 鼠标射线方向
            this.camRay = new Laya.Ray(new Laya.Vector3(), new Laya.Vector3());
            this.cax = 0; //0 x, 1 y 2 z
            this.worldAx = 0; // 0 视平面， 世界空间， 本地空间
            this.movOnPlane = true; // true则在平面移动。否则在轴上移动。在轴上移动的话，用直线交点
            this.initStatic();
        }
        initStatic() {
            if (!PositionAction.mousePt) {
                PositionAction.mousePt = new Laya.Vector2();
                PositionAction.v1 = new Laya.Vector3();
                PositionAction.v2 = new Laya.Vector3();
            }
        }
        hitPlane(hitpos) {
            let r = this.camRay;
            let rdir = this.rayDir;
            Laya.Vector3.normalize(r.direction, rdir);
            // dot(raypos, norm)+dot(raydir,norm)*t=d;
            let t = (this.planeD - Laya.Vector3.dot(r.origin, this.rotAxis)) / Laya.Vector3.dot(rdir, this.rotAxis);
            if (t >= 0 && t < 1e8) {
                r.origin.cloneTo(hitpos);
                hitpos.x += rdir.x * t;
                hitpos.y += rdir.y * t;
                hitpos.z += rdir.z * t;
                return true;
            }
            return false;
        }
        /**
         * 射线与移动轴的碰撞检测，取最近距离对应的点作为碰撞点。
         * @param hitpos
         */
        hitLine(hitpos) {
            let r = this.camRay;
            let rdir = this.rayDir;
            Laya.Vector3.normalize(r.direction, rdir);
            let P1 = this.startPos;
            let D1 = this.rotAxis;
            let P2 = r.origin;
            let D2 = rdir;
            console.log('--', D1);
            let d = PositionAction.v1;
            Laya.Vector3.subtract(P1, P2, d);
            // 两个线段之间的距离: | P1+t1D1 -(P2+t2D2) |
            // P1-P2 = d
            // (d + t1D1-t2D2)^2 是距离的平方，对这个取全微分
            // 2(d+t1D1-t2D2)*D1, -2(d+t1D1-t2D2)*D2 这两个都是0
            // 显然这时候与D1,D2都垂直
            // -dD1 -t1D1^2 + t2D1D2  = 0
            // -dD2 -t1D1D2 + t2D2^2  = 0
            // 先用多项式的方法求解 Ax=b
            // | -D1^2  D1D2 | |t1|    |dD1|
            // |             | |  |  = |   |
            // | -D1D2  D2^2 | |t2|    |dD2|
            //
            // 如果平行，则有个方向的d永远为0
            let A = -Laya.Vector3.dot(D1, D1);
            let B = Laya.Vector3.dot(D1, D2);
            let C = -B;
            let D = Laya.Vector3.dot(D2, D2);
            let b1 = Laya.Vector3.dot(d, D1);
            let b2 = Laya.Vector3.dot(d, D2);
            let adbc = A * D - B * C;
            if (adbc > -1e-6 && adbc < 1e-6) {
                //平行。这时候假设重合了，计算两条线的距离
                // TODO
                hitpos.setValue(P1.x, P1.y, P1.z);
            }
            else {
                let dd = 1 / adbc;
                let t1 = (D * b1 - B * b2) * dd; // 轴
                let t2 = (-C * b1 + A * b2) * dd; // 射线
                console.log('t=', t1, t2);
                hitpos.setValue(P1.x + t1 * D1.x, P1.y + t1 * D1.y, P1.z + t1 * D1.z);
            }
        }
        updateRay(mousex, mousey) {
            let ray = this.camRay;
            let mousept = PositionAction.mousePt;
            mousept.setValue(mousex, mousey);
            this.camera.viewportPointToRay(mousept, ray);
        }
        __apply(pos) {
            if (!this.node)
                return;
            let r = this.node.transform.position;
            pos.cloneTo(r);
            this.node.transform.position = r;
        }
        onMouseMove(mx, my) {
            if (!this.node)
                return;
            if (this.useInput)
                return;
            this.updateRay(mx, my);
            let hitpos = this.curHitPos;
            let hit = true;
            if (this.movOnPlane)
                hit = this.hitPlane(hitpos);
            else
                this.hitLine(hitpos);
            if (hit) {
                let k = this.shift ? 0.1 : 1;
                let lp = this.lastHitPos;
                this.outPos.x += (hitpos.x - lp.x) * k;
                this.outPos.y += (hitpos.y - lp.y) * k;
                this.outPos.z += (hitpos.z - lp.z) * k;
                // 应用
                this.__apply(this.outPos);
                this.curHitPos.cloneTo(this.lastHitPos);
            }
        }
        // 确认
        apply(outop) {
            if (!this.node)
                return;
            this.__apply(this.outPos);
            this.node = null;
            // 记录undo
            if (outop) {
                if (!outop.applyop)
                    outop.applyop = {};
                if (!outop.lastop)
                    outop.lastop = {};
                let r = this.outPos;
                outop.applyop['position'] = [r.x, r.y, r.z];
                let lr = this.startPos;
                outop.lastop['position'] = [lr.x, lr.y, lr.z];
            }
        }
        // 取消
        cancel() {
            if (!this.node)
                return;
            this.__apply(this.startPos);
            this.node = null;
        }
        startAction(node, cam, mousex, mousey) {
            this.shift = false;
            super._startAction(node, cam);
            this.node = node;
            this.camera = cam;
            node.transform.position.cloneTo(this.startPos);
            this.startPos.cloneTo(this.outPos);
            // 开始的时候，修正一个合理的dist，避免target在空中，dist很小了以后移动很慢的问题
            var mat = cam.transform.worldMatrix.elements;
            var zx = mat[8]; // z轴朝向
            var zy = mat[9];
            var zz = mat[10];
            this.camDir.setValue(zx, zy, zz); //TODO 是否要取反
            Laya.Vector3.normalize(this.camDir, this.camDir);
            this.updateRay(mousex, mousey);
            this.cax = 0;
            this.worldAx = 0;
            this.useInput = false;
            this.onChangeAxis();
            // 计算初始拾取点
            this.hitPlane(this.lastHitPos);
        }
        /**
         * 设置转轴（平面法线），计算平面d
         */
        onChangeAxis() {
            if (!this.node)
                return;
            switch (this.worldAx) {
                case 0:
                    this.movOnPlane = true; // 没有指定轴，则平面移动
                    this.camDir.cloneTo(this.rotAxis);
                    break;
                case 1: // 世界空间
                    this.movOnPlane = false; // 否则只在轴上移动
                    if (this.cax == 0)
                        this.rotAxis.setValue(1, 0, 0);
                    else if (this.cax == 1)
                        this.rotAxis.setValue(0, 1, 0);
                    else
                        this.rotAxis.setValue(0, 0, 1);
                    break;
                case 2: // 本地空间
                    {
                        this.movOnPlane = false; // 否则只在轴上移动
                        let worldmate = this.node.transform.worldMatrix.elements;
                        if (this.cax == 0) {
                            this.rotAxis.setValue(worldmate[0], worldmate[1], worldmate[2]);
                        }
                        else if (this.cax == 1) {
                            this.rotAxis.setValue(worldmate[4], worldmate[5], worldmate[6]);
                        }
                        else {
                            this.rotAxis.setValue(worldmate[8], worldmate[9], worldmate[10]);
                        }
                        Laya.Vector3.normalize(this.rotAxis, this.rotAxis);
                    }
                    break;
            }
            this.planeD = Laya.Vector3.dot(this.rotAxis, this.startPos);
            if (this.movOnPlane)
                this.hitPlane(this.lastHitPos);
            else
                this.hitLine(this.lastHitPos);
        }
        onInputValueChanged(delta) {
            if (!this.node)
                return;
            console.log('value=', delta);
            let ax = this.rotAxis;
            if (this.worldAx == 0) {
                // 输入值的情况，摄像机方向按照x轴算
                ax.setValue(1, 0, 0);
            }
            let st = this.startPos;
            this.outPos.setValue(st.x + ax.x * delta, st.y + ax.y * delta, st.z + ax.z * delta);
            // 应用
            this.__apply(this.outPos);
        }
        // 如果上层没有截获，则这里处理
        onKeyEvent(keycode, down) {
            if (!this.node)
                return;
            super.onKeyEvent(keycode, down);
            let cax = this.cax;
            if (keycode >= 88 && keycode <= 90) { // xyz
                let ax = keycode - 88;
                if (cax != ax) {
                    this.cax = ax;
                    this.worldAx = 1;
                    this.onChangeAxis();
                }
                else {
                    this.worldAx += 1;
                    this.worldAx %= 3;
                    this.onChangeAxis();
                }
            }
        }
    }

    class RotationAction extends KeyInputAction {
        constructor() {
            super();
            this.QuatI = new Laya.Quaternion();
            this.startRot = new Laya.Quaternion();
            // 起点要不断更新，否则幅度太大的时候会产生意外旋转
            this.lastHitPos = new Laya.Vector3();
            this.curHitPos = new Laya.Vector3();
            this.deltaRot = new Laya.Quaternion();
            this.outRot = new Laya.Quaternion();
            this.rotAxis = new Laya.Vector3(); // 旋转轴：缺省是摄像机z轴，第一次切换为世界空间轴，第二次本地空间轴
            this.rotOrig = new Laya.Vector3(); // 旋转原点
            this.camDir = new Laya.Vector3(); // 摄像机朝向。作为缺省旋转轴。是摄像机朝向的反向
            this.planeD = 0; // 构造的点击平面。 平面方程是: ax+by+cz=d
            this.rayDir = new Laya.Vector3(); // 鼠标射线方向
            this.camRay = new Laya.Ray(new Laya.Vector3(), new Laya.Vector3());
            this.cax = 0; //0 x, 1 y 2 z
            this.worldAx = 0; // 0 视平面， 世界空间， 本地空间
            this.initStatic();
        }
        initStatic() {
            if (!RotationAction.mousePt) {
                RotationAction.mousePt = new Laya.Vector2();
                RotationAction.v1 = new Laya.Vector3();
                RotationAction.v2 = new Laya.Vector3();
            }
        }
        hitPlane(hitpos) {
            let r = this.camRay;
            let rdir = this.rayDir;
            Laya.Vector3.normalize(r.direction, rdir);
            // dot(raypos, norm)+dot(raydir,norm)*t=d;
            let t = (this.planeD - Laya.Vector3.dot(r.origin, this.rotAxis)) / Laya.Vector3.dot(rdir, this.rotAxis);
            if (t >= 0 && t < 1e8) {
                r.origin.cloneTo(hitpos);
                hitpos.x += rdir.x * t;
                hitpos.y += rdir.y * t;
                hitpos.z += rdir.z * t;
                return true;
            }
            return false;
        }
        updateRay(mousex, mousey) {
            let ray = this.camRay;
            let mousept = RotationAction.mousePt;
            mousept.setValue(mousex, mousey);
            this.camera.viewportPointToRay(mousept, ray);
        }
        onMouseMove(mx, my) {
            if (!this.node)
                return;
            if (this.useInput)
                return;
            this.updateRay(mx, my);
            let hitpos = this.curHitPos;
            if (this.hitPlane(hitpos)) {
                let v1 = RotationAction.v1;
                let v2 = RotationAction.v2;
                Laya.Vector3.subtract(this.lastHitPos, this.rotOrig, v1);
                Laya.Vector3.subtract(hitpos, this.rotOrig, v2);
                Laya.Vector3.normalize(v1, v1);
                Laya.Vector3.normalize(v2, v2);
                let deltaRot = this.deltaRot;
                ArcBall.rotationTo(deltaRot, v1, v2);
                //
                if (this.shift) {
                    //deltaRot/10
                    Laya.Quaternion.slerp(this.QuatI, deltaRot, 0.1, deltaRot);
                }
                Laya.Quaternion.multiply(deltaRot, this.outRot, this.outRot);
                // 应用
                let r = this.node.transform.rotation;
                this.outRot.cloneTo(r);
                this.node.transform.rotation = r;
                this.curHitPos.cloneTo(this.lastHitPos);
            }
        }
        // 确认
        apply(outop) {
            if (!this.node)
                return;
            let r = this.node.transform.rotation;
            this.outRot.cloneTo(r);
            this.node.transform.rotation = r;
            this.node = null;
            // 记录undo
            if (outop) {
                if (!outop.applyop)
                    outop.applyop = {};
                if (!outop.lastop)
                    outop.lastop = {};
                outop.applyop['rotation'] = [r.x, r.y, r.z, r.w];
                let lr = this.startRot;
                outop.lastop['rotation'] = [lr.x, lr.y, lr.z, lr.w];
            }
        }
        // 取消
        cancel() {
            if (!this.node)
                return;
            let r = this.node.transform.rotation;
            this.startRot.cloneTo(r);
            this.node.transform.rotation = r;
            this.node = null;
        }
        startAction(node, cam, mousex, mousey) {
            this.shift = false;
            super._startAction(node, cam);
            this.node = node;
            this.camera = cam;
            node.transform.rotation.cloneTo(this.startRot);
            node.transform.position.cloneTo(this.rotOrig);
            this.startRot.cloneTo(this.outRot);
            var mat = cam.transform.worldMatrix.elements;
            var zx = mat[8]; // z轴朝向
            var zy = mat[9];
            var zz = mat[10];
            this.camDir.setValue(zx, zy, zz); //TODO 是否要取反
            Laya.Vector3.normalize(this.camDir, this.camDir);
            this.updateRay(mousex, mousey);
            this.cax = 0;
            this.worldAx = 0;
            this.useInput = false;
            this.onChangeAxis();
            //this.lastQuat.identity();
            // 计算初始拾取点
            this.hitPlane(this.lastHitPos);
            //let cx = Laya.stage.mouseX;
            //let cy = Laya.stage.mouseY;
            //this.arcball.startDrag(cx,cy, cam.transform.worldMatrix);
        }
        /**
         * 设置转轴（平面法线），计算平面d
         */
        onChangeAxis() {
            if (!this.node)
                return;
            switch (this.worldAx) {
                case 0:
                    this.camDir.cloneTo(this.rotAxis);
                    break;
                case 1: // 世界空间
                    if (this.cax == 0)
                        this.rotAxis.setValue(1, 0, 0);
                    else if (this.cax == 1)
                        this.rotAxis.setValue(0, 1, 0);
                    else
                        this.rotAxis.setValue(0, 0, 1);
                    break;
                case 2: // 本地空间
                    {
                        let worldmate = this.node.transform.worldMatrix.elements;
                        if (this.cax == 0) {
                            this.rotAxis.setValue(worldmate[0], worldmate[1], worldmate[2]);
                        }
                        else if (this.cax == 1) {
                            this.rotAxis.setValue(worldmate[4], worldmate[5], worldmate[6]);
                        }
                        else {
                            this.rotAxis.setValue(worldmate[8], worldmate[9], worldmate[10]);
                        }
                        Laya.Vector3.normalize(this.rotAxis, this.rotAxis);
                    }
                    break;
            }
            Laya.Quaternion.createFromAxisAngle(this.rotAxis, 0, this.QuatI);
            this.planeD = Laya.Vector3.dot(this.rotAxis, this.rotOrig);
            console.log('rotax=', this.rotAxis, this.planeD);
            this.hitPlane(this.lastHitPos);
        }
        onInputValueChanged(deg) {
            if (!this.node)
                return;
            Laya.Quaternion.createFromAxisAngle(this.rotAxis, deg * Math.PI / 180, this.deltaRot);
            Laya.Quaternion.multiply(this.deltaRot, this.startRot, this.outRot);
            // 应用
            let r = this.node.transform.rotation;
            this.outRot.cloneTo(r);
            this.node.transform.rotation = r;
        }
        // 如果上层没有截获，则这里处理
        onKeyEvent(keycode, down) {
            if (!this.node)
                return;
            super.onKeyEvent(keycode, down);
            let cax = this.cax;
            if (keycode >= 88 && keycode <= 90) { // xyz
                let ax = keycode - 88;
                if (cax != ax) {
                    this.cax = ax;
                    this.worldAx = 1;
                    this.onChangeAxis();
                }
                else {
                    this.worldAx += 1;
                    this.worldAx %= 3;
                    this.onChangeAxis();
                }
            }
        }
    }

    /**
     * @class TupleDictionary
     * @constructor
     */
    class TupleDictionary {
        constructor() {
            this.data = { keys: [] };
        }
        get(i, j) {
            if (i > j) {
                // swap
                const temp = j;
                j = i;
                i = temp;
            }
            return this.data[`${i}-${j}`];
        }
        set(i, j, value) {
            if (i > j) {
                const temp = j;
                j = i;
                i = temp;
            }
            const key = `${i}-${j}`;
            // Check if key already exists
            if (!this.get(i, j)) {
                this.data.keys.push(key);
            }
            this.data[key] = value;
        }
        reset() {
            const data = this.data;
            const keys = data.keys;
            while (keys.length > 0) {
                const key = keys.pop();
                delete data[key];
            }
        }
    }

    /**
     * For pooling objects that can be reused.
     * @class Pool
     * @constructor
     */
    class Pool {
        constructor() {
            /**
             * The pooled objects
             */
            this.objects = [];
        }
        /**
         * Release an object after use
         * @method release
         * @param {Object} obj
         */
        releaseMany(args) {
            const Nargs = args.length;
            for (let i = 0; i !== Nargs; i++) {
                this.objects.push(args[i]);
            }
            return this;
        }
        release(o) {
            this.objects.push(o);
            return this;
        }
        /**
         * Get an object
         * @method get
         */
        get() {
            if (this.objects.length === 0) {
                return this.constructObject();
            }
            else {
                return this.objects.pop();
            }
        }
        /**
         * Construct an object. Should be implmented in each subclass.
         */
        constructObject() {
            throw new Error("constructObject() not implemented in this Pool subclass yet!");
        }
        /**
         * @method resize
         * @param  size
         * @return  Self, for chaining
         */
        resize(size) {
            const objects = this.objects;
            while (objects.length > size) {
                objects.pop();
            }
            while (objects.length < size) {
                objects.push(this.constructObject());
            }
            return this;
        }
    }

    class Vec3Pool extends Pool {
        constructor() {
            super();
        }
        constructObject() {
            return new Vec3();
        }
    }

    const ORIGIN = new Vec3();
    /**
     * 子多面体的最近点的结果
     */
    class SubSimplexClosestResult {
        constructor() {
            this.closestPointOnSimplex = new Vec3();
            //MASK for m_usedVertices
            //stores the simplex vertex-usage, using the MASK,
            // if m_usedVertices & MASK then the related vertex is used
            //btUsageBitfield m_usedVertices;
            this.usedVertices = 0;
            this.barycentricCoords = [0, 0, 0, 0]; // 重心坐标，最多到四面体，所以保留4个
            this.degenerate = false; // simplex退化了
        }
        reset() {
            this.degenerate = false;
            this.setBarycentricCoordinates();
            this.usedVertices = 0;
        }
        isValid() {
            let bcC = this.barycentricCoords;
            return (bcC[0] >= 0.) &&
                (bcC[1] >= 0.) &&
                (bcC[2] >= 0.) &&
                (bcC[3] >= 0.);
        }
        setBarycentricCoordinates(a = 0, b = 0, c = 0, d = 0) {
            let bcC = this.barycentricCoords;
            bcC[0] = a;
            bcC[1] = b;
            bcC[2] = c;
            bcC[3] = d;
        }
    }
    class VoronoiSimplexSolver {
        constructor() {
            this.MAXVERTS = 5;
            this.vertNum = 0; //当前指针，
            this.needUpdate = true;
            this.vecW = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()]; // P-Q. 注意不要看成是矢量，是Minkowski多边形上的点，
            this.pointP = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
            this.pointQ = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
            /**  计算出的新的方向，也就是需要下一步扩展单形的方向 */
            this.cachedV = new Vec3();
            this.cachedP = new Vec3();
            this.cachedQ = new Vec3();
            this.cachedBC = new SubSimplexClosestResult();
            this.cachedValidClosest = false;
        }
        reset() {
            this.vertNum = 0;
            this.needUpdate = true;
        }
        addVertex(w, pWorld, qWorld) {
            this.lastW = w;
            this.needUpdate = true;
            let n = this.vertNum;
            this.vecW[n].copy(w);
            this.pointP[n].copy(pWorld);
            this.pointQ[n].copy(qWorld);
            this.vertNum++;
        }
        inSimplex(p) {
            let found = false;
            let num = this.vertNum;
            for (let i = 0; i < num; i++) {
                if (this.vecW[i].almostEquals(p)) {
                    found = true;
                }
            }
            return found;
        }
        closest(newDir) {
            let succes = this.updateClosestVectorAndPoints();
            // 如果点正好在单形上，会返回false，怎么处理
            //newDir.copy(this.cachedV);
            // 更新采样方向，要朝向原点，所以取cachedV的反向
            this.cachedV.negate(newDir);
            return succes;
        }
        fullSimplex() {
            return this.vertNum >= 4;
        }
        removeVertex(index) {
            // this.vertNum > 0;
            this.vertNum--;
            this.vecW[index] = this.vecW[this.vertNum];
            this.pointP[index] = this.pointP[this.vertNum];
            this.pointQ[index] = this.pointQ[this.vertNum];
        }
        //去掉不用的
        reduceVertices(used) {
            var usedA = used & 0x0001;
            var usedB = (used >> 1) & 0x0001;
            var usedC = (used >> 2) & 0x0001;
            var usedD = (used >> 3) & 0x0001;
            if ((this.vertNum >= 4) && (!usedD)) {
                this.removeVertex(3);
            }
            if ((this.vertNum >= 3) && (!usedC)) {
                this.removeVertex(2);
            }
            if ((this.vertNum >= 2) && (!usedB)) {
                this.removeVertex(1);
            }
            if ((this.vertNum >= 1) && (!usedA)) {
                this.removeVertex(0);
            }
        }
        compute_points(p1, p2) {
            this.updateClosestVectorAndPoints();
            p1.copy(this.cachedP);
            p2.copy(this.cachedQ);
        }
        closestPtPointTriangle(p, a, b, c, result) {
            let ab = new Vec3();
            let ac = new Vec3();
            let ap = new Vec3();
            let bc = new Vec3();
            result.usedVertices = 0;
            let closest = result.closestPointOnSimplex;
            // Check if P in vertex region outside A
            b.vsub(a, ab);
            c.vsub(a, ac);
            p.vsub(a, ap);
            let d1 = ab.dot(ap);
            let d2 = ac.dot(ap);
            if (d1 <= 0.0 && d2 <= 0.0) {
                closest.copy(a);
                result.usedVertices |= 1; // usedVertexA = true;
                result.setBarycentricCoordinates(1, 0, 0);
                return; // a; // barycentric coordinates (1,0,0)
            }
            // Check if P in vertex region outside B
            let bp = new Vec3();
            p.vsub(b, bp);
            let d3 = ab.dot(bp);
            let d4 = ac.dot(bp);
            if (d3 >= 0.0 && d4 <= d3) {
                closest.copy(b);
                result.usedVertices |= 2; //usedVertexB = true;
                result.setBarycentricCoordinates(0, 1, 0);
                return; // b; // barycentric coordinates (0,1,0)
            }
            // Check if P in edge region of AB, if so return projection of P onto AB
            let vc = d1 * d4 - d3 * d2;
            if (vc <= 0.0 && d1 >= 0.0 && d3 <= 0.0) {
                let v = d1 / (d1 - d3);
                a.addScaledVector(v, ab, closest); // = a+v*ab
                result.usedVertices |= 3; //usedVertexA = true; usedVertexB = true;
                result.setBarycentricCoordinates(1 - v, v, 0);
                return;
                //return a + v * ab; // barycentric coordinates (1-v,v,0)
            }
            // Check if P in vertex region outside C
            let cp = new Vec3();
            p.vsub(c, cp);
            let d5 = ab.dot(cp);
            let d6 = ac.dot(cp);
            if (d6 >= 0.0 && d5 <= d6) {
                result.closestPointOnSimplex = c;
                result.usedVertices |= 4; //usedVertexC = true;
                result.setBarycentricCoordinates(0, 0, 1);
                return; //c; // barycentric coordinates (0,0,1)
            }
            // Check if P in edge region of AC, if so return projection of P onto AC
            let vb = d5 * d2 - d1 * d6;
            if (vb <= 0.0 && d2 >= 0.0 && d6 <= 0.0) {
                let w = d2 / (d2 - d6);
                a.addScaledVector(w, ac, closest); //closest = a + w * ac;
                result.usedVertices |= 5; //usedVertexA = true;usedVertexC = true;
                result.setBarycentricCoordinates(1 - w, 0, w);
                return;
                //return a + w * ac; // barycentric coordinates (1-w,0,w)
            }
            // Check if P in edge region of BC, if so return projection of P onto BC
            let va = d3 * d6 - d5 * d4;
            if (va <= 0.0 && (d4 - d3) >= 0.0 && (d5 - d6) >= 0.0) {
                let w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
                c.vsub(b, bc);
                b.addScaledVector(w, bc, closest); //closest = b + w * (c - b);
                result.usedVertices |= 6; //usedVertexB = true; usedVertexC = true;
                result.setBarycentricCoordinates(0, 1 - w, w);
                return;
                // return b + w * (c - b); // barycentric coordinates (0,1-w,w)
            }
            // P inside face region. Compute Q through its barycentric coordinates (u,v,w)
            let denom = 1.0 / (va + vb + vc);
            let v = vb * denom;
            let w = vc * denom;
            a.addScaledVector(v, ab, closest);
            closest.addScaledVector(w, ac, closest); //closest = a + ab * v + ac * w;
            result.usedVertices |= 7; //usedVertexA = true; usedVertexB = true; usedVertexC = true;
            result.setBarycentricCoordinates(1 - v - w, v, w);
            //	return a + ab * v + ac * w; // = u*a + v*b + w*c, u = va * denom = btScalar(1.0) - v - w
        }
        /**
         * 判断一个点在平面的外面，平面是abc，d是平面内的一个点，用于确定内部
         * @param p
         * @param a
         * @param b
         * @param c
         * @param d
         * @return -1 在面上， 0 在内面， 1 在外面（与d同侧）
         */
        pointOutsideOfPlane(p, a, b, c, d) {
            let ac = new Vec3();
            let ab = new Vec3();
            let ap = new Vec3();
            let ad = new Vec3();
            let normal = new Vec3();
            c.vsub(a, ac); //ac=c-a
            b.vsub(a, ab); //ab=b-a
            ab.cross(ac, normal); //normal=abxac
            p.vsub(a, ap); //ap = p-a;
            d.vsub(a, ad); //ad = d-a;
            let signp = ap.dot(normal); // [AP AB AC]
            let signd = ad.dot(normal); // [AD AB AC]
            if (signd * signd < ((1e-8) * (1e-8))) {
                //如果在平面上
                return -1;
            }
            // 如果点在外面，则一定与d分别在平面的两侧，则符号相反
            return (signp * signd < 0.) ? 1 : 0;
        }
        /**
         * 查找点p在四面体abcd上最近的面，得到的结果放在finalResult中
         * TODO 优化，感觉太啰嗦
         * @param p
         * @param a
         * @param b
         * @param c
         * @param d
         * @param finalResult
         * @return
         */
        closestPtPointTetrahedron(p, a, b, c, d, finalResult) {
            let tempResult = new SubSimplexClosestResult();
            // Start out assuming point inside all halfspaces, so closest to itself
            finalResult.closestPointOnSimplex.copy(p);
            finalResult.usedVertices = 0;
            finalResult.usedVertices = 15; //ABCD
            let pointOutsideABC = this.pointOutsideOfPlane(p, a, b, c, d);
            let pointOutsideACD = this.pointOutsideOfPlane(p, a, c, d, b);
            let pointOutsideADB = this.pointOutsideOfPlane(p, a, d, b, c);
            let pointOutsideBDC = this.pointOutsideOfPlane(p, b, d, c, a);
            if (pointOutsideABC < 0 || pointOutsideACD < 0 || pointOutsideADB < 0 || pointOutsideBDC < 0) {
                //p 在多面体的面上了。查找最近点失败
                finalResult.degenerate = true;
                return false;
            }
            if (!pointOutsideABC && !pointOutsideACD && !pointOutsideADB && !pointOutsideBDC) {
                // 如果点已经在四面体内部了。。TODO
                return false;
            }
            // p在四面体的外面，但是不知道距离哪一个面最近，需要挨个测试，找到最近的（最多需要测试3次）
            let bestSqDist = 1e10;
            let pq = new Vec3();
            // If point outside face abc then compute closest point on abc
            if (pointOutsideABC) {
                this.closestPtPointTriangle(p, a, b, c, tempResult);
                let q = tempResult.closestPointOnSimplex;
                q.vsub(p, pq);
                let sqDist = pq.dot(pq);
                // Update best closest point if (squared) distance is less than current best
                if (sqDist < bestSqDist) {
                    bestSqDist = sqDist;
                    finalResult.closestPointOnSimplex.copy(q);
                    //convert result bitmask!
                    finalResult.usedVertices = 7; //ABC
                    finalResult.setBarycentricCoordinates(tempResult.barycentricCoords[0], //A
                    tempResult.barycentricCoords[1], //B
                    tempResult.barycentricCoords[2], //C
                    0);
                }
            }
            // Repeat test for face acd
            if (pointOutsideACD) {
                this.closestPtPointTriangle(p, a, c, d, tempResult);
                let q = tempResult.closestPointOnSimplex;
                //convert result bitmask!
                q.vsub(p, pq);
                let sqDist = pq.dot(pq);
                if (sqDist < bestSqDist) {
                    bestSqDist = sqDist;
                    finalResult.closestPointOnSimplex.copy(q);
                    finalResult.usedVertices = 13; //ACD
                    finalResult.setBarycentricCoordinates(tempResult.barycentricCoords[0], //A
                    0, tempResult.barycentricCoords[1], //B
                    tempResult.barycentricCoords[2]); //C
                }
            }
            // Repeat test for face adb
            if (pointOutsideADB) {
                this.closestPtPointTriangle(p, a, d, b, tempResult);
                let q = tempResult.closestPointOnSimplex;
                q.vsub(p, pq);
                let sqDist = pq.dot(pq);
                if (sqDist < bestSqDist) {
                    bestSqDist = sqDist;
                    finalResult.closestPointOnSimplex.copy(q);
                    finalResult.usedVertices = 11; //ABD
                    finalResult.setBarycentricCoordinates(tempResult.barycentricCoords[0], //A
                    tempResult.barycentricCoords[2], //C
                    0, tempResult.barycentricCoords[1]); //B
                }
            }
            // Repeat test for face bdc
            if (pointOutsideBDC) {
                this.closestPtPointTriangle(p, b, d, c, tempResult);
                let q = tempResult.closestPointOnSimplex;
                q.vsub(p, pq);
                let sqDist = pq.dot(pq);
                if (sqDist < bestSqDist) {
                    bestSqDist = sqDist;
                    finalResult.closestPointOnSimplex = q;
                    finalResult.usedVertices = 14; //BCD
                    finalResult.setBarycentricCoordinates(0, tempResult.barycentricCoords[0], //A
                    tempResult.barycentricCoords[2], //C
                    tempResult.barycentricCoords[1]); //B
                }
            }
            return true;
        }
        /**
         * 计算单形上最接近原点的点，以及朝向原点的方向
         */
        updateClosestVectorAndPoints() {
            if (this.needUpdate) {
                let cachedBC = this.cachedBC;
                let cachedP = this.cachedP;
                let cachedQ = this.cachedQ;
                let cachedV = this.cachedV;
                let Vs = this.vecW;
                let Ps = this.pointP;
                let Qs = this.pointQ;
                this.needUpdate = false;
                cachedBC.reset();
                switch (this.vertNum) {
                    case 0:
                        this.cachedValidClosest = false;
                        break;
                    case 1: // 一个支撑
                        cachedP.copy(Ps[0]);
                        cachedQ.copy(Qs[0]);
                        cachedV.copy(Vs[0]);
                        cachedBC.reset();
                        cachedBC.setBarycentricCoordinates(1, 0, 0, 0);
                        this.cachedValidClosest = true; //一个总是true
                        break;
                    case 2: // 线段
                        {
                            let from = Vs[0];
                            let to = Vs[1];
                            let nearest = new Vec3();
                            let fromTo = new Vec3();
                            to.vsub(from, fromTo);
                            let t = -from.dot(fromTo); // from_Origin 在 fromTo上的投影 。
                            // 判断第二次的朝向是不是比第一次更靠近原点方向
                            if (t > 0) {
                                // 原点投影在正向
                                let dotVV = fromTo.dot(fromTo);
                                if (t < dotVV) {
                                    // 投影在线段上
                                    t /= dotVV;
                                    //diff -= t * v;
                                    cachedBC.usedVertices |= 3; //使用第一第二个点
                                }
                                else {
                                    // 投影在线段外，需要重来，退化成一个点
                                    t = 1;
                                    //diff -= v;
                                    cachedBC.usedVertices |= 2; // 使用第二个点
                                }
                            }
                            else {
                                // t在from外，当前的simplex不行，退化成一个点重来
                                t = 0;
                                cachedBC.usedVertices |= 1; // 使用第一个点
                            }
                            cachedBC.setBarycentricCoordinates(1 - t, t);
                            from.addScaledVector(t, fromTo, nearest);
                            // 更新p1,p2
                            let p0 = Ps[0], p1 = Ps[1];
                            let q0 = Qs[0], q1 = Qs[1];
                            cachedP.x = p0.x + t * (p1.x - p0.x);
                            cachedP.y = p0.y + t * (p1.y - p0.y);
                            cachedP.z = p0.z + t * (p1.z - p0.z);
                            cachedQ.x = q0.x + t * (q1.x - q0.x);
                            cachedQ.y = q0.y + t * (q1.y - q0.y);
                            cachedQ.z = q0.z + t * (q1.z - q0.z);
                            cachedP.vsub(cachedQ, cachedV);
                            this.reduceVertices(cachedBC.usedVertices);
                            this.cachedValidClosest = cachedBC.isValid();
                        }
                        break;
                    case 3: // 三角形
                        {
                            //closest point origin from triangle
                            let vecW = this.vecW;
                            let a = vecW[0];
                            let b = vecW[1];
                            let c = vecW[2];
                            this.closestPtPointTriangle(ORIGIN, a, b, c, cachedBC);
                            let bcCoord = cachedBC.barycentricCoords;
                            {
                                let a = bcCoord[0], b = bcCoord[1], c = bcCoord[2];
                                let p0 = Ps[0], p1 = Ps[1], p2 = Ps[2];
                                let q0 = Qs[0], q1 = Qs[1], q2 = Qs[2];
                                cachedP.x = p0.x * a + p1.x * b + p2.x * c;
                                cachedP.y = p0.y * a + p1.y * b + p2.y * c;
                                cachedP.z = p0.z * a + p1.z * b + p2.z * c;
                                cachedQ.x = q0.x * a + q1.x * b + q2.x * c;
                                cachedQ.y = q0.y * a + q1.y * b + q2.y * c;
                                cachedQ.z = q0.z * a + q1.z * b + q2.z * c;
                            }
                            cachedP.vsub(cachedQ, cachedV);
                            this.reduceVertices(cachedBC.usedVertices);
                            this.cachedValidClosest = cachedBC.isValid();
                        }
                        break;
                    case 4: // 四面体
                        {
                            let a = Vs[0];
                            let b = Vs[1];
                            let c = Vs[2];
                            let d = Vs[3];
                            let hasSeparation = this.closestPtPointTetrahedron(ORIGIN, a, b, c, d, cachedBC);
                            if (hasSeparation) {
                                let bcCoord = cachedBC.barycentricCoords;
                                let a = bcCoord[0], b = bcCoord[1], c = bcCoord[2], d = bcCoord[3];
                                let p0 = Ps[0], p1 = Ps[1], p2 = Ps[2], p3 = Ps[3];
                                let q0 = Qs[0], q1 = Qs[1], q2 = Qs[2], q3 = Qs[3];
                                cachedP.x = p0.x * a + p1.x * b + p2.x * c + p3.x * d;
                                cachedP.y = p0.y * a + p1.y * b + p2.y * c + p3.y * d;
                                cachedP.z = p0.z * a + p1.z * b + p2.z * c + p3.z * d;
                                cachedQ.x = q0.x * a + q1.x * b + q2.x * c + q3.x * d;
                                cachedQ.y = q0.y * a + q1.y * b + q2.y * c + q3.y * d;
                                cachedQ.z = q0.z * a + q1.z * b + q2.z * c + q3.z * d;
                                cachedP.vsub(cachedQ, cachedV);
                                this.reduceVertices(cachedBC.usedVertices);
                            }
                            else {
                                //					printf("sub distance got penetration\n");
                                if (cachedBC.degenerate) {
                                    //如果点已经在表面上了，则正常
                                    this.cachedValidClosest = false;
                                }
                                else {
                                    this.cachedValidClosest = true;
                                    //degenerate case == false, penetration = true + zero
                                    cachedV.set(0, 0, 0);
                                }
                                break;
                            }
                            this.cachedValidClosest = cachedBC.isValid();
                            //closest point origin from tetrahedron
                        }
                        break;
                    default:
                        this.cachedValidClosest = false;
                }
            }
            return this.cachedValidClosest;
        }
    }

    const GJK_MIN_DISTANCE = 1e-12;
    const GJK_DUPLICATED_EPS = 1e-12;
    const GJK_ACCURACY = 1e-12;
    const GJK_MAX_ITERATIONS = 128;
    const GJK_SIMPLEX2_EPS = 0;
    const GJK_SIMPLEX3_EPS = 0;
    const GJK_SIMPLEX4_EPS = 0;
    /** support vertex */
    class GJK_sSV {
        constructor() {
            /** 采样方向 */
            this.d = new Vec3();
            /** 采样得到的点 */
            this.w = new Vec3();
        }
        copy(o) {
            this.d.copy(o.d);
            this.w.copy(o.w);
            return this;
        }
    }
    /** 当前单形的描述 */
    class GJK_sSimlex {
        constructor() {
            /** 支撑点，最多4个，包含采样方向和采样点 */
            this.supv = []; //4
            this.p = [0, 0, 0, 0];
            this.rank = 0; // 单形类型。1点， 2线段 3三角形 4四面体
        }
    }
    var vec3_4 = [new Vec3(), new Vec3(), new Vec3(), new Vec3()];
    class GJK {
        constructor() {
            this.m_ray = new Vec3(); // 当前检测方向
            this.m_distance = 0;
            /** simplex[2] */
            this.m_simplices = [new GJK_sSimlex(), new GJK_sSimlex()];
            this.m_store = [new GJK_sSV(), new GJK_sSV(), new GJK_sSV(), new GJK_sSV()];
            this.m_free = new Array(4); // 保存删除的点
            this.m_nfree = 0; // m_free的有效长度
            this.m_current = 0;
            this.m_status = 2 /* Failed */;
            this.Initialize();
        }
        Initialize() {
            this.m_ray.set(0, 0, 0);
            this.m_nfree = 0;
            this.m_status = 2 /* Failed */;
            this.m_current = 0;
            this.m_distance = 0;
        }
        /**
         * 执行GJK算法
         * @param shapearg
         * @param guess 初始检测方向
         * @TODO 由于这个函数会多次调用，需要想办法优化其中的空间转换部分的代码
         */
        Evaluate(shapearg, guess) {
            let m_simplices = this.m_simplices;
            let m_ray = this.m_ray;
            let iterations = 0;
            let sqdist = 0;
            let alpha = 0;
            let lastw = vec3_4; //Vec3[4]
            let clastw = 0;
            /* Initialize solver		*/
            let m_free = this.m_free;
            let m_store = this.m_store;
            m_free[0] = m_store[0];
            m_free[1] = m_store[1];
            m_free[2] = m_store[2];
            m_free[3] = m_store[3];
            this.m_nfree = 4;
            this.m_current = 0;
            this.m_status = 0 /* Valid */;
            this.m_shape = shapearg;
            this.m_distance = 0;
            /* Initialize simplex		*/
            let curSimp = m_simplices[0];
            curSimp.rank = 0;
            m_ray.copy(guess);
            let sqrl = m_ray.lengthSquared();
            // 采样第一个simplex
            let smpDir = new Vec3(1, 0, 0);
            if (sqrl > 0) {
                m_ray.negate(smpDir);
            }
            this.appendvertice(curSimp, smpDir);
            curSimp.p[0] = 1;
            m_ray.copy(curSimp.supv[0].w);
            sqdist = sqrl;
            lastw[0].copy(m_ray); // lastw = simp[0].c[0].w
            lastw[1].copy(m_ray);
            lastw[2].copy(m_ray);
            lastw[3].copy(m_ray);
            let tmpD = new Vec3();
            let weights = [0, 0, 0, 0];
            let retMask = [0];
            let current = this.m_current;
            do {
                let next = 1 - current; //只在0,1之间切换
                /** 当前的simplex */
                let cs = m_simplices[current];
                /** 下一个simplex */
                let ns = m_simplices[next];
                /* Check zero							*/
                /** 采样方向的长度 */
                let rl = m_ray.length();
                if (rl < GJK_MIN_DISTANCE) { /* Touching or inside				*/
                    this.m_status = 1 /* Inside */;
                    break;
                }
                /* Append new vertice in -'v' direction	*/
                m_ray.negate(smpDir);
                this.appendvertice(cs, smpDir); // 添加一个新的采样
                /**新的采样点 */
                let w = cs.supv[cs.rank - 1].w;
                let found = false;
                for (let i = 0; i < 4; ++i) {
                    w.vsub(lastw[i], tmpD); //tmpD = w-lastw[i]
                    if (tmpD.lengthSquared() < GJK_DUPLICATED_EPS) {
                        //如果新的采样点已经与上4次中的某个重合了，则认为结束了
                        found = true;
                        break;
                    }
                }
                if (found) { /* Return old simplex				*/
                    // 删掉重合的点，结束。
                    this.removevertice(m_simplices[current]);
                    break;
                }
                else { /* Update lastw					*/
                    // 更新 lastw，lastw[++%4]=w
                    lastw[clastw = (clastw + 1) & 3].copy(w);
                }
                /* Check for termination				*/
                /** 采样点在采样方向上投影的长度 */
                let omega = m_ray.dot(w) / rl;
                alpha = Math.max(omega, alpha); // 取大的
                if (((rl - alpha) - (GJK_ACCURACY * rl)) <= 0) { /* Return old simplex				*/
                    //如果新采样的长度跟原来的差不多，结束
                    this.removevertice(m_simplices[current]);
                    break;
                }
                /* Reduce simplex						*/
                weights[2] = 0;
                weights[3] = 0; //初始化为0
                retMask[0] = 0;
                switch (cs.rank) {
                    case 2:
                        sqdist = this.projectorigin2(cs.supv[0].w, cs.supv[1].w, weights, retMask);
                        break;
                    case 3:
                        sqdist = this.projectorigin3(cs.supv[0].w, cs.supv[1].w, cs.supv[2].w, weights, retMask);
                        break;
                    case 4:
                        sqdist = this.projectorigin4(cs.supv[0].w, cs.supv[1].w, cs.supv[2].w, cs.supv[3].w, weights, retMask);
                        break;
                }
                let mask = retMask[0];
                //如果距离有效。计算新的采样方向
                if (sqdist >= 0) { /* Valid	*/
                    ns.rank = 0;
                    m_ray.set(0, 0, 0);
                    this.m_current = current = next;
                    for (let i = 0, ni = cs.rank; i < ni; ++i) {
                        if (mask & (1 << i)) {
                            // 如果weights[i]存在数据
                            // 这里的作用是去掉空白的数据，并且更新ray
                            ns.supv[ns.rank] = cs.supv[i];
                            let cwt = weights[i];
                            ns.p[ns.rank++] = cwt;
                            let cw = cs.supv[i].w;
                            m_ray.x += cw.x * cwt;
                            m_ray.y += cw.y * cwt;
                            m_ray.z += cw.z * cwt;
                        }
                        else {
                            m_free[this.m_nfree++] = cs.supv[i];
                        }
                    }
                    if (mask == 15)
                        this.m_status = 1 /* Inside */;
                }
                else { /* Return old simplex				*/
                    this.removevertice(m_simplices[current]);
                    break;
                }
                this.m_status = ((++iterations) < GJK_MAX_ITERATIONS) ? this.m_status : 2 /* Failed */;
            } while (this.m_status == 0 /* Valid */);
            this.m_simplex = m_simplices[this.m_current];
            switch (this.m_status) {
                case 0 /* Valid */:
                    this.m_distance = m_ray.length();
                    break;
                case 1 /* Inside */:
                    this.m_distance = 0;
                    break;
                default:
                    {
                    }
            }
            return this.m_status;
        }
        /**
         * 构建四面体，把原点包起来
         * @return false
         */
        EncloseOrigin() {
            let m_simplex = this.m_simplex;
            let d = new Vec3();
            let p = new Vec3();
            let n = new Vec3();
            let axis = new Vec3();
            let negv = new Vec3();
            let d1 = new Vec3();
            let d2 = new Vec3();
            let d3 = new Vec3();
            switch (m_simplex.rank) {
                case 1:
                    {
                        // 如果只有一个点，需要6个正方向采样，变成线段再看
                        for (let i = 0; i < 3; ++i) {
                            axis.set(i == 0 ? 1 : 0, i == 1 ? 1 : 0, i == 2 ? 1 : 0); // 1,0,0;  0,1,0;  0,0,1
                            this.appendvertice(m_simplex, axis);
                            if (this.EncloseOrigin())
                                return true;
                            this.removevertice(m_simplex);
                            axis.negate(negv); // 取反再检测一下
                            this.appendvertice(m_simplex, negv); // -axis
                            if (this.EncloseOrigin())
                                return true;
                            this.removevertice(m_simplex);
                        }
                    }
                    break;
                case 2:
                    {
                        m_simplex.supv[1].w.vsub(m_simplex.supv[0].w, d); //	let d = m_simplex.c[1].w - m_simplex.c[0].w;
                        for (let i = 0; i < 3; ++i) {
                            axis.set(i == 0 ? 1 : 0, i == 1 ? 1 : 0, i == 2 ? 1 : 0); // 1,0,0;  0,1,0;  0,0,1
                            d.cross(axis, p); //p=d x axis
                            if (p.lengthSquared() > 0) {
                                this.appendvertice(m_simplex, p);
                                if (this.EncloseOrigin())
                                    return true;
                                this.removevertice(m_simplex);
                                p.negate(negv);
                                this.appendvertice(m_simplex, negv); // -p
                                if (this.EncloseOrigin())
                                    return true;
                                this.removevertice(m_simplex);
                            }
                        }
                    }
                    break;
                case 3:
                    {
                        m_simplex.supv[1].w.vsub(m_simplex.supv[0].w, d1);
                        m_simplex.supv[2].w.vsub(m_simplex.supv[0].w, d2);
                        //Vector3 n = Cross(m_simplex.c[1].w - m_simplex.c[0].w,	m_simplex.c[2].w - m_simplex.c[0].w);
                        d1.cross(d2, n);
                        if (n.lengthSquared() > 0) {
                            this.appendvertice(m_simplex, n);
                            if (this.EncloseOrigin())
                                return true;
                            this.removevertice(m_simplex);
                            n.negate(negv);
                            this.appendvertice(m_simplex, negv); //-n
                            if (this.EncloseOrigin())
                                return true;
                            this.removevertice(m_simplex);
                        }
                    }
                    break;
                case 4:
                    {
                        m_simplex.supv[0].w.vsub(m_simplex.supv[3].w, d1);
                        m_simplex.supv[1].w.vsub(m_simplex.supv[3].w, d2);
                        m_simplex.supv[2].w.vsub(m_simplex.supv[3].w, d3);
                        //if (Math.abs(this.det(m_simplex.c[0].w - m_simplex.c[3].w, m_simplex.c[1].w - m_simplex.c[3].w, m_simplex.c[2].w - m_simplex.c[3].w)) > 0)
                        if (Math.abs(this.det(d1, d2, d3)) > 0)
                            return true;
                    }
                    break;
            }
            return false;
        }
        /**
         * 沿着方向d采样shape，结果放到sv中
         * @param d
         * @param sv
         */
        getsupport(d, sv) {
            let l = d.length();
            d.scale(1 / l, sv.d); // 规格化d. sv.d=d/||d||
            this.m_shape.Support(sv.d, false, sv.w); // 在方向d上采样，放到 sv.w
        }
        /**
         * simplex 删除一个点，降级一下
         * @param simplex
         */
        removevertice(simplex) {
            this.m_free[this.m_nfree++] = simplex.supv[--simplex.rank];
        }
        /**
         * simplex根据采样方向，增加新的点
         * @param simplex
         * @param v
         */
        appendvertice(simplex, v) {
            simplex.p[simplex.rank] = 0;
            simplex.supv[simplex.rank] = this.m_free[--this.m_nfree]; // 回收支撑点
            this.getsupport(v, simplex.supv[simplex.rank++]);
        }
        det(a, b, c) {
            return (a.y * b.z * c.x + a.z * b.x * c.y -
                a.x * b.z * c.y - a.y * b.x * c.z +
                a.x * b.y * c.z - a.z * b.y * c.x);
        }
        /**
         * 原点投影到线段上。返回最接近原点的点到原点的距离
         * @param a 点1
         * @param b 点2
         * @param w out 重心坐标
         * @param m mask bit位表示使用了w的哪个位置
         */
        projectorigin2(a, b, w, m) {
            let d = GJK.proj2_d;
            b.vsub(a, d); //d=b-a;
            let l = d.lengthSquared();
            if (l > GJK_SIMPLEX2_EPS) {
                let t = l > 0 ? -a.dot(d) / l : 0;
                if (t >= 1) { // 原点超过b
                    w[0] = 0;
                    w[1] = 1;
                    m[0] = 2;
                    return (b.lengthSquared());
                }
                else if (t <= 0) { // 原点<a
                    w[0] = 1;
                    w[1] = 0;
                    m[0] = 1;
                    return (a.lengthSquared());
                }
                else {
                    w[0] = 1 - (w[1] = t);
                    m[0] = 3;
                    a.addScaledVector(t, d, d);
                    return d.lengthSquared(); //a+d*t
                }
            }
            return -1;
        }
        /**
         * 找到三角形上最接近原点的点
         * @param a
         * @param b
         * @param c
         * @param w
         * @param m
         */
        projectorigin3(a, b, c, w, m) {
            let imd3 = [1, 2, 0];
            let vt = [a, b, c];
            let n = new Vec3();
            let ba = new Vec3();
            let cb = new Vec3();
            let ac = new Vec3();
            let n1 = new Vec3();
            let p = new Vec3();
            let pb = new Vec3();
            let pc = new Vec3();
            let tmp = new Vec3();
            a.vsub(b, ba);
            b.vsub(c, cb);
            c.vsub(a, ac);
            let dl = [ba, cb, ac];
            dl[0].cross(dl[1], n); //n = dl[0]xdl[1]
            let l = n.lengthSquared();
            if (l > GJK_SIMPLEX3_EPS) {
                let mindist = -1;
                let subw = [0., 0.];
                for (let i = 0; i < 3; ++i) {
                    dl[i].cross(n, n1);
                    if (vt[i].dot(n1) > 0) {
                        let j = imd3[i];
                        let subd = this.projectorigin2(vt[i], vt[j], subw, m); //m重用了
                        let subm = m[0];
                        if ((mindist < 0) || (subd < mindist)) {
                            mindist = subd;
                            m[0] = (((subm & 1) ? 1 << i : 0) + ((subm & 2) ? 1 << j : 0));
                            w[i] = subw[0];
                            w[j] = subw[1];
                            w[imd3[j]] = 0;
                        }
                    }
                }
                if (mindist < 0) {
                    let d = a.dot(n);
                    let s = Math.sqrt(l);
                    n.scale(d / l, p); // p = n*(d/l)
                    mindist = p.lengthSquared();
                    m[0] = 7; // 0,1,2 三个
                    b.vsub(p, pb); //pb=b-p
                    c.vsub(p, pc); //pc=c-p
                    dl[1].cross(pb, tmp); //dl[1] x pb
                    w[0] = tmp.length() / s;
                    dl[2].cross(pc, tmp); //dl[2] x pc
                    w[1] = tmp.length() / s;
                    w[2] = 1 - (w[0] + w[1]);
                }
                return mindist;
            }
            return -1;
        }
        projectorigin4(a, b, c, d, w, m) {
            let imd3 = [1, 2, 0];
            let vt = [a, b, c, d];
            let da = new Vec3();
            let db = new Vec3();
            let dc = new Vec3();
            let cb = new Vec3();
            let ba = new Vec3();
            let n = new Vec3();
            let n1 = new Vec3();
            a.vsub(d, da); //da=a-b
            b.vsub(d, db); //db=b-d
            c.vsub(d, dc); //dc=c-d
            b.vsub(c, cb); //cb=b-c
            a.vsub(b, ba); //ba=a-b
            cb.cross(ba, n); //n=cbxba
            let dl = [da, db, c];
            let vl = this.det(dl[0], dl[1], dl[2]);
            let ng = (vl * a.dot(n)) <= 0;
            if (ng && (Math.abs(vl) > GJK_SIMPLEX4_EPS)) {
                let mindist = -1;
                let subw = [0., 0., 0.];
                let subm = 0;
                for (let i = 0; i < 3; ++i) {
                    let j = imd3[i];
                    dl[i].cross(dl[j], n1);
                    let s = vl * d.dot(n1); //s = vl * d.(dl[i]xdl[j])
                    if (s > 0) {
                        let subd = this.projectorigin3(vt[i], vt[j], d, subw, m);
                        subm = m[0]; // 重用m
                        if ((mindist < 0) || (subd < mindist)) {
                            mindist = subd;
                            m[0] = ((subm & 1 ? 1 << i : 0) + (subm & 2 ? 1 << j : 0) + (subm & 4 ? 8 : 0));
                            w[i] = subw[0];
                            w[j] = subw[1];
                            w[imd3[j]] = 0;
                            w[3] = subw[2];
                        }
                    }
                }
                if (mindist < 0) {
                    mindist = 0;
                    m[0] = 15;
                    w[0] = this.det(c, b, d) / vl;
                    w[1] = this.det(a, c, d) / vl;
                    w[2] = this.det(b, a, d) / vl;
                    w[3] = 1 - (w[0] + w[1] + w[2]);
                }
                return mindist;
            }
            return -1;
        }
    }
    GJK.proj2_d = new Vec3();

    const EPA_MAX_VERTICES = 128;
    const EPA_MAX_FACES = 256; //EPA_MAX_VERTICES*2
    const EPA_MAX_ITERATIONS = 255;
    const EPA_ACCURACY = 1e-12;
    const EPA_PLANE_EPS = 1e-14;
    /**
     * 平面定义
     */
    class EPA_sFace {
        constructor() {
            /** 平面法线 */
            this.n = new Vec3(); // 平面是 n.v=d
            /** 原点到平面的距离 */
            this.d = 0;
            /** face 的三个点 */
            this.vert = new Array(3); //sSV*[]
            /** face 的三个邻面 */
            this.f = new Array(3); //sFace*[]
            /** 三个边对应邻面的哪个边 */
            this.e = [0, 0, 0];
            /** 面的列表，所有的面组成一个双向链表，用来遍历 */
            this.link = new Array(2); //sFace*[]
            /** 经过多少次迭代 */
            this.pass = 0;
        }
        copy(o) {
            this.n.copy(o.n);
            this.d = o.d;
            let c1 = this.vert;
            let c2 = o.vert;
            c1[0] = c2[0];
            c1[1] = c2[1];
            c1[2] = c2[2];
            let f1 = this.f;
            let f2 = o.f;
            f1[0] = f2[0];
            f1[1] = f2[1];
            f1[2] = f2[2];
            this.link[0] = o.link[0];
            this.link[1] = o.link[1];
            this.e[0] = o.e[0];
            this.e[1] = o.e[1];
            this.e[2] = o.e[2];
            this.pass = o.pass;
        }
    }
    /**
     * 面链，通过root和每个face的 l[0],l[1]组成一个可遍历的双向链表
     */
    class EPA_sList {
        constructor() {
            /** 本链表的根face */
            this.root = null;
            /** 链表的长度 */
            this.count = 0;
        }
    }
    class EPA_sHorizon {
        constructor() {
            /** sFAce* */
            this.cf = null;
            /** sFace*  */
            this.ff = null;
            this.nf = 0;
        }
    }
    (function (EPA_eStatus) {
        EPA_eStatus[EPA_eStatus["Valid"] = 0] = "Valid";
        EPA_eStatus[EPA_eStatus["Touching"] = 1] = "Touching";
        EPA_eStatus[EPA_eStatus["Degenerated"] = 2] = "Degenerated";
        EPA_eStatus[EPA_eStatus["NonConvex"] = 3] = "NonConvex";
        EPA_eStatus[EPA_eStatus["InvalidHull"] = 4] = "InvalidHull";
        EPA_eStatus[EPA_eStatus["OutOfFaces"] = 5] = "OutOfFaces";
        EPA_eStatus[EPA_eStatus["OutOfVertices"] = 6] = "OutOfVertices";
        EPA_eStatus[EPA_eStatus["AccuraryReached"] = 7] = "AccuraryReached";
        EPA_eStatus[EPA_eStatus["FallBack"] = 8] = "FallBack";
        EPA_eStatus[EPA_eStatus["Failed"] = 9] = "Failed";
    })(exports.EPA_eStatus || (exports.EPA_eStatus = {}));
    /**
     * 初始化一个数组，并用cls的对象填满
     * @param cls
     * @param n
     */
    function newArray(cls, n) {
        let ret = new Array(n);
        for (let i = 0; i < n; i++) {
            ret[i] = new cls();
        }
        return ret;
    }
    class EPA {
        constructor() {
            this.m_status = exports.EPA_eStatus.Failed;
            this.m_result = new GJK_sSimlex();
            this.m_normal = new Vec3();
            this.m_depth = 0;
            /** 顶点的缓存 */
            this.m_sv_store = newArray(GJK_sSV, EPA_MAX_VERTICES);
            /** face 的缓存 */
            this.m_fc_store = newArray(EPA_sFace, EPA_MAX_FACES);
            this.m_nextsv = 0;
            this.m_hull = new EPA_sList();
            this.m_stock = new EPA_sList();
            this.Initialize();
        }
        /**
         * 建立两个三角形的邻接关系 fa的第ea个邻面是 fb，fb的第eb个邻面是fa
         * @param fa aface
         * @param ea
         * @param fb bface
         * @param eb
         */
        bind(fa, ea, fb, eb) {
            fa.e[ea] = eb;
            fa.f[ea] = fb;
            fb.e[eb] = ea;
            fb.f[eb] = fa;
        }
        /**
         * 把 face 插入到list的root位置，
         * @param list
         * @param face
         */
        append(list, face) {
            face.link[0] = null;
            face.link[1] = list.root;
            if (list.root)
                list.root.link[0] = face;
            list.root = face;
            ++list.count;
        }
        /**
         * 从list中删除face
         * @param list
         * @param face
         */
        remove(list, face) {
            if (face.link[1])
                face.link[1].link[0] = face.link[0];
            if (face.link[0])
                face.link[0].link[1] = face.link[1];
            if (face == list.root)
                list.root = face.link[1];
            --list.count;
        }
        Initialize() {
            this.m_status = exports.EPA_eStatus.Failed;
            this.m_normal.set(0, 0, 0);
            this.m_depth = 0;
            this.m_nextsv = 0;
            for (let i = 0; i < EPA_MAX_FACES; ++i) {
                this.append(this.m_stock, this.m_fc_store[EPA_MAX_FACES - i - 1]);
            }
        }
        Evaluate(gjk, guess) {
            let m_hull = this.m_hull;
            /** gjk 得到的simplex */
            let simplex = gjk.m_simplex;
            let m_normal = this.m_normal;
            let m_result = this.m_result;
            let m_sv_store = this.m_sv_store;
            let d1 = new Vec3();
            let d2 = new Vec3();
            let d3 = new Vec3();
            let projection = new Vec3();
            if (simplex.rank > 1 && gjk.EncloseOrigin()) { // EncloseOrigin 会把simplex填满 
                /* Clean up				*/
                while (m_hull.root) {
                    let f = m_hull.root;
                    this.remove(m_hull, f);
                    this.append(this.m_stock, f);
                }
                this.m_status = exports.EPA_eStatus.Valid;
                this.m_nextsv = 0;
                /* Orient simplex		*/
                simplex.supv[0].w.vsub(simplex.supv[3].w, d1); // d1=0-3
                simplex.supv[1].w.vsub(simplex.supv[3].w, d2); // d2=1-3
                simplex.supv[2].w.vsub(simplex.supv[3].w, d3); // d3=2-3
                //if (gjk.det(simplex.c[0].w - simplex.c[3].w, simplex.c[1].w - simplex.c[3].w, simplex.c[2].w - simplex.c[3].w) < 0) {
                if (gjk.det(d1, d2, d3) < 0) {
                    let tmp = simplex.supv[0];
                    simplex.supv[0] = simplex.supv[1];
                    simplex.supv[1] = tmp; //swap(simplex.c[0], simplex.c[1]);
                    let tmp1 = simplex.p[0];
                    simplex.p[0] = simplex.p[1];
                    simplex.p[1] = tmp1; // Swap(simplex.p[0], simplex.p[1]);
                }
                /* Build initial hull 初始四面体	*/
                let tetra = [
                    this.newface(simplex.supv[0], simplex.supv[1], simplex.supv[2], true),
                    this.newface(simplex.supv[1], simplex.supv[0], simplex.supv[3], true),
                    this.newface(simplex.supv[2], simplex.supv[1], simplex.supv[3], true),
                    this.newface(simplex.supv[0], simplex.supv[2], simplex.supv[3], true)
                ];
                if (m_hull.count == 4) {
                    let best = this.findbest();
                    let outer = new EPA_sFace();
                    outer.copy(best);
                    let pass = 0;
                    let iterations = 0;
                    // 共有6种相邻关系，3,2,1
                    this.bind(tetra[0], 0, tetra[1], 0);
                    this.bind(tetra[0], 1, tetra[2], 0);
                    this.bind(tetra[0], 2, tetra[3], 0);
                    this.bind(tetra[1], 1, tetra[3], 2);
                    this.bind(tetra[1], 2, tetra[2], 1);
                    this.bind(tetra[2], 2, tetra[3], 1);
                    this.m_status = exports.EPA_eStatus.Valid;
                    // 开始迭代
                    for (; iterations < EPA_MAX_ITERATIONS; ++iterations) {
                        if (this.m_nextsv < EPA_MAX_VERTICES) {
                            let horizon = new EPA_sHorizon();
                            let w = m_sv_store[this.m_nextsv++];
                            let valid = true;
                            best.pass = ++pass;
                            gjk.getsupport(best.n, w);
                            let wdist = best.n.dot(w.w) - best.d;
                            if (wdist > EPA_ACCURACY) {
                                for (let j = 0; (j < 3) && valid; ++j) {
                                    valid = valid && this.expand(pass, w, best.f[j], best.e[j], horizon);
                                }
                                if (valid && (horizon.nf >= 3)) {
                                    this.bind(horizon.cf, 1, horizon.ff, 2);
                                    this.remove(m_hull, best);
                                    this.append(this.m_stock, best);
                                    best = this.findbest();
                                    outer.copy(best);
                                }
                                else {
                                    this.m_status = exports.EPA_eStatus.InvalidHull;
                                    break;
                                }
                            }
                            else {
                                this.m_status = exports.EPA_eStatus.AccuraryReached;
                                break;
                            }
                        }
                        else {
                            this.m_status = exports.EPA_eStatus.OutOfVertices;
                            break;
                        }
                    }
                    outer.n.addScaledVector(outer.d, outer.n, projection); //projection = outer.n * outer.d;
                    m_normal = outer.n;
                    this.m_depth = outer.d;
                    m_result.rank = 3;
                    m_result.supv[0] = outer.vert[0];
                    m_result.supv[1] = outer.vert[1];
                    m_result.supv[2] = outer.vert[2];
                    outer.vert[1].w.vsub(projection, d1);
                    outer.vert[2].w.vsub(projection, d2);
                    d1.cross(d2, d3);
                    m_result.p[0] = d3.length(); //Cross(outer.c[1].w - projection, outer.c[2].w - projection).length();
                    outer.vert[2].w.vsub(projection, d1);
                    outer.vert[0].w.vsub(projection, d2);
                    d1.cross(d2, d3);
                    m_result.p[1] = d3.length(); //Cross(outer.c[2].w - projection, outer.c[0].w - projection).length();
                    outer.vert[0].w.vsub(projection, d1);
                    outer.vert[1].w.vsub(projection, d2);
                    d1.cross(d2, d3);
                    m_result.p[2] = d3.length(); //Cross(outer.c[0].w - projection, outer.c[1].w - projection).length();
                    let sum = m_result.p[0] + m_result.p[1] + m_result.p[2];
                    m_result.p[0] /= sum;
                    m_result.p[1] /= sum;
                    m_result.p[2] /= sum;
                    return this.m_status;
                }
            }
            /* Fallback		*/
            this.m_status = exports.EPA_eStatus.FallBack;
            guess.negate(m_normal);
            let nl = m_normal.length();
            if (nl > 0)
                m_normal.scale(1 / nl, m_normal); //m_normal = m_normal / nl;
            else
                m_normal.set(1, 0, 0);
            this.m_depth = 0;
            this.m_result.rank = 1;
            this.m_result.supv[0] = simplex.supv[0];
            this.m_result.p[0] = 1;
            return this.m_status;
        }
        /**
         * dist 直接放到face.d中了
         * @param face
         * @param a
         * @param b
         * @param dist
         */
        getedgedist(face, a, b) {
            let ba = new Vec3();
            let n_ab = new Vec3();
            b.vsub(a, ba); //ba = b.w-a.w
            ba.cross(face.n, n_ab); //n_ab=baxface.n Outward facing edge normal direction, on triangle plane
            let a_dot_nab = a.dot(n_ab); // Only care about the sign to determine inside/outside, so not normalization required
            if (a_dot_nab < 0) {
                // Outside of edge a.b
                let ba_l2 = ba.lengthSquared();
                let a_dot_ba = a.dot(ba);
                let b_dot_ba = b.dot(ba);
                if (a_dot_ba > 0) {
                    // Pick distance vertex a
                    face.d = a.length();
                }
                else if (b_dot_ba < 0) {
                    // Pick distance vertex b
                    face.d = b.length();
                }
                else {
                    // Pick distance to edge a.b
                    let a_dot_b = a.dot(b);
                    face.d = Math.sqrt(Math.max((a.lengthSquared() * b.lengthSquared() - a_dot_b * a_dot_b) / ba_l2, 0));
                }
                return true;
            }
            return false;
        }
        /**
         * 根据三个点创建多面体的一个面
         * @param a
         * @param b
         * @param c
         * @param forced
         * TODO 如果已知都是简单模型，可以不做一些检测
         */
        newface(a, b, c, forced) {
            let d1 = new Vec3();
            let d2 = new Vec3();
            let m_stock = this.m_stock;
            let m_hull = this.m_hull;
            if (m_stock.root) {
                let face = m_stock.root;
                this.remove(m_stock, face);
                this.append(m_hull, face);
                face.pass = 0;
                face.vert[0] = a;
                face.vert[1] = b;
                face.vert[2] = c;
                b.w.vsub(a.w, d1);
                c.w.vsub(a.w, d2);
                d1.cross(d2, face.n); //face.n = Cross(b.w - a.w, c.w - a.w);
                let l = face.n.length();
                if (l > EPA_ACCURACY) { // 如果确实是三角形
                    // 计算d
                    if (!(this.getedgedist(face, a.w, b.w) ||
                        this.getedgedist(face, b.w, c.w) ||
                        this.getedgedist(face, c.w, a.w))) {
                        // Origin projects to the interior of the triangle
                        // Use distance to triangle plane
                        face.d = a.w.dot(face.n) / l; // a dot n = d  ax+by+cz=d. 用a,b,c应该都可以
                    }
                    face.n.scale(1 / l, face.n); // 法线规格化
                    if (forced || (face.d >= -EPA_PLANE_EPS)) {
                        return face;
                    }
                    else
                        this.m_status = exports.EPA_eStatus.NonConvex;
                }
                else
                    this.m_status = exports.EPA_eStatus.Degenerated; // 失败了，不是三角形
                this.remove(m_hull, face);
                this.append(m_stock, face);
                return null;
            }
            this.m_status = m_stock.root ? exports.EPA_eStatus.OutOfVertices : exports.EPA_eStatus.OutOfFaces;
            return null;
        }
        /**
         * 找一个最接近原点的face
         */
        findbest() {
            let m_hull = this.m_hull;
            let minf = m_hull.root;
            if (minf) {
                let mind = minf.d * minf.d;
                for (let f = minf.link[1]; f; f = f.link[1]) {
                    let sqd = f.d * f.d;
                    if (sqd < mind) { // 直接比较 d*d 即可
                        minf = f;
                        mind = sqd;
                    }
                }
            }
            return minf;
        }
        expand(pass, w, f, e, horizon) {
            let i1m3 = [1, 2, 0];
            let i2m3 = [2, 0, 1];
            if (f.pass != pass) {
                let e1 = i1m3[e];
                if ((f.n.dot(w.w) - f.d) < -EPA_PLANE_EPS) {
                    let nf = this.newface(f.vert[e1], f.vert[e], w, false);
                    if (nf) {
                        this.bind(nf, 0, f, e);
                        if (horizon.cf)
                            this.bind(horizon.cf, 1, nf, 2);
                        else
                            horizon.ff = nf;
                        horizon.cf = nf;
                        ++horizon.nf;
                        return true;
                    }
                }
                else {
                    let e2 = i2m3[e];
                    f.pass = pass;
                    if (this.expand(pass, w, f.f[e1], f.e[e1], horizon) &&
                        this.expand(pass, w, f.f[e2], f.e[e2], horizon)) {
                        this.remove(this.m_hull, f);
                        this.append(this.m_stock, f);
                        return true;
                    }
                }
            }
            return false;
        }
    }

    const GJK_MIN_DISTANCE$1 = 1e-12;
    let sup1 = new Vec3();
    let sup2 = new Vec3();
    let sup_negd = new Vec3();
    let sup_dir1 = new Vec3();
    let sup_dir2 = new Vec3();
    let tmpVec$1 = new Vec3(); //保证在局部范围用的
    let worldA = new Vec3();
    let worldB = new Vec3();
    class MinkowskiDiff {
        constructor() {
        }
        reset(shapeA, shapeB, transA, transB) {
            this.shapeA = shapeA;
            this.shapeB = shapeB;
            this.transA = transA;
            this.transB = transB;
            return this;
            //this.toshape1 = wtrs1.getBasis().transposeTimes(wtrs0.getBasis());	TODO
            //this.toshape0 = wtrs0.inverseTimes(wtrs1);
        }
        //btVector3 (btConvexShape::*Ls)(btVector3&) const;
        EnableMargin(b) {
        }
        /**
         * 沿着d方向采样shapeA
         * @param d A的本地空间
         */
        Support0(d, out = new Vec3()) {
            this.shapeA.getSupportVertex(d, out);
            return out;
        }
        /**
         * 沿着d方向采样shapeB
         * @param d
         */
        Support1(d, out = new Vec3()) {
            //return (m_toshape0 * ((m_shapes[1])->*(Ls))(m_toshape1 * d));
            throw '';
        }
        /**
         * 沿着d方向采样
         * @param d
         * @TODO 空间转换部分要优化
         */
        Support(d, noMargin, out = new Vec3()) {
            /*
            this.Support0(d,sup1);
            d.negate(sup_negd);
            this.Support1(sup_negd,sup2);
            sup1.vsub(sup2,out);
            return out;
            */
            let transA = this.transA;
            let transB = this.transB;
            let A = this.shapeA;
            let B = this.shapeB;
            //先把dir转换到本地空间
            let dirA = sup_dir1;
            let dirB = sup_dir2;
            let negDir = new Vec3();
            negDir.copy(d).negate(negDir);
            // 把dir转换到本地空间		
            let qA = transA.quaternion;
            qA.w *= -1;
            qA.vmult(d, dirA);
            qA.w *= -1;
            let qB = transB.quaternion;
            qB.w *= -1;
            qB.vmult(negDir, dirB);
            qB.w *= -1;
            let supA = sup1;
            let supB = sup2;
            if (noMargin) {
                A.getSupportVertexWithoutMargin(dirA, supA);
                B.getSupportVertexWithoutMargin(dirB, supB);
            }
            else {
                A.getSupportVertex(dirA, supA);
                B.getSupportVertex(dirB, supB); //问题：例如盒子，得到的support会不会抖动，例如不转的时候，轴向采样的话四个点都可以
            }
            // 转换到世界空间
            transA.pointToWorld(supA, worldA);
            transB.pointToWorld(supB, worldB);
            worldA.vsub(worldB, out); //A-B 就是 B指向A		
            return out;
        }
    }
    (function (Result_Status) {
        Result_Status[Result_Status["Separated"] = 0] = "Separated";
        Result_Status[Result_Status["Penetrating"] = 1] = "Penetrating";
        Result_Status[Result_Status["GJK_Failed"] = 2] = "GJK_Failed";
        Result_Status[Result_Status["EPA_Failed"] = 3] = "EPA_Failed"; /* EPA phase fail, bigger problem, need to save parameters, and debug	*/
    })(exports.Result_Status || (exports.Result_Status = {}));
    class sResults {
        constructor() {
            this.witnessA = new Vec3(); //A上的碰撞点
            this.witnessB = new Vec3(); //B上的碰撞点
            this.normal = new Vec3(); //碰撞法线
            this.distance = 0;
        }
        reset() {
            this.witnessA.set(0, 0, 0);
            this.witnessB.set(0, 0, 0);
            this.status = exports.Result_Status.Separated;
        }
    }
    ;
    var negVec = new Vec3();
    var tmpV1 = new Vec3();
    function Distance(shape0, wtrs0, shape1, wtrs1, guess, results) {
        let shape = new MinkowskiDiff();
        shape.reset(shape0, shape1, wtrs0, wtrs1).EnableMargin(false);
        results.reset();
        let gjk = new GJK();
        let gjk_status = gjk.Evaluate(shape, guess);
        if (gjk_status == 0 /* Valid */) {
            let w0 = new Vec3();
            let w1 = new Vec3();
            for (let i = 0; i < gjk.m_simplex.rank; ++i) {
                let p = gjk.m_simplex.p[i];
                let cd = gjk.m_simplex.supv[i].d;
                let sup = shape.Support0(cd);
                w0.addScaledVector(p, sup, w0); //w0 += shape.Support(cd, 0) * p;
                cd.negate(negVec);
                sup = shape.Support1(negVec);
                w1.addScaledVector(p, sup, w1); //w1 += shape.Support(-cd, 1) * p;
            }
            //results.witnesses[0] = wtrs0 * w0;
            wtrs0.pointToWorld(w0, results.witnessA);
            //results.witnesses[1] = wtrs0 * w1;
            wtrs0.pointToWorld(w1, results.witnessB);
            w0.vsub(w1, results.normal); //results.normal = w0 - w1;
            results.distance = results.normal.length();
            let s = results.distance > GJK_MIN_DISTANCE$1 ? results.distance : 1;
            results.normal.scale(1 / s, results.normal);
            return true;
        }
        else {
            results.status = gjk_status == 1 /* Inside */ ? exports.Result_Status.Penetrating : exports.Result_Status.GJK_Failed;
            return false;
        }
    }
    let minkShape = new MinkowskiDiff();
    /**
     * 计算shape0和shape1之间的碰撞深度。
     * @param shape0
     * @param wtrs0 	转换到实际空间的transfrom
     * @param shape1
     * @param wtrs1
     * @param guess
     * @param results 	输出结果
     * @param usemargins  是否使用shape的margin
     * @return false 没有检测到碰撞
     */
    function Penetration(shape0, wtrs0, shape1, wtrs1, guess, results, usemargins = true) {
        let shape = minkShape;
        shape.reset(shape0, shape1, wtrs0, wtrs1).EnableMargin(usemargins);
        results.reset();
        let gjk = new GJK();
        let gjk_status = gjk.Evaluate(shape, guess.negate(negVec));
        switch (gjk_status) {
            case 1 /* Inside */: // GJK 判断发生了碰撞，下面开始用EPA计算距离
                {
                    let epa = new EPA();
                    let epa_status = epa.Evaluate(gjk, negVec); // -guess
                    if (epa_status != exports.EPA_eStatus.Failed) {
                        // EPA正常
                        let w0 = new Vec3();
                        //根据重心坐标计算出最近的点
                        for (let i = 0; i < epa.m_result.rank; ++i) {
                            let sup = shape.Support0(epa.m_result.supv[i].d); // 根据结果中保存的朝向采样shape0
                            //w0 += shape.Support(epa.m_result.c[i] . d, 0) * epa.m_result.p[i];
                            w0.addScaledVector(epa.m_result.p[i], sup, w0);
                        }
                        results.status = exports.Result_Status.Penetrating;
                        // 把结果转换到世界空间
                        //results.witnesses[0] = wtrs0 * w0;
                        wtrs0.pointToWorld(w0, results.witnessA);
                        w0.addScaledVector(-epa.m_depth, epa.m_normal, tmpV1); //tmpV1 = (w0 - epa.m_normal * epa.m_depth)
                        //results.witnesses[1] = wtrs0 * tmpV1;
                        wtrs0.pointToWorld(tmpV1, results.witnessB);
                        epa.m_normal.negate(results.normal); //results.normal = -epa.m_normal;
                        results.distance = -epa.m_depth;
                        return true;
                    }
                    else
                        results.status = exports.Result_Status.EPA_Failed;
                }
                break;
            case 2 /* Failed */:
                results.status = exports.Result_Status.GJK_Failed;
                break;
            default:
                break;
        }
        return false;
    }

    const PHYEPSILON = 1e-10; //
    const PHYEPS2 = PHYEPSILON ** 2;
    class SupportVector {
        constructor(a_b, a, b) {
            this.v = new Vec3(); // minkowski sum
            this.v1 = new Vec3(); //obj1 世界空间
            this.v2 = new Vec3(); //obj2 世界空间
            a_b && (this.v = a_b);
            a && (this.v1 = a);
            b && (this.v2 = b);
        }
    }
    var PHYEPS = 1e-6;
    var NPHYEPS = -1e-6;
    function nearZeroF(v) {
        return v > NPHYEPS && v < PHYEPS;
    }
    var ORIGIN$1 = new Vec3(0, 0, 0);
    class Simplex {
        constructor() {
            this.supportVertex = [new SupportVector(), new SupportVector(), new SupportVector(), new SupportVector()];
            this.lastAddIdx = -1; // 最后一个添加的位置
        }
        reset() {
            this.lastAddIdx = -1;
        }
        // 以copy的方法添加
        addCopy(s) {
            this.setCopy(++this.lastAddIdx, s);
        }
        setCopy(idx, s) {
            let c = this.supportVertex[idx];
            let v = s.v;
            let v1 = s.v1;
            let v2 = s.v2;
            c.v.set(v.x, v.y, v.z);
            c.v1.set(v1.x, v1.y, v1.z);
            c.v2.set(v2.x, v2.y, v2.z);
        }
        simplexSize() {
            return this.lastAddIdx + 1;
        }
        /**
         *
         * @param dir  注意dir会被修改，以便算法继续
         * @return -1 没有相交， 0 需要继续   1 碰撞了
         */
        doSimplex(dir) {
            let simplexSize = this.simplexSize();
            if (simplexSize == 2) {
                //simplex只是一个线段
                return this.doSimplex2(dir);
            }
            else if (simplexSize == 3) {
                //simplex是一个三角形
                return this.doSimplex3(dir);
            }
            else {
                //simpsize=4
                //simplex是一个四面体。 只有四面体能包含原点，其他的都是on而不是in
                return this.doSimplex4(dir);
            }
        }
        /**
         * 判断原点是不是在线段上。根据原点的位置更新simplex，并计算新的dir
         * @param dir
         */
        doSimplex2(dir) {
            let supVert = this.supportVertex;
            // A是上一次添加的
            let A = supVert[this.lastAddIdx];
            // 另外一个
            let B = supVert[0];
            let AB = new Vec3();
            B.v.vsub(A.v, AB);
            let AO = new Vec3();
            AO.copy(A.v);
            AO.negate(AO); //AO = -A.v。 AO是从A指向原点
            let dot = AO.dot(AB);
            let tmp = new Vec3();
            AB.cross(AO, tmp);
            if (nearZeroF(tmp.dot(tmp)) && dot > 0) {
                //原点在线段上。AO，AB共线，且AO，AB同向（O在AB中间）
                return 1;
            }
            // 原点不在线段上，确定在线段的哪一侧，作为新的方向
            if (dot < PHYEPS) {
                // <0 表示当前的方向（AB）不对，o在AB的反向，从最后加的点重新算，方向变成AO
                this.setCopy(0, A);
                this.lastAddIdx = 1;
                dir.copy(AO);
            }
            else {
                // 方向要垂直于AB
                AB.cross(AO, dir).cross(AO, dir); //dir = ABxAOxAB
            }
            return 0;
        }
        doSimplex3(dir) {
            //TODO new 
            let AO = new Vec3();
            let AB = new Vec3();
            let AC = new Vec3();
            let ABC = new Vec3();
            let tmp = new Vec3();
            let supVert = this.supportVertex;
            // A是上一次添加的
            let A = supVert[this.lastAddIdx];
            // 另外两个
            let B = supVert[1];
            let C = supVert[0];
            let dist = this.ptTriDist2(ORIGIN$1, A.v, B.v, C.v);
            if (nearZeroF(dist)) {
                // 原点在三角形上，相交了
                return 1;
            }
            if (A.v.almostEquals(B.v) || A.v.almostEquals(C.v)) {
                // 够不成三角形，没有碰到
                return -1;
            }
            AO.copy(A.v).negate(); //AO = -A.v
            B.v.vsub(A.v, AB);
            C.v.vsub(A.v, AC);
            AB.cross(AC, ABC); // ABC = ABxAC
            ABC.cross(AC, tmp); // tmp = ABCxAC = ABXACXAC
            // 判断原点在三角形的哪一面
            let dot = tmp.dot(AO); // 假设tmp是上方
            if (dot >= 0) {
                // 在三角形上方
                dot = AC.dot(AO);
                if (dot >= 0) {
                    //原点在 AC方向。C是合适的
                    this.setCopy(1, A);
                    this.lastAddIdx = 2;
                    AC.cross(AO, dir).cross(AC, dir); //dir=ACxAOxAC
                }
                else {
                    //原点在 AC反方向
                    dot = AB.dot(AO);
                    if (dot >= 0) {
                        this.setCopy(0, B);
                        this.setCopy(1, A);
                        this.lastAddIdx = 2;
                        AB.cross(AO, dir).cross(AB, dir); //dir=ABxAOxAB
                    }
                    else {
                        this.setCopy(0, A);
                        this.lastAddIdx = 1; // 0=A, 1=B
                        dir.copy(AO);
                    }
                }
            }
            else {
                // 在三角形下方
                AB.cross(ABC, tmp);
                dot = tmp.dot(AO);
                if (dot >= 0) {
                    dot = AB.dot(AO);
                    if (dot >= 0) {
                        this.setCopy(0, B);
                        this.setCopy(1, A);
                        this.lastAddIdx = 2;
                        AB.cross(AO, dir).cross(AB, dir); //dir = ABxAOxAB
                    }
                    else {
                        // 退成线段
                        this.setCopy(0, A);
                        this.lastAddIdx = 1;
                        dir.copy(AO);
                    }
                }
                else {
                    dot = ABC.dot(AO);
                    if (dot >= 0) {
                        dir.copy(ABC); // dir = ABC
                    }
                    else {
                        // 交换 [0],[1]
                        let tmp = supVert[0];
                        supVert[0] = supVert[1];
                        supVert[1] = tmp;
                        dir.copy(ABC).negate(); // dir = -ABC
                    }
                }
            }
            return 0;
        }
        doSimplex4(dir) {
            let supVerts = this.supportVertex;
            let A = supVerts[this.lastAddIdx];
            let B = supVerts[2];
            let C = supVerts[1];
            let D = supVerts[0];
            // 检查四面体是否有效,最后加的点如果在三角形上就不行
            let dist = this.ptTriDist2(A.v, B.v, C.v, D.v);
            if (nearZeroF(dist)) {
                return -1; // 新加的点没有扩展成体，还在三角面上，这种情况表示没有碰撞
            }
            // 检查四个面，原点是否在这四个面上，是的话，表示碰撞了
            dist = this.ptTriDist2(ORIGIN$1, A.v, B.v, C.v);
            if (nearZeroF(dist))
                return 1;
            dist = this.ptTriDist2(ORIGIN$1, A.v, C.v, D.v);
            if (nearZeroF(dist))
                return 1;
            dist = this.ptTriDist2(ORIGIN$1, A.v, B.v, D.v);
            if (nearZeroF(dist))
                return 1;
            dist = this.ptTriDist2(ORIGIN$1, B.v, C.v, D.v);
            if (nearZeroF(dist))
                return 1;
            let AO = new Vec3();
            let AB = new Vec3();
            let AC = new Vec3();
            let AD = new Vec3();
            let ABC = new Vec3();
            let ACD = new Vec3();
            let ADB = new Vec3();
            AO.copy(A.v).negate(); // AO = -A.v
            B.v.vsub(A.v, AB); //AB=B-A
            C.v.vsub(A.v, AC); //AC=C-A
            D.v.vsub(A.v, AD); //AD=D-A
            AB.cross(AC, ABC); // ABC平面的法线
            AC.cross(AD, ACD); // ACD平面的法线
            AD.cross(AB, ADB); // ADB平面的法线
            throw 'NI';
        }
        /**
         * 点到线段的距离的平方。
         * @param P
         * @param v0
         * @param v1
         * @param witness 见证点。最近的点
         */
        PointSegmentDist2(P, v0, v1, witness = null) {
            // The computation comes from solving equation of segment:
            //      S(t) = V0 + t.d
            //          where - V0 is initial point of segment
            //                - d is direction of segment from x0 (|d| > 0)
            //                - t belongs to <0, 1> interval
            //
            // Than, distance from a segment to some point P can be expressed:
            //      D(t) = |V0 + t.d - P|^2
            //          which is distance from any point on segment. Minimization
            //          of this function brings distance from P to segment.
            // Minimization of D(t) leads to simple quadratic equation that's
            // solving is straightforward.
            //
            // Bonus of this method is witness point for free.
            let t;
            let d = new Vec3(), a = new Vec3();
            let d1 = new Vec3();
            // direction of segment
            v1.vsub(v0, d);
            // precompute vector from P to x0
            v0.vsub(P, a); // PX0=x0-P
            t = -a.dot(d);
            t /= d.dot(d);
            if (t <= 0) { // 按照起点计算
                v0.vsub(P, d1);
            }
            else if (t > 1) { // 按照终点计算
                v1.vsub(P, d1);
            }
            else {
                // 最近点在中间
                a.addScaledVector(t, d, d1); // a+d*t = v0+a+d*t -v0
            }
            return d1.dot(d1);
        }
        /**
         * 点到三角形的距离的平方
         * @param pt
         * @param v0
         * @param v1
         * @param v2
         */
        ptTriDist2(pt, v0, v1, v2) {
            let d1 = new Vec3();
            let d2 = new Vec3();
            let a = new Vec3();
            v1.vsub(v0, d1); // v0v1
            v2.vsub(v0, d2); // v0v2
            v0.vsub(pt, a); // ptv0
            let dist = 0, dist2 = 0; // 初始值应该是多少
            let u = a.dot(a);
            let v = d1.dot(d1);
            let w = d2.dot(d2);
            let p = a.dot(d1);
            let q = a.dot(d2);
            let r = d1.dot(d2);
            // T(s,t) = v0 + s*d1+t*d2
            // 计算出s,t以后，就能得到出T，T是pt在三角形平面上的投影，||pt-T||就是距离
            let s = (q * r - w * p) / (w * v - r * r);
            let t = (-s * r - q) / w;
            if ((s >= 0) && (s <= 1) && (t >= 0) && (t <= 1) && (t + s <= 1)) {
                // 如果落在在三角形内
                dist = s * s * v;
                dist += t * t * w;
                dist += 2 * s * t * r;
                dist += 2 * s * p;
                dist += 2 * t * q;
                dist += u;
            }
            else {
                // 跟三个边求距离，取最小的。
                dist = this.PointSegmentDist2(pt, v0, v1, null);
                dist2 = this.PointSegmentDist2(pt, v0, v1, null);
                if (dist2 < dist) {
                    dist = dist2;
                }
                dist2 = this.PointSegmentDist2(pt, v1, v2, null);
                if (dist2 < dist) {
                    dist = dist2;
                }
            }
            return dist;
        }
    }
    var calcdepth_v1 = new Vec3();
    let guessVectors = [
        new Vec3(),
        new Vec3(),
        new Vec3(0, 0, 1),
        new Vec3(0, 1, 0),
        new Vec3(1, 0, 0),
        new Vec3(1, 1, 0),
        new Vec3(1, 1, 1),
        new Vec3(0, 1, 1),
        new Vec3(1, 0, 1),
    ];
    var calcPenDepth_results = new sResults();
    /**
     * 用EPA算法找到碰撞深度
     */
    class GjkEpaPenetrationDepthSolver {
        calcPenDepth(simplexSolver, pConvexA, pConvexB, transformA, transformB, v, wWitnessOnA, wWitnessOnB) {
            let o1 = transformA.position;
            let o2 = transformB.position;
            let d1 = calcdepth_v1;
            o1.vsub(o2, d1);
            d1.normalize(); //BA矢量
            let guessVecs = guessVectors;
            guessVecs[0].set(-d1.x, -d1.y, -d1.z); //o2-o1
            guessVecs[1].set(d1.x, d1.y, d1.z); //o1-o2
            let numVectors = guessVecs.length;
            let results = calcPenDepth_results;
            //各个方向来一次
            for (let i = 0; i < numVectors; i++) {
                simplexSolver.reset();
                let guessVector = guessVecs[i];
                if (Penetration(pConvexA, transformA, pConvexB, transformB, guessVector, results)) {
                    wWitnessOnA.copy(results.witnessA);
                    wWitnessOnB.copy(results.witnessB);
                    v.copy(results.normal);
                    return true;
                }
                else {
                    return false; // 并不想要计算距离。下面的代码还没验证
                    if (Distance(pConvexA, transformA, pConvexB, transformB, guessVector, results)) {
                        wWitnessOnA.copy(results.witnessA);
                        wWitnessOnB.copy(results.witnessB);
                        v.copy(results.normal);
                        return false;
                    }
                }
            }
            //failed to find a distance/penetration 算法失败了
            wWitnessOnA.set(0, 0, 0);
            wWitnessOnB.set(0, 0, 0);
            v.set(0, 0, 0);
            return false;
        }
    }
    var tmpVec1$3 = new Vec3();
    var tmpVec2$3 = new Vec3();
    var _computeSupport_Vec1 = new Vec3();
    var _computeSupport_Vec2 = new Vec3();
    var _computeSupport_Vec3 = new Vec3();
    var _computeSupport_Vec4 = new Vec3();
    class GJKPairDetector {
        constructor() {
            this.simplexSolver = new VoronoiSimplexSolver();
            this.penetrationDepthSolver = new GjkEpaPenetrationDepthSolver();
            this.marginA = 0;
            this.marginB = 0;
        }
        /**
         * 计算A和B的最近点
         * @param transA
         * @param transB
         */
        getClosestPoint1(transA, transB) {
            // 把transform改成相对于两个对象中心的
            let cen = tmpVec1$3;
            let oldTransA = transA.position;
            let oldTransB = transB.position;
            transA.position = new Vec3(); // 记得后面要恢复
            transB.position = new Vec3();
            transA.position.vadd(transB.position, cen).scale(0.5, cen);
            oldTransA.vsub(cen, transA.position); // tranA.postion -= center;
            oldTransB.vsub(cen, transB.position);
            let maxIt = 1000;
            let curIt = 0;
            let sepAxis = tmpVec2$3;
            sepAxis.set(0, 1, 0);
            let margin = 0;
            let simp1 = new Simplex();
            let dir = new Vec3(1, 0, 0); // 先随便假设一个方向。如果不对的话，以后会修改
            let worldA = new Vec3();
            let worldB = new Vec3();
            let AminB = new Vec3();
            this.computeSupport(transA, transB, dir, worldA, worldB, AminB, false);
            let last = new SupportVector(AminB, worldA, worldB);
            simp1.addCopy(last);
            AminB.negate(dir); // dir = -AminB
            let status = -2;
            for (let i = 0; i < maxIt; i++) {
                this.computeSupport(transA, transB, dir, worldA, worldB, AminB, false); //TODO 这个能简化一下么，里面空间转换太多
                let delta = AminB.dot(dir);
                if (delta < 0) {
                    // 当前检测方向，与当前支撑点，在原点的同一侧。例如w在原点的左侧，却对应超右的支撑方向，即w已经在最右边了，依然在左侧，则没有碰撞
                    status = -1;
                    break;
                }
                // 继续添加单体
                last.v = AminB;
                last.v1 = worldA;
                last.v2 = worldB;
                simp1.addCopy(last);
                //let newDir = new Vec3();
                let r = simp1.doSimplex(dir);
                if (r == 1) {
                    // 确定碰撞了
                    status = 0;
                    break;
                }
                else if (r == -1) {
                    // 确定没有碰撞
                    status = -1;
                    break;
                }
                if (nearZeroF(dir.dot(dir))) {
                    // 没有碰撞
                    status = -1;
                    break;
                }
                if (dir.almostZero()) {
                    status = -1;
                    break;
                }
            }
            //simplexSolver.reset()
            // 另外一种方法
            /** 碰撞点的B上的法线 */
            let normalInB = new Vec3(0, 0, 0);
            let squaredDistance = 1e20;
            let checkSimplex = false;
            let degenerateSimplex = 0;
            let REL_ERROR2 = 1e-12;
            let simpSolver = this.simplexSolver;
            while (true) {
                this.computeSupport(transA, transB, sepAxis, worldA, worldB, AminB, true); //TODO dir谁取反的问题
                let delta = sepAxis.dot(AminB);
                if (delta <= 0) { // =? 如果沿着dir方向取A,沿着反向取B，但是dot却<0表示两个对象是分离的
                    // 即找到了一个dir方向能把对象分离
                    checkSimplex = true;
                    degenerateSimplex = 10;
                    break;
                }
                // 新得到的点已经在smplex中了，表示无法更接近了
                if (simpSolver.inSimplex(AminB)) {
                    degenerateSimplex = 1;
                    checkSimplex = true;
                    break;
                }
                // 再近一点
                let f0 = squaredDistance - delta;
                let f1 = squaredDistance * REL_ERROR2;
                if (f0 <= f1) {
                    // 如果dist已经很小了
                    if (f0 <= 0) {
                        degenerateSimplex = 2;
                    }
                    else {
                        degenerateSimplex = 11;
                    }
                    checkSimplex = true;
                    break;
                }
                simpSolver.addVertex(AminB, worldA, worldB);
                let newSepAx = new Vec3();
                if (!simpSolver.closest(newSepAx)) {
                    // 如果找不到更近的点
                    degenerateSimplex = 3;
                    checkSimplex = true;
                    break;
                }
                if (newSepAx.lengthSquared() < REL_ERROR2) {
                    sepAxis.copy(newSepAx); //TODO 是不是可以用同一个对象
                    degenerateSimplex = 6;
                    checkSimplex = true;
                    break;
                }
                let previousSquaredDistance = squaredDistance;
                squaredDistance = newSepAx.lengthSquared();
                if (previousSquaredDistance <= squaredDistance) {
                    //新的分离轴没有更靠近？
                    checkSimplex = true;
                    degenerateSimplex = 12;
                    break;
                }
                sepAxis.copy(newSepAx);
                let check = !simpSolver.fullSimplex();
                if (!check) { //if full
                    degenerateSimplex = 13;
                    break;
                }
                let pointOnA = new Vec3();
                let pointOnB = new Vec3();
                if (checkSimplex) {
                    simpSolver.compute_points(pointOnA, pointOnB);
                }
            }
            // 恢复transform
            transA.position = oldTransB;
            transB.position = oldTransB;
        }
        /**
         * 计算A和B的最近点
         * @param transA
         * @param transB
         * @param hitNorm 把A推开的法线，即B身上的，朝向A的。
         * @return 碰撞深度， <0表示没有碰撞，
         */
        getClosestPoint(transA, transB, hitA, hitB, hitNorm, justtest) {
            //performance.clearMarks('getcloseptstart');
            //performance.clearMarks('getcloseptend');
            //performance.clearMeasures('getClosePoint');
            //performance.mark('getcloseptstart');
            //DEBUG
            //let phyr = PhyRender.inst;
            let phyr = window.phyr;
            let showit = window.dbgit;
            //DEBUG
            // 把transform改成相对于两个对象中心的
            let cen = tmpVec1$3;
            /* 先不做这个，直接用世界坐标
            let oldTransA = transA.position;
            let oldTransB = transB.position;
            transA.position = new Vec3();		// 记得后面要恢复
            transB.position = new Vec3();
            oldTransA.vadd(oldTransB, cen).scale(0.5, cen);
            oldTransA.vsub(cen, transA.position);	// tranA.postion -= center;
            oldTransB.vsub(cen, transB.position);
            */
            let sepAxis = tmpVec2$3;
            sepAxis.set(0, 1, 0);
            let margin = this.shapeA.margin + this.shapeB.margin;
            let distance = 0;
            let isValid = false; // sepAxis 有效
            let worldA = new Vec3();
            let worldB = new Vec3();
            let AminB = new Vec3();
            let normSep = new Vec3(); //规格化之后的测试轴
            let simpSolver = this.simplexSolver;
            simpSolver.reset();
            /** 碰撞点的B上的法线 */
            let normalInB = new Vec3(0, 0, 0);
            /** 分离轴的长度平方 */
            let squaredDistance = 1e20;
            let checkSimplex = false;
            let degenerateSimplex = 0;
            let collision = false;
            const REL_ERROR2 = 1e-12;
            let itNum = 0;
            while (true) {
                let showdbg = showit == itNum; //debug
                itNum++;
                let sepLen = sepAxis.length();
                sepAxis.scale(1 / sepLen, normSep); //TODO 这个是不是在computeSupport函数内部做更好
                this.computeSupport(transA, transB, normSep, worldA, worldB, AminB, true); //TODO dir谁取反的问题
                //DEBUG
                if (showdbg) {
                    phyr.addPoint(worldA.x + cen.x, worldA.y + cen.y, worldA.z + cen.z, 0x77);
                    phyr.addPoint(worldB.x + cen.x, worldB.y + cen.y, worldB.z + cen.z, 0xff);
                    phyr.addPoint(AminB.x, AminB.y, AminB.z, 0xff0000);
                    phyr.addVec(0, 0, 0, sepAxis.x, sepAxis.y, sepAxis.z, 0xff00);
                }
                //DEBUG
                /** 新的采样点在采样方向上的投影。即采样点-原点 在采样方向的投影 */
                let delta = normSep.dot(AminB);
                if (delta < -margin) { // 如果沿着dir方向取A,沿着反向取B，但是dot却<0表示两个对象是分离的
                    // 沿着采样方向采样minkow形，结果点在后面，则原点一定不在minkow形内
                    // 相当于找到了一个dir方向能把对象分离
                    // 由于采样的是没有margin的，因此要把marin考虑在内
                    // 注意不能=，因为=算碰撞
                    checkSimplex = true;
                    degenerateSimplex = 10;
                    collision = false;
                    break;
                }
                // 新得到的点已经在smplex中了，表示无法更接近了
                if (simpSolver.inSimplex(AminB)) {
                    degenerateSimplex = 1;
                    checkSimplex = true;
                    collision = true;
                    break;
                }
                // 判断投影长度delta是不是超过了采样射线，超过了表示原点在里面
                // 投影长度约等于delta，表示原点就在采样起点上
                // 投影长度比采样向量大，由于原点一定在采样向量前面，投影长度大的话，说明采样点一定跨越了原点
                /*
                let f0 = squaredDistance - delta;// + margin;
                let f1 = squaredDistance * REL_ERROR2;
                if (f0 <= f1) {
                    if (f0 <= 0) {
                        degenerateSimplex = 2;
                    } else {
                        degenerateSimplex = 11;
                    }
                    checkSimplex = true;
                    collision=true;
                    break;
                }
                */
                simpSolver.addVertex(AminB, worldA, worldB);
                let newSepAx = new Vec3();
                if (!simpSolver.closest(newSepAx)) {
                    // 如果找不到更近的点
                    degenerateSimplex = 3;
                    checkSimplex = true;
                    collision = true;
                    break;
                }
                let newSepLen2 = newSepAx.lengthSquared();
                if (newSepLen2 < REL_ERROR2) {
                    // 如果分离轴已经很短了。表示最近点已经是原点了，原点在simplex上
                    // 这种情况下，无法确定碰撞方向
                    sepAxis.copy(newSepAx); //TODO 是不是可以用同一个对象
                    degenerateSimplex = 6;
                    checkSimplex = true;
                    collision = true;
                    break;
                }
                let previousSquaredDistance = squaredDistance;
                squaredDistance = newSepLen2; // newSepAx.lengthSquared();
                if (previousSquaredDistance - squaredDistance <= previousSquaredDistance * 1e-10) {
                    // 即 previousSquaredDistance<=squaredDistance 只是误差与previousSquaredDistance大小有关，避免都用相同误差
                    //新的分离轴没有更靠近？
                    checkSimplex = true;
                    degenerateSimplex = 12;
                    collision = true;
                    break;
                }
                sepAxis.copy(newSepAx);
                let check = !simpSolver.fullSimplex();
                if (!check) { //if full
                    degenerateSimplex = 13;
                    break;
                }
            }
            //console.log('itnum=',itNum);
            if (!collision) {
                return -1;
            }
            if (justtest)
                return 1;
            let pointOnA = new Vec3();
            let pointOnB = new Vec3();
            if (checkSimplex) {
                // 计算或者copy上次朝向采样的两个点（可能是计算的点，不一定在边界？）
                simpSolver.compute_points(pointOnA, pointOnB);
                // 由于采样方向是-AminB 所以是指向B，所以下面取反
                sepAxis.negate(normalInB);
                //normalInB.copy(sepAxis);
                let lenSqr = sepAxis.lengthSquared();
                if (lenSqr < 1e-12) {
                    degenerateSimplex = 5; //dir无效
                }
                else {
                    let len = Math.sqrt(lenSqr);
                    let rlen = 1 / len;
                    normalInB.scale(rlen, normalInB); //规格化一下
                    //let s = Math.sqrt(squaredDistance);	//TODO 是不是重复了
                    // pointOnA.addScaledVector(margin, normalInB, pointOnA); 	TODO 谁加谁减
                    // pointOnB.addScaledVector(-margin, normalInB, pointOnB);
                    distance = len - margin;
                    isValid = true;
                }
            }
            let catchDegeneratePenetrationCase = distance + margin < 1e-13;
            if (!isValid || catchDegeneratePenetrationCase) {
                // 如果上面没有检测到，或者太深，GJK无法计算深度，只能用复杂的EPA解决
                if (this.penetrationDepthSolver) {
                    let tmpPointOnA = new Vec3();
                    let tmpPointOnB = new Vec3();
                    sepAxis.set(0, 0, 0);
                    let isValid2 = this.penetrationDepthSolver.calcPenDepth(this.simplexSolver, this.shapeA, this.shapeB, transA, transB, sepAxis, tmpPointOnA, tmpPointOnB);
                    let sepLen = sepAxis.lengthSquared();
                    if (sepLen > 0) {
                        if (isValid2) {
                            let tmpNormalInB = new Vec3();
                            tmpPointOnB.vsub(tmpPointOnA, tmpNormalInB);
                            let lenSqr = tmpNormalInB.lengthSquared();
                            if (lenSqr <= PHYEPS2) {
                                //==0
                                tmpNormalInB.copy(sepAxis);
                                lenSqr = sepLen;
                            }
                            else {
                                //>0
                                tmpNormalInB.scale(1 / Math.sqrt(lenSqr)); //normalize
                                let d = new Vec3();
                                tmpPointOnA.vsub(tmpPointOnB, d);
                                let l = -d.length(); // 深度是负的
                                if (!isValid || l < distance) {
                                    // 深度取更深的。
                                    // 如果gjk没有检测到，或者epa检测的深度更大。
                                    //TODO add contact
                                    isValid = true;
                                }
                            }
                        }
                        else {
                            //都这样了，EPA还是没有检测到碰撞的情况
                        }
                    }
                }
            }
            //if(isValid && (distance<0||distance*distance<maxDistSquared))
            if (isValid) { //&& distance < 0) { TODO distanc合理性检查
                // 确定碰撞了，处理碰撞
                sepAxis.normalize();
                sepAxis.negate(hitNorm);
                //hitNorm.copy(sepAxis);
                // 具体的碰撞点要把margin加上
                pointOnA.addScaledVector(this.shapeA.margin, sepAxis, hitA); // hitA = pointOnA - margin*norm
                hitA.vadd(cen, hitA); //TODO 这个cen能去掉么，不知道有什么好处
                //hitA.copy(pointOnA);
                //hitB.copy(pointOnB);
                pointOnB.addScaledVector(this.shapeB.margin, hitNorm, hitB); //hitB = pointOnB+margin*norm
                hitB.vadd(cen, hitB);
            }
            // 恢复transform
            // 先不做这个，直接用世界坐标
            //transA.position = oldTransB;
            //transB.position = oldTransB;
            //DEBUG
            //return -1;
            //performance.mark('getcloseptend');
            //performance.measure('getClosePoint','getcloseptstart','getcloseptend');
            return -distance;
        }
        /**
         * 获得A，B的support点，以及A-B
         * @param transA
         * @param transB
         * @param dir
         * @param worldA
         * @param worldB
         * @param aMinB
         */
        computeSupport(transA, transB, dir, worldA, worldB, aMinB, noMargin) {
            let A = this.shapeA;
            let B = this.shapeB;
            //先把dir转换到本地空间
            let dirA = _computeSupport_Vec1;
            let dirB = _computeSupport_Vec2;
            let negDir = new Vec3();
            negDir.copy(dir).negate(negDir);
            // 把dir转换到本地空间		
            let qA = transA.quaternion;
            qA.w *= -1;
            qA.vmult(dir, dirA);
            qA.w *= -1;
            let qB = transB.quaternion;
            qB.w *= -1;
            qB.vmult(negDir, dirB);
            qB.w *= -1;
            let supA = _computeSupport_Vec3;
            let supB = _computeSupport_Vec4;
            if (noMargin) {
                A.getSupportVertexWithoutMargin(dirA, supA);
                B.getSupportVertexWithoutMargin(dirB, supB);
            }
            else {
                A.getSupportVertex(dirA, supA);
                B.getSupportVertex(dirB, supB); //问题：例如盒子，得到的support会不会抖动，例如不转的时候，轴向采样的话四个点都可以
            }
            // 转换到世界空间
            transA.pointToWorld(supA, worldA);
            transB.pointToWorld(supB, worldB);
            worldA.vsub(worldB, aMinB); //A-B 就是 B指向A
        }
        simplexAdd() {
        }
    }

    var tmpVec1$4 = new Vec3();
    var tmpVec2$4 = new Vec3();
    var tmpVec3$1 = new Vec3();
    var tmpQ = new Quaternion();
    /**
     * A line in 3D space that intersects bodies and return points.
     */
    class Ray {
        constructor(from, to) {
            this.from = new Vec3();
            this.to = new Vec3();
            this._direction = new Vec3();
            /**
             * The precision of the ray. Used when checking parallelity etc.
             */
            this.precision = 0.0001;
            /**
             * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
             */
            this.checkCollisionResponse = true;
            /**
             * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
             */
            this.skipBackfaces = false;
            this.collisionFilterMask = -1;
            this.collisionFilterGroup = -1;
            /**
             * The intersection mode. Should be Ray.ANY, Ray.ALL or Ray.CLOSEST.
             */
            this.mode = 2 /* ANY */;
            /**
             * Current result object.
             */
            this.result = new RaycastResult();
            /**
             * Will be set to true during intersectWorld() if the ray hit anything.
             */
            this.hasHit = false;
            from && (this.from = from.clone());
            to && (this.to = to.clone());
        }
        /**
         * Do itersection against all bodies in the given World.
         */
        intersectWorld(world, options) {
            this.mode = options.mode || 2 /* ANY */;
            this.result = options.result || new RaycastResult();
            this.skipBackfaces = !!options.skipBackfaces;
            this.collisionFilterMask = typeof (options.collisionFilterMask) !== 'undefined' ? options.collisionFilterMask : -1;
            this.collisionFilterGroup = typeof (options.collisionFilterGroup) !== 'undefined' ? options.collisionFilterGroup : -1;
            if (options.from) {
                this.from.copy(options.from);
            }
            if (options.to) {
                this.to.copy(options.to);
            }
            this.callback = options.callback || (() => { });
            this.hasHit = false;
            this.result.reset();
            this._updateDirection();
            this.getAABB(tmpAABB$1);
            tmpArray.length = 0;
            world.broadphase.aabbQuery(world, tmpAABB$1, tmpArray);
            this.intersectBodies(tmpArray);
            return this.hasHit;
        }
        intersectBody(body, result) {
            if (result) {
                this.result = result;
                this._updateDirection();
            }
            if (!body.enableRayTest)
                return;
            const checkCollisionResponse = this.checkCollisionResponse;
            if (checkCollisionResponse && !body.collisionResponse) {
                return;
            }
            if ((this.collisionFilterGroup & body.collisionFilterMask) === 0 || (body.collisionFilterGroup & this.collisionFilterMask) === 0) {
                return;
            }
            let xi = intersectBody_xi;
            let qi = intersectBody_qi;
            for (let i = 0, N = body.shapes.length; i < N; i++) {
                const shape = body.shapes[i];
                if (!shape.enable)
                    continue;
                if (checkCollisionResponse && !shape.collisionResponse) {
                    continue; // Skip
                }
                let shapeq = body.shapeOrientations[i];
                if (shapeq)
                    body.quaternion.mult(shapeq, qi);
                else
                    qi.copy(body.quaternion);
                let shapeoff = body.shapeOffsets[i];
                if (shapeoff) {
                    body.quaternion.vmult(shapeoff, xi);
                    xi.vadd(body.position, xi);
                }
                else
                    xi.copy(body.position);
                this.intersectShape(shape, qi, xi, body);
                if (this.result._shouldStop) {
                    break;
                }
            }
        }
        /**
         * @method intersectBodies
         * @param {Array} bodies An array of Body objects.
         * @param {RaycastResult} [result] Deprecated
         */
        intersectBodies(bodies, result) {
            if (result) {
                this.result = result;
                this._updateDirection();
            }
            for (let i = 0, l = bodies.length; !this.result._shouldStop && i < l; i++) {
                this.intersectBody(bodies[i]);
            }
        }
        /**
         * Updates the _direction vector.
         * @private
         * @method _updateDirection
         */
        _updateDirection() {
            this.to.vsub(this.from, this._direction);
            this._direction.normalize();
        }
        intersectShape(shape, quat, position, body) {
            const from = this.from;
            // Checking boundingSphere
            const distance = distanceFromIntersection(from, this._direction, position);
            if (distance > shape.boundSphR) {
                return;
            }
            switch (shape.type) {
                case 4 /* BOX */:
                    this.intersectBox(shape, quat, position, body, shape);
                    break;
                case 1 /* SPHERE */:
                    this.intersectSphere(shape, quat, position, body, shape);
                    break;
                case 2 /* PLANE */:
                    this.intersectPlane(shape, quat, position, body, shape);
                    break;
                case 16 /* CONVEXPOLYHEDRON */:
                    this.intersectConvex(shape, quat, position, body, shape);
                    break;
                case 256 /* TRIMESH */:
                    this.intersectTrimesh(shape, quat, position, body, shape);
                    break;
                case 32 /* HEIGHTFIELD */:
                    this.intersectHeightfield(shape, quat, position, body, shape);
                    break;
                case 512 /* CAPSULE */: break;
                case 1024 /* VOXEL */:
                    this.intersectVoxel(shape, quat, position, body, shape);
                    break;
            }
            /*
            const intersectMethod = this[shape.type];
            if (intersectMethod) {
                intersectMethod.call(this, shape, quat, position, body, shape);
            }
            */
        }
        intersectBox(shape, quat, position, body, reportedShape) {
            return this.intersectConvex(shape.convexPolyhedronRepresentation, quat, position, body, reportedShape);
        }
        intersectPlane(shape, quat, position, body, reportedShape) {
            const from = this.from;
            const to = this.to;
            const direction = this._direction;
            // Get plane normal
            const worldNormal = new Vec3(0, 0, 1);
            quat.vmult(worldNormal, worldNormal);
            const len = new Vec3();
            from.vsub(position, len);
            const planeToFrom = len.dot(worldNormal);
            to.vsub(position, len);
            const planeToTo = len.dot(worldNormal);
            if (planeToFrom * planeToTo > 0) {
                // "from" and "to" are on the same side of the plane... bail out
                return;
            }
            if (from.distanceTo(to) < planeToFrom) {
                return;
            }
            const n_dot_dir = worldNormal.dot(direction);
            if (Math.abs(n_dot_dir) < this.precision) {
                // No intersection
                return;
            }
            const planePointToFrom = new Vec3();
            const dir_scaled_with_t = new Vec3();
            const hitPointWorld = new Vec3();
            from.vsub(position, planePointToFrom);
            const t = -worldNormal.dot(planePointToFrom) / n_dot_dir;
            direction.scale(t, dir_scaled_with_t);
            from.vadd(dir_scaled_with_t, hitPointWorld);
            this.reportIntersection(worldNormal, hitPointWorld, reportedShape, body, -1);
        }
        /**
         * Get the world AABB of the ray.
         */
        getAABB(aabb) {
            const to = this.to;
            const from = this.from;
            aabb.lowerBound.x = Math.min(to.x, from.x);
            aabb.lowerBound.y = Math.min(to.y, from.y);
            aabb.lowerBound.z = Math.min(to.z, from.z);
            aabb.upperBound.x = Math.max(to.x, from.x);
            aabb.upperBound.y = Math.max(to.y, from.y);
            aabb.upperBound.z = Math.max(to.z, from.z);
        }
        intersectHeightfield(shape, quat, position, body, reportedShape) {
            //const data = shape.data;
            //const w = shape.elementSize;
            // Convert the ray to local heightfield coordinates
            const localRay = intersectHeightfield_localRay; //new Ray(this.from, this.to);
            localRay.from.copy(this.from);
            localRay.to.copy(this.to);
            Transform.pointToLocalFrame(position, quat, localRay.from, localRay.from);
            Transform.pointToLocalFrame(position, quat, localRay.to, localRay.to);
            localRay._updateDirection();
            // Get the index of the data points to test against
            const index = intersectHeightfield_index;
            let iMinZ = 0, iMinX = 0;
            let iMaxZ;
            // Set to max
            let iMaxX = iMaxZ = shape.data.length - 1;
            const aabb = new AABB();
            localRay.getAABB(aabb);
            // min所在的位置
            shape.getIndexOfPosition(aabb.lowerBound.x, aabb.lowerBound.z, index, true);
            iMinX = Math.max(iMinX, index[0]); //限制到>=0
            iMinZ = Math.max(iMinZ, index[1]);
            // max所在的位置
            shape.getIndexOfPosition(aabb.upperBound.x, aabb.upperBound.z, index, true);
            iMaxX = Math.min(iMaxX, index[0] + 1); // 限制一下
            iMaxZ = Math.min(iMaxZ, index[1] + 1);
            for (let j = iMinZ; j < iMaxZ; j++) {
                for (let i = iMinX; i < iMaxX; i++) {
                    if (this.result._shouldStop) {
                        return;
                    }
                    //当前数据块与射线的aabb检测
                    shape.getAabbAtIndex(i, j, aabb);
                    if (!aabb.overlapsRay(localRay)) {
                        continue;
                    }
                    // 下面与三角形检测
                    // Lower triangle
                    shape.getConvexTrianglePillar(i, j, false);
                    Transform.pointToWorldFrame(position, quat, shape.pillarOffset, worldPillarOffset);
                    this.intersectConvex(shape.pillarConvex, quat, worldPillarOffset, body, reportedShape, intersectConvexOptions);
                    if (this.result._shouldStop) {
                        return;
                    }
                    // Upper triangle
                    shape.getConvexTrianglePillar(i, j, true);
                    Transform.pointToWorldFrame(position, quat, shape.pillarOffset, worldPillarOffset);
                    this.intersectConvex(shape.pillarConvex, quat, worldPillarOffset, body, reportedShape, intersectConvexOptions);
                }
            }
        }
        intersectSphere(shape, quat, position, body, reportedShape) {
            const from = this.from;
            const to = this.to;
            const r = shape.radius;
            const a = (to.x - from.x) ** 2 + (to.y - from.y) ** 2 + (to.z - from.z) ** 2;
            const b = 2 * ((to.x - from.x) * (from.x - position.x) + (to.y - from.y) * (from.y - position.y) + (to.z - from.z) * (from.z - position.z));
            const c = (from.x - position.x) ** 2 + (from.y - position.y) ** 2 + (from.z - position.z) ** 2 - r ** 2;
            const delta = b ** 2 - 4 * a * c;
            const intersectionPoint = Ray_intersectSphere_intersectionPoint;
            const normal = Ray_intersectSphere_normal;
            if (delta < 0) {
                // No intersection
                return;
            }
            else if (delta === 0) {
                // single intersection point
                from.lerp(to, delta, intersectionPoint);
                intersectionPoint.vsub(position, normal);
                normal.normalize();
                this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
            }
            else {
                const d1 = (-b - Math.sqrt(delta)) / (2 * a);
                const d2 = (-b + Math.sqrt(delta)) / (2 * a);
                if (d1 >= 0 && d1 <= 1) {
                    from.lerp(to, d1, intersectionPoint);
                    intersectionPoint.vsub(position, normal);
                    normal.normalize();
                    this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
                }
                if (this.result._shouldStop) {
                    return;
                }
                if (d2 >= 0 && d2 <= 1) {
                    from.lerp(to, d2, intersectionPoint);
                    intersectionPoint.vsub(position, normal);
                    normal.normalize();
                    this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
                }
            }
        }
        /**
         * 是否与凸体相交
         * @param shape
         * @param quat
         * @param position
         * @param body
         * @param reportedShape
         * @param options
         */
        intersectConvex(shape, quat, position, body, reportedShape, options) {
            //const minDistNormal = intersectConvex_minDistNormal;
            const normal = intersectConvex_normal;
            const vector = intersectConvex_vector;
            //const minDistIntersect = intersectConvex_minDistIntersect;
            const faceList = (options && options.faceList) || null;
            // Checking faces
            const faces = shape.faces;
            const vertices = shape.vertices;
            const normals = shape.faceNormals;
            const direction = this._direction;
            const from = this.from;
            const to = this.to;
            const fromToDistance = from.distanceTo(to);
            //const minDist = -1;
            const Nfaces = faceList ? faceList.length : faces.length;
            const result = this.result;
            let ptInTri = Ray.pointInTriangle;
            for (let j = 0; !result._shouldStop && j < Nfaces; j++) {
                const fi = faceList ? faceList[j] : j;
                const face = faces[fi];
                const faceNormal = normals[fi];
                const q = quat;
                const x = position;
                // determine if ray intersects the plane of the face
                // note: this works regardless of the direction of the face normal
                // Get plane point in world coordinates...
                vector.copy(vertices[face[0]]);
                q.vmult(vector, vector);
                vector.vadd(x, vector);
                // ...but make it relative to the ray from. We'll fix this later.
                vector.vsub(from, vector);
                // Get plane normal
                q.vmult(faceNormal, normal);
                // If this dot product is negative, we have something interesting
                const dot = direction.dot(normal);
                // Bail out if ray and plane are parallel
                if (Math.abs(dot) < this.precision) {
                    continue;
                }
                // calc distance to plane
                const scalar = normal.dot(vector) / dot;
                // if negative distance, then plane is behind ray
                if (scalar < 0) {
                    continue;
                }
                // if (dot < 0) {
                // Intersection point is from + direction * scalar
                direction.scale(scalar, intersectPoint);
                intersectPoint.vadd(from, intersectPoint);
                // a is the point we compare points b and c with.
                a.copy(vertices[face[0]]);
                q.vmult(a, a);
                x.vadd(a, a);
                for (let i = 1; !result._shouldStop && i < face.length - 1; i++) {
                    // Transform 3 vertices to world coords
                    b.copy(vertices[face[i]]);
                    c.copy(vertices[face[i + 1]]);
                    q.vmult(b, b);
                    q.vmult(c, c);
                    x.vadd(b, b);
                    x.vadd(c, c);
                    const distance = intersectPoint.distanceTo(from);
                    if (!(ptInTri(intersectPoint, a, b, c) || ptInTri(intersectPoint, b, a, c)) || distance > fromToDistance) {
                        continue;
                    }
                    this.reportIntersection(normal, intersectPoint, reportedShape, body, fi);
                }
                // }
            }
        }
        /**
         * @method intersectTrimesh
         * @todo Optimize by transforming the world to local space first.
         * @todo Use Octree lookup
         */
        intersectTrimesh(mesh, quat, position, body, reportedShape, options) {
            const normal = intersectTrimesh_normal;
            const triangles = intersectTrimesh_triangles;
            const treeTransform = intersectTrimesh_treeTransform;
            //const minDistNormal = intersectConvex_minDistNormal;
            const vector = intersectConvex_vector;
            //const minDistIntersect = intersectConvex_minDistIntersect;
            //const localAABB = intersectTrimesh_localAABB;
            const localDirection = intersectTrimesh_localDirection;
            const localFrom = intersectTrimesh_localFrom;
            const localTo = intersectTrimesh_localTo;
            const worldIntersectPoint = intersectTrimesh_worldIntersectPoint;
            const worldNormal = intersectTrimesh_worldNormal;
            //const faceList = (options && options.faceList) || null;
            // Checking faces
            const indices = mesh.indices;
            //const vertices = mesh.vertices;
            //const normals = mesh.normals;
            const from = this.from;
            const to = this.to;
            const direction = this._direction;
            //const minDist = -1;
            treeTransform.position.copy(position);
            treeTransform.quaternion.copy(quat);
            // Transform ray to local space!
            Transform.vectorToLocalFrame(position, quat, direction, localDirection);
            Transform.pointToLocalFrame(position, quat, from, localFrom);
            Transform.pointToLocalFrame(position, quat, to, localTo);
            localTo.x *= mesh.scale.x;
            localTo.y *= mesh.scale.y;
            localTo.z *= mesh.scale.z;
            localFrom.x *= mesh.scale.x;
            localFrom.y *= mesh.scale.y;
            localFrom.z *= mesh.scale.z;
            localTo.vsub(localFrom, localDirection);
            localDirection.normalize();
            const fromToDistanceSquared = localFrom.distanceSquared(localTo);
            mesh.tree.rayQuery(this, treeTransform, triangles);
            var ptInTri = Ray.pointInTriangle;
            for (let i = 0, N = triangles.length; !this.result._shouldStop && i !== N; i++) {
                const trianglesIndex = triangles[i];
                mesh.getNormal(trianglesIndex, normal);
                // determine if ray intersects the plane of the face
                // note: this works regardless of the direction of the face normal
                // Get plane point in world coordinates...
                mesh.getVertex(indices[trianglesIndex * 3], a);
                // ...but make it relative to the ray from. We'll fix this later.
                a.vsub(localFrom, vector);
                // If this dot product is negative, we have something interesting
                const dot = localDirection.dot(normal);
                // Bail out if ray and plane are parallel
                // if (Math.abs( dot ) < this.precision){
                //     continue;
                // }
                // calc distance to plane
                const scalar = normal.dot(vector) / dot;
                // if negative distance, then plane is behind ray
                if (scalar < 0) {
                    continue;
                }
                // Intersection point is from + direction * scalar
                localDirection.scale(scalar, intersectPoint);
                intersectPoint.vadd(localFrom, intersectPoint);
                // Get triangle vertices
                mesh.getVertex(indices[trianglesIndex * 3 + 1], b);
                mesh.getVertex(indices[trianglesIndex * 3 + 2], c);
                const squaredDistance = intersectPoint.distanceSquared(localFrom);
                if (!(ptInTri(intersectPoint, b, a, c) || ptInTri(intersectPoint, a, b, c)) || squaredDistance > fromToDistanceSquared) {
                    continue;
                }
                // transform intersectpoint and normal to world
                Transform.vectorToWorldFrame(quat, normal, worldNormal);
                Transform.pointToWorldFrame(position, quat, intersectPoint, worldIntersectPoint);
                this.reportIntersection(worldNormal, worldIntersectPoint, reportedShape, body, trianglesIndex);
            }
            triangles.length = 0;
        }
        /**
         * 射线与voxel的相交
         * @param voxel
         * @param quat 	voxel的旋转
         * @param position 	voxel的位置
         * @param body
         * @param reportedShape
         */
        intersectVoxel(voxel, quat, position, body, reportedShape) {
            const from = this.from;
            const to = this.to;
            // 世界空间的包围盒
            // TEMP
            voxel.pos = position;
            voxel.quat = quat;
            voxel.updateAABB();
            // TEMP
            let voxmin = voxel.aabbmin;
            let voxmax = voxel.aabbmax;
            // 判断包围盒
            let minx = from.x < to.x ? from.x : to.x;
            let miny = from.y < to.y ? from.y : to.y;
            let minz = from.z < to.z ? from.z : to.z;
            let maxx = from.x > to.x ? from.x : to.x;
            let maxy = from.y > to.y ? from.y : to.y;
            let maxz = from.z > to.z ? from.z : to.z;
            if (maxx < voxmin.x ||
                minx > voxmax.x ||
                maxy < voxmin.y ||
                miny > voxmax.y ||
                maxz < voxmin.z ||
                minz > voxmax.z)
                return;
            // from to转到voxel空间
            let invQ = tmpQ;
            quat.conjugate(invQ);
            let fromLocal = tmpVec1$4;
            let toLocal = tmpVec2$4;
            from.vsub(position, fromLocal);
            invQ.vmult(fromLocal, fromLocal);
            to.vsub(position, toLocal);
            invQ.vmult(toLocal, toLocal);
            if (voxel.invScale) {
                fromLocal.vmul(voxel.invScale, fromLocal);
                toLocal.vmul(voxel.invScale, toLocal);
            }
            const intersectionPoint = Ray_intersectSphere_intersectionPoint;
            const normal = Ray_intersectSphere_normal;
            // 包围盒检查通过，下面检查voxel
            //test
            voxel.pos = position; //position是临时的，因此只能使用前随时设置
            voxel.quat = quat;
            let find = false;
            //test
            voxel.rayTravel(fromLocal, toLocal, (x, y, z, b) => {
                if (!b)
                    return true;
                var pmin = new Vec3();
                var pmax = new Vec3();
                voxel.xyzToPos(x, y, z, position, quat, pmin, pmax);
                //console.log('hit',x,y,z);
                //let phyr =  (window as any).phyr as PhyRender;// getPhyRender();
                //phyr.addAABB(new Vec3(),pmax,0xff00);
                //phyr.addPersistPoint( pmin );
                //phyr.addPersistPoint( pmax );
                intersectionPoint.copy(pmax); //TODO 先粗略的加一个，碰撞点
                normal.set(0, 0, 0); //没有做，设成0，避免误解
                find = true;
                return false;
            });
            // 转回世界空间
            if (find)
                this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
        }
        /**
         * 发生了一个碰撞，记录并判断是否需要继续。
         * 只有类型是ANY才会立即返回
         * @param normal 		碰撞点的normal
         * @param hitPointWorld 世界坐标的碰撞点
         * @param shape
         * @param body
         * @param hitFaceIndex
         * @return True if the intersections should continue
         */
        reportIntersection(normal, hitPointWorld, shape, body, hitFaceIndex) {
            const from = this.from;
            const to = this.to;
            const distance = from.distanceTo(hitPointWorld);
            const result = this.result;
            // Skip back faces?
            if (this.skipBackfaces && normal.dot(this._direction) > 0) {
                return;
            }
            result.hitFaceIndex = typeof (hitFaceIndex) !== 'undefined' ? hitFaceIndex : -1;
            switch (this.mode) {
                case 4 /* ALL */:
                    this.hasHit = true;
                    result.set(from, to, normal, hitPointWorld, shape, body, distance);
                    result.hasHit = true;
                    this.callback(result);
                    break;
                case 1 /* CLOSEST */:
                    // Store if closer than current closest
                    if (distance < result.distance || !result.hasHit) {
                        this.hasHit = true;
                        result.hasHit = true;
                        result.set(from, to, normal, hitPointWorld, shape, body, distance);
                    }
                    break;
                case 2 /* ANY */:
                    // Report and stop.
                    this.hasHit = true;
                    result.hasHit = true;
                    result.set(from, to, normal, hitPointWorld, shape, body, distance);
                    result._shouldStop = true;
                    break;
            }
        }
        /*
         * As per "Barycentric Technique" as named here http://www.blackpawn.com/texts/pointinpoly/default.html But without the division
         */
        static pointInTriangle(p, a, b, c) {
            c.vsub(a, v0);
            b.vsub(a, v1);
            p.vsub(a, v2);
            const dot00 = v0.dot(v0);
            const dot01 = v0.dot(v1);
            const dot02 = v0.dot(v2);
            const dot11 = v1.dot(v1);
            const dot12 = v1.dot(v2);
            let u;
            let v;
            return ((u = dot11 * dot02 - dot01 * dot12) >= 0) &&
                ((v = dot00 * dot12 - dot01 * dot02) >= 0) &&
                (u + v < (dot00 * dot11 - dot01 * dot01));
        }
    }
    var tmpAABB$1 = new AABB();
    var tmpArray = [];
    const v1 = new Vec3();
    const v2 = new Vec3();
    /**
     * Shoot a ray at a body, get back information about the hit.
     * @method intersectBody
     * @private
     * @param {Body} body
     * @param {RaycastResult} [result] Deprecated - set the result property of the Ray instead.
     */
    var intersectBody_xi = new Vec3();
    var intersectBody_qi = new Quaternion();
    //const vector = new Vec3();
    //const normal = new Vec3();
    var intersectPoint = new Vec3();
    var a = new Vec3();
    var b = new Vec3();
    var c = new Vec3();
    //const d = new Vec3();
    //const tmpRaycastResult = new RaycastResult();
    var intersectConvexOptions = {
        faceList: [0]
    };
    var worldPillarOffset = new Vec3();
    var intersectHeightfield_localRay = new Ray();
    var intersectHeightfield_index = [];
    //const intersectHeightfield_minMax = [];
    var Ray_intersectSphere_intersectionPoint = new Vec3();
    var Ray_intersectSphere_normal = new Vec3();
    var intersectConvex_normal = new Vec3();
    //var intersectConvex_minDistNormal = new Vec3();
    //var intersectConvex_minDistIntersect = new Vec3();
    var intersectConvex_vector = new Vec3();
    var intersectTrimesh_normal = new Vec3();
    var intersectTrimesh_localDirection = new Vec3();
    var intersectTrimesh_localFrom = new Vec3();
    var intersectTrimesh_localTo = new Vec3();
    var intersectTrimesh_worldNormal = new Vec3();
    var intersectTrimesh_worldIntersectPoint = new Vec3();
    //var intersectTrimesh_localAABB = new AABB();
    var intersectTrimesh_triangles = [];
    var intersectTrimesh_treeTransform = new Transform();
    var v0 = new Vec3();
    const intersect = new Vec3();
    function distanceFromIntersection(from, direction, position) {
        // v0 is vector from from to position
        position.vsub(from, v0);
        const dot = v0.dot(direction);
        // intersect = direction*dot + from
        direction.scale(dot, intersect);
        intersect.vadd(from, intersect);
        const distance = position.distanceTo(intersect);
        return distance;
    }

    var shapeChecks = [];
    let sphereVoxel_hitPoints = new HitPointInfoArray();
    sphereVoxel_hitPoints.reserve(32);
    var enableFriction = true;
    /**
     * Helper class for the World. Generates ContactEquations.
     * @class Narrowphase
     * @constructor
     * @todo Sphere-ConvexPolyhedron contacts
     * @todo Contact reduction
     * @todo  should move methods to prototype
     */
    class Narrowphase {
        constructor(world) {
            /**
             * Internal storage of pooled contact points.
             */
            this.contactPointPool = [];
            this.frictionEquationPool = [];
            this.v3pool = new Vec3Pool();
            /**
             * 碰撞结果保存为 ContactEquation
             */
            this.result = [];
            this.frictionResult = [];
            /** 当前使用的材质 */
            this.currentContactMaterial = new ContactMaterial(null, null, 0.3, 0);
            /**
             * @property {Boolean} enableFrictionReduction
             */
            this.enableFrictionReduction = false;
            this.gjkdist = new GJKPairDetector();
            this.curm1 = null;
            this.curm2 = null;
            this.world = world;
            shapeChecks[4 /* BOX */] = this.boxBox;
            shapeChecks[4 /* BOX */ | 16 /* CONVEXPOLYHEDRON */] = this.boxConvex;
            shapeChecks[4 /* BOX */ | 64 /* PARTICLE */] = this.boxParticle;
            shapeChecks[4 /* BOX */ | 1024 /* VOXEL */] = this.boxVoxel;
            shapeChecks[1 /* SPHERE */] = this.sphereSphere;
            shapeChecks[2 /* PLANE */ | 256 /* TRIMESH */] = this.planeTrimesh;
            shapeChecks[1 /* SPHERE */ | 256 /* TRIMESH */] = this.sphereTrimesh;
            shapeChecks[1 /* SPHERE */ | 2 /* PLANE */] = this.spherePlane;
            shapeChecks[1 /* SPHERE */ | 4 /* BOX */] = this.sphereBox;
            shapeChecks[1 /* SPHERE */ | 16 /* CONVEXPOLYHEDRON */] = this.sphereConvex;
            shapeChecks[1 /* SPHERE */ | 1024 /* VOXEL */] = this.sphereVoxel;
            shapeChecks[512 /* CAPSULE */] = this.CapsuleCapsule;
            shapeChecks[512 /* CAPSULE */ | 2 /* PLANE */] = this.planeCapsule;
            shapeChecks[512 /* CAPSULE */ | 1 /* SPHERE */] = this.sphereCapsule;
            shapeChecks[4 /* BOX */ | 512 /* CAPSULE */] = this.boxCapsule;
            shapeChecks[2 /* PLANE */ | 4 /* BOX */] = this.planeBox;
            shapeChecks[2 /* PLANE */ | 16 /* CONVEXPOLYHEDRON */] = this.planeConvex;
            shapeChecks[16 /* CONVEXPOLYHEDRON */] = this.convexConvex;
            shapeChecks[2 /* PLANE */ | 64 /* PARTICLE */] = this.planeParticle;
            shapeChecks[64 /* PARTICLE */ | 1 /* SPHERE */] = this.sphereParticle;
            shapeChecks[64 /* PARTICLE */ | 16 /* CONVEXPOLYHEDRON */] = this.convexParticle;
            shapeChecks[16 /* CONVEXPOLYHEDRON */ | 32 /* HEIGHTFIELD */] = this.convexHeightfield;
            shapeChecks[4 /* BOX */ | 32 /* HEIGHTFIELD */] = this.boxHeightfield;
            shapeChecks[1 /* SPHERE */ | 32 /* HEIGHTFIELD */] = this.sphereHeightfield;
        }
        /**
         * Make a contact object, by using the internal pool or creating a new one.
         */
        createContactEquation(bi, bj, si, sj, overrideShapeA, overrideShapeB) {
            let c;
            if (this.contactPointPool.length) {
                c = this.contactPointPool.pop();
                c.bi = bi;
                c.bj = bj;
            }
            else {
                c = new ContactEquation(bi, bj);
            }
            c.enabled = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;
            const cm = this.currentContactMaterial;
            c.restitution = cm.restitution;
            c.setSpookParams(cm.contactEquationStiffness, cm.contactEquationRelaxation, this.world.dt);
            c.si = overrideShapeA || si;
            c.sj = overrideShapeB || sj;
            return c;
        }
        /**
         * 根据contact创建摩擦约束。每个contact会创建两个摩擦约束，在tangent的两个方向
         * @param contactEq
         * @param outArray
         */
        createFrictionEquationsFromContact(contactEq, outArray) {
            if (!enableFriction)
                return;
            const bodyA = contactEq.bi;
            const bodyB = contactEq.bj;
            const world = this.world;
            const cm = this.currentContactMaterial;
            // If friction or restitution were specified in the material, use them
            let friction = cm.friction;
            if (friction > 0) {
                // Create 2 tangent equations
                // TODO 这里要改成 a和b的受力在法线上的投影?
                // 最大力受到摩擦系数的影响
                let maxf = Math.max(world.gravity.lengthSquared(), bodyA.force.lengthSquared(), bodyB.force.lengthSquared());
                const mug = friction * Math.sqrt(maxf);
                let reducedMass = (bodyA.invMass + bodyB.invMass);
                if (reducedMass > 0) {
                    reducedMass = 1 / reducedMass;
                }
                const pool = this.frictionEquationPool;
                const c1 = pool.length ? pool.pop() : new FrictionEquation(bodyA, bodyB, mug * reducedMass);
                const c2 = pool.length ? pool.pop() : new FrictionEquation(bodyA, bodyB, mug * reducedMass);
                c1.bi = c2.bi = bodyA;
                c1.bj = c2.bj = bodyB;
                c1.minForce = c2.minForce = -mug * reducedMass;
                c1.maxForce = c2.maxForce = mug * reducedMass;
                // Copy over the relative vectors
                c1.ri.copy(contactEq.ri);
                c1.rj.copy(contactEq.rj);
                c2.ri.copy(contactEq.ri);
                c2.rj.copy(contactEq.rj);
                // Construct tangents
                contactEq.ni.tangents(c1.t, c2.t);
                // Set spook params
                c1.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);
                c2.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);
                c1.enabled = c2.enabled = contactEq.enabled;
                outArray.push(c1, c2);
                return true;
            }
            return false;
        }
        // Take the average N latest contact point on the plane.
        createFrictionFromAverage(numContacts) {
            // The last contactEquation
            let c = this.result[this.result.length - 1];
            // Create the result: two "average" friction equations
            if (!this.createFrictionEquationsFromContact(c, this.frictionResult) || numContacts === 1) {
                return;
            }
            const f1 = this.frictionResult[this.frictionResult.length - 2];
            const f2 = this.frictionResult[this.frictionResult.length - 1];
            averageNormal.setZero();
            averageContactPointA.setZero();
            averageContactPointB.setZero();
            const bodyA = c.bi;
            //const bodyB = c.bj;
            for (let i = 0; i !== numContacts; i++) {
                c = this.result[this.result.length - 1 - i];
                if (c.bi !== bodyA) { //c.bi?
                    averageNormal.vadd(c.ni, averageNormal);
                    averageContactPointA.vadd(c.ri, averageContactPointA);
                    averageContactPointB.vadd(c.rj, averageContactPointB);
                }
                else {
                    averageNormal.vsub(c.ni, averageNormal);
                    averageContactPointA.vadd(c.rj, averageContactPointA);
                    averageContactPointB.vadd(c.ri, averageContactPointB);
                }
            }
            const invNumContacts = 1 / numContacts;
            averageContactPointA.scale(invNumContacts, f1.ri);
            averageContactPointB.scale(invNumContacts, f1.rj);
            f2.ri.copy(f1.ri); // Should be the same
            f2.rj.copy(f1.rj);
            averageNormal.normalize();
            averageNormal.tangents(f1.t, f2.t);
            // return eq;
        }
        _getContactMtl(mi, mj) {
            let cm = this.currentContactMaterial;
            let lastmi = this.curm1;
            let lastmj = this.curm2;
            if (!mi && !mj) {
                return cm; // 为了提高效率，外面指定
                let defcm = this.world.defaultContactMaterial;
                cm.friction = defcm.friction;
                cm.restitution = defcm.restitution;
                this.curm1 = mi;
                this.curm2 = mj;
            }
            if (!mi || !mj) {
                // 任意一个没有指定的话，则使用指定的
                let sm = mi || mj;
                //@ts-ignore
                cm.friction = sm.friction;
                if (cm.friction > 1)
                    cm.friction = 1;
                if (cm.friction < 0)
                    cm.friction = 0;
                //@ts-ignore
                cm.restitution = sm.restitution;
                this.curm1 = mi;
                this.curm2 = mj;
                return cm;
            }
            // 双方都有的情况下，先找相对材质
            if ((mi === lastmi && mj === lastmj) || (mi === lastmj && mj === lastmi)) {
                //前面已经找到了
            }
            else {
                let rcm = this.world.getContactMaterial(mi, mj);
                if (rcm) {
                    cm.friction = rcm.friction;
                    cm.restitution = rcm.restitution;
                }
                else {
                    // 如果没有相对材质，就计算组合。先用最简单的乘法
                    if (mi.friction == Material.infiniteFriction || mj.friction == Material.infiniteFriction) {
                        cm.friction = 1; // 特殊情况
                    }
                    else if (mi.friction < 0 || mj.friction < 0) {
                        cm.friction = 0;
                    }
                    else
                        cm.friction = (mi.friction + mj.friction) / 2;
                    cm.restitution = mi.restitution * mj.restitution;
                }
                this.curm1 = mi;
                this.curm2 = mj;
            }
            return cm;
        }
        /**
         * Generate all contacts between a list of body pairs
         * @param  p1 Array of body indices
         * @param  p2 Array of body indices
         * @param  world
         * @param  result Array to store generated contacts
         * @param  oldcontacts Optional. Array of reusable contact objects
         */
        getContacts(p1, p2, world, result, oldcontacts, frictionResult, frictionPool) {
            // Save old contact objects
            this.contactPointPool = oldcontacts;
            this.frictionEquationPool = frictionPool;
            this.result = result;
            this.frictionResult = frictionResult;
            const qi = tmpQuat1;
            const qj = tmpQuat2;
            const xi = tmpVec1$5;
            const xj = tmpVec2$5;
            // 给接触材质赋初始值
            let cm = this.currentContactMaterial;
            let defcm = world.defaultContactMaterial;
            cm.friction = defcm.friction;
            cm.restitution = defcm.restitution;
            this.curm1 = null;
            this.curm2 = null;
            for (let k = 0, N = p1.length; k !== N; k++) {
                const bi = p1[k];
                const bj = p2[k];
                let typei = bi.type;
                let typej = bj.type;
                /**
                 * 接触材质，优先使用shape的相对材质，然后是body的相对材质，然后是两个材质的合并，最后是世界缺省
                 */
                let mi = bi.material;
                let mj = bj.material;
                const justTest = typei & 8 /* TRIGGER */ ||
                    typej & 8 /* TRIGGER */ ||
                    ((typei & 4 /* KINEMATIC */) && (typej & 2 /* STATIC */)) || // Kinematic vs static
                    ((typei & 2 /* STATIC */) && (typej & 4 /* KINEMATIC */)) || // static vs kinematix
                    ((typei & 4 /* KINEMATIC */) && (typej & 4 /* KINEMATIC */)); // kinematic vs kinematic
                //TODO
                let stepNum = 0;
                for (let i = 0; i < bi.shapes.length; i++) {
                    const si = bi.shapes[i];
                    if (!si.enable)
                        continue;
                    let shapeoffi = bi.shapeOffsets[i];
                    let shapeqi = bi.shapeOrientations[i];
                    if (shapeqi) {
                        bi.quaternion.mult(shapeqi, qi);
                    }
                    else {
                        qi.copy(bi.quaternion);
                    }
                    if (shapeoffi) {
                        bi.quaternion.vmult(shapeoffi, xi);
                        xi.vadd(bi.position, xi);
                    }
                    else {
                        xi.copy(bi.position);
                    }
                    if (si.hasPreNarrowPhase)
                        si.onPreNarrowpase(stepNum, xi, qi);
                    mi = si.material || mi;
                    for (let j = 0; j < bj.shapes.length; j++) {
                        const sj = bj.shapes[j];
                        if (!sj.enable)
                            continue;
                        // Compute world transform of shapes
                        let shapeoffj = bj.shapeOffsets[j];
                        let shapeqj = bj.shapeOrientations[j];
                        if (shapeqj) {
                            bj.quaternion.mult(shapeqj, qj);
                        }
                        else {
                            qj.copy(bj.quaternion);
                        }
                        if (shapeoffj) {
                            bj.quaternion.vmult(shapeoffj, xj);
                            xj.vadd(bj.position, xj);
                        }
                        else {
                            xj.copy(bj.position);
                        }
                        if (sj.hasPreNarrowPhase)
                            sj.onPreNarrowpase(stepNum, xj, qj);
                        // 碰撞组判断
                        if (!((si.collisionFilterMask & sj.collisionFilterGroup) && (sj.collisionFilterMask & si.collisionFilterGroup))) {
                            continue;
                        }
                        // 包围球判断
                        if (xi.distanceTo(xj) > si.boundSphR + sj.boundSphR) {
                            continue;
                        }
                        mj = sj.material || mj;
                        cm = this._getContactMtl(mi, mj);
                        // Get contacts
                        const resolver = shapeChecks[si.type | sj.type];
                        if (resolver) {
                            let retval = false;
                            if (si.type < sj.type) {
                                retval = resolver.call(this, si, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
                            }
                            else {
                                retval = resolver.call(this, sj, si, xj, xi, qj, qi, bj, bi, si, sj, justTest);
                            }
                            if (retval && justTest) {
                                // 触发器的碰撞处理
                                // Register overlap
                                //world.shapeOverlapKeeper.set(si.id, sj.id);
                                //world.bodyOverlapKeeper.set(bi.id, bj.id);
                                bi.type != 2 /* STATIC */ && bi.contact.addTriggerContact(bj, si, sj);
                                bj.type != 2 /* STATIC */ && bj.contact.addTriggerContact(bi, sj, si);
                            }
                        }
                    }
                }
            }
        }
        boxBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
            si.convexPolyhedronRepresentation.material = si.material;
            sj.convexPolyhedronRepresentation.material = sj.material;
            si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
            sj.convexPolyhedronRepresentation.collisionResponse = sj.collisionResponse;
            return this.convexConvex(si.convexPolyhedronRepresentation, sj.convexPolyhedronRepresentation, xi, xj, qi, qj, bi, bj, si, sj, justTest);
        }
        boxConvex(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
            si.convexPolyhedronRepresentation.material = si.material;
            si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
            return this.convexConvex(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
        }
        boxParticle(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
            si.convexPolyhedronRepresentation.material = si.material;
            si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
            return this.convexParticle(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
        }
        sphereSphere(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
            let hit = xi.distanceSquared(xj) < (si.radius + sj.radius) ** 2;
            if (!hit || justTest) {
                return hit;
            }
            // We will have only one contact in this case
            const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
            // Contact normal
            xj.vsub(xi, r.ni);
            r.ni.normalize();
            // Contact point locations
            r.ri.copy(r.ni);
            r.rj.copy(r.ni);
            r.ri.scale(si.radius, r.ri);
            r.rj.scale(-sj.radius, r.rj);
            r.ri.vadd(xi, r.ri);
            r.ri.vsub(bi.position, r.ri);
            r.rj.vadd(xj, r.rj);
            r.rj.vsub(bj.position, r.rj);
            this.result.push(r);
            this.createFrictionEquationsFromContact(r, this.frictionResult);
            return true;
        }
        planeTrimesh(planeShape, trimeshShape, planePos, trimeshPos, planeQuat, trimeshQuat, planeBody, trimeshBody, rsi, rsj, justTest) {
            // Make contacts!
            const v = new Vec3();
            const normal = planeTrimesh_normal;
            normal.set(0, 0, 1);
            planeQuat.vmult(normal, normal); // Turn normal according to plane
            for (let i = 0; i < trimeshShape.vertices.length / 3; i++) {
                // Get world vertex from trimesh
                trimeshShape.getVertex(i, v);
                // Safe up
                const v2 = new Vec3();
                v2.copy(v);
                Transform.pointToWorldFrame(trimeshPos, trimeshQuat, v2, v);
                // Check plane side
                const relpos = planeTrimesh_relpos;
                v.vsub(planePos, relpos);
                const dot = normal.dot(relpos);
                if (dot <= 0.0) {
                    if (justTest) {
                        return true;
                    }
                    const r = this.createContactEquation(planeBody, trimeshBody, planeShape, trimeshShape, rsi, rsj);
                    r.ni.copy(normal); // Contact normal is the plane normal
                    // Get vertex position projected on plane
                    const projected = planeTrimesh_projected;
                    normal.scale(relpos.dot(normal), projected);
                    v.vsub(projected, projected);
                    // ri is the projected world position minus plane position
                    r.ri.copy(projected);
                    r.ri.vsub(planeBody.position, r.ri);
                    r.rj.copy(v);
                    r.rj.vsub(trimeshBody.position, r.rj);
                    // Store result
                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                }
                return true;
            }
            return false;
        }
        /**
         * 球与mesh的碰撞
         * @param sphereShape
         * @param trimeshShape
         * @param spherePos
         * @param trimeshPos
         * @param sphereQuat
         * @param trimeshQuat
         * @param sphereBody
         * @param trimeshBody
         * @param rsi
         * @param rsj
         * @param justTest
         */
        sphereTrimesh(sphereShape, trimeshShape, spherePos, trimeshPos, sphereQuat, trimeshQuat, sphereBody, trimeshBody, rsi, rsj, justTest) {
            const edgeVertexA = sphereTrimesh_edgeVertexA;
            const edgeVertexB = sphereTrimesh_edgeVertexB;
            const edgeVector = sphereTrimesh_edgeVector;
            const edgeVectorUnit = sphereTrimesh_edgeVectorUnit;
            const localSpherePos = sphereTrimesh_localSpherePos;
            const tmp = sphereTrimesh_tmp;
            const localSphereAABB = sphereTrimesh_localSphereAABB;
            const v2 = sphereTrimesh_v2;
            const relpos = sphereTrimesh_relpos;
            const triangles = sphereTrimesh_triangles;
            // Convert sphere position to local in the trimesh
            Transform.pointToLocalFrame(trimeshPos, trimeshQuat, spherePos, localSpherePos);
            // Get the aabb of the sphere locally in the trimesh
            const sphereRadius = sphereShape.radius;
            localSphereAABB.lowerBound.set(localSpherePos.x - sphereRadius, localSpherePos.y - sphereRadius, localSpherePos.z - sphereRadius);
            localSphereAABB.upperBound.set(localSpherePos.x + sphereRadius, localSpherePos.y + sphereRadius, localSpherePos.z + sphereRadius);
            trimeshShape.getTrianglesInAABB(localSphereAABB, triangles);
            //for (var i = 0; i < trimeshShape.indices.length / 3; i++) triangles.push(i); // All
            let hit = false;
            // Vertices
            const v = sphereTrimesh_v;
            const radiusSquared = sphereShape.radius * sphereShape.radius;
            for (var i = 0; i < triangles.length; i++) {
                for (var j = 0; j < 3; j++) {
                    trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], v);
                    // Check vertex overlap in sphere
                    v.vsub(localSpherePos, relpos);
                    if (relpos.lengthSquared() <= radiusSquared) {
                        // Safe up
                        v2.copy(v);
                        Transform.pointToWorldFrame(trimeshPos, trimeshQuat, v2, v);
                        v.vsub(spherePos, relpos);
                        hit = true;
                        if (justTest) {
                            return true;
                        }
                        var r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
                        r.ni.copy(relpos);
                        r.ni.normalize();
                        // ri is the vector from sphere center to the sphere surface
                        r.ri.copy(r.ni);
                        r.ri.scale(sphereShape.radius, r.ri);
                        r.ri.vadd(spherePos, r.ri);
                        r.ri.vsub(sphereBody.position, r.ri);
                        r.rj.copy(v);
                        r.rj.vsub(trimeshBody.position, r.rj);
                        // Store result
                        this.result.push(r);
                        this.createFrictionEquationsFromContact(r, this.frictionResult);
                    }
                }
            }
            // Check all edges
            for (var i = 0; i < triangles.length; i++) {
                for (var j = 0; j < 3; j++) {
                    trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], edgeVertexA);
                    trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + ((j + 1) % 3)], edgeVertexB);
                    edgeVertexB.vsub(edgeVertexA, edgeVector);
                    // Project sphere position to the edge
                    localSpherePos.vsub(edgeVertexB, tmp);
                    const positionAlongEdgeB = tmp.dot(edgeVector);
                    localSpherePos.vsub(edgeVertexA, tmp);
                    let positionAlongEdgeA = tmp.dot(edgeVector);
                    if (positionAlongEdgeA > 0 && positionAlongEdgeB < 0) {
                        // Now check the orthogonal distance from edge to sphere center
                        localSpherePos.vsub(edgeVertexA, tmp);
                        edgeVectorUnit.copy(edgeVector);
                        edgeVectorUnit.normalize();
                        positionAlongEdgeA = tmp.dot(edgeVectorUnit);
                        edgeVectorUnit.scale(positionAlongEdgeA, tmp);
                        tmp.vadd(edgeVertexA, tmp);
                        // tmp is now the sphere center position projected to the edge, defined locally in the trimesh frame
                        var dist = tmp.distanceTo(localSpherePos);
                        if (dist < sphereShape.radius) {
                            hit = true;
                            if (justTest) {
                                return true;
                            }
                            var r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
                            tmp.vsub(localSpherePos, r.ni);
                            r.ni.normalize();
                            r.ni.scale(sphereShape.radius, r.ri);
                            Transform.pointToWorldFrame(trimeshPos, trimeshQuat, tmp, tmp);
                            tmp.vsub(trimeshBody.position, r.rj);
                            Transform.vectorToWorldFrame(trimeshQuat, r.ni, r.ni);
                            Transform.vectorToWorldFrame(trimeshQuat, r.ri, r.ri);
                            this.result.push(r);
                            this.createFrictionEquationsFromContact(r, this.frictionResult);
                        }
                    }
                }
            }
            // Triangle faces
            const va = sphereTrimesh_va;
            const vb = sphereTrimesh_vb;
            const vc = sphereTrimesh_vc;
            const normal = sphereTrimesh_normal;
            for (let i = 0, N = triangles.length; i !== N; i++) {
                trimeshShape.getTriangleVertices(triangles[i], va, vb, vc);
                trimeshShape.getNormal(triangles[i], normal);
                localSpherePos.vsub(va, tmp);
                var dist = tmp.dot(normal);
                normal.scale(dist, tmp);
                localSpherePos.vsub(tmp, tmp);
                // tmp is now the sphere position projected to the triangle plane
                dist = tmp.distanceTo(localSpherePos);
                if (Ray.pointInTriangle(tmp, va, vb, vc) && dist < sphereShape.radius) {
                    hit = true;
                    if (justTest) {
                        return true;
                    }
                    var r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
                    tmp.vsub(localSpherePos, r.ni);
                    r.ni.normalize();
                    r.ni.scale(sphereShape.radius, r.ri);
                    Transform.pointToWorldFrame(trimeshPos, trimeshQuat, tmp, tmp);
                    tmp.vsub(trimeshBody.position, r.rj);
                    Transform.vectorToWorldFrame(trimeshQuat, r.ni, r.ni);
                    Transform.vectorToWorldFrame(trimeshQuat, r.ri, r.ri);
                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                }
            }
            triangles.length = 0;
            return hit;
        }
        spherePlane(sphere, plane, sphPos, planePos, qi, planeQ, sphBody, planeBody, rsi, rsj, justTest) {
            let ni = Narrowphase.nor1; // 球的碰撞法线
            // 平面的法线转换到平面的朝向上
            ni.set(0, 0, 1);
            planeQ.vmult(ni, ni);
            ni.negate(ni); // 由于是球的碰撞法线，所以颠倒一下 body i is the sphere, flip normal
            ni.normalize(); // Needed?
            // Project down sphere on plane
            sphPos.vsub(planePos, point_on_plane_to_sphere);
            ni.scale(ni.dot(point_on_plane_to_sphere), plane_to_sphere_ortho);
            if (-point_on_plane_to_sphere.dot(ni) <= sphere.radius) {
                if (justTest) {
                    return true;
                }
                const r = this.createContactEquation(sphBody, planeBody, sphere, plane, rsi, rsj);
                r.ni.copy(ni);
                // Vector from sphere center to contact point
                // 球的碰撞点
                ni.scale(sphere.radius, r.ri); // 长度为半径
                point_on_plane_to_sphere.vsub(plane_to_sphere_ortho, r.rj); // The sphere position projected to plane
                // Make it relative to the body
                const ri = r.ri;
                const rj = r.rj;
                ri.vadd(sphPos, ri);
                ri.vsub(sphBody.position, ri); // pos+hitV-a.pos  正常情况下 pos == a.pos
                rj.vadd(planePos, rj);
                rj.vsub(planeBody.position, rj);
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
                return true;
            }
            return false;
        }
        bigSphereBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
            let hitpos = sphereBox_ns;
            let hitpos1 = sphereBox_ns1;
            let ni = Narrowphase.nor1;
            let deep = Sphere.hitBox(xi, si.radius, sj.halfExtents, xj, qj, hitpos, hitpos1, ni, justTest);
            if (deep >= 0) {
                //debug
                /*
                let phyr = this.world._phyRender;
                phyr.addPoint1(hitpos,0xff);
                phyr.addPoint1(hitpos1,0xff00);
                phyr.addVec1(hitpos1,ni,10,0xffff00);
                */
                //debug
                if (justTest)
                    return true;
                let r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                ni.negate(r.ni);
                hitpos.vsub(xi, r.ri);
                hitpos1.vsub(xj, r.rj);
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
                return true;
            }
            return false;
        }
        sphereBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
            return this.bigSphereBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest);
            /*
            const v3pool = this.v3pool;
            let half = sj.halfExtents;
            let maxw = Math.max(half.x,half.y,half.z);

            if(si.radius>4*maxw){
                return this.bigSphereBox(si,sj,xi,xj,qi,qj,bi,bj,rsi,rsj,justTest);
            }
            // we refer to the box as body j
            const sides = sphereBox_sides;
            xi.vsub(xj, box_to_sphere);
            sj.getSideNormals(sides, qj);
            const R = si.radius;
            //const penetrating_sides = [];

            // Check side (plane) intersections
            let found = false;

            // Store the resulting side penetration info
            const side_ns = sphereBox_side_ns;
            const side_ns1 = sphereBox_side_ns1;
            const side_ns2 = sphereBox_side_ns2;
            let side_h: f32 = 0;
            let side_penetrations = 0;
            let side_dot1 = 0;
            let side_dot2 = 0;
            let side_distance = null;
            for (let idx = 0, nsides = sides.length; idx !== nsides && found === false; idx++) {
                // Get the plane side normal (ns)
                const ns = sphereBox_ns;
                ns.copy(sides[idx]);

                const h = ns.length();
                ns.normalize();

                // The normal/distance dot product tells which side of the plane we are
                const dot = box_to_sphere.dot(ns);

                if (dot < h + R && dot > 0) {
                    // Intersects plane. Now check the other two dimensions
                    const ns1 = sphereBox_ns1;
                    const ns2 = sphereBox_ns2;
                    ns1.copy(sides[(idx + 1) % 3]);
                    ns2.copy(sides[(idx + 2) % 3]);
                    const h1 = ns1.length();
                    const h2 = ns2.length();
                    ns1.normalize();
                    ns2.normalize();
                    const dot1 = box_to_sphere.dot(ns1);
                    const dot2 = box_to_sphere.dot(ns2);
                    if (dot1 < h1 && dot1 > -h1 && dot2 < h2 && dot2 > -h2) {
                        let dist = Math.abs(dot - h - R);
                        if (side_distance === null || dist < side_distance) {
                            side_distance = dist;
                            side_dot1 = dot1;
                            side_dot2 = dot2;
                            side_h = h;
                            side_ns.copy(ns);
                            side_ns1.copy(ns1);
                            side_ns2.copy(ns2);
                            side_penetrations++;

                            if (justTest) {
                                return true;
                            }
                        }
                    }
                }
            }
            if (side_penetrations) {
                found = true;
                let r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                side_ns.scale(-R, r.ri); // Sphere r
                r.ni.copy(side_ns);
                r.ni.negate(r.ni); // Normal should be out of sphere
                side_ns.scale(side_h, side_ns);
                side_ns1.scale(side_dot1, side_ns1);
                side_ns.vadd(side_ns1, side_ns);
                side_ns2.scale(side_dot2, side_ns2);
                side_ns.vadd(side_ns2, r.rj);

                // Make relative to bodies
                r.ri.vadd(xi, r.ri);
                r.ri.vsub(bi.position, r.ri);
                r.rj.vadd(xj, r.rj);
                r.rj.vsub(bj.position, r.rj);

                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            }

            // Check corners
            let rj = v3pool.get();
            const sphere_to_corner = sphereBox_sphere_to_corner;
            for (var j = 0; j !== 2 && !found; j++) {
                for (var k = 0; k !== 2 && !found; k++) {
                    for (var l = 0; l !== 2 && !found; l++) {
                        rj.set(0, 0, 0);
                        if (j) {
                            rj.vadd(sides[0], rj);
                        } else {
                            rj.vsub(sides[0], rj);
                        }
                        if (k) {
                            rj.vadd(sides[1], rj);
                        } else {
                            rj.vsub(sides[1], rj);
                        }
                        if (l) {
                            rj.vadd(sides[2], rj);
                        } else {
                            rj.vsub(sides[2], rj);
                        }

                        // World position of corner
                        xj.vadd(rj, sphere_to_corner);
                        sphere_to_corner.vsub(xi, sphere_to_corner);

                        if (sphere_to_corner.lengthSquared() < R * R) {
                            if (justTest) {
                                return true;
                            }
                            found = true;
                            let r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                            r.ri.copy(sphere_to_corner);
                            r.ri.normalize();
                            r.ni.copy(r.ri);
                            r.ri.scale(R, r.ri);
                            r.rj.copy(rj);

                            // Make relative to bodies
                            r.ri.vadd(xi, r.ri);
                            r.ri.vsub(bi.position, r.ri);
                            r.rj.vadd(xj, r.rj);
                            r.rj.vsub(bj.position, r.rj);

                            this.result.push(r);
                            this.createFrictionEquationsFromContact(r, this.frictionResult);
                        }
                    }
                }
            }
            v3pool.release(rj);
            //rj = null;

            // Check edges
            const edgeTangent = v3pool.get() as Vec3;
            const edgeCenter = v3pool.get() as Vec3;
            var r: Vec3 = v3pool.get() as Vec3; // r = edge center to sphere center
            const orthogonal = v3pool.get() as Vec3;
            var dist: Vec3 = v3pool.get() as Vec3;
            const Nsides = sides.length;
            for (var j = 0; j !== Nsides && !found; j++) {
                for (var k = 0; k !== Nsides && !found; k++) {
                    if (j % 3 !== k % 3) {
                        // Get edge tangent
                        sides[k].cross(sides[j], edgeTangent);
                        edgeTangent.normalize();
                        sides[j].vadd(sides[k], edgeCenter);
                        r.copy(xi);
                        r.vsub(edgeCenter, r);
                        r.vsub(xj, r);
                        const orthonorm = r.dot(edgeTangent); // distance from edge center to sphere center in the tangent direction
                        edgeTangent.scale(orthonorm, orthogonal); // Vector from edge center to sphere center in the tangent direction

                        // Find the third side orthogonal to this one
                        var l = 0;
                        while (l === j % 3 || l === k % 3) {
                            l++;
                        }

                        // vec from edge center to sphere projected to the plane orthogonal to the edge tangent
                        dist.copy(xi);
                        dist.vsub(orthogonal, dist);
                        dist.vsub(edgeCenter, dist);
                        dist.vsub(xj, dist);

                        // Distances in tangent direction and distance in the plane orthogonal to it
                        const tdist = Math.abs(orthonorm);
                        const ndist = dist.length();

                        if (tdist < sides[l].length() && ndist < R) {
                            if (justTest) {
                                return true;
                            }
                            found = true;
                            const res = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                            edgeCenter.vadd(orthogonal, res.rj); // box rj
                            res.rj.copy(res.rj);
                            dist.negate(res.ni);
                            res.ni.normalize();

                            res.ri.copy(res.rj);
                            res.ri.vadd(xj, res.ri);
                            res.ri.vsub(xi, res.ri);
                            res.ri.normalize();
                            res.ri.scale(R, res.ri);

                            // Make relative to bodies
                            res.ri.vadd(xi, res.ri);
                            res.ri.vsub(bi.position, res.ri);
                            res.rj.vadd(xj, res.rj);
                            res.rj.vsub(bj.position, res.rj);

                            this.result.push(res);
                            this.createFrictionEquationsFromContact(res, this.frictionResult);
                        }
                    }
                }
            }
            v3pool.release(edgeTangent).release(edgeCenter).release(r).release(orthogonal).release(dist);
            return found;
            */
        }
        sphereConvex(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
            const v3pool = this.v3pool;
            xi.vsub(xj, convex_to_sphere);
            const normals = sj.faceNormals;
            const faces = sj.faces;
            const verts = sj.vertices;
            const R = si.radius;
            //const penetrating_sides = [];
            // if(convex_to_sphere.norm2() > si.boundingSphereRadius + sj.boundingSphereRadius){
            //     return;
            // }
            // Check corners
            for (var i = 0; i !== verts.length; i++) {
                const v = verts[i];
                // World position of corner
                const worldCorner = sphereConvex_worldCorner;
                qj.vmult(v, worldCorner);
                xj.vadd(worldCorner, worldCorner); // v转换到是世界空间
                //DEBUG
                //let phyr = this.world.phyRender as PhyRender;//
                //phyr.addPoint1(worldCorner,0xff0000);
                //DEBUG
                const sphere_to_corner = sphereConvex_sphereToCorner;
                worldCorner.vsub(xi, sphere_to_corner);
                if (sphere_to_corner.lengthSquared() < R * R) {
                    if (justTest) {
                        return true;
                    }
                    found = true;
                    var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                    r.ri.copy(sphere_to_corner);
                    r.ri.normalize();
                    r.ni.copy(r.ri);
                    r.ri.scale(R, r.ri);
                    worldCorner.vsub(xj, r.rj);
                    // Should be relative to the body.
                    r.ri.vadd(xi, r.ri);
                    r.ri.vsub(bi.position, r.ri);
                    // Should be relative to the body.
                    r.rj.vadd(xj, r.rj);
                    r.rj.vsub(bj.position, r.rj);
                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                    return true;
                }
            }
            // Check side (plane) intersections
            var found = false;
            for (let i = 0, nfaces = faces.length; i !== nfaces && found === false; i++) {
                const normal = normals[i];
                const face = faces[i];
                // Get world-transformed normal of the face
                const worldNormal = sphereConvex_worldNormal;
                qj.vmult(normal, worldNormal);
                // Get a world vertex from the face
                const worldPoint = sphereConvex_worldPoint;
                qj.vmult(verts[face[0]], worldPoint);
                worldPoint.vadd(xj, worldPoint);
                // Get a point on the sphere, closest to the face normal
                const worldSpherePointClosestToPlane = sphereConvex_worldSpherePointClosestToPlane;
                worldNormal.scale(-R, worldSpherePointClosestToPlane);
                xi.vadd(worldSpherePointClosestToPlane, worldSpherePointClosestToPlane);
                // Vector from a face point to the closest point on the sphere
                const penetrationVec = sphereConvex_penetrationVec;
                worldSpherePointClosestToPlane.vsub(worldPoint, penetrationVec);
                // The penetration. Negative value means overlap.
                const penetration = penetrationVec.dot(worldNormal);
                const worldPointToSphere = sphereConvex_sphereToWorldPoint;
                xi.vsub(worldPoint, worldPointToSphere);
                if (penetration < 0 && worldPointToSphere.dot(worldNormal) > 0) {
                    // Intersects plane. Now check if the sphere is inside the face polygon
                    const faceVerts = []; // Face vertices, in world coords
                    for (var j = 0, Nverts = face.length; j !== Nverts; j++) {
                        const worldVertex = v3pool.get();
                        qj.vmult(verts[face[j]], worldVertex);
                        xj.vadd(worldVertex, worldVertex);
                        faceVerts.push(worldVertex);
                    }
                    if (pointInPolygon(faceVerts, worldNormal, xi)) { // Is the sphere center in the face polygon?
                        if (justTest) {
                            return true;
                        }
                        found = true;
                        var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                        worldNormal.scale(-R, r.ri); // Contact offset, from sphere center to contact
                        worldNormal.negate(r.ni); // Normal pointing out of sphere
                        const penetrationVec2 = v3pool.get();
                        worldNormal.scale(-penetration, penetrationVec2);
                        const penetrationSpherePoint = v3pool.get();
                        worldNormal.scale(-R, penetrationSpherePoint);
                        //xi.vsub(xj).vadd(penetrationSpherePoint).vadd(penetrationVec2 , r.rj);
                        xi.vsub(xj, r.rj);
                        r.rj.vadd(penetrationSpherePoint, r.rj);
                        r.rj.vadd(penetrationVec2, r.rj);
                        // Should be relative to the body.
                        r.rj.vadd(xj, r.rj);
                        r.rj.vsub(bj.position, r.rj);
                        // Should be relative to the body.
                        r.ri.vadd(xi, r.ri);
                        r.ri.vsub(bi.position, r.ri);
                        v3pool.release(penetrationVec2);
                        v3pool.release(penetrationSpherePoint);
                        this.result.push(r);
                        this.createFrictionEquationsFromContact(r, this.frictionResult);
                        // Release world vertices
                        for (var j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
                            v3pool.release(faceVerts[j]);
                        }
                        return true; // We only expect *one* face contact
                    }
                    else {
                        // Edge?
                        for (var j = 0; j !== face.length; j++) {
                            // Get two world transformed vertices
                            const v1 = v3pool.get();
                            const v2 = v3pool.get();
                            qj.vmult(verts[face[(j + 1) % face.length]], v1);
                            qj.vmult(verts[face[(j + 2) % face.length]], v2);
                            xj.vadd(v1, v1);
                            xj.vadd(v2, v2);
                            // Construct edge vector
                            const edge = sphereConvex_edge;
                            v2.vsub(v1, edge);
                            // Construct the same vector, but normalized
                            const edgeUnit = sphereConvex_edgeUnit;
                            edge.unit(edgeUnit);
                            // p is xi projected onto the edge
                            const p = v3pool.get();
                            const v1_to_xi = v3pool.get();
                            xi.vsub(v1, v1_to_xi);
                            const dot = v1_to_xi.dot(edgeUnit);
                            edgeUnit.scale(dot, p);
                            p.vadd(v1, p);
                            // Compute a vector from p to the center of the sphere
                            const xi_to_p = v3pool.get();
                            p.vsub(xi, xi_to_p);
                            // Collision if the edge-sphere distance is less than the radius
                            // AND if p is in between v1 and v2
                            if (dot > 0 && dot * dot < edge.lengthSquared() && xi_to_p.lengthSquared() < R * R) { // Collision if the edge-sphere distance is less than the radius
                                // Edge contact!
                                if (justTest) {
                                    return true;
                                }
                                var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                                p.vsub(xj, r.rj);
                                p.vsub(xi, r.ni);
                                r.ni.normalize();
                                r.ni.scale(R, r.ri);
                                // Should be relative to the body.
                                r.rj.vadd(xj, r.rj);
                                r.rj.vsub(bj.position, r.rj);
                                // Should be relative to the body.
                                r.ri.vadd(xi, r.ri);
                                r.ri.vsub(bi.position, r.ri);
                                this.result.push(r);
                                this.createFrictionEquationsFromContact(r, this.frictionResult);
                                // Release world vertices
                                for (var j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
                                    v3pool.release(faceVerts[j]);
                                }
                                v3pool.release(v1);
                                v3pool.release(v2);
                                v3pool.release(p);
                                v3pool.release(xi_to_p);
                                v3pool.release(v1_to_xi);
                                return true;
                            }
                            v3pool.release(v1);
                            v3pool.release(v2);
                            v3pool.release(p);
                            v3pool.release(xi_to_p);
                            v3pool.release(v1_to_xi);
                        }
                    }
                    // Release world vertices
                    for (var j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
                        v3pool.release(faceVerts[j]);
                    }
                }
            }
            return found;
        }
        /*
        sphereVoxel(sphere: Sphere, voxel: Voxel,  pos1: Vec3, pos2: Vec3, q1: Quaternion, q2: Quaternion, body1: Body, body2: Body,  rsi: Shape, rsj: Shape, justTest: boolean): boolean {
            let hitpoints:HitPointInfo[] = [];
            let hit = sphere.hitVoxel(pos1,voxel,pos2,q2,hitpoints,justTest);
            if(hit){
                if( justTest) return true;
                hitpoints.forEach( hit=>{
                    let r = this.createContactEquation(body1,body2,sphere,voxel,rsi,rsj);
                    hit.normal.negate(r.ni);
                    //r.ni.copy(hit.normal);
                    hit.posi.vsub(pos1,r.ri);
                    hit.posj.vsub(pos2,r.rj);
        
                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                })
                return true;
            }
            return false;
        }
        */
        sphereVoxel(sphere, voxel, pos1, pos2, q1, q2, body1, body2, rsi, rsj, justTest) {
            //TEMP voxel的AABB的更新先在这里做，以后记得优化
            voxel.pos = pos2;
            voxel.quat = q2;
            voxel.updateAABB();
            //TEMP
            let hitpoints = sphereVoxel_hitPoints;
            let hit = sphere.hitVoxel1(pos1, voxel, pos2, q2, hitpoints, justTest);
            if (hit) {
                if (justTest)
                    return true;
                let hl = hitpoints.length;
                //let phyr = this.world.phyRender as PhyRender;
                for (let i = 0; i < hl; i++) {
                    let hit = hitpoints.data[i];
                    let r = this.createContactEquation(body1, body2, sphere, voxel, rsi, rsj);
                    //debug
                    //phyr.addPersistPoint(hit.posi);
                    //phyr.addPersistVec(hit.normal, hit.posi)
                    //debug
                    hit.normal.negate(r.ni);
                    //r.ni.copy(hit.normal);
                    hit.posi.vsub(body1.position, r.ri); // 相对位置必须是相对于body的，因为pos1可能考虑了shape的偏移，变成了相对于shape的偏移了。
                    hit.posj.vsub(body2.position, r.rj);
                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                }
                return true;
            }
            return false;
        }
        CapsuleCapsule(cap1, cap2, pos1, pos2, q1, q2, body1, body2, rsi, rsj, justTest) {
            let ni = Narrowphase.nor1;
            let hitpos = point_on_plane_to_sphere;
            let hit1 = Cap_Cap_tmpV1;
            let deep = cap1.hitCapsule(pos1, cap2, pos2, hitpos, hit1, ni, justTest);
            if (deep >= 0) {
                if (justTest)
                    return true;
                let r = this.createContactEquation(body1, body2, cap1, cap2, rsi, rsj);
                ni.negate(ni);
                r.ni.copy(ni);
                hitpos.vsub(body1.position, r.ri);
                hit1.vsub(body2.position, r.rj);
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
                return true;
            }
            return false;
        }
        sphereCapsule(sphere, capsule, sphPos, capPos, sphQ, capQ, sphBody, capBody, rsi, rsj, justTest) {
            let ni = Narrowphase.nor1;
            let hitpos = point_on_plane_to_sphere;
            let hit1 = Cap_Cap_tmpV1;
            let deep = capsule.hitSphere(capPos, sphere.radius, sphPos, hitpos, hit1, ni, justTest);
            if (deep >= 0) {
                if (justTest)
                    return true;
                let r = this.createContactEquation(capBody, sphBody, capsule, sphere, rsi, rsj);
                ni.negate(ni); // 
                r.ni.copy(ni);
                hitpos.vsub(sphBody.position, r.ri);
                hit1.vsub(capBody.position, r.rj);
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
                return true;
            }
            return false;
        }
        planeCapsule(plane, capsule, planePos, capPos, planeQ, capQ, planeBody, capBody, rsi, rsj, justTest) {
            let ni = Narrowphase.nor1; // 球的碰撞法线
            // 平面的法线转换到平面的朝向上
            ni.set(0, 0, 1); // 平面法线，TODO 以后换成laya坐标系，0,1,0
            planeQ.vmult(ni, ni);
            ni.normalize(); // Needed?
            let nearToPlane = point_on_plane_to_sphere;
            let deep = capsule.hitPlane(capPos, planePos, ni, nearToPlane);
            if (deep >= 0) {
                if (justTest)
                    return true;
                const r = this.createContactEquation(capBody, planeBody, capsule, plane, rsi, rsj);
                ni.negate(ni); // capsule身上的法线 -planeNormal
                r.ni.copy(ni);
                let planeHit = r.rj; // 平面的碰撞点
                planeHit.copy(nearToPlane); // r.rj = hitpos
                //DEBUG
                //this.world.phyRender._addPoint(nearToPlane, PhyColor.RED);
                //DEBUG
                planeHit.addScaledVector(-deep, ni, planeHit); //ni朝向平面里面 = rj
                planeHit.vsub(planeBody.position, planeHit); // 转到相对自己的位置
                // 把ri,rj转成相对坐标
                const ri = r.ri;
                ri.copy(nearToPlane);
                ri.vsub(capBody.position, ri);
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
                return true;
            }
            return false;
        }
        boxCapsule(box, capsule, boxPos, capPos, boxQ, capQ, boxBody, capBody, rsi, rsj, justTest) {
            let ni = Narrowphase.nor1;
            let hitpos = point_on_plane_to_sphere;
            let hit1 = Cap_Cap_tmpV1;
            let gjk = this.gjkdist;
            gjk.shapeA = box.minkowski;
            gjk.shapeB = capsule.minkowski;
            let transA = Narrowphase.trans1;
            let transB = Narrowphase.trans2;
            transA.position = boxPos;
            transA.quaternion = boxQ;
            transB.position = capPos;
            transB.quaternion = capQ;
            let deep = this.gjkdist.getClosestPoint(transA, transB, hitpos, hit1, ni, justTest);
            if (deep >= 0) {
                if (justTest)
                    return true;
                let r = this.createContactEquation(boxBody, capBody, box, capsule, rsi, rsj);
                ni.negate(ni); // 
                r.ni.copy(ni);
                hitpos.vsub(boxBody.position, r.ri);
                hit1.vsub(capBody.position, r.rj);
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
                return true;
            }
            return false;
        }
        boxVoxel(box, voxel, pos1, pos2, q1, q2, body1, body2, rsi, rsj, justTest) {
            let hitpoints = [];
            let hit = box.hitVoxel(pos1, q1, voxel, pos2, q2, hitpoints, justTest);
            if (hit) {
                if (justTest)
                    return true;
                //let ni = Narrowphase.nor1;
                hitpoints.forEach(hit => {
                    //DEBUG
                    //let phyr = this.world._phyRender;
                    //phyr.addPersistPoint(hit.posi);
                    //phyr.addPersistPoint(hit.posj);
                    //phyr.addPersistVec(hit.normal, hit.posi);
                    //DEBUG
                    let r = this.createContactEquation(body1, body2, box, voxel, rsi, rsj);
                    //hit.normal.negate(r.ni);
                    r.ni.copy(hit.normal); // 现在的法线是推开voxel的， 所以不用取反
                    hit.posi.vsub(body1.position, r.ri);
                    hit.posj.vsub(body2.position, r.rj);
                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                });
                return true;
            }
            return false;
        }
        planeBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
            sj.convexPolyhedronRepresentation.material = sj.material;
            sj.convexPolyhedronRepresentation.collisionResponse = sj.collisionResponse;
            sj.convexPolyhedronRepresentation.id = sj.id;
            return this.planeConvex(si, sj.convexPolyhedronRepresentation, xi, xj, qi, qj, bi, bj, si, sj, justTest);
        }
        planeConvex(planeShape, convexShape, planePosition, convexPosition, planeQuat, convexQuat, planeBody, convexBody, si, sj, justTest) {
            // Simply return the points behind the plane.
            const worldVertex = planeConvex_v;
            const worldNormal = planeConvex_normal;
            worldNormal.set(0, 0, 1);
            planeQuat.vmult(worldNormal, worldNormal); // Turn normal according to plane orientation
            let hit = false;
            let numContacts = 0;
            const relpos = planeConvex_relpos;
            for (let i = 0; i !== convexShape.vertices.length; i++) {
                // Get world convex vertex
                worldVertex.copy(convexShape.vertices[i]);
                convexQuat.vmult(worldVertex, worldVertex);
                convexPosition.vadd(worldVertex, worldVertex);
                worldVertex.vsub(planePosition, relpos);
                const dot = worldNormal.dot(relpos);
                if (dot <= 0.0) {
                    if (justTest) {
                        return true;
                    }
                    hit = true;
                    const r = this.createContactEquation(planeBody, convexBody, planeShape, convexShape, si, sj);
                    // Get vertex position projected on plane
                    const projected = planeConvex_projected;
                    worldNormal.scale(worldNormal.dot(relpos), projected);
                    worldVertex.vsub(projected, projected);
                    projected.vsub(planePosition, r.ri); // From plane to vertex projected on plane
                    r.ni.copy(worldNormal); // Contact normal is the plane normal out from plane
                    // rj is now just the vector from the convex center to the vertex
                    worldVertex.vsub(convexPosition, r.rj);
                    // Make it relative to the body
                    r.ri.vadd(planePosition, r.ri);
                    r.ri.vsub(planeBody.position, r.ri);
                    r.rj.vadd(convexPosition, r.rj);
                    r.rj.vsub(convexBody.position, r.rj);
                    this.result.push(r);
                    numContacts++;
                    if (!this.enableFrictionReduction) {
                        this.createFrictionEquationsFromContact(r, this.frictionResult);
                    }
                }
            }
            if (this.enableFrictionReduction && numContacts) {
                this.createFrictionFromAverage(numContacts);
            }
            return hit;
        }
        convexConvex(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest, faceListA = null, faceListB = null) {
            const sepAxis = convexConvex_sepAxis;
            if (xi.distanceTo(xj) > si.boundSphR + sj.boundSphR) {
                return false;
            }
            let hit = false;
            if (si.findSeparatingAxis(sj, xi, qi, xj, qj, sepAxis, faceListA, faceListB)) {
                const res = [];
                const q = convexConvex_q;
                si.clipAgainstHull(xi, qi, sj, xj, qj, sepAxis, -100, 100, res);
                let numContacts = 0;
                for (let j = 0; j !== res.length; j++) {
                    if (justTest) {
                        return true;
                    }
                    hit = true;
                    const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                    const ri = r.ri;
                    const rj = r.rj;
                    sepAxis.negate(r.ni);
                    res[j].normal.negate(q);
                    q.scale(res[j].depth, q);
                    res[j].point.vadd(q, ri);
                    rj.copy(res[j].point);
                    // Contact points are in world coordinates. Transform back to relative
                    ri.vsub(xi, ri);
                    rj.vsub(xj, rj);
                    // Make relative to bodies
                    ri.vadd(xi, ri);
                    ri.vsub(bi.position, ri);
                    rj.vadd(xj, rj);
                    rj.vsub(bj.position, rj);
                    this.result.push(r);
                    numContacts++;
                    if (!this.enableFrictionReduction) {
                        this.createFrictionEquationsFromContact(r, this.frictionResult);
                    }
                }
                if (this.enableFrictionReduction && numContacts) {
                    this.createFrictionFromAverage(numContacts);
                }
            }
            return hit;
        }
        planeParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest) {
            const normal = particlePlane_normal;
            normal.set(0, 0, 1);
            bj.quaternion.vmult(normal, normal); // Turn normal according to plane orientation
            const relpos = particlePlane_relpos;
            xi.vsub(bj.position, relpos);
            const dot = normal.dot(relpos);
            if (dot <= 0.0) {
                if (justTest) {
                    return true;
                }
                const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                r.ni.copy(normal); // Contact normal is the plane normal
                r.ni.negate(r.ni);
                r.ri.set(0, 0, 0); // Center of particle
                // Get particle position projected on plane
                const projected = particlePlane_projected;
                normal.scale(normal.dot(xi), projected);
                xi.vsub(projected, projected);
                //projected.vadd(bj.position,projected);
                // rj is now the projected world position minus plane position
                r.rj.copy(projected);
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
                return true;
            }
            return false;
        }
        sphereParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest) {
            // The normal is the unit vector from sphere center to particle center
            const normal = particleSphere_normal;
            normal.set(0, 0, 1);
            xi.vsub(xj, normal);
            const lengthSquared = normal.lengthSquared();
            if (lengthSquared <= sj.radius * sj.radius) {
                if (justTest) {
                    return true;
                }
                const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                normal.normalize();
                r.rj.copy(normal);
                r.rj.scale(sj.radius, r.rj);
                r.ni.copy(normal); // Contact normal
                r.ni.negate(r.ni);
                r.ri.set(0, 0, 0); // Center of particle
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
                return true;
            }
            return false;
        }
        convexParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest) {
            let penetratedFaceIndex = -1;
            const penetratedFaceNormal = convexParticle_penetratedFaceNormal;
            const worldPenetrationVec = convexParticle_worldPenetrationVec;
            let minPenetration = null;
            //let numDetectedFaces = 0;
            let hit = false;
            // Convert particle position xi to local coords in the convex
            const local = convexParticle_local;
            local.copy(xi);
            local.vsub(xj, local); // Convert position to relative the convex origin
            qj.conjugate(cqj);
            cqj.vmult(local, local);
            if (sj.pointIsInside(local)) {
                if (sj.worldVerticesNeedsUpdate) {
                    sj.computeWorldVertices(xj, qj);
                }
                if (sj.worldFaceNormalsNeedsUpdate) {
                    sj.computeWorldFaceNormals(qj);
                }
                // For each world polygon in the polyhedra
                for (let i = 0, nfaces = sj.faces.length; i !== nfaces; i++) {
                    // Construct world face vertices
                    const verts = [sj.worldVertices[sj.faces[i][0]]];
                    const normal = sj.worldFaceNormals[i];
                    // Check how much the particle penetrates the polygon plane.
                    xi.vsub(verts[0], convexParticle_vertexToParticle);
                    const penetration = -normal.dot(convexParticle_vertexToParticle);
                    if (minPenetration === null || Math.abs(penetration) < Math.abs(minPenetration)) {
                        if (justTest) {
                            return true;
                        }
                        hit = true;
                        minPenetration = penetration;
                        penetratedFaceIndex = i;
                        penetratedFaceNormal.copy(normal);
                        //numDetectedFaces++;
                    }
                }
                if (penetratedFaceIndex !== -1) {
                    // Setup contact
                    const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                    penetratedFaceNormal.scale(minPenetration, worldPenetrationVec);
                    // rj is the particle position projected to the face
                    worldPenetrationVec.vadd(xi, worldPenetrationVec);
                    worldPenetrationVec.vsub(xj, worldPenetrationVec);
                    r.rj.copy(worldPenetrationVec);
                    //var projectedToFace = xi.vsub(xj).vadd(worldPenetrationVec);
                    //projectedToFace.copy(r.rj);
                    //qj.vmult(r.rj,r.rj);
                    penetratedFaceNormal.negate(r.ni); // Contact normal
                    r.ri.set(0, 0, 0); // Center of particle
                    const ri = r.ri;
                    const rj = r.rj;
                    // Make relative to bodies
                    ri.vadd(xi, ri);
                    ri.vsub(bi.position, ri);
                    rj.vadd(xj, rj);
                    rj.vsub(bj.position, rj);
                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                }
                else {
                    console.warn("Point found inside convex, but did not find penetrating face!");
                }
            }
            return hit;
        }
        convexHeightfield(convexShape, hfShape, convexPos, hfPos, convexQuat, hfQuat, convexBody, hfBody, rsi, rsj, justTest) {
            const data = hfShape.data;
            const w = hfShape.elementSize;
            const radius = convexShape.boundSphR;
            const worldPillarOffset = convexHeightfield_tmp2;
            const faceList = convexHeightfield_faceList;
            // Get sphere position to heightfield local!
            const localConvexPos = convexHeightfield_tmp1;
            Transform.pointToLocalFrame(hfPos, hfQuat, convexPos, localConvexPos);
            // Get the index of the data points to test against
            let iMinX = Math.floor((localConvexPos.x - radius) / w) - 1;
            let iMaxX = Math.ceil((localConvexPos.x + radius) / w) + 1;
            let iMinZ = Math.floor((localConvexPos.z - radius) / w) - 1;
            let iMaxZ = Math.ceil((localConvexPos.z + radius) / w) + 1;
            // Bail out if we are out of the terrain
            if (iMaxX < 0 || iMaxZ < 0 || iMinX > data.length || iMinZ > data[0].length) {
                return false;
            }
            // Clamp index to edges
            if (iMinX < 0) {
                iMinX = 0;
            }
            if (iMaxX < 0) {
                iMaxX = 0;
            }
            if (iMinZ < 0) {
                iMinZ = 0;
            }
            if (iMaxZ < 0) {
                iMaxZ = 0;
            }
            if (iMinX >= data[0].length) {
                iMinX = data[0].length - 1;
            }
            if (iMaxX >= data[0].length) {
                iMaxX = data[0].length - 1;
            }
            if (iMaxZ >= data.length) {
                iMaxZ = data.length - 1;
            }
            if (iMinZ >= data.length) {
                iMinZ = data.length - 1;
            }
            const minMax = [];
            hfShape.getRectMinMax(iMinX, iMinZ, iMaxX, iMaxZ, minMax);
            const min = minMax[0];
            const max = minMax[1];
            // Bail out if we're cant touch the bounding height box
            if (localConvexPos.y - radius > max || localConvexPos.y + radius < min) {
                return false;
            }
            let hit = false;
            for (let j = iMinZ; j < iMaxZ; j++) {
                for (let i = iMinX; i < iMaxX; i++) {
                    let intersecting = false;
                    // Lower triangle
                    hfShape.getConvexTrianglePillar(i, j, false);
                    Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);
                    if (convexPos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundSphR + convexShape.boundSphR) {
                        intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexPos, worldPillarOffset, convexQuat, hfQuat, convexBody, hfBody, null, null, justTest, faceList, null);
                    }
                    if (justTest && intersecting) {
                        return true;
                    }
                    hit = hit || intersecting;
                    // Upper triangle
                    hfShape.getConvexTrianglePillar(i, j, true);
                    Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);
                    if (convexPos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundSphR + convexShape.boundSphR) {
                        intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexPos, worldPillarOffset, convexQuat, hfQuat, convexBody, hfBody, null, null, justTest, faceList, null);
                    }
                    hit = hit || intersecting;
                    if (justTest && intersecting) {
                        return true;
                    }
                }
            }
            return hit;
        }
        boxHeightfield(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
            si.convexPolyhedronRepresentation.material = si.material;
            si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
            return this.convexHeightfield(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
        }
        sphereHeightfield(sphereShape, hfShape, spherePos, hfPos, sphereQuat, hfQuat, sphereBody, hfBody, rsi, rsj, justTest) {
            const data = hfShape.data;
            const radius = sphereShape.radius;
            const w = hfShape.elementSize;
            const worldPillarOffset = sphereHeightfield_tmp2;
            // Get sphere position to heightfield local!
            const localSpherePos = sphereHeightfield_tmp1;
            Transform.pointToLocalFrame(hfPos, hfQuat, spherePos, localSpherePos); //sphere转换到hf空间
            // Get the index of the data points to test against
            // sphere覆盖的范围
            let iMinX = Math.floor((localSpherePos.x - radius) / w) - 1;
            let iMaxX = Math.ceil((localSpherePos.x + radius) / w) + 1;
            let iMinZ = Math.floor((localSpherePos.z - radius) / w) - 1;
            let iMaxZ = Math.ceil((localSpherePos.z + radius) / w) + 1;
            // Bail out if we are out of the terrain
            // 投影本身在格子外面
            if (iMaxX < 0 || iMaxZ < 0 || iMinX > data[0].length || iMaxZ > data.length) {
                return false;
            }
            // Clamp index to edges
            if (iMinX < 0) {
                iMinX = 0;
            }
            if (iMaxX < 0) {
                iMaxX = 0;
            }
            if (iMinZ < 0) {
                iMinZ = 0;
            }
            if (iMaxZ < 0) {
                iMaxZ = 0;
            }
            if (iMinX >= data[0].length) {
                iMinX = data[0].length - 1;
            }
            if (iMaxX >= data[0].length) {
                iMaxX = data[0].length - 1;
            }
            if (iMaxZ >= data.length) {
                iMaxZ = data.length - 1;
            }
            if (iMinZ >= data.length) {
                iMinZ = data.length - 1;
            }
            const minMax = [];
            hfShape.getRectMinMax(iMinX, iMinZ, iMaxX, iMaxZ, minMax);
            const min = minMax[0];
            const max = minMax[1];
            // Bail out if we're cant touch the bounding height box
            if (localSpherePos.y - radius > max || localSpherePos.y + radius < min) {
                return false;
            }
            let hit = false;
            const result = this.result;
            for (let j = iMinZ; j < iMaxZ; j++) {
                for (let i = iMinX; i < iMaxX; i++) {
                    const numContactsBefore = result.length;
                    let intersecting = false;
                    // Lower triangle
                    hfShape.getConvexTrianglePillar(i, j, false);
                    // 把convex的offset点转换到世界空间
                    Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);
                    if (spherePos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundSphR + sphereShape.boundSphR) {
                        intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, spherePos, worldPillarOffset, sphereQuat, hfQuat, sphereBody, hfBody, sphereShape, hfShape, justTest);
                    }
                    hit = hit || intersecting;
                    if (justTest && intersecting) {
                        return true;
                    }
                    // Upper triangle
                    hfShape.getConvexTrianglePillar(i, j, true);
                    Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);
                    if (spherePos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundSphR + sphereShape.boundSphR) {
                        intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, spherePos, worldPillarOffset, sphereQuat, hfQuat, sphereBody, hfBody, sphereShape, hfShape, justTest);
                    }
                    hit = hit || intersecting;
                    if (justTest && intersecting) {
                        return true;
                    }
                    const numContacts = result.length - numContactsBefore;
                    if (numContacts > 2) {
                        return true;
                    }
                    /*
                    // Skip all but 1
                    for (var k = 0; k < numContacts - 1; k++) {
                        result.pop();
                    }
                    */
                }
            }
            return hit;
        }
    }
    Narrowphase.nor1 = new Vec3();
    Narrowphase.trans1 = new Transform();
    Narrowphase.trans2 = new Transform();
    var averageNormal = new Vec3();
    var averageContactPointA = new Vec3();
    var averageContactPointB = new Vec3();
    var tmpVec1$5 = new Vec3();
    var tmpVec2$5 = new Vec3();
    var tmpQuat1 = new Quaternion();
    var tmpQuat2 = new Quaternion();
    var Cap_Cap_tmpV1 = new Vec3();
    const planeTrimesh_normal = new Vec3();
    const planeTrimesh_relpos = new Vec3();
    const planeTrimesh_projected = new Vec3();
    const sphereTrimesh_normal = new Vec3();
    const sphereTrimesh_relpos = new Vec3();
    //const sphereTrimesh_projected = new Vec3();
    const sphereTrimesh_v = new Vec3();
    const sphereTrimesh_v2 = new Vec3();
    const sphereTrimesh_edgeVertexA = new Vec3();
    const sphereTrimesh_edgeVertexB = new Vec3();
    const sphereTrimesh_edgeVector = new Vec3();
    const sphereTrimesh_edgeVectorUnit = new Vec3();
    const sphereTrimesh_localSpherePos = new Vec3();
    const sphereTrimesh_tmp = new Vec3();
    const sphereTrimesh_va = new Vec3();
    const sphereTrimesh_vb = new Vec3();
    const sphereTrimesh_vc = new Vec3();
    const sphereTrimesh_localSphereAABB = new AABB();
    const sphereTrimesh_triangles = []; // i16?
    const point_on_plane_to_sphere = new Vec3();
    const plane_to_sphere_ortho = new Vec3();
    // See http://bulletphysics.com/Bullet/BulletFull/SphereTriangleDetector_8cpp_source.html
    const pointInPolygon_edge = new Vec3();
    const pointInPolygon_edge_x_normal = new Vec3();
    const pointInPolygon_vtp = new Vec3();
    function pointInPolygon(verts, normal, p) {
        let positiveResult = null;
        const N = verts.length;
        for (let i = 0; i !== N; i++) {
            const v = verts[i];
            // Get edge to the next vertex
            const edge = pointInPolygon_edge;
            verts[(i + 1) % (N)].vsub(v, edge);
            // Get cross product between polygon normal and the edge
            const edge_x_normal = pointInPolygon_edge_x_normal;
            //var edge_x_normal = new Vec3();
            edge.cross(normal, edge_x_normal);
            // Get vector between point and current vertex
            const vertex_to_p = pointInPolygon_vtp;
            p.vsub(v, vertex_to_p);
            // This dot product determines which side of the edge the point is
            const r = edge_x_normal.dot(vertex_to_p);
            // If all such dot products have same sign, we are inside the polygon.
            if (positiveResult === null || (r > 0 && positiveResult === true) || (r <= 0 && positiveResult === false)) {
                if (positiveResult === null) {
                    positiveResult = r > 0;
                }
                continue;
            }
            else {
                return false; // Encountered some other sign. Exit.
            }
        }
        // If we got here, all dot products were of the same sign.
        return true;
    }
    const box_to_sphere$1 = new Vec3();
    const sphereBox_ns = new Vec3();
    const sphereBox_ns1 = new Vec3();
    const sphereBox_ns2 = new Vec3();
    const sphereBox_sides = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
    const sphereBox_sphere_to_corner = new Vec3();
    const sphereBox_side_ns = new Vec3();
    const sphereBox_side_ns1 = new Vec3();
    const sphereBox_side_ns2 = new Vec3();
    const convex_to_sphere = new Vec3();
    const sphereConvex_edge = new Vec3();
    const sphereConvex_edgeUnit = new Vec3();
    const sphereConvex_sphereToCorner = new Vec3();
    const sphereConvex_worldCorner = new Vec3();
    const sphereConvex_worldNormal = new Vec3();
    const sphereConvex_worldPoint = new Vec3();
    const sphereConvex_worldSpherePointClosestToPlane = new Vec3();
    const sphereConvex_penetrationVec = new Vec3();
    const sphereConvex_sphereToWorldPoint = new Vec3();
    //const planeBox_normal = new Vec3();
    //const plane_to_corner = new Vec3();
    const planeConvex_v = new Vec3();
    const planeConvex_normal = new Vec3();
    const planeConvex_relpos = new Vec3();
    const planeConvex_projected = new Vec3();
    const convexConvex_sepAxis = new Vec3();
    const convexConvex_q = new Vec3();
    // Narrowphase.prototype[SHAPETYPE.CONVEXPOLYHEDRON | SHAPETYPE.TRIMESH] =
    // Narrowphase.prototype.convexTrimesh = function(si,sj,xi,xj,qi,qj,bi,bj,rsi,rsj,faceListA,faceListB){
    //     var sepAxis = convexConvex_sepAxis;
    //     if(xi.distanceTo(xj) > si.boundingSphereRadius + sj.boundingSphereRadius){
    //         return;
    //     }
    //     // Construct a temp hull for each triangle
    //     var hullB = new ConvexPolyhedron();
    //     hullB.faces = [[0,1,2]];
    //     var va = new Vec3();
    //     var vb = new Vec3();
    //     var vc = new Vec3();
    //     hullB.vertices = [
    //         va,
    //         vb,
    //         vc
    //     ];
    //     for (var i = 0; i < sj.indices.length / 3; i++) {
    //         var triangleNormal = new Vec3();
    //         sj.getNormal(i, triangleNormal);
    //         hullB.faceNormals = [triangleNormal];
    //         sj.getTriangleVertices(i, va, vb, vc);
    //         var d = si.testSepAxis(triangleNormal, hullB, xi, qi, xj, qj);
    //         if(!d){
    //             triangleNormal.scale(-1, triangleNormal);
    //             d = si.testSepAxis(triangleNormal, hullB, xi, qi, xj, qj);
    //             if(!d){
    //                 continue;
    //             }
    //         }
    //         var res = [];
    //         var q = convexConvex_q;
    //         si.clipAgainstHull(xi,qi,hullB,xj,qj,triangleNormal,-100,100,res);
    //         for(var j = 0; j !== res.length; j++){
    //             var r = this.createContactEquation(bi,bj,si,sj,rsi,rsj),
    //                 ri = r.ri,
    //                 rj = r.rj;
    //             r.ni.copy(triangleNormal);
    //             r.ni.negate(r.ni);
    //             res[j].normal.negate(q);
    //             q.mult(res[j].depth, q);
    //             res[j].point.vadd(q, ri);
    //             rj.copy(res[j].point);
    //             // Contact points are in world coordinates. Transform back to relative
    //             ri.vsub(xi,ri);
    //             rj.vsub(xj,rj);
    //             // Make relative to bodies
    //             ri.vadd(xi, ri);
    //             ri.vsub(bi.position, ri);
    //             rj.vadd(xj, rj);
    //             rj.vsub(bj.position, rj);
    //             result.push(r);
    //         }
    //     }
    // };
    const particlePlane_normal = new Vec3();
    const particlePlane_relpos = new Vec3();
    const particlePlane_projected = new Vec3();
    const particleSphere_normal = new Vec3();
    // WIP
    const cqj = new Quaternion();
    const convexParticle_local = new Vec3();
    //const convexParticle_normal = new Vec3();
    const convexParticle_penetratedFaceNormal = new Vec3();
    const convexParticle_vertexToParticle = new Vec3();
    const convexParticle_worldPenetrationVec = new Vec3();
    const convexHeightfield_tmp1 = new Vec3();
    const convexHeightfield_tmp2 = new Vec3();
    const convexHeightfield_faceList = [0];
    const sphereHeightfield_tmp1 = new Vec3();
    const sphereHeightfield_tmp2 = new Vec3();

    /**
     * 管理场景中的互相关联的都处于sleep状态的对象组
     * TODO
     * 	动态对象不可能在空中sleep，所以一定要记录并维持之前的碰撞对象，只要不是与static对象碰撞，都不允许一个iso只有一个对象
     */
    class IsolateManager {
        constructor() {
            this.isolates = [];
        }
        addSleepObj(b) {
        }
        wakeupObj(b) {
        }
    }

    /**
     * Base class for broadphase implementations
     * @class Broadphase
     * @constructor
     * @author schteppe
     */
    class Broadphase {
        constructor() {
            /**
             * If set to true, the broadphase uses bounding boxes for intersection test, else it uses bounding spheres.
             */
            this.useBoundingBoxes = false;
            /**
             * Set to true if the objects in the world moved.
             */
            this.dirty = true;
        }
        /**
         * Check if a body pair needs to be intersection tested at all.
         */
        needBroadphaseCollision(bodyA, bodyB) {
            if (!bodyA.enable || !bodyB.enable)
                return false;
            // Check collision filter masks
            if ((bodyA.collisionFilterGroup & bodyB.collisionFilterMask) === 0 || (bodyB.collisionFilterGroup & bodyA.collisionFilterMask) === 0) {
                return false;
            }
            // Check types
            if (((bodyA.type & 2 /* STATIC */) !== 0 || bodyA.sleepState === 2 /* SLEEPING */) &&
                ((bodyB.type & 2 /* STATIC */) !== 0 || bodyB.sleepState === 2 /* SLEEPING */)) {
                // Both bodies are static or sleeping. Skip.
                return false;
            }
            return true;
        }
        /**
         * Check if the bounding volumes of two bodies intersect.
          */
        intersectionTest(bodyA, bodyB, pairs1, pairs2) {
            if (this.useBoundingBoxes) {
                this.doBoundingBoxBroadphase(bodyA, bodyB, pairs1, pairs2);
            }
            else {
                this.doBoundingSphereBroadphase(bodyA, bodyB, pairs1, pairs2);
            }
        }
        /**
         * Check if the bounding spheres of two bodies are intersecting.
         */
        doBoundingSphereBroadphase(bodyA, bodyB, pairs1, pairs2) {
            const r = Broadphase_collisionPairs_r;
            bodyB.position.vsub(bodyA.position, r);
            const boundingRadiusSum2 = (bodyA.boundingRadius + bodyB.boundingRadius) ** 2;
            const norm2 = r.lengthSquared();
            if (norm2 < boundingRadiusSum2) {
                pairs1.push(bodyA);
                pairs2.push(bodyB);
            }
        }
        /**
         * Check if the bounding boxes of two bodies are intersecting.
         */
        doBoundingBoxBroadphase(bodyA, bodyB, pairs1, pairs2) {
            if (bodyA.aabbNeedsUpdate) {
                bodyA.updateAABB();
            }
            if (bodyB.aabbNeedsUpdate) {
                bodyB.updateAABB();
            }
            // Check AABB / AABB
            if (bodyA.aabb.overlaps(bodyB.aabb)) {
                pairs1.push(bodyA);
                pairs2.push(bodyB);
            }
        }
        /**
         * Removes duplicate pairs from the pair arrays.
         */
        makePairsUnique(pairs1, pairs2) {
            const t = Broadphase_makePairsUnique_temp;
            const p1 = Broadphase_makePairsUnique_p1;
            const p2 = Broadphase_makePairsUnique_p2;
            const N = pairs1.length;
            for (var i = 0; i !== N; i++) {
                p1[i] = pairs1[i];
                p2[i] = pairs2[i];
            }
            pairs1.length = 0;
            pairs2.length = 0;
            for (var i = 0; i !== N; i++) {
                const id1 = p1[i].id;
                const id2 = p2[i].id;
                var key = id1 < id2 ? `${id1},${id2}` : `${id2},${id1}`;
                t[key] = i;
                t.keys.push(key);
            }
            for (var i = 0; i !== t.keys.length; i++) {
                const key = t.keys.pop();
                const pairIndex = t[key];
                pairs1.push(p1[pairIndex]);
                pairs2.push(p2[pairIndex]);
                delete t[key];
            }
        }
        /**
         * To be implemented by subcasses
         */
        setWorld(world) {
        }
        /**
         * Returns all the bodies within the AABB.
         */
        aabbQuery(world, aabb, result) {
            console.warn('.aabbQuery is not implemented in this Broadphase subclass.');
            return [];
        }
        sphereQuery(world, pos, radius, result) {
            console.warn('.sphereQuery is not implemented in this Broadphase subclass.');
            return [];
        }
        /**
         * Check if the bounding spheres of two bodies overlap.
         * 检查两个body的包围球是否碰撞
         */
        static boundingSphereCheck(bodyA, bodyB) {
            throw 'compile err'; // 编译有错误，先注掉
            //var dist = bsc_dist;
            //bodyA.position.vsub(bodyB.position, dist);
            //return Math.pow(bodyA.shape.boundingSphereRadius + bodyB.shape.boundingSphereRadius, 2) > dist.lengthSquared();
        }
    }
    // Temp objects
    var Broadphase_collisionPairs_r = new Vec3();
    //const Broadphase_collisionPairs_normal = new Vec3();
    //const Broadphase_collisionPairs_quat = new Quaternion();
    //const Broadphase_collisionPairs_relpos = new Vec3();
    var Broadphase_makePairsUnique_temp = { keys: [] };
    var Broadphase_makePairsUnique_p1 = [];
    var Broadphase_makePairsUnique_p2 = [];
    //const bsc_dist = new Vec3();

    var tmpVec1$6 = new Vec3();
    /**
     * Naive broadphase implementation, used in lack of better ones.
     * @description The naive broadphase looks at all possible pairs without restriction, therefore it has complexity N^2 (which is bad)
     */
    class NaiveBroadphase extends Broadphase {
        constructor() {
            super();
        }
        /**
         * Get all the collision pairs in the physics world
         */
        collisionPairs(world, pairs1, pairs2) {
            const bodies = world.bodies;
            const n = bodies.length;
            let i;
            let j;
            let bi;
            let bj;
            // Naive N^2 ftw!
            for (i = 0; i !== n; i++) {
                for (j = 0; j !== i; j++) {
                    bi = bodies[i];
                    bj = bodies[j];
                    if (!this.needBroadphaseCollision(bi, bj)) {
                        continue;
                    }
                    this.intersectionTest(bi, bj, pairs1, pairs2);
                }
            }
        }
        /**
         * Returns all the bodies within an AABB.
         * @param result An array to store resulting bodies in.
         */
        aabbQuery(world, aabb, result = []) {
            let bodies = world.bodies;
            for (let i = 0; i < bodies.length; i++) {
                const b = bodies[i];
                if (b.aabbNeedsUpdate) {
                    b.updateAABB();
                }
                // Ugly hack until Body gets aabb
                if (b.aabb.overlaps(aabb)) {
                    result.push(b);
                }
            }
            return result;
        }
        sphereQuery(world, pos, radius, result = []) {
            let bodies = world.bodies;
            let rr = radius * radius;
            for (let i = 0; i < bodies.length; i++) {
                const b = bodies[i];
                // 先用最简单，最不精确的方法做
                b.position.vsub(pos, tmpVec1$6);
                if (tmpVec1$6.lengthSquared() < rr) {
                    result.push(b);
                }
            }
            return result;
        }
    }

    class profileData {
        constructor() {
            this.frametm = 0; // 帧时间
            this.broadphase = 0; // 宽阶段碰撞检测的时间
            this.narrowphase = 0; // 窄阶段碰撞检测的时间
            this.integrate = 0;
            this.solve = 0; // solve时间
            this.makeContactConstraints = 0;
            this.error = 0; // 总误差
            this.avgErr = 0; // 平均每个对象的误差
        }
    }
    let perfNow;
    try {
        perfNow = performance.now;
    }
    catch (e) {
        perfNow = Date.now;
    }
    class PhyEvent {
        constructor(name) {
            this.type = name;
        }
    }
    class AddBodyEvent extends PhyEvent {
        constructor(body) {
            super('addBody');
            this.body = body;
        }
    }
    class RemoveBodyEvent extends PhyEvent {
        constructor(body) {
            super('removeBody');
            this.body = body;
        }
    }
    class PhyCollideEvent extends PhyEvent {
        constructor(name, body, c) {
            super(name);
            this.otherBody = body;
            this.contact = c;
        }
    }
    var collideEnterEvt = new PhyCollideEvent(Body.EVENT_COLLIDE_ENTER, null, null);
    var collideExitEvt = new PhyCollideEvent(Body.EVENT_COLLIDE_EXIT, null, null);
    // Temp stuff
    var tmpRay = new Ray();
    var 
    /**
     * Dispatched after the world has stepped forward in time.
     * @event postStep
     */
    World_step_postStepEvent = { type: "postStep" }, // Reusable event objects to save memory
    /**
     * Dispatched before the world steps forward in time.
     * @event preStep
     */
    World_step_preStepEvent = new PhyEvent("preStep"), 
    //World_step_collideEvent = new PhyCollideEvent( Body.COLLIDE_EVENT_NAME, null, null ),
    World_step_oldContacts = [], // Pools for unused objects
    World_step_frictionEquationPool = [], World_step_p1 = [], // Reusable arrays for collision pairs
    World_step_p2 = [];
    class IPhyRender {
    }
    var PhyrInst;
    function setPhyRender(r) {
        PhyrInst = r;
        window.phyr = r;
    }
    function getPhyRender() {
        return PhyrInst;
    }
    /**
     * The physics world
     */
    class World extends EventTarget {
        constructor(options) {
            super();
            /**
             * Currently / last used timestep. Is set to -1 if not available. This value is updated before each internal step, which means that it is "fresh" inside event callbacks.
             */
            this.dt = -1;
            /**
             * Makes bodies go to sleep when they've been inactive
             */
            this.allowSleep = true;
            /**
             * All the current contacts (instances of ContactEquation) in the world.
             */
            this.contacts = [];
            this.frictionEquations = [];
            /**
             * How often to normalize quaternions. Set to 0 for every step, 1 for every second etc.. A larger value increases performance. If bodies tend to explode, set to a smaller value (zero to be sure nothing can go wrong).
             */
            this.quatNormalizeSkip = 0;
            /**
             * Set to true to use fast quaternion normalization. It is often enough accurate to use. If bodies tend to explode, set to false.
             * @see Quaternion.normalizeFast
             * @see Quaternion.normalize
             */
            this.quatNormalizeFast = false;
            /**
             * The wall-clock time since simulation start
             * 物理系统累计时间
             */
            this.time = 0.0;
            /**
             * Number of timesteps taken since start
             */
            this.stepnumber = 0;
            /** step 实际经历的时间，因为可能有多个internalstep */
            this.stepTime = 0;
            /// Default and last timestep sizes
            this.default_dt = 1 / 60;
            this.nextId = 0;
            this.gravity = new Vec3();
            /**
             * The broadphase algorithm to use. Default is NaiveBroadphase
             */
            this.broadphase = new NaiveBroadphase(); // new GridBroadphase(); Grid的有问题
            /**
             * @property bodies
             */
            this.bodies = [];
            /**
             * The solver algorithm to use. Default is GSSolver
             */
            this.solver = new GSSolver();
            this.constraints = [];
            this.narrowphase = new Narrowphase(this);
            /** 当前帧的collisionMatrix */
            //collisionMatrix = new ArrayCollisionMatrix();
            /**
             * CollisionMatrix from the previous step.
             * 上一帧的collisionMatrix
             */
            //collisionMatrixPrevious = new ArrayCollisionMatrix();
            //bodyOverlapKeeper = new OverlapKeeper();
            //shapeOverlapKeeper = new OverlapKeeper();
            /**
             * All added materials
             */
            this.materials = [];
            /**
             * 接触材质，发生碰撞后，根据a，b的材质，到这里找对应的接触材质
             */
            this.contactmaterials = [];
            /**
             * Used to look up a ContactMaterial given two instances of Material.
             */
            this.contactMaterialTable = new TupleDictionary();
            this.defaultMaterial = new Material("default");
            this.tempMaterial = new ContactMaterial(null, null, 0, 0); // 角色控制用，根据角色材质返回一个临时材质
            /**
             * This contact material is used if no suitable contactmaterial is found for a contact.
             * 缺省材质
             */
            this.defaultContactMaterial = new ContactMaterial(this.defaultMaterial, this.defaultMaterial, 0.3, 0.0);
            this.doProfiling = false;
            this.profile = new profileData();
            /**
             * Time accumulator for interpolation. See http://gafferongames.com/game-physics/fix-your-timestep/
             */
            this.accumulator = 0; //秒
            this.subsystems = [];
            /**
             * Dispatched after a body has been added to the world.
             */
            this.addBodyEvent = new AddBodyEvent(null);
            /**
             * Dispatched after a body has been removed from the world.
             * @param  body The body that has been removed from the world.
             */
            this.removeBodyEvent = new RemoveBodyEvent(null);
            this.idToBodyMap = {};
            /**
             * 没有动态的，则不计算。只要有一次加过动态的，就算
             */
            this._noDynamic = true;
            this._pause = false;
            options = options || {};
            this.allowSleep = !!options.allowSleep;
            this.quatNormalizeSkip = options.quatNormalizeSkip !== undefined ? options.quatNormalizeSkip : 0;
            this.quatNormalizeFast = options.quatNormalizeFast !== undefined ? options.quatNormalizeFast : false;
            if (options.gravity) {
                this.gravity.copy(options.gravity);
            }
            options.broadphase !== undefined && (this.broadphase = options.broadphase);
            options.solver !== undefined && (this.solver = options.solver);
            this.broadphase.setWorld(this);
        }
        set phyRender(r) {
            this._phyRender = r;
            this.solver._phyr = r;
        }
        get phyRender() {
            return this._phyRender;
        }
        /**
         * 接触事件
         */
        /*
        emitContactEvents() {
            var hasBeginContact = this.hasAnyEventListener('beginContact');
            var hasEndContact = this.hasAnyEventListener('endContact');

            if (hasBeginContact || hasEndContact) {
                this.bodyOverlapKeeper.getDiff(additions, removals);
            }

            // body开始接触事件
            if (hasBeginContact) {
                for (var i = 0, l = additions.length; i < l; i += 2) {
                    beginContactEvent.bodyA = this.getBodyById(additions[i]);
                    beginContactEvent.bodyB = this.getBodyById(additions[i + 1]);
                    this.dispatchEvent(beginContactEvent);
                }
                beginContactEvent.bodyA = beginContactEvent.bodyB = null;
            }

            // body结束接触事件
            if (hasEndContact) {
                for (var i = 0, l = removals.length; i < l; i += 2) {
                    endContactEvent.bodyA = this.getBodyById(removals[i]);
                    endContactEvent.bodyB = this.getBodyById(removals[i + 1]);
                    this.dispatchEvent(endContactEvent);
                }
                endContactEvent.bodyA = endContactEvent.bodyB = null;
            }

            additions.length = removals.length = 0;

            var hasBeginShapeContact = this.hasAnyEventListener('beginShapeContact');
            var hasEndShapeContact = this.hasAnyEventListener('endShapeContact');

            if (hasBeginShapeContact || hasEndShapeContact) {
                this.shapeOverlapKeeper.getDiff(additions, removals);
            }

            // shape开始接触事件
            if (hasBeginShapeContact) {
                for (var i = 0, l = additions.length; i < l; i += 2) {
                    var shapeA = this.getShapeById(additions[i]);
                    var shapeB = this.getShapeById(additions[i + 1]);
                    beginShapeContactEvent.shapeA = shapeA;
                    beginShapeContactEvent.shapeB = shapeB;
                    beginShapeContactEvent.bodyA = shapeA && shapeA.body;
                    beginShapeContactEvent.bodyB = shapeB && shapeB.body;
                    this.dispatchEvent(beginShapeContactEvent);
                }
                beginShapeContactEvent.bodyA = beginShapeContactEvent.bodyB = beginShapeContactEvent.shapeA = beginShapeContactEvent.shapeB = null;
            }

            // shape结束接触事件
            if (hasEndShapeContact) {
                for (var i = 0, l = removals.length; i < l; i += 2) {
                    var shapeA = this.getShapeById(removals[i]);
                    var shapeB = this.getShapeById(removals[i + 1]);
                    endShapeContactEvent.shapeA = shapeA;
                    endShapeContactEvent.shapeB = shapeB;
                    endShapeContactEvent.bodyA = shapeA && shapeA.body;
                    endShapeContactEvent.bodyB = shapeB && shapeB.body;
                    this.dispatchEvent(endShapeContactEvent);
                }
                endShapeContactEvent.bodyA = endShapeContactEvent.bodyB = endShapeContactEvent.shapeA = endShapeContactEvent.shapeB = null;
            }

        }
        */
        /**
         * Sets all body forces in the world to zero.
         */
        clearForces() {
            var bodies = this.bodies;
            var N = bodies.length;
            for (var i = 0; i !== N; i++) {
                var b = bodies[i], force = b.force, tau = b.torque;
                force.set(0, 0, 0);
                tau.set(0, 0, 0);
            }
        }
        /**
         * Get the contact material between materials m1 and m2
         * @return The contact material if it was found.
         */
        getContactMaterial(m1, m2) {
            let ret = this.contactMaterialTable.get(m1.id, m2.id); //this.contactmaterials[this.mats2cmat[i+j*this.materials.length]];
            if (!ret) {
                // 临时合并出一个
                let useMtl = null;
                if (m1.friction == Material.infiniteFriction)
                    useMtl = m1;
                else if (m2.friction == Material.infiniteFriction)
                    useMtl = m2;
                if (useMtl) {
                    this.tempMaterial.friction = 1;
                    this.tempMaterial.restitution = useMtl.restitution;
                    return this.tempMaterial;
                }
            }
            return ret;
        }
        /**
         * Get number of objects in the world.
         * @deprecated
         */
        numObjects() {
            return this.bodies.length;
        }
        /**
         * Store old collision state info
         * @method collisionMatrixTick
         */
        collisionMatrixTick() {
            //var temp = this.collisionMatrixPrevious;
            //this.collisionMatrixPrevious = this.collisionMatrix;
            //this.collisionMatrix = temp;
            //this.collisionMatrix.reset();
            //this.bodyOverlapKeeper.tick();
            //this.shapeOverlapKeeper.tick();
        }
        /**
         * Add a rigid body to the simulation.
         * @todo If the simulation has not yet started, why recrete and copy arrays for each body? Accumulate in dynamic arrays in this case.
         * @todo Adding an array of bodies should be possible. This would save some loops too
         * @deprecated Use .addBody instead
         */
        addBody(body) {
            if (this.bodies.indexOf(body) !== -1) {
                return;
            }
            body.index = this.bodies.length;
            this.bodies.push(body);
            body.world = this;
            body.initPosition.copy(body.position);
            body.initVelocity.copy(body.velocity);
            body.timeLastSleepy = this.time;
            if (body) {
                body.initAngularVelocity.copy(body.angularVelocity);
                //body.initQuaternion.copy(body.quaternion);
            }
            //this.collisionMatrix.setNumObjects(this.bodies.length);
            this.addBodyEvent.body = body;
            this.idToBodyMap[body.id] = body;
            if (body.type == 1 /* DYNAMIC */) {
                this._noDynamic = false;
            }
            this.dispatchEvent(this.addBodyEvent);
        }
        /**
         * Add a constraint to the simulation.
         */
        addConstraint(c) {
            this.constraints.push(c);
        }
        /**
         * Removes a constraint
         */
        removeConstraint(c) {
            var idx = this.constraints.indexOf(c);
            if (idx !== -1) {
                this.constraints.splice(idx, 1);
            }
        }
        /**
         * Raycast test
         * @deprecated Use .raycastAll, .raycastClosest or .raycastAny instead.
         */
        rayTest(from, to, result) {
            if (result instanceof RaycastResult) {
                // Do raycastclosest
                this.raycastClosest(from, to, {
                    skipBackfaces: true
                }, result);
            }
            else {
                // Do raycastAll
                this.raycastAll(from, to, {
                    skipBackfaces: true
                }, result);
            }
        }
        /**
         * Ray cast against all bodies. The provided callback will be executed for each hit with a RaycastResult as single argument.
         * @method raycastAll
         * @param  {Object} options
         * @param  {number} [options.collisionFilterMask=-1]
         * @param  {number} [options.collisionFilterGroup=-1]
         * @param  {boolean} [options.skipBackfaces=false]
         * @param  {boolean} [options.checkCollisionResponse=true]
         * @param  {Function} callback
         * @return  True if any body was hit.
         */
        raycastAll(from, to, options, callback) {
            options.mode = 4 /* ALL */;
            options.from = from;
            options.to = to;
            options.callback = callback;
            return tmpRay.intersectWorld(this, options);
        }
        /**
         * Ray cast, and stop at the first result. Note that the order is random - but the method is fast.
         * @method raycastAny
         * @param  {Vec3} from
         * @param  {Vec3} to
         * @param  {Object} options
         * @param  {number} [options.collisionFilterMask=-1]
         * @param  {number} [options.collisionFilterGroup=-1]
         * @param  {boolean} [options.skipBackfaces=false]
         * @param  {boolean} [options.checkCollisionResponse=true]
         * @param  {RaycastResult} result
         * @return {boolean} True if any body was hit.
         */
        raycastAny(from, to, options, result) {
            options.mode = 2 /* ANY */;
            options.from = from;
            options.to = to;
            options.result = result;
            return tmpRay.intersectWorld(this, options);
        }
        /**
         * Ray cast, and return information of the closest hit.
         * @method raycastClosest
         * @param  {Vec3} from
         * @param  {Vec3} to
         * @param  {Object} options
         * @param  {number} [options.collisionFilterMask=-1]
         * @param  {number} [options.collisionFilterGroup=-1]
         * @param  {boolean} [options.skipBackfaces=false]
         * @param  {boolean} [options.checkCollisionResponse=true]
         * @param  {RaycastResult} result
         * @return  True if any body was hit.
         */
        raycastClosest(from, to, options, result) {
            options.mode = 1 /* CLOSEST */;
            options.from = from;
            options.to = to;
            options.result = result;
            return tmpRay.intersectWorld(this, options);
        }
        /**
         * Remove a rigid body from the simulation.
         * @method remove
         * @param {Body} body
         * @deprecated Use .removeBody instead
         */
        remove(body) {
            body.world = null;
            //var n = this.bodies.length - 1,
            var bodies = this.bodies, idx = bodies.indexOf(body);
            if (idx !== -1) {
                bodies.splice(idx, 1); // Todo: should use a garbage free method
                // Recompute index
                for (var i = 0; i !== bodies.length; i++) {
                    bodies[i].index = i;
                }
                //this.collisionMatrix.setNumObjects(n);
                this.removeBodyEvent.body = body;
                delete this.idToBodyMap[body.id];
                this.dispatchEvent(this.removeBodyEvent);
            }
        }
        /**
         * Remove a rigid body from the simulation.
         */
        //World.prototype.removeBody = World.prototype.remove;
        getBodyById(id) {
            return this.idToBodyMap[id];
        }
        // TODO Make a faster map
        getShapeById(id) {
            var bodies = this.bodies;
            for (var i = 0, bl = bodies.length; i < bl; i++) {
                var shapes = bodies[i].shapes;
                for (var j = 0, sl = shapes.length; j < sl; j++) {
                    var shape = shapes[j];
                    if (shape.id === id) {
                        return shape;
                    }
                }
            }
            return null;
        }
        /**
         * Adds a material to the World.
         * @todo Necessary?
         */
        addMaterial(m) {
            this.materials.push(m);
        }
        /**
         * Adds a contact material to the World
         * @method addContactMaterial
         * @param  cmat
         */
        addContactMaterial(cmat) {
            // Add contact material
            this.contactmaterials.push(cmat);
            // Add current contact material to the material table
            this.contactMaterialTable.set(cmat.materials[0].id, cmat.materials[1].id, cmat);
            return this;
        }
        /**
         * Step the physics world forward in time.
         *
         * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument.
         * The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
         *
         * @param dt                       The fixed time step size to use. 单位是秒
         * @param [timeSinceLastCalled]    The time elapsed since the function was last called. 如果为0则直接使用dt来计算，表示固定时间间隔
         * @param [maxSubSteps=10]         Maximum number of fixed steps to take per function call. 最大插值次数
         *
         * @example
         *     // fixed timestepping without interpolation
         *     world.step(1/60);
         */
        step(dt, timeSinceLastCalled = 0, maxSubSteps = 10) {
            if (this._noDynamic)
                return;
            if (this.phyRender) {
                this.phyRender.stepStart();
            }
            if (this._pause)
                return;
            if (timeSinceLastCalled === 0) { // Fixed, simple stepping
                this.internalStep(dt);
                // Increment time
                this.time += dt;
                this.stepTime = dt;
            }
            else {
                this.accumulator += timeSinceLastCalled; // 上次可能还有一部分时间没有处理，所以是 +=
                var substeps = 0;
                while (this.accumulator >= dt && substeps < maxSubSteps) {
                    // Do fixed steps to catch up
                    this.internalStep(dt);
                    this.accumulator -= dt;
                    substeps++;
                }
                this.stepTime = substeps * dt;
                // accumulator可能还剩一些
                /*
                var t = (this.accumulator % dt) / dt;
                for (var j = 0; j !== this.bodies.length; j++) {
                    var b = this.bodies[j];
                    b.previousPosition.lerp(b.position, t, b.interpolatedPosition); //  这个目前没有用上。
                    b.previousQuaternion.slerp(b.quaternion, t, b.interpolatedQuaternion);
                    b.previousQuaternion.normalize();
                }
                */
                this.time += timeSinceLastCalled;
            }
            if (this.phyRender) {
                this.phyRender.stepEnd();
            }
        }
        internalStep(dt) {
            this.dt = dt;
            var contacts = this.contacts, p1 = World_step_p1, p2 = World_step_p2, N = this.numObjects(), bodies = this.bodies, solver = this.solver, gravity = this.gravity, doProfiling = this.doProfiling, profile = this.profile, profilingStart = 0, constraints = this.constraints, frictionEquationPool = World_step_frictionEquationPool, 
            //gnorm:f32 = gravity.length(),
            gx = gravity.x, gy = gravity.y, gz = gravity.z, i = 0;
            if (doProfiling) {
                profilingStart = perfNow();
            }
            // Add gravity to all objects
            for (i = 0; i !== N; i++) {
                var bi = bodies[i];
                if (bi.enable) {
                    if (bi.type != 2 /* STATIC */)
                        bi.contact.newTick();
                    //temp
                    if (bi.preCollision) {
                        bi.preCollision();
                    }
                    if (bi.type == 4 /* KINEMATIC */ && bi.kinematicUsePos) {
                        //由于碰撞处理需要速度，如果kinematic没有速度的话，需要计算
                        bi.position.vsub(bi.previousPosition, bi.velocity);
                        bi.velocity.scale(1 / dt, bi.velocity); // TODO 如果插值多次会有问题么
                        // bi.quaternion; 旋转先不管，必须通过设置角速度来达到效果
                    }
                    //temp
                    if (bi.type === 1 /* DYNAMIC */) { // static和kinematic的不响应受力的
                        var f = bi.force, m = bi._mass;
                        let bg = bi.bodyGravity;
                        if (bg) {
                            f.x += m * bg.x;
                            f.y += m * bg.y;
                            f.z += m * bg.z;
                        }
                        else {
                            f.x += m * gx;
                            f.y += m * gy;
                            f.z += m * gz;
                        }
                    }
                }
            }
            // Update subsystems
            for (var i = 0, Nsubsystems = this.subsystems.length; i !== Nsubsystems; i++) {
                this.subsystems[i].update();
            }
            // Collision detection
            if (doProfiling) {
                profilingStart = perfNow();
            }
            p1.length = 0; // Clean up pair arrays from last step
            p2.length = 0;
            this.broadphase.collisionPairs(this, p1, p2);
            if (doProfiling) {
                profile.broadphase = perfNow() - profilingStart;
            } // 宽阶段的时间
            // Remove constrained pairs with collideConnected == false
            // TODO 这个方式是不是不太效率啊
            var Nconstraints = constraints.length;
            for (i = 0; i !== Nconstraints; i++) {
                let c = constraints[i];
                if (!c.collideConnected) {
                    for (var j = p1.length - 1; j >= 0; j -= 1) {
                        if ((c.bodyA === p1[j] && c.bodyB === p2[j]) ||
                            (c.bodyB === p1[j] && c.bodyA === p2[j])) {
                            p1.splice(j, 1);
                            p2.splice(j, 1);
                        }
                    }
                }
            }
            this.collisionMatrixTick();
            // Generate contacts
            if (doProfiling) {
                profilingStart = perfNow();
            }
            var oldcontacts = World_step_oldContacts;
            var NoldContacts = contacts.length;
            // 把上一帧的保存到 oldcontacts 中，用来回收对象
            for (i = 0; i !== NoldContacts; i++) {
                oldcontacts.push(contacts[i]);
            }
            contacts.length = 0;
            // Transfer FrictionEquation from current list to the pool for reuse
            // TODO  效率 这个是不是可以通过交换完成
            var NoldFrictionEquations = this.frictionEquations.length;
            for (i = 0; i !== NoldFrictionEquations; i++) {
                frictionEquationPool.push(this.frictionEquations[i]);
            }
            this.frictionEquations.length = 0;
            this.narrowphase.getContacts(p1, p2, this, contacts, oldcontacts, // To be reused
            this.frictionEquations, frictionEquationPool);
            if (doProfiling) {
                profile.narrowphase = perfNow() - profilingStart; // 窄阶段的时间
            }
            // Loop over all collisions
            if (doProfiling) {
                profilingStart = perfNow();
            }
            // Add all friction eqs
            // TODO 效率，这个为什么不在getContacts的时候直接push， 是因为顺序么
            for (var i = 0; i < this.frictionEquations.length; i++) {
                solver.addEquation(this.frictionEquations[i]);
            }
            var ncontacts = contacts.length;
            for (var k = 0; k < ncontacts; k++) {
                let c = contacts[k];
                // Get current collision indeces
                let bi = c.bi, bj = c.bj;
                //let si = c.si,
                //    sj = c.sj;
                // Get collision properties
                /*
                var cm:ContactMaterial;
                if (bi.material && bj.material) {
                    cm = this.getContactMaterial(bi.material, bj.material) || this.defaultContactMaterial;
                } else {
                    cm = this.defaultContactMaterial;
                }

                // c.enabled = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;

                var mu = cm.friction;
                // c.restitution = cm.restitution;

                // If friction or restitution were specified in the material, use them
                if (bi.material && bj.material) {
                    if (bi.material.friction >= 0 && bj.material.friction >= 0) {
                        mu = bi.material.friction * bj.material.friction;
                    }

                    if (bi.material.restitution >= 0 && bj.material.restitution >= 0) {
                        c.restitution = bi.material.restitution * bj.material.restitution;
                    }
                }
                */
                // c.setSpookParams(
                //           cm.contactEquationStiffness,
                //           cm.contactEquationRelaxation,
                //           dt
                //       );
                solver.addEquation(c);
                //if(mu>0){}
                // // Add friction constraint equation
                // if(mu > 0){
                // 	// Create 2 tangent equations
                // 	var mug = mu * gnorm;
                // 	var reducedMass = (bi.invMass + bj.invMass);
                // 	if(reducedMass > 0){
                // 		reducedMass = 1/reducedMass;
                // 	}
                // 	var pool = frictionEquationPool;
                // 	var c1 = pool.length ? pool.pop() : new FrictionEquation(bi,bj,mug*reducedMass);
                // 	var c2 = pool.length ? pool.pop() : new FrictionEquation(bi,bj,mug*reducedMass);
                // 	this.frictionEquations.push(c1, c2);
                // 	c1.bi = c2.bi = bi;
                // 	c1.bj = c2.bj = bj;
                // 	c1.minForce = c2.minForce = -mug*reducedMass;
                // 	c1.maxForce = c2.maxForce = mug*reducedMass;
                // 	// Copy over the relative vectors
                // 	c1.ri.copy(c.ri);
                // 	c1.rj.copy(c.rj);
                // 	c2.ri.copy(c.ri);
                // 	c2.rj.copy(c.rj);
                // 	// Construct tangents
                // 	c.ni.tangents(c1.t, c2.t);
                //           // Set spook params
                //           c1.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, dt);
                //           c2.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, dt);
                //           c1.enabled = c2.enabled = c.enabled;
                // 	// Add equations to solver
                // 	solver.addEquation(c1);
                // 	solver.addEquation(c2);
                // }
                // 发生碰撞的两个对象，是否需要wakeup
                if (bi.allowSleep &&
                    bi.type === 1 /* DYNAMIC */ &&
                    bi.sleepState === 2 /* SLEEPING */ &&
                    bj.sleepState === 0 /* AWAKE */ &&
                    bj.type !== 2 /* STATIC */) {
                    var speedSquaredB = bj.velocity.lengthSquared() + bj.angularVelocity.lengthSquared();
                    var speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit, 2);
                    if (speedSquaredB >= speedLimitSquaredB * 2) {
                        bi._wakeUpAfterNarrowphase = true;
                    }
                }
                if (bj.allowSleep &&
                    bj.type === 1 /* DYNAMIC */ &&
                    bj.sleepState === 2 /* SLEEPING */ &&
                    bi.sleepState === 0 /* AWAKE */ &&
                    bi.type !== 2 /* STATIC */) {
                    var speedSquaredA = bi.velocity.lengthSquared() + bi.angularVelocity.lengthSquared();
                    var speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit, 2);
                    if (speedSquaredA >= speedLimitSquaredA * 2) {
                        bj._wakeUpAfterNarrowphase = true;
                    }
                }
                // Now we know that i and j are in contact. Set collision matrix state
                //this.collisionMatrix.set(bi, bj, true);
                //if (!this.collisionMatrixPrevious.get(bi, bj)) {
                // First contact!
                // We reuse the collideEvent object, otherwise we will end up creating new objects for each new contact, even if there's no event listener attached.
                // 发送第一次碰撞的碰撞事件
                // 这里用 collisionMatrix 是否与bodyOverlapKeeper重复了
                /*
                World_step_collideEvent.contact = c;
                
                World_step_collideEvent.body = bj;
                bi.dispatchEvent(World_step_collideEvent);

                World_step_collideEvent.body = bi;
                bj.dispatchEvent(World_step_collideEvent);
                */
                //}
                bi.type != 2 /* STATIC */ && bi.contact.addContact(bi, c);
                bj.type != 2 /* STATIC */ && bj.contact.addContact(bj, c);
                //this.bodyOverlapKeeper.set(bi.id, bj.id);
                //this.shapeOverlapKeeper.set(si.id, sj.id);
            } //for each contacts
            // 通知所有的接触事件
            //this.emitContactEvents();
            if (doProfiling) {
                profile.makeContactConstraints = perfNow() - profilingStart;
                profilingStart = perfNow();
            }
            // Wake up bodies
            for (i = 0; i !== N; i++) {
                var bi = bodies[i];
                // 唤醒
                if (bi._wakeUpAfterNarrowphase) {
                    bi.wakeUp();
                    bi._wakeUpAfterNarrowphase = false;
                }
            }
            // Add user-added constraints
            var Nconstraints = constraints.length;
            for (i = 0; i !== Nconstraints; i++) {
                var c = constraints[i];
                c.update();
                for (var j = 0, Neq = c.equations.length; j !== Neq; j++) {
                    var eq = c.equations[j];
                    solver.addEquation(eq);
                }
            }
            // Solve the constrained system
            solver.solve(dt, this);
            if (doProfiling) {
                profile.solve = perfNow() - profilingStart; // solve的时间
            }
            // Remove all contacts from solver
            solver.removeAllEquations();
            // Apply damping, see http://code.google.com/p/bullet/issues/detail?id=74 for details
            // 衰减
            for (i = 0; i !== N; i++) {
                var bi = bodies[i];
                if (bi.type & 1 /* DYNAMIC */) { // Only for dynamic bodies
                    var ld = bi.ldampPow; // Math.pow(1.0 - bi.linearDamping, dt);
                    var v = bi.velocity;
                    v.scale(ld, v);
                    var av = bi.angularVelocity;
                    if (av) {
                        var ad = bi.adampPow; // Math.pow(1.0 - bi.angularDamping, dt);
                        av.scale(ad, av);
                    }
                }
            }
            this.dispatchEvent(World_step_preStepEvent);
            // Invoke pre-step callbacks  这里是integrate之前，post是integrate之后
            // TODO 优化或者去掉
            for (i = 0; i !== N; i++) {
                var bi = bodies[i];
                if (bi.preIntegrate) {
                    bi.preIntegrate.call(bi);
                }
            }
            // Leap frog
            // vnew = v + h*f/m
            // xnew = x + h*vnew
            if (doProfiling) {
                profilingStart = perfNow();
            }
            var stepnumber = this.stepnumber;
            var quatNormalize = stepnumber % (this.quatNormalizeSkip + 1) === 0;
            var quatNormalizeFast = this.quatNormalizeFast;
            for (i = 0; i !== N; i++) {
                bodies[i].integrate(dt, quatNormalize, quatNormalizeFast);
            }
            this.clearForces();
            this.broadphase.dirty = true;
            if (doProfiling) {
                profile.integrate = perfNow() - profilingStart;
            }
            // Update world time
            this.time += dt;
            this.stepnumber += 1;
            this.dispatchEvent(World_step_postStepEvent);
            // Invoke post-step callbacks
            // TODO 优化或者去掉
            for (i = 0; i !== N; i++) {
                var bi = bodies[i];
                var postStep = bi.postIntegrate;
                if (postStep) {
                    postStep.call(bi);
                }
            }
            // Sleeping update
            if (this.allowSleep) {
                for (i = 0; i !== N; i++) {
                    bodies[i].sleepTick(this.time);
                }
            }
            // 发送事件,这期间会通知逻辑，可能会导致body删除，因此要放到最后，并用备份数组
            let tbodies = bodies.concat();
            for (i = 0; i !== N; i++) {
                var bi = tbodies[i];
                if (bi.type != 2 /* STATIC */) { //TRIGGER怎么办
                    // 发送事件
                    let cs = bi.contact;
                    for (let ei = 0; ei < cs.addlen; ei++) { // enter事件
                        let c = cs.added[ei];
                        let entEvt = collideEnterEvt;
                        entEvt.otherBody = c.body;
                        entEvt.contact = c;
                        bi.dispatchEvent(entEvt);
                    }
                    for (let ri = 0; ri < cs.removedLen; ri++) { // exit事件
                        let c = cs.removed[ri];
                        let exitEvt = collideExitEvt;
                        exitEvt.otherBody = c.body;
                        exitEvt.contact = c;
                        bi.dispatchEvent(exitEvt);
                    }
                }
            }
            if (this.phyRender) {
                this.phyRender.internalStep();
            }
        }
        pause(b) {
            this._pause = b == undefined ? !this._pause : b;
        }
    }

    /**
     * Collision "matrix". It's actually a triangular-shaped array of whether two bodies are touching this step, for reference next step
     * 记录两个对象在当前帧是否碰撞，是一个三角矩阵
     * TODO 如果对象多了这个占内存太多 n*(n-1)/2
     */
    class ArrayCollisionMatrix {
        constructor() {
            /**
             * The matrix storage
             */
            this.matrix = [];
        }
        /**
         * Get an element
         */
        get(i, j) {
            let ii = i.index;
            let ji = j.index;
            if (ji > ii) {
                const temp = ji;
                ji = ii;
                ii = temp;
            }
            return this.matrix[(ii * (ii + 1) >> 1) + ji - 1];
        }
        /**
         * Set an element
         */
        set(bi, bj, value) {
            let i = bi.index;
            let j = bj.index;
            if (j > i) {
                const temp = j;
                j = i;
                i = temp;
            }
            this.matrix[(i * (i + 1) >> 1) + j - 1] = value ? 1 : 0;
        }
        /**
         * Sets all elements to zero
         */
        reset() {
            this.matrix.fill(0);
        }
        /**
         * Sets the max number of objects
         */
        setNumObjects(n) {
            this.matrix.length = n * (n - 1) >> 1;
        }
    }

    /**
     * sweep and prune 算法
     */
    class AxisSweepBroadphase extends Broadphase {
        constructor() {
            super();
        }
        /**
         * 插入排序算法。比较适合基本排好序的数据。
         * TODO 与js内置排序算法比较性能
         * @param inputArr
         */
        insertionSort(inputArr) {
            let length = inputArr.length;
            for (let i = 1; i < length; i++) {
                let key = inputArr[i];
                let j = i - 1;
                while (j >= 0 && inputArr[j] > key) {
                    inputArr[j + 1] = inputArr[j];
                    j = j - 1;
                }
                inputArr[j + 1] = key;
            }
            return inputArr;
        }
        /**
         * Get all the collision pairs in the physics world
         */
        collisionPairs(world, pairs1, pairs2) {
            const bodies = world.bodies;
            const n = bodies.length;
            let i;
            let j;
            let bi;
            let bj;
            // Naive N^2 ftw!
            for (i = 0; i !== n; i++) {
                for (j = 0; j !== i; j++) {
                    bi = bodies[i];
                    bj = bodies[j];
                    if (!this.needBroadphaseCollision(bi, bj)) {
                        continue;
                    }
                    this.intersectionTest(bi, bj, pairs1, pairs2);
                }
            }
        }
        /**
         * Returns all the bodies within an AABB.
         * @param result An array to store resulting bodies in.
         */
        aabbQuery(world, aabb, result = []) {
            let bodies = world.bodies;
            for (let i = 0; i < bodies.length; i++) {
                const b = bodies[i];
                if (b.aabbNeedsUpdate) {
                    b.updateAABB();
                }
                // Ugly hack until Body gets aabb
                if (b.aabb.overlaps(aabb)) {
                    result.push(b);
                }
            }
            return result;
        }
    }

    class ManifoldPoint {
        constructor() {
            // Whether this manifold point is persisting or not.
            this.warmStarted = false;
            //  The position of this manifold point.
            this.position = new Vec3();
            // 碰撞点相对于第一个shape的相对位置
            this.localPoint1 = new Vec3();
            // 碰撞点相对于第2个shape的相对位置
            this.localPoint2 = new Vec3();
            // The normal vector of this manifold point.
            this.normal = new Vec3();
            // The tangent vector of this manifold point.
            this.tangent = new Vec3();
            // The binormal vector of this manifold point.
            this.binormal = new Vec3();
            // 法线方向上的碰撞冲量
            this.normalImpulse = 0;
            // tangent方向上的碰撞冲量
            this.tangentImpulse = 0;
            // 副法线方向上的碰撞冲量
            this.binormalImpulse = 0;
            // The denominator in normal direction.
            this.normalDenominator = 0;
            // The denominator in tangent direction.
            this.tangentDenominator = 0;
            // The denominator in binormal direction.
            this.binormalDenominator = 0;
            // 碰撞深度
            this.penetration = 0;
        }
    }
    /**
     * 用来跨帧记录两个对象的碰撞信息
     * 碰撞的时候添加碰撞点
     * 规则
     *  每帧只取一个碰撞点，添加进去
     *  最多保留4个碰撞点
     *      保留撞入深度最深的碰撞点
     *      根据碰撞点在AB两个物体上的距离是否仍然在对穿或者接触决定是否需要删除
     *      选取构成四边形面积最大的碰撞点
     */
    class ContactManifold {
        constructor() {
            this.numPoints = 0;
            this.points = [
                new ManifoldPoint(),
                new ManifoldPoint(),
                new ManifoldPoint(),
                new ManifoldPoint()
            ];
        }
        //Reset the manifold.
        reset(shape1, shape2) {
            this.bodyA = shape1.body;
            this.bodyB = shape2.body;
            this.numPoints = 0;
        }
        //  Add a point into this manifold.
        addPoint(x, y, z, nx, ny, nz, penetration, flip) {
            let p = this.points[this.numPoints++];
            p.position.set(x, y, z);
            p.normal.set(nx, ny, nz);
            //p.localPoint1.vsub(p.position, this.bodyA.position).applyMatrix3(this.bodyA.rotation);
            //p.localPoint2.vsub(p.position, this.bodyB.position).applyMatrix3(this.bodyB.rotation);
            p.normalImpulse = 0;
            if (flip)
                p.normal.negate();
            p.penetration = penetration;
            p.warmStarted = false;
        }
        UpdateManifolds() {
        }
        /**
         * 删除最无效的点
         */
        RearrangeContactPoints() {
            let maxDepth = 1e6;
            //let deepestIndex:i32=0;
            let ptNum = this.numPoints;
            let pts = this.points;
            for (let i = 0; i < ptNum; i++) {
                let cp = pts[i];
                if (cp.penetration < maxDepth) {
                    //deepestIndex=i;
                    maxDepth = cp.penetration;
                }
            }
            //let newPoint = pts[3];//4-1
            //let indexToRemove=;
            this.numPoints--;
        }
    }
    class ManifoldManager {
        get(a, b) {
            throw 'ni';
        }
        foreach() {
        }
    }

    class GridBroadphase extends Broadphase {
        /**
         * Axis aligned uniform grid broadphase.
         * @todo Needs support for more than just planes and spheres.
         * @param  aabbMin
         * @param  aabbMax
         * @param  nx Number of boxes along x
         * @param  ny Number of boxes along y
         * @param  nz Number of boxes along z
         */
        constructor(aabbMin, aabbMax, nx = 10, ny = 10, nz = 10) {
            super();
            this.nx = 10;
            this.ny = 10;
            this.nz = 10;
            this.aabbMin = new Vec3(100, 100, 100);
            this.aabbMax = new Vec3(-100, -100, -100);
            this.bins = [];
            // bins 数组中的每个数组的长度
            this.binLengths = []; //Rather than continually resizing arrays (thrashing the memory), just record length and allow them to grow
            this.nx = nx || 10;
            this.ny = ny || 10;
            this.nz = nz || 10;
            aabbMin && (this.aabbMin = aabbMin);
            aabbMax && (this.aabbMax = aabbMax);
            ;
            const nbins = this.nx * this.ny * this.nz;
            if (nbins <= 0) {
                throw "GridBroadphase: Each dimension's n must be >0";
            }
            this.bins.length = nbins;
            this.binLengths.length = nbins;
            for (let i = 0; i < nbins; i++) {
                this.bins[i] = [];
                this.binLengths[i] = 0;
            }
        }
        /**
         * Get all the collision pairs in the physics world
         * TODO 这个效率太低了，每帧都计算每个对象在哪个格子中
         */
        collisionPairs(world, pairs1, pairs2) {
            const N = world.numObjects();
            const bodies = world.bodies;
            var max = this.aabbMax;
            var min = this.aabbMin;
            const nx = this.nx;
            const ny = this.ny;
            const nz = this.nz;
            const xstep = ny * nz;
            const ystep = nz;
            const zstep = 1;
            const xmax = max.x;
            const ymax = max.y;
            const zmax = max.z;
            const xmin = min.x;
            const ymin = min.y;
            const zmin = min.z;
            const xmult = nx / (xmax - xmin);
            const ymult = ny / (ymax - ymin);
            const zmult = nz / (zmax - zmin);
            const binsizeX = (xmax - xmin) / nx;
            const binsizeY = (ymax - ymin) / ny;
            const binsizeZ = (zmax - zmin) / nz;
            const binRadius = Math.sqrt(binsizeX * binsizeX + binsizeY * binsizeY + binsizeZ * binsizeZ) * 0.5;
            const SPHERE = 1 /* SPHERE */;
            const PLANE = 2 /* PLANE */;
            //const BOX = SHAPETYPE.BOX;
            //const COMPOUND = SHAPETYPE.COMPOUND;
            //const CONVEXPOLYHEDRON = SHAPETYPE.CONVEXPOLYHEDRON;
            const bins = this.bins;
            const binLengths = this.binLengths;
            const Nbins = this.bins.length;
            // Reset bins
            for (var i = 0; i !== Nbins; i++) {
                binLengths[i] = 0;
            }
            const ceil = Math.ceil;
            function addBoxToBins(x0, y0, z0, x1, y1, z1, bi) {
                let xoff0 = ((x0 - xmin) * xmult) | 0;
                let yoff0 = ((y0 - ymin) * ymult) | 0;
                let zoff0 = ((z0 - zmin) * zmult) | 0;
                let xoff1 = ceil((x1 - xmin) * xmult);
                let yoff1 = ceil((y1 - ymin) * ymult);
                let zoff1 = ceil((z1 - zmin) * zmult);
                if (xoff0 < 0) {
                    xoff0 = 0;
                }
                else if (xoff0 >= nx) {
                    xoff0 = nx - 1;
                }
                if (yoff0 < 0) {
                    yoff0 = 0;
                }
                else if (yoff0 >= ny) {
                    yoff0 = ny - 1;
                }
                if (zoff0 < 0) {
                    zoff0 = 0;
                }
                else if (zoff0 >= nz) {
                    zoff0 = nz - 1;
                }
                if (xoff1 < 0) {
                    xoff1 = 0;
                }
                else if (xoff1 >= nx) {
                    xoff1 = nx - 1;
                }
                if (yoff1 < 0) {
                    yoff1 = 0;
                }
                else if (yoff1 >= ny) {
                    yoff1 = ny - 1;
                }
                if (zoff1 < 0) {
                    zoff1 = 0;
                }
                else if (zoff1 >= nz) {
                    zoff1 = nz - 1;
                }
                xoff0 *= xstep;
                yoff0 *= ystep;
                zoff0 *= zstep;
                xoff1 *= xstep;
                yoff1 *= ystep;
                zoff1 *= zstep;
                for (let xoff = xoff0; xoff <= xoff1; xoff += xstep) {
                    for (let yoff = yoff0; yoff <= yoff1; yoff += ystep) {
                        for (let zoff = zoff0; zoff <= zoff1; zoff += zstep) {
                            const idx = xoff + yoff + zoff;
                            bins[idx][binLengths[idx]++] = bi;
                        }
                    }
                }
            }
            // Put all bodies into the bins
            for (var i = 0; i !== N; i++) {
                var bi = bodies[i];
                const si = bi.shapes[0]; //TODO 原来是 bi.shape
                switch (si.type) {
                    case SPHERE:
                        // Put in bin
                        // check if overlap with other bins
                        const x = bi.position.x;
                        const y = bi.position.y;
                        const z = bi.position.z;
                        const r = si.radius;
                        addBoxToBins(x - r, y - r, z - r, x + r, y + r, z + r, bi);
                        break;
                    case PLANE:
                        if (si.worldNormalNeedsUpdate) {
                            si.computeWorldNormal(bi.quaternion);
                        }
                        const planeNormal = si.worldNormal;
                        //Relative position from origin of plane object to the first bin
                        //Incremented as we iterate through the bins
                        const xreset = xmin + binsizeX * 0.5 - bi.position.x;
                        const yreset = ymin + binsizeY * 0.5 - bi.position.y;
                        const zreset = zmin + binsizeZ * 0.5 - bi.position.z;
                        const d = GridBroadphase_collisionPairs_d;
                        d.set(xreset, yreset, zreset);
                        for (var xi = 0, xoff = 0; xi !== nx; xi++, xoff += xstep, d.y = yreset, d.x += binsizeX) {
                            for (var yi = 0, yoff = 0; yi !== ny; yi++, yoff += ystep, d.z = zreset, d.y += binsizeY) {
                                for (let zi = 0, zoff = 0; zi !== nz; zi++, zoff += zstep, d.z += binsizeZ) {
                                    if (d.dot(planeNormal) < binRadius) {
                                        const idx = xoff + yoff + zoff;
                                        bins[idx][binLengths[idx]++] = bi;
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        if (bi.aabbNeedsUpdate) {
                            bi.updateAABB();
                        }
                        addBoxToBins(bi.aabb.lowerBound.x, bi.aabb.lowerBound.y, bi.aabb.lowerBound.z, bi.aabb.upperBound.x, bi.aabb.upperBound.y, bi.aabb.upperBound.z, bi);
                        break;
                }
            }
            // Check each bin
            for (var i = 0; i !== Nbins; i++) {
                const binLength = binLengths[i];
                //Skip bins with no potential collisions
                if (binLength > 1) {
                    const bin = bins[i];
                    // Do N^2 broadphase inside
                    for (var xi = 0; xi !== binLength; xi++) {
                        //@ts-ignore
                        var bi = bin[xi];
                        for (var yi = 0; yi !== xi; yi++) {
                            const bj = bin[yi];
                            if (this.needBroadphaseCollision(bi, bj)) {
                                this.intersectionTest(bi, bj, pairs1, pairs2);
                            }
                        }
                    }
                }
            }
            //	for (var zi = 0, zoff=0; zi < nz; zi++, zoff+= zstep) {
            //		console.log("layer "+zi);
            //		for (var yi = 0, yoff=0; yi < ny; yi++, yoff += ystep) {
            //			var row = '';
            //			for (var xi = 0, xoff=0; xi < nx; xi++, xoff += xstep) {
            //				var idx = xoff + yoff + zoff;
            //				row += ' ' + binLengths[idx];
            //			}
            //			console.log(row);
            //		}
            //	}
            this.makePairsUnique(pairs1, pairs2);
        }
    }
    var GridBroadphase_collisionPairs_d = new Vec3();

    /**
     * 基于格子的宽阶段碰撞检测。
     * 分成静止和动态两个格子，动态的每次都清理
     * 静态的一直保存，一旦active就要从静态格子删除
     * 注意 超出范围的会被忽略
     *
     */
    class GridBroadphase1 extends Broadphase {
        constructor(aabbMin, aabbMax, nx = 10, ny = 10, nz = 10) {
            super();
            this.nx = 10;
            this.ny = 10;
            this.nz = 10;
            this.aabbMin = new Vec3(100, 100, 100);
            this.aabbMax = new Vec3(-100, -100, -100);
            this.bins = [];
            // bins 数组中的每个数组的长度
            this.binLengths = []; //Rather than continually resizing arrays (thrashing the memory), just record length and allow them to grow
            this.nx = nx;
            this.ny = ny;
            this.nz = nz;
            aabbMin && (this.aabbMin = aabbMin);
            aabbMax && (this.aabbMax = aabbMax);
            ;
            const nbins = this.nx * this.ny * this.nz;
            if (nbins <= 0) {
                throw "GridBroadphase: Each dimension's n must be >0";
            }
            this.bins.length = nbins;
            this.binLengths.length = nbins;
            for (let i = 0; i < nbins; i++) {
                this.bins[i] = [];
                this.binLengths[i] = 0;
            }
        }
        /**
         *
         */
        collisionPairs(world, pairs1, pairs2) {
            const N = world.numObjects();
            const bodies = world.bodies;
            var max = this.aabbMax;
            var min = this.aabbMin;
            const nx = this.nx;
            const ny = this.ny;
            const nz = this.nz;
            const xstep = ny * nz;
            const ystep = nz;
            const zstep = 1;
            const xmax = max.x;
            const ymax = max.y;
            const zmax = max.z;
            const xmin = min.x;
            const ymin = min.y;
            const zmin = min.z;
            const xmult = nx / (xmax - xmin);
            const ymult = ny / (ymax - ymin);
            const zmult = nz / (zmax - zmin);
            const binsizeX = (xmax - xmin) / nx;
            const binsizeY = (ymax - ymin) / ny;
            const binsizeZ = (zmax - zmin) / nz;
            const binRadius = Math.sqrt(binsizeX * binsizeX + binsizeY * binsizeY + binsizeZ * binsizeZ) * 0.5;
            const SPHERE = 1 /* SPHERE */;
            const PLANE = 2 /* PLANE */;
            //const BOX = SHAPETYPE.BOX;
            //const COMPOUND = SHAPETYPE.COMPOUND;
            //const CONVEXPOLYHEDRON = SHAPETYPE.CONVEXPOLYHEDRON;
            const bins = this.bins;
            const binLengths = this.binLengths;
            const Nbins = this.bins.length;
            // Reset bins
            for (var i = 0; i !== Nbins; i++) {
                binLengths[i] = 0;
            }
            const ceil = Math.ceil;
            function addBoxToBins(x0, y0, z0, x1, y1, z1, bi) {
                let xoff0 = ((x0 - xmin) * xmult) | 0;
                let yoff0 = ((y0 - ymin) * ymult) | 0;
                let zoff0 = ((z0 - zmin) * zmult) | 0;
                let xoff1 = ceil((x1 - xmin) * xmult);
                let yoff1 = ceil((y1 - ymin) * ymult);
                let zoff1 = ceil((z1 - zmin) * zmult);
                if (xoff0 < 0) {
                    xoff0 = 0;
                }
                else if (xoff0 >= nx) {
                    xoff0 = nx - 1;
                }
                if (yoff0 < 0) {
                    yoff0 = 0;
                }
                else if (yoff0 >= ny) {
                    yoff0 = ny - 1;
                }
                if (zoff0 < 0) {
                    zoff0 = 0;
                }
                else if (zoff0 >= nz) {
                    zoff0 = nz - 1;
                }
                if (xoff1 < 0) {
                    xoff1 = 0;
                }
                else if (xoff1 >= nx) {
                    xoff1 = nx - 1;
                }
                if (yoff1 < 0) {
                    yoff1 = 0;
                }
                else if (yoff1 >= ny) {
                    yoff1 = ny - 1;
                }
                if (zoff1 < 0) {
                    zoff1 = 0;
                }
                else if (zoff1 >= nz) {
                    zoff1 = nz - 1;
                }
                xoff0 *= xstep;
                yoff0 *= ystep;
                zoff0 *= zstep;
                xoff1 *= xstep;
                yoff1 *= ystep;
                zoff1 *= zstep;
                for (let xoff = xoff0; xoff <= xoff1; xoff += xstep) {
                    for (let yoff = yoff0; yoff <= yoff1; yoff += ystep) {
                        for (let zoff = zoff0; zoff <= zoff1; zoff += zstep) {
                            const idx = xoff + yoff + zoff;
                            bins[idx][binLengths[idx]++] = bi;
                        }
                    }
                }
            }
            // Put all bodies into the bins
            for (var i = 0; i !== N; i++) {
                var bi = bodies[i];
                const si = bi.shapes[0]; //TODO 原来是 bi.shape
                switch (si.type) {
                    case SPHERE:
                        // Put in bin
                        // check if overlap with other bins
                        const x = bi.position.x;
                        const y = bi.position.y;
                        const z = bi.position.z;
                        const r = si.radius;
                        addBoxToBins(x - r, y - r, z - r, x + r, y + r, z + r, bi);
                        break;
                    case PLANE:
                        if (si.worldNormalNeedsUpdate) {
                            si.computeWorldNormal(bi.quaternion);
                        }
                        const planeNormal = si.worldNormal;
                        //Relative position from origin of plane object to the first bin
                        //Incremented as we iterate through the bins
                        const xreset = xmin + binsizeX * 0.5 - bi.position.x;
                        const yreset = ymin + binsizeY * 0.5 - bi.position.y;
                        const zreset = zmin + binsizeZ * 0.5 - bi.position.z;
                        const d = GridBroadphase_collisionPairs_d$1;
                        d.set(xreset, yreset, zreset);
                        for (var xi = 0, xoff = 0; xi !== nx; xi++, xoff += xstep, d.y = yreset, d.x += binsizeX) {
                            for (var yi = 0, yoff = 0; yi !== ny; yi++, yoff += ystep, d.z = zreset, d.y += binsizeY) {
                                for (let zi = 0, zoff = 0; zi !== nz; zi++, zoff += zstep, d.z += binsizeZ) {
                                    if (d.dot(planeNormal) < binRadius) {
                                        const idx = xoff + yoff + zoff;
                                        bins[idx][binLengths[idx]++] = bi;
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        if (bi.aabbNeedsUpdate) {
                            bi.updateAABB();
                        }
                        addBoxToBins(bi.aabb.lowerBound.x, bi.aabb.lowerBound.y, bi.aabb.lowerBound.z, bi.aabb.upperBound.x, bi.aabb.upperBound.y, bi.aabb.upperBound.z, bi);
                        break;
                }
            }
            // Check each bin
            for (var i = 0; i !== Nbins; i++) {
                const binLength = binLengths[i];
                //Skip bins with no potential collisions
                if (binLength > 1) {
                    const bin = bins[i];
                    // Do N^2 broadphase inside
                    for (var xi = 0; xi !== binLength; xi++) {
                        //@ts-ignore
                        var bi = bin[xi];
                        for (var yi = 0; yi !== xi; yi++) {
                            const bj = bin[yi];
                            if (this.needBroadphaseCollision(bi, bj)) {
                                this.intersectionTest(bi, bj, pairs1, pairs2);
                            }
                        }
                    }
                }
            }
            this.makePairsUnique(pairs1, pairs2);
        }
    }
    var GridBroadphase_collisionPairs_d$1 = new Vec3();

    /**
     * Records what objects are colliding with each other
     */
    class ObjectCollisionMatrix {
        constructor() {
            /**
             * The matrix storage
             */
            this.matrix = {};
        }
        get(bi, bj) {
            let i = bi.id;
            let j = bj.id;
            if (j > i) {
                const temp = j;
                j = i;
                i = temp;
            }
            return `${i}-${j}` in this.matrix;
        }
        set(bi, bj, value) {
            let i = bi.id;
            let j = bj.id;
            if (j > i) {
                const temp = j;
                j = i;
                i = temp;
            }
            if (value) {
                this.matrix[`${i}-${j}`] = true;
            }
            else {
                delete this.matrix[`${i}-${j}`];
            }
        }
        /**
         * Empty the matrix
         */
        reset() {
            this.matrix = {};
        }
        /**
         * Set max number of objects
         */
        setNumObjects(n) {
        }
    }

    /**
     * 避免重复添加碰撞信息
     * 记录上次的碰撞信息，方便发送进入和分开事件
     */
    class OverlapKeeper {
        constructor() {
            this.current = [];
            this.previous = [];
        }
        getKey(i, j) {
            /*
            if (j < i) {
                const temp = j;
                j = i;
                i = temp;
            }
            return (i << 16) | j;
            */
            return (j < i) ? ((j << 16) | i) : ((i << 16) | j);
        }
        /**
         * 记录i与j相交了，把key插入current中。按照从小到大排序
         */
        set(i, j) {
            // Insertion sort. This way the diff will have linear complexity.
            const key = this.getKey(i, j);
            const current = this.current;
            let index = 0;
            while (key > current[index]) {
                index++;
            }
            if (key === current[index]) {
                return key; // Pair was already added
            }
            for (var j = current.length - 1; j >= index; j--) {
                current[j + 1] = current[j];
            }
            current[index] = key;
            return key;
        }
        /**
         * 每帧执行一次交换
         */
        tick() {
            //swap(current,previous)
            const tmp = this.current;
            this.current = this.previous;
            this.previous = tmp;
            this.current.length = 0;
        }
        getDiff(additions, removals) {
            const a = this.current;
            const b = this.previous;
            const al = a.length;
            const bl = b.length;
            let j = 0;
            for (var i = 0; i < al; i++) {
                var found = false;
                const keyA = a[i];
                while (keyA > b[j]) {
                    j++;
                }
                found = keyA === b[j];
                if (!found) {
                    unpackAndPush(additions, keyA);
                }
            }
            j = 0;
            for (var i = 0; i < bl; i++) {
                var found = false;
                const keyB = b[i];
                while (keyB > a[j]) {
                    j++;
                }
                found = a[j] === keyB;
                if (!found) {
                    unpackAndPush(removals, keyB);
                }
            }
        }
    }
    function unpackAndPush(array, key) {
        array.push((key & 0xFFFF0000) >> 16, key & 0x0000FFFF);
    }

    var tmpVec1$7 = new Vec3();
    /**
     * Sweep and prune broadphase along one axis.
     *
     * @class SAPBroadphase
     * @constructor
     * @param {World} [world]
     * @extends Broadphase
     */
    class SAPBroadphase extends Broadphase {
        constructor(world) {
            super();
            /**
             * List of bodies currently in the broadphase.
             */
            this.axisList = [];
            /**
             * Axis to sort the bodies along. Set to 0 for x axis, and 1 for y axis. For best performance, choose an axis that the bodies are spread out more on.
             */
            this.axisIndex = 0;
            const axisList = this.axisList;
            this._addBodyHandler = (evt) => {
                //@ts-ignore
                axisList.push(evt.body);
            };
            this._removeBodyHandler = (evt) => {
                //@ts-ignore
                const idx = axisList.indexOf(evt.body);
                if (idx !== -1) {
                    axisList.splice(idx, 1);
                }
            };
            if (world) {
                this.setWorld(world);
            }
        }
        /**
         * Change the world
         */
        setWorld(world) {
            // Clear the old axis array
            this.axisList.length = 0;
            // Add all bodies from the new world
            for (let i = 0; i < world.bodies.length; i++) {
                let a = world.bodies[i];
                this.axisList.push(a);
                this.axisList.push(world.bodies[i]);
            }
            // Remove old handlers, if any
            world.removeEventListener("addBody", this._addBodyHandler);
            world.removeEventListener("removeBody", this._removeBodyHandler);
            // Add handlers to update the list of bodies.
            world.addEventListener("addBody", this._addBodyHandler);
            world.addEventListener("removeBody", this._removeBodyHandler);
            this.world = world;
            this.dirty = true;
        }
        /**
         * Collect all collision pairs
         */
        collisionPairs(world, p1, p2) {
            const bodies = this.axisList;
            const N = bodies.length;
            const axisIndex = this.axisIndex;
            let i;
            let j;
            if (this.dirty) {
                this.sortList();
                this.dirty = false;
            }
            // Look through the list
            for (i = 0; i !== N; i++) {
                const bi = bodies[i];
                for (j = i + 1; j < N; j++) {
                    const bj = bodies[j];
                    if (!this.needBroadphaseCollision(bi, bj)) {
                        continue;
                    }
                    if (!SAPBroadphase.checkBounds(bi, bj, axisIndex)) {
                        break;
                    }
                    this.intersectionTest(bi, bj, p1, p2);
                }
            }
        }
        sortList() {
            const axisList = this.axisList;
            const axisIndex = this.axisIndex;
            const N = axisList.length;
            // Update AABBs
            for (let i = 0; i !== N; i++) {
                const bi = axisList[i];
                if (bi.aabbNeedsUpdate) {
                    bi.updateAABB();
                }
            }
            // Sort the list
            if (axisIndex === 0) {
                SAPBroadphase.insertionSortX(axisList);
            }
            else if (axisIndex === 1) {
                SAPBroadphase.insertionSortY(axisList);
            }
            else if (axisIndex === 2) {
                SAPBroadphase.insertionSortZ(axisList);
            }
        }
        /**
         * Computes the variance of the body positions and estimates the best
         * axis to use. Will automatically set property .axisIndex.
         * @method autoDetectAxis
         */
        autoDetectAxis() {
            let sumX = 0;
            let sumX2 = 0;
            let sumY = 0;
            let sumY2 = 0;
            let sumZ = 0;
            let sumZ2 = 0;
            const bodies = this.axisList;
            const N = bodies.length;
            const invN = 1 / N;
            for (let i = 0; i !== N; i++) {
                const b = bodies[i];
                const centerX = b.position.x;
                sumX += centerX;
                sumX2 += centerX * centerX;
                const centerY = b.position.y;
                sumY += centerY;
                sumY2 += centerY * centerY;
                const centerZ = b.position.z;
                sumZ += centerZ;
                sumZ2 += centerZ * centerZ;
            }
            const varianceX = sumX2 - sumX * sumX * invN;
            const varianceY = sumY2 - sumY * sumY * invN;
            const varianceZ = sumZ2 - sumZ * sumZ * invN;
            if (varianceX > varianceY) {
                if (varianceX > varianceZ) {
                    this.axisIndex = 0;
                }
                else {
                    this.axisIndex = 2;
                }
            }
            else if (varianceY > varianceZ) {
                this.axisIndex = 1;
            }
            else {
                this.axisIndex = 2;
            }
        }
        /**
         * Returns all the bodies within an AABB.
         */
        aabbQuery(world, aabb, result = []) {
            if (this.dirty) {
                this.sortList();
                this.dirty = false;
            }
            //const axisIndex = this.axisIndex;
            //let axis = 'x';
            //if (axisIndex === 1) { axis = 'y'; }
            //if (axisIndex === 2) { axis = 'z'; }
            const axisList = this.axisList;
            //const lower = aabb.lowerBound[axis];
            //const upper = aabb.upperBound[axis];
            for (let i = 0; i < axisList.length; i++) {
                const b = axisList[i];
                if (b.aabbNeedsUpdate) {
                    b.updateAABB();
                }
                if (b.aabb.overlaps(aabb)) {
                    result.push(b);
                }
            }
            return result;
        }
        sphereQuery(world, pos, radius, result = []) {
            // 先用最简单的方法
            let rr = radius * radius;
            const axisList = this.axisList;
            for (let i = 0; i < axisList.length; i++) {
                const b = axisList[i];
                b.position.vsub(pos, tmpVec1$7);
                if (tmpVec1$7.lengthSquared() < rr) {
                    result.push(b);
                }
            }
            return result;
        }
        static insertionSortX(a) {
            for (let i = 1, l = a.length; i < l; i++) {
                const v = a[i];
                for (var j = i - 1; j >= 0; j--) {
                    if (a[j].aabb.lowerBound.x <= v.aabb.lowerBound.x) {
                        break;
                    }
                    a[j + 1] = a[j];
                }
                a[j + 1] = v;
            }
            return a;
        }
        static insertionSortY(a) {
            for (let i = 1, l = a.length; i < l; i++) {
                const v = a[i];
                for (var j = i - 1; j >= 0; j--) {
                    if (a[j].aabb.lowerBound.y <= v.aabb.lowerBound.y) {
                        break;
                    }
                    a[j + 1] = a[j];
                }
                a[j + 1] = v;
            }
            return a;
        }
        static insertionSortZ(a) {
            for (let i = 1, l = a.length; i < l; i++) {
                const v = a[i];
                for (var j = i - 1; j >= 0; j--) {
                    if (a[j].aabb.lowerBound.z <= v.aabb.lowerBound.z) {
                        break;
                    }
                    a[j + 1] = a[j];
                }
                a[j + 1] = v;
            }
            return a;
        }
        /**
         * Check if the bounds of two bodies overlap, along the given SAP axis.
         */
        static checkBounds(bi, bj, axisIndex) {
            var biPos = 0;
            var bjPos = 0;
            if (axisIndex === 0) {
                biPos = bi.position.x;
                bjPos = bj.position.x;
            }
            else if (axisIndex === 1) {
                biPos = bi.position.y;
                bjPos = bj.position.y;
            }
            else if (axisIndex === 2) {
                biPos = bi.position.z;
                bjPos = bj.position.z;
            }
            var ri = bi.boundingRadius, rj = bj.boundingRadius, 
            //boundA1 = biPos - ri,
            boundA2 = biPos + ri, boundB1 = bjPos - rj;
            //boundB2 = bjPos + rj;
            return boundB1 < boundA2;
        }
    }

    class DBVTProxy {
        constructor(body) {
            this.leaf = new DBVTNode();
            this.leaf.proxy = this;
        }
    }
    class DBVTNode {
        constructor() {
            // 节点的高度，从叶子算起，root的最高
            this.height = 0;
            this.aabb = new AABB();
        }
        isLeaf() {
            return !!this.proxy;
        }
    }

    /**
     * A dynamic bounding volume tree for the broad-phase algorithm.
     * 参考 https://box2d.org/files/GDC2019/ErinCatto_DynamicBVH_GDC2019.pdf
     * @author saharan
     * @author lo-th
     */
    class DBVT {
        constructor() {
            this.freeNodes = new Array(16384);
            this.numFreeNodes = 0;
            this.aabb = new AABB();
        }
        ;
        // TODO 效率问题，应该超过一定范围后再做
        moveLeaf(leaf) {
            this.deleteLeaf(leaf);
            this.insertLeaf(leaf);
        }
        insertLeaf(leaf) {
            if (this.root == null) {
                this.root = leaf;
                return;
            }
            var lb = leaf.aabb;
            var sibling = this.root;
            var oldArea;
            var newArea;
            let aabb = this.aabb;
            while (sibling.proxy == null) { // descend the node to search the best pair
                var c1 = sibling.child1;
                var c2 = sibling.child2;
                var c1b = c1.aabb;
                var c2b = c2.aabb;
                var b = sibling.aabb;
                oldArea = b.surfaceArea(); //TODO 保存起来如何
                aabb.combine(lb, b);
                newArea = aabb.surfaceArea(); //新节点与当前sibling合并后的新的面积
                /**  */
                var creatingCost = newArea * 2; // 为什么*2
                /** 合并增加的cost */
                var incrementalCost = (newArea - oldArea) * 2; // cost of creating a new pair with the node
                // 计算与c1结合的代价
                var discendingCost1 = incrementalCost;
                aabb.combine(lb, c1b);
                if (c1.proxy != null) {
                    //如果c1是叶子节点
                    // leaf cost = area(combined aabb)
                    discendingCost1 += aabb.surfaceArea();
                }
                else {
                    //如果c1不是叶子节点
                    // node cost = area(combined aabb) - area(old aabb)
                    discendingCost1 += aabb.surfaceArea() - c1b.surfaceArea();
                }
                // 计算与c2结合的代价
                var discendingCost2 = incrementalCost;
                aabb.combine(lb, c2b);
                if (c2.proxy != null) {
                    // leaf cost = area(combined aabb)
                    discendingCost2 += aabb.surfaceArea();
                }
                else {
                    // node cost = area(combined aabb) - area(old aabb)
                    discendingCost2 += aabb.surfaceArea() - c2b.surfaceArea();
                }
                // 选择一个cost小的继续
                if (discendingCost1 < discendingCost2) {
                    if (creatingCost < discendingCost1) {
                        break; // stop descending
                    }
                    else {
                        sibling = c1; // descend into first child
                    }
                }
                else {
                    if (creatingCost < discendingCost2) {
                        break; // stop descending
                    }
                    else {
                        sibling = c2; // descend into second child
                    }
                }
            }
            // 创建一个新的parent
            var oldParent = sibling.parent;
            var newParent;
            if (this.numFreeNodes > 0) {
                newParent = this.freeNodes[--this.numFreeNodes];
            }
            else {
                newParent = new DBVTNode();
            }
            newParent.parent = oldParent;
            newParent.child1 = leaf;
            newParent.child2 = sibling;
            newParent.aabb.combine(leaf.aabb, sibling.aabb);
            newParent.height = sibling.height + 1;
            sibling.parent = newParent;
            leaf.parent = newParent;
            if (sibling == this.root) {
                // replace root
                this.root = newParent;
            }
            else {
                // replace child
                if (oldParent.child1 == sibling) {
                    oldParent.child1 = newParent;
                }
                else {
                    oldParent.child2 = newParent;
                }
            }
            // 添加了一个新的节点，要更新树，从newParent开始。
            do {
                newParent = this.balance(newParent);
                this.refit(newParent);
                newParent = newParent.parent;
            } while (newParent != null);
        }
        /**
         * 判断叶子节点的平衡度。
         * @param node
         */
        getBalance(node) {
            if (node.proxy != null)
                return 0;
            return node.child1.height - node.child2.height;
        }
        deleteLeaf(leaf) {
            if (leaf == this.root) {
                //@ts-ignore
                this.root = null;
                return;
            }
            var parent = leaf.parent;
            var sibling;
            if (parent.child1 == leaf) {
                sibling = parent.child2;
            }
            else {
                sibling = parent.child1;
            }
            if (parent == this.root) {
                this.root = sibling;
                //@ts-ignore
                sibling.parent = null;
                return;
            }
            var grandParent = parent.parent;
            sibling.parent = grandParent;
            if (grandParent.child1 == parent) {
                grandParent.child1 = sibling;
            }
            else {
                grandParent.child2 = sibling;
            }
            if (this.numFreeNodes < 16384) {
                this.freeNodes[this.numFreeNodes++] = parent;
            }
            do {
                grandParent = this.balance(grandParent);
                this.refit(grandParent);
                grandParent = grandParent.parent;
            } while (grandParent != null);
        }
        balance(node) {
            var nh = node.height;
            if (nh < 2) {
                return node;
            }
            var p = node.parent;
            var l = node.child1;
            var r = node.child2;
            var lh = l.height;
            var rh = r.height;
            var balance = lh - rh;
            var t; // for bit operation
            // 旋转节点。一共有四种旋转方法
            //          [ N ]
            //         /     \
            //    [ L ]       [ R ]
            //     / \         / \
            // [L-L] [L-R] [R-L] [R-R]
            // Is the tree balanced?
            if (balance > 1) {
                var ll = l.child1;
                var lr = l.child2;
                var llh = ll.height;
                var lrh = lr.height;
                // Is L-L higher than L-R?
                if (llh > lrh) {
                    // set N to L-R
                    l.child2 = node;
                    node.parent = l;
                    //          [ L ]
                    //         /     \
                    //    [L-L]       [ N ]
                    //     / \         / \
                    // [...] [...] [ L ] [ R ]
                    // set L-R
                    node.child1 = lr;
                    lr.parent = node;
                    //          [ L ]
                    //         /     \
                    //    [L-L]       [ N ]
                    //     / \         / \
                    // [...] [...] [L-R] [ R ]
                    // fix bounds and heights
                    node.aabb.combine(lr.aabb, r.aabb);
                    t = lrh - rh;
                    node.height = lrh - (t & t >> 31) + 1;
                    l.aabb.combine(ll.aabb, node.aabb);
                    t = llh - nh;
                    l.height = llh - (t & t >> 31) + 1;
                }
                else {
                    // set N to L-L
                    l.child1 = node;
                    node.parent = l;
                    //          [ L ]
                    //         /     \
                    //    [ N ]       [L-R]
                    //     / \         / \
                    // [ L ] [ R ] [...] [...]
                    // set L-L
                    node.child1 = ll;
                    ll.parent = node;
                    //          [ L ]
                    //         /     \
                    //    [ N ]       [L-R]
                    //     / \         / \
                    // [L-L] [ R ] [...] [...]
                    // fix bounds and heights
                    node.aabb.combine(ll.aabb, r.aabb);
                    t = llh - rh;
                    node.height = llh - (t & t >> 31) + 1;
                    l.aabb.combine(node.aabb, lr.aabb);
                    t = nh - lrh;
                    l.height = nh - (t & t >> 31) + 1;
                }
                // set new parent of L
                if (p != null) {
                    if (p.child1 == node) {
                        p.child1 = l;
                    }
                    else {
                        p.child2 = l;
                    }
                }
                else {
                    this.root = l;
                }
                l.parent = p;
                return l;
            }
            else if (balance < -1) {
                var rl = r.child1;
                var rr = r.child2;
                var rlh = rl.height;
                var rrh = rr.height;
                // Is R-L higher than R-R?
                if (rlh > rrh) {
                    // set N to R-R
                    r.child2 = node;
                    node.parent = r;
                    //          [ R ]
                    //         /     \
                    //    [R-L]       [ N ]
                    //     / \         / \
                    // [...] [...] [ L ] [ R ]
                    // set R-R
                    node.child2 = rr;
                    rr.parent = node;
                    //          [ R ]
                    //         /     \
                    //    [R-L]       [ N ]
                    //     / \         / \
                    // [...] [...] [ L ] [R-R]
                    // fix bounds and heights
                    node.aabb.combine(l.aabb, rr.aabb);
                    t = lh - rrh;
                    node.height = lh - (t & t >> 31) + 1;
                    r.aabb.combine(rl.aabb, node.aabb);
                    t = rlh - nh;
                    r.height = rlh - (t & t >> 31) + 1;
                }
                else {
                    // set N to R-L
                    r.child1 = node;
                    node.parent = r;
                    //          [ R ]
                    //         /     \
                    //    [ N ]       [R-R]
                    //     / \         / \
                    // [ L ] [ R ] [...] [...]
                    // set R-L
                    node.child2 = rl;
                    rl.parent = node;
                    //          [ R ]
                    //         /     \
                    //    [ N ]       [R-R]
                    //     / \         / \
                    // [ L ] [R-L] [...] [...]
                    // fix bounds and heights
                    node.aabb.combine(l.aabb, rl.aabb);
                    t = lh - rlh;
                    node.height = lh - (t & t >> 31) + 1;
                    r.aabb.combine(node.aabb, rr.aabb);
                    t = nh - rrh;
                    r.height = nh - (t & t >> 31) + 1;
                }
                // set new parent of R
                if (p != null) {
                    if (p.child1 == node) {
                        p.child1 = r;
                    }
                    else {
                        p.child2 = r;
                    }
                }
                else {
                    this.root = r;
                }
                r.parent = p;
                return r;
            }
            return node;
        }
        /**
         * 更新node的包围盒和高度
         * @param node
         */
        refit(node) {
            let c1 = node.child1;
            let c2 = node.child2;
            let h1 = c1.height;
            let h2 = c2.height;
            node.aabb.combine(c1.aabb, c2.aabb);
            node.height = h1 < h2 ? h2 + 1 : h1 + 1;
        }
        cost() {
            // 所有节点的表面积相加
        }
    }

    /**
     * A broad-phase algorithm using dynamic bounding volume tree.
     *
     * @author saharan
     * @author lo-th
     */
    class DBVTBroadPhase extends Broadphase {
        constructor() {
            super();
            this.tree = new DBVT();
            this.stack = [];
            this.leaves = [];
            this.numLeaves = 0;
            this.numPairChecks = 0;
        }
        createProxy(body) {
            return new DBVTProxy(body);
        }
        addProxy(proxy) {
            this.tree.insertLeaf(proxy.leaf);
            this.leaves.push(proxy.leaf);
            this.numLeaves++;
        }
        removeProxy(proxy) {
            this.tree.deleteLeaf(proxy.leaf);
            // 删除leaves中记录的proxy
            var n = this.leaves.indexOf(proxy.leaf);
            if (n > -1) {
                this.leaves.splice(n, 1);
                this.numLeaves--;
            }
        }
        // 收集碰撞对信息
        collectPairs(p1, p2) {
            if (this.numLeaves < 2)
                return;
            var leaf, margin = 0.1, i = this.numLeaves;
            while (i--) {
                leaf = this.leaves[i];
                if (leaf.proxy.aabb.overlaps(leaf.aabb)) {
                    leaf.aabb.copy(leaf.proxy.aabb).margin(margin);
                    this.tree.deleteLeaf(leaf);
                    this.tree.insertLeaf(leaf);
                    this.collide(leaf, this.tree.root, p1, p2);
                }
            }
        }
        collisionPairs(world, p1, p2) {
            this.collectPairs(p1, p2);
        }
        collide(node1, node2, p1, p2) {
            let stackCount = 2;
            let b1, b2, n1, n2, l1, l2;
            this.stack[0] = node1;
            this.stack[1] = node2;
            while (stackCount > 0) {
                n1 = this.stack[--stackCount];
                n2 = this.stack[--stackCount];
                l1 = n1.proxy != null;
                l2 = n2.proxy != null;
                this.numPairChecks++;
                if (l1 && l2) {
                    b1 = n1.proxy.body;
                    b2 = n2.proxy.body;
                    if (b1 == b2 || !b1.aabb.overlaps(b2.aabb) || !this.needBroadphaseCollision(b1, b2))
                        continue;
                    p1.push(b1);
                    p2.push(b2);
                }
                else {
                    if (!n1.aabb.overlaps(n2.aabb))
                        continue;
                    if (l2 || !l1 && (n1.aabb.surfaceArea() > n2.aabb.surfaceArea())) {
                        this.stack[stackCount++] = n1.child1;
                        this.stack[stackCount++] = n2;
                        this.stack[stackCount++] = n1.child2;
                        this.stack[stackCount++] = n2;
                    }
                    else {
                        this.stack[stackCount++] = n1;
                        this.stack[stackCount++] = n2.child1;
                        this.stack[stackCount++] = n1;
                        this.stack[stackCount++] = n2.child2;
                    }
                }
            }
        }
    }

    /**
    * A proxy for dynamic bounding volume tree broad-phase.
    * @author saharan
    */
    var count = 0;
    function ProxyIdCount() { return count++; }

    exports.ConeTwistConstraint = ConeTwistConstraint;
    exports.Constraint = Constraint;
    exports.DistanceConstraint = DistanceConstraint;
    exports.HingeConstraint = HingeConstraint;
    exports.Muscle = Muscle;
    exports.PointToPointConstraint = PointToPointConstraint;
    exports.PointToPointDistanceConstraint = PointToPointDistanceConstraint;
    exports.LockConstraint = LockConstraint;
    exports.ContactMaterial = ContactMaterial;
    exports.Material = Material;
    exports.ContactEquation = ContactEquation;
    exports.Equation = Equation;
    exports.ConeEquation = ConeEquation;
    exports.FrictionEquation = FrictionEquation;
    exports.RotationalEquation = RotationalEquation;
    exports.RotationalMotorEquation = RotationalMotorEquation;
    exports.Vec3 = Vec3;
    exports.Transform = Transform;
    exports.Quaternion = Quaternion;
    exports.Mat3 = Mat3;
    exports.JacobianElement = JacobianElement;
    exports.Body = Body;
    exports.carData = carData;
    exports.Car = Car;
    exports.RaycastVehicle = RaycastVehicle;
    exports.RigidVehicle = RigidVehicle;
    exports.SPHSystem = SPHSystem;
    exports.Spring = Spring;
    exports.WheelInfo = WheelInfo;
    exports.quat_AABBExt_mult = quat_AABBExt_mult;
    exports.Box = Box;
    exports.Capsule = Capsule;
    exports.hitInfo = hitInfo;
    exports.ConvexPolyhedron = ConvexPolyhedron;
    exports.Particle = Particle;
    exports.Cylinder = Cylinder;
    exports.Plane = Plane;
    exports.Heightfield = Heightfield;
    exports.Sphere = Sphere;
    exports.Tetrahedron = Tetrahedron;
    exports.HitPointInfo = HitPointInfo;
    exports.HitPointInfoArray = HitPointInfoArray;
    exports.Shape = Shape;
    exports.POT = POT;
    exports.hashData = hashData;
    exports.hashSparseVox = hashSparseVox;
    exports.SparseVoxData = SparseVoxData;
    exports.VoxelBitData = VoxelBitData;
    exports.Trimesh = Trimesh;
    exports.PhyVoxelData = PhyVoxelData;
    exports.GridScene = GridScene;
    exports.VoxelScene = VoxelScene;
    exports.Voxel = Voxel;
    exports.ArcBall = ArcBall;
    exports.GSSolver = GSSolver;
    exports.Solver = Solver;
    exports.SplitSolver = SplitSolver;
    exports.OperatorInfo = OperatorInfo;
    exports.KeyInputAction = KeyInputAction;
    exports.PositionAction = PositionAction;
    exports.RotationAction = RotationAction;
    exports.EventTarget = EventTarget;
    exports.OctreeNode = OctreeNode;
    exports.Octree = Octree;
    exports.TupleDictionary = TupleDictionary;
    exports.Pool = Pool;
    exports.Vec3Pool = Vec3Pool;
    exports.enableFriction = enableFriction;
    exports.Narrowphase = Narrowphase;
    exports.AddBodyEvent = AddBodyEvent;
    exports.RemoveBodyEvent = RemoveBodyEvent;
    exports.PhyCollideEvent = PhyCollideEvent;
    exports.IPhyRender = IPhyRender;
    exports.setPhyRender = setPhyRender;
    exports.getPhyRender = getPhyRender;
    exports.World = World;
    exports.ArrayCollisionMatrix = ArrayCollisionMatrix;
    exports.AABB = AABB;
    exports.ContactInfo = ContactInfo;
    exports.ContactInfoMgr = ContactInfoMgr;
    exports.AxisSweepBroadphase = AxisSweepBroadphase;
    exports.Broadphase = Broadphase;
    exports.ContactManifold = ContactManifold;
    exports.ManifoldManager = ManifoldManager;
    exports.EPA_sFace = EPA_sFace;
    exports.EPA_sList = EPA_sList;
    exports.EPA_sHorizon = EPA_sHorizon;
    exports.EPA = EPA;
    exports.GJK_sSV = GJK_sSV;
    exports.GJK_sSimlex = GJK_sSimlex;
    exports.GJK = GJK;
    exports.GJKPairDetector = GJKPairDetector;
    exports.MinkowskiDiff = MinkowskiDiff;
    exports.sResults = sResults;
    exports.Distance = Distance;
    exports.Penetration = Penetration;
    exports.GridBroadphase = GridBroadphase;
    exports.GridBroadphase1 = GridBroadphase1;
    exports.ObjectCollisionMatrix = ObjectCollisionMatrix;
    exports.OverlapKeeper = OverlapKeeper;
    exports.NaiveBroadphase = NaiveBroadphase;
    exports.Ray = Ray;
    exports.RaycastResult = RaycastResult;
    exports.SAPBroadphase = SAPBroadphase;
    exports.VoronoiSimplexSolver = VoronoiSimplexSolver;
    exports.DBVT = DBVT;
    exports.DBVTBroadPhase = DBVTBroadPhase;
    exports.DBVTProxy = DBVTProxy;
    exports.DBVTNode = DBVTNode;

    cannon.version=Sat Dec 21 2019 15:46:09 GMT+0800 (GMT+08:00)

    return exports;

}({}));
