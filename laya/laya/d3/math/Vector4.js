import { MathUtils3D } from "./MathUtils3D";
import { Vector2 } from "./Vector2";
export class Vector4 {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    setValue(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    fromArray(array, offset = 0) {
        this.x = array[offset + 0];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 3];
    }
    cloneTo(destObject) {
        var destVector4 = destObject;
        destVector4.x = this.x;
        destVector4.y = this.y;
        destVector4.z = this.z;
        destVector4.w = this.w;
    }
    clone() {
        var destVector4 = new Vector4();
        this.cloneTo(destVector4);
        return destVector4;
    }
    static lerp(a, b, t, out) {
        var ax = a.x, ay = a.y, az = a.z, aw = a.w;
        out.x = ax + t * (b.x - ax);
        out.y = ay + t * (b.y - ay);
        out.z = az + t * (b.z - az);
        out.w = aw + t * (b.w - aw);
    }
    static transformByM4x4(vector4, m4x4, out) {
        var vx = vector4.x;
        var vy = vector4.y;
        var vz = vector4.z;
        var vw = vector4.w;
        var me = m4x4.elements;
        out.x = vx * me[0] + vy * me[4] + vz * me[8] + vw * me[12];
        out.y = vx * me[1] + vy * me[5] + vz * me[9] + vw * me[13];
        out.z = vx * me[2] + vy * me[6] + vz * me[10] + vw * me[14];
        out.w = vx * me[3] + vy * me[7] + vz * me[11] + vw * me[15];
    }
    static equals(a, b) {
        return MathUtils3D.nearEqual(Math.abs(a.x), Math.abs(b.x)) && MathUtils3D.nearEqual(Math.abs(a.y), Math.abs(b.y)) && MathUtils3D.nearEqual(Math.abs(a.z), Math.abs(b.z)) && MathUtils3D.nearEqual(Math.abs(a.w), Math.abs(b.w));
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    static normalize(s, out) {
        var len = s.length();
        if (len > 0) {
            out.x = s.x * len;
            out.y = s.y * len;
            out.z = s.z * len;
            out.w = s.w * len;
        }
    }
    static add(a, b, out) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        out.w = a.w + b.w;
    }
    static subtract(a, b, out) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        out.w = a.w - b.w;
    }
    static multiply(a, b, out) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
        out.w = a.w * b.w;
    }
    static scale(a, b, out) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        out.w = a.w * b;
    }
    static Clamp(value, min, max, out) {
        var x = value.x;
        var y = value.y;
        var z = value.z;
        var w = value.w;
        var mineX = min.x;
        var mineY = min.y;
        var mineZ = min.z;
        var mineW = min.w;
        var maxeX = max.x;
        var maxeY = max.y;
        var maxeZ = max.z;
        var maxeW = max.w;
        x = (x > maxeX) ? maxeX : x;
        x = (x < mineX) ? mineX : x;
        y = (y > maxeY) ? maxeY : y;
        y = (y < mineY) ? mineY : y;
        z = (z > maxeZ) ? maxeZ : z;
        z = (z < mineZ) ? mineZ : z;
        w = (w > maxeW) ? maxeW : w;
        w = (w < mineW) ? mineW : w;
        out.x = x;
        out.y = y;
        out.z = z;
        out.w = w;
    }
    static distanceSquared(value1, value2) {
        var x = value1.x - value2.x;
        var y = value1.y - value2.y;
        var z = value1.z - value2.z;
        var w = value1.w - value2.w;
        return (x * x) + (y * y) + (z * z) + (w * w);
    }
    static distance(value1, value2) {
        var x = value1.x - value2.x;
        var y = value1.y - value2.y;
        var z = value1.z - value2.z;
        var w = value1.w - value2.w;
        return Math.sqrt((x * x) + (y * y) + (z * z) + (w * w));
    }
    static dot(a, b) {
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z) + (a.w * b.w);
    }
    static min(a, b, out) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        out.w = Math.min(a.w, b.w);
    }
    static max(a, b, out) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        out.w = Math.max(a.w, b.w);
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
Vector4.ZERO = new Vector4();
Vector4.ONE = new Vector4(1.0, 1.0, 1.0, 1.0);
Vector4.UnitX = new Vector4(1.0, 0.0, 0.0, 0.0);
Vector4.UnitY = new Vector4(0.0, 1.0, 0.0, 0.0);
Vector4.UnitZ = new Vector4(0.0, 0.0, 1.0, 0.0);
Vector4.UnitW = new Vector4(0.0, 0.0, 0.0, 1.0);
