import { MathUtils3D } from "../MathUtils3D";
export class ConchVector4 {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        var v = this.elements = new Float32Array(4);
        v[0] = x;
        v[1] = y;
        v[2] = z;
        v[3] = w;
    }
    get x() {
        return this.elements[0];
    }
    set x(value) {
        this.elements[0] = value;
    }
    get y() {
        return this.elements[1];
    }
    set y(value) {
        this.elements[1] = value;
    }
    get z() {
        return this.elements[2];
    }
    set z(value) {
        this.elements[2] = value;
    }
    get w() {
        return this.elements[3];
    }
    set w(value) {
        this.elements[3] = value;
    }
    fromArray(array, offset = 0) {
        this.elements[0] = array[offset + 0];
        this.elements[1] = array[offset + 1];
        this.elements[2] = array[offset + 2];
        this.elements[3] = array[offset + 3];
    }
    cloneTo(destObject) {
        var destVector4 = destObject;
        var destE = destVector4.elements;
        var s = this.elements;
        destE[0] = s[0];
        destE[1] = s[1];
        destE[2] = s[2];
        destE[3] = s[3];
    }
    clone() {
        var destVector4 = new ConchVector4();
        this.cloneTo(destVector4);
        return destVector4;
    }
    static lerp(a, b, t, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        var ax = f[0], ay = f[1], az = f[2], aw = f[3];
        e[0] = ax + t * (g[0] - ax);
        e[1] = ay + t * (g[1] - ay);
        e[2] = az + t * (g[2] - az);
        e[3] = aw + t * (g[3] - aw);
    }
    static transformByM4x4(vector4, m4x4, out) {
        var ve = vector4.elements;
        var vx = ve[0];
        var vy = ve[1];
        var vz = ve[2];
        var vw = ve[3];
        var me = m4x4.elements;
        var oe = out.elements;
        oe[0] = vx * me[0] + vy * me[4] + vz * me[8] + vw * me[12];
        oe[1] = vx * me[1] + vy * me[5] + vz * me[9] + vw * me[13];
        oe[2] = vx * me[2] + vy * me[6] + vz * me[10] + vw * me[14];
        oe[3] = vx * me[3] + vy * me[7] + vz * me[11] + vw * me[15];
    }
    static equals(a, b) {
        var ae = a.elements;
        var be = b.elements;
        return MathUtils3D.nearEqual(Math.abs(ae[0]), Math.abs(be[0])) && MathUtils3D.nearEqual(Math.abs(ae[1]), Math.abs(be[1])) && MathUtils3D.nearEqual(Math.abs(ae[2]), Math.abs(be[2])) && MathUtils3D.nearEqual(Math.abs(ae[3]), Math.abs(be[3]));
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    static normalize(s, out) {
        var se = s.elements;
        var oe = out.elements;
        var len = s.length();
        if (len > 0) {
            oe[0] = se[0] * len;
            oe[1] = se[1] * len;
            oe[2] = se[2] * len;
            oe[3] = se[3] * len;
        }
    }
    static add(a, b, out) {
        var oe = out.elements;
        var ae = a.elements;
        var be = b.elements;
        oe[0] = ae[0] + be[0];
        oe[1] = ae[1] + be[1];
        oe[2] = ae[2] + be[2];
        oe[3] = ae[3] + be[3];
    }
    static subtract(a, b, out) {
        var oe = out.elements;
        var ae = a.elements;
        var be = b.elements;
        oe[0] = ae[0] - be[0];
        oe[1] = ae[1] - be[1];
        oe[2] = ae[2] - be[2];
        oe[3] = ae[3] - be[3];
    }
    static multiply(a, b, out) {
        var oe = out.elements;
        var ae = a.elements;
        var be = b.elements;
        oe[0] = ae[0] * be[0];
        oe[1] = ae[1] * be[1];
        oe[2] = ae[2] * be[2];
        oe[3] = ae[3] * be[3];
    }
    static scale(a, b, out) {
        var oe = out.elements;
        var ae = a.elements;
        oe[0] = ae[0] * b;
        oe[1] = ae[1] * b;
        oe[2] = ae[2] * b;
        oe[3] = ae[3] * b;
    }
    static Clamp(value, min, max, out) {
        var valuee = value.elements;
        var x = valuee[0];
        var y = valuee[1];
        var z = valuee[2];
        var w = valuee[3];
        var mine = min.elements;
        var mineX = mine[0];
        var mineY = mine[1];
        var mineZ = mine[2];
        var mineW = mine[3];
        var maxe = max.elements;
        var maxeX = maxe[0];
        var maxeY = maxe[1];
        var maxeZ = maxe[2];
        var maxeW = maxe[3];
        var oute = out.elements;
        x = (x > maxeX) ? maxeX : x;
        x = (x < mineX) ? mineX : x;
        y = (y > maxeY) ? maxeY : y;
        y = (y < mineY) ? mineY : y;
        z = (z > maxeZ) ? maxeZ : z;
        z = (z < mineZ) ? mineZ : z;
        w = (w > maxeW) ? maxeW : w;
        w = (w < mineW) ? mineW : w;
        oute[0] = x;
        oute[1] = y;
        oute[2] = z;
        oute[3] = w;
    }
    static distanceSquared(value1, value2) {
        var value1e = value1.elements;
        var value2e = value2.elements;
        var x = value1e[0] - value2e[0];
        var y = value1e[1] - value2e[1];
        var z = value1e[2] - value2e[2];
        var w = value1e[3] - value2e[3];
        return (x * x) + (y * y) + (z * z) + (w * w);
    }
    static distance(value1, value2) {
        var value1e = value1.elements;
        var value2e = value2.elements;
        var x = value1e[0] - value2e[0];
        var y = value1e[1] - value2e[1];
        var z = value1e[2] - value2e[2];
        var w = value1e[3] - value2e[3];
        return Math.sqrt((x * x) + (y * y) + (z * z) + (w * w));
    }
    static dot(a, b) {
        var ae = a.elements;
        var be = b.elements;
        var r = (ae[0] * be[0]) + (ae[1] * be[1]) + (ae[2] * be[2]) + (ae[3] * be[3]);
        return r;
    }
    static min(a, b, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        e[0] = Math.min(f[0], g[0]);
        e[1] = Math.min(f[1], g[1]);
        e[2] = Math.min(f[2], g[2]);
        e[3] = Math.min(f[3], g[3]);
    }
    static max(a, b, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        e[0] = Math.max(f[0], g[0]);
        e[1] = Math.max(f[1], g[1]);
        e[2] = Math.max(f[2], g[2]);
        e[3] = Math.max(f[3], g[3]);
    }
}
ConchVector4.ZERO = new ConchVector4();
ConchVector4.ONE = new ConchVector4(1.0, 1.0, 1.0, 1.0);
ConchVector4.UnitX = new ConchVector4(1.0, 0.0, 0.0, 0.0);
ConchVector4.UnitY = new ConchVector4(0.0, 1.0, 0.0, 0.0);
ConchVector4.UnitZ = new ConchVector4(0.0, 0.0, 1.0, 0.0);
ConchVector4.UnitW = new ConchVector4(0.0, 0.0, 0.0, 1.0);
