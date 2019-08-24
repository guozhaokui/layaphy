import { Vector3 } from "./Vector3";
import { Matrix3x3 } from "./Matrix3x3";
import { MathUtils3D } from "./MathUtils3D";
import { Vector2 } from "./Vector2";
import { ILaya3D } from "../../../ILaya3D";
export class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1, nativeElements = null) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    static createFromYawPitchRoll(yaw, pitch, roll, out) {
        var halfRoll = roll * 0.5;
        var halfPitch = pitch * 0.5;
        var halfYaw = yaw * 0.5;
        var sinRoll = Math.sin(halfRoll);
        var cosRoll = Math.cos(halfRoll);
        var sinPitch = Math.sin(halfPitch);
        var cosPitch = Math.cos(halfPitch);
        var sinYaw = Math.sin(halfYaw);
        var cosYaw = Math.cos(halfYaw);
        out.x = (cosYaw * sinPitch * cosRoll) + (sinYaw * cosPitch * sinRoll);
        out.y = (sinYaw * cosPitch * cosRoll) - (cosYaw * sinPitch * sinRoll);
        out.z = (cosYaw * cosPitch * sinRoll) - (sinYaw * sinPitch * cosRoll);
        out.w = (cosYaw * cosPitch * cosRoll) + (sinYaw * sinPitch * sinRoll);
    }
    static multiply(left, right, out) {
        var lx = left.x;
        var ly = left.y;
        var lz = left.z;
        var lw = left.w;
        var rx = right.x;
        var ry = right.y;
        var rz = right.z;
        var rw = right.w;
        var a = (ly * rz - lz * ry);
        var b = (lz * rx - lx * rz);
        var c = (lx * ry - ly * rx);
        var d = (lx * rx + ly * ry + lz * rz);
        out.x = (lx * rw + rx * lw) + a;
        out.y = (ly * rw + ry * lw) + b;
        out.z = (lz * rw + rz * lw) + c;
        out.w = lw * rw - d;
    }
    static arcTanAngle(x, y) {
        if (x == 0) {
            if (y == 1)
                return Math.PI / 2;
            return -Math.PI / 2;
        }
        if (x > 0)
            return Math.atan(y / x);
        if (x < 0) {
            if (y > 0)
                return Math.atan(y / x) + Math.PI;
            return Math.atan(y / x) - Math.PI;
        }
        return 0;
    }
    static angleTo(from, location, angle) {
        Vector3.subtract(location, from, Quaternion.TEMPVector30);
        Vector3.normalize(Quaternion.TEMPVector30, Quaternion.TEMPVector30);
        angle.x = Math.asin(Quaternion.TEMPVector30.y);
        angle.y = Quaternion.arcTanAngle(-Quaternion.TEMPVector30.z, -Quaternion.TEMPVector30.x);
    }
    static createFromAxisAngle(axis, rad, out) {
        rad = rad * 0.5;
        var s = Math.sin(rad);
        out.x = s * axis.x;
        out.y = s * axis.y;
        out.z = s * axis.z;
        out.w = Math.cos(rad);
    }
    static createFromMatrix4x4(mat, out) {
        var me = mat.elements;
        var sqrt;
        var half;
        var scale = me[0] + me[5] + me[10];
        if (scale > 0.0) {
            sqrt = Math.sqrt(scale + 1.0);
            out.w = sqrt * 0.5;
            sqrt = 0.5 / sqrt;
            out.x = (me[6] - me[9]) * sqrt;
            out.y = (me[8] - me[2]) * sqrt;
            out.z = (me[1] - me[4]) * sqrt;
        }
        else if ((me[0] >= me[5]) && (me[0] >= me[10])) {
            sqrt = Math.sqrt(1.0 + me[0] - me[5] - me[10]);
            half = 0.5 / sqrt;
            out.x = 0.5 * sqrt;
            out.y = (me[1] + me[4]) * half;
            out.z = (me[2] + me[8]) * half;
            out.w = (me[6] - me[9]) * half;
        }
        else if (me[5] > me[10]) {
            sqrt = Math.sqrt(1.0 + me[5] - me[0] - me[10]);
            half = 0.5 / sqrt;
            out.x = (me[4] + me[1]) * half;
            out.y = 0.5 * sqrt;
            out.z = (me[9] + me[6]) * half;
            out.w = (me[8] - me[2]) * half;
        }
        else {
            sqrt = Math.sqrt(1.0 + me[10] - me[0] - me[5]);
            half = 0.5 / sqrt;
            out.x = (me[8] + me[2]) * half;
            out.y = (me[9] + me[6]) * half;
            out.z = 0.5 * sqrt;
            out.w = (me[1] - me[4]) * half;
        }
    }
    static slerp(left, right, t, out) {
        var ax = left.x, ay = left.y, az = left.z, aw = left.w, bx = right.x, by = right.y, bz = right.z, bw = right.w;
        var omega, cosom, sinom, scale0, scale1;
        cosom = ax * bx + ay * by + az * bz + aw * bw;
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        if ((1.0 - cosom) > 0.000001) {
            omega = Math.acos(cosom);
            sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        }
        else {
            scale0 = 1.0 - t;
            scale1 = t;
        }
        out.x = scale0 * ax + scale1 * bx;
        out.y = scale0 * ay + scale1 * by;
        out.z = scale0 * az + scale1 * bz;
        out.w = scale0 * aw + scale1 * bw;
        return out;
    }
    static lerp(left, right, amount, out) {
        var inverse = 1.0 - amount;
        if (Quaternion.dot(left, right) >= 0) {
            out.x = (inverse * left.x) + (amount * right.x);
            out.y = (inverse * left.y) + (amount * right.y);
            out.z = (inverse * left.z) + (amount * right.z);
            out.w = (inverse * left.w) + (amount * right.w);
        }
        else {
            out.x = (inverse * left.x) - (amount * right.x);
            out.y = (inverse * left.y) - (amount * right.y);
            out.z = (inverse * left.z) - (amount * right.z);
            out.w = (inverse * left.w) - (amount * right.w);
        }
        out.normalize(out);
    }
    static add(left, right, out) {
        out.x = left.x + right.x;
        out.y = left.y + right.y;
        out.z = left.z + right.z;
        out.w = left.w + right.w;
    }
    static dot(left, right) {
        return left.x * right.x + left.y * right.y + left.z * right.z + left.w * right.w;
    }
    scaling(scaling, out) {
        out.x = this.x * scaling;
        out.y = this.y * scaling;
        out.z = this.z * scaling;
        out.w = this.w * scaling;
    }
    normalize(out) {
        var len = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = this.x * len;
            out.y = this.y * len;
            out.z = this.z * len;
            out.w = this.w * len;
        }
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    rotateX(rad, out) {
        rad *= 0.5;
        var bx = Math.sin(rad), bw = Math.cos(rad);
        out.x = this.x * bw + this.w * bx;
        out.y = this.y * bw + this.z * bx;
        out.z = this.z * bw - this.y * bx;
        out.w = this.w * bw - this.x * bx;
    }
    rotateY(rad, out) {
        rad *= 0.5;
        var by = Math.sin(rad), bw = Math.cos(rad);
        out.x = this.x * bw - this.z * by;
        out.y = this.y * bw + this.w * by;
        out.z = this.z * bw + this.x * by;
        out.w = this.w * bw - this.y * by;
    }
    rotateZ(rad, out) {
        rad *= 0.5;
        var bz = Math.sin(rad), bw = Math.cos(rad);
        out.x = this.x * bw + this.y * bz;
        out.y = this.y * bw - this.x * bz;
        out.z = this.z * bw + this.w * bz;
        out.w = this.w * bw - this.z * bz;
    }
    getYawPitchRoll(out) {
        Vector3.transformQuat(Vector3._ForwardRH, this, Quaternion.TEMPVector31);
        Vector3.transformQuat(Vector3._Up, this, Quaternion.TEMPVector32);
        var upe = Quaternion.TEMPVector32;
        Quaternion.angleTo(Vector3._ZERO, Quaternion.TEMPVector31, Quaternion.TEMPVector33);
        var angle = Quaternion.TEMPVector33;
        if (angle.x == Math.PI / 2) {
            angle.y = Quaternion.arcTanAngle(upe.z, upe.x);
            angle.z = 0;
        }
        else if (angle.x == -Math.PI / 2) {
            angle.y = Quaternion.arcTanAngle(-upe.z, -upe.x);
            angle.z = 0;
        }
        else {
            ILaya3D.Matrix4x4.createRotationY(-angle.y, ILaya3D.Matrix4x4.TEMPMatrix0);
            ILaya3D.Matrix4x4.createRotationX(-angle.x, ILaya3D.Matrix4x4.TEMPMatrix1);
            Vector3.transformCoordinate(Quaternion.TEMPVector32, ILaya3D.Matrix4x4.TEMPMatrix0, Quaternion.TEMPVector32);
            Vector3.transformCoordinate(Quaternion.TEMPVector32, ILaya3D.Matrix4x4.TEMPMatrix1, Quaternion.TEMPVector32);
            angle.z = Quaternion.arcTanAngle(upe.y, -upe.x);
        }
        if (angle.y <= -Math.PI)
            angle.y = Math.PI;
        if (angle.z <= -Math.PI)
            angle.z = Math.PI;
        if (angle.y >= Math.PI && angle.z >= Math.PI) {
            angle.y = 0;
            angle.z = 0;
            angle.x = Math.PI - angle.x;
        }
        var oe = out;
        oe.x = angle.y;
        oe.y = angle.x;
        oe.z = angle.z;
    }
    invert(out) {
        var a0 = this.x, a1 = this.y, a2 = this.z, a3 = this.w;
        var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        var invDot = dot ? 1.0 / dot : 0;
        out.x = -a0 * invDot;
        out.y = -a1 * invDot;
        out.z = -a2 * invDot;
        out.w = a3 * invDot;
    }
    identity() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
    }
    fromArray(array, offset = 0) {
        this.x = array[offset + 0];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 3];
    }
    cloneTo(destObject) {
        if (this === destObject) {
            return;
        }
        destObject.x = this.x;
        destObject.y = this.y;
        destObject.z = this.z;
        destObject.w = this.w;
    }
    clone() {
        var dest = new Quaternion();
        this.cloneTo(dest);
        return dest;
    }
    equals(b) {
        return MathUtils3D.nearEqual(this.x, b.x) && MathUtils3D.nearEqual(this.y, b.y) && MathUtils3D.nearEqual(this.z, b.z) && MathUtils3D.nearEqual(this.w, b.w);
    }
    static rotationLookAt(forward, up, out) {
        Quaternion.lookAt(Vector3._ZERO, forward, up, out);
    }
    static lookAt(eye, target, up, out) {
        Matrix3x3.lookAt(eye, target, up, Quaternion._tempMatrix3x3);
        Quaternion.rotationMatrix(Quaternion._tempMatrix3x3, out);
    }
    lengthSquared() {
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w);
    }
    static invert(value, out) {
        var lengthSq = value.lengthSquared();
        if (!MathUtils3D.isZero(lengthSq)) {
            lengthSq = 1.0 / lengthSq;
            out.x = -value.x * lengthSq;
            out.y = -value.y * lengthSq;
            out.z = -value.z * lengthSq;
            out.w = value.w * lengthSq;
        }
    }
    static rotationMatrix(matrix3x3, out) {
        var me = matrix3x3.elements;
        var m11 = me[0];
        var m12 = me[1];
        var m13 = me[2];
        var m21 = me[3];
        var m22 = me[4];
        var m23 = me[5];
        var m31 = me[6];
        var m32 = me[7];
        var m33 = me[8];
        var sqrt, half;
        var scale = m11 + m22 + m33;
        if (scale > 0) {
            sqrt = Math.sqrt(scale + 1);
            out.w = sqrt * 0.5;
            sqrt = 0.5 / sqrt;
            out.x = (m23 - m32) * sqrt;
            out.y = (m31 - m13) * sqrt;
            out.z = (m12 - m21) * sqrt;
        }
        else if ((m11 >= m22) && (m11 >= m33)) {
            sqrt = Math.sqrt(1 + m11 - m22 - m33);
            half = 0.5 / sqrt;
            out.x = 0.5 * sqrt;
            out.y = (m12 + m21) * half;
            out.z = (m13 + m31) * half;
            out.w = (m23 - m32) * half;
        }
        else if (m22 > m33) {
            sqrt = Math.sqrt(1 + m22 - m11 - m33);
            half = 0.5 / sqrt;
            out.x = (m21 + m12) * half;
            out.y = 0.5 * sqrt;
            out.z = (m32 + m23) * half;
            out.w = (m31 - m13) * half;
        }
        else {
            sqrt = Math.sqrt(1 + m33 - m11 - m22);
            half = 0.5 / sqrt;
            out.x = (m31 + m13) * half;
            out.y = (m32 + m23) * half;
            out.z = 0.5 * sqrt;
            out.w = (m12 - m21) * half;
        }
    }
    forNativeElement(nativeElements = null) {
        if (nativeElements) {
            this.elements = nativeElements;
            this.elements[0] = this.x;
            this.elements[1] = this.y;
            this.elements[2] = this.z;
            this.elements[3] = this.w;
        }
        else {
            this.elements = new Float32Array([this.x, this.y, this.z, this.w]);
        }
        Vector2.rewriteNumProperty(this, "x", 0);
        Vector2.rewriteNumProperty(this, "y", 1);
        Vector2.rewriteNumProperty(this, "z", 2);
        Vector2.rewriteNumProperty(this, "w", 3);
    }
}
Quaternion.TEMPVector30 = new Vector3();
Quaternion.TEMPVector31 = new Vector3();
Quaternion.TEMPVector32 = new Vector3();
Quaternion.TEMPVector33 = new Vector3();
Quaternion._tempMatrix3x3 = new Matrix3x3();
Quaternion.DEFAULT = new Quaternion();
Quaternion.NAN = new Quaternion(NaN, NaN, NaN, NaN);
