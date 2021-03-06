import { ConchVector4 } from "./ConchVector4";
import { MathUtils3D } from "../MathUtils3D";
export class ConchVector3 {
    constructor(x = 0, y = 0, z = 0, nativeElements = null) {
        var v;
        if (nativeElements) {
            v = nativeElements;
        }
        else {
            v = new Float32Array(3);
        }
        this.elements = v;
        v[0] = x;
        v[1] = y;
        v[2] = z;
    }
    static distanceSquared(value1, value2) {
        var value1e = value1.elements;
        var value2e = value2.elements;
        var x = value1e[0] - value2e[0];
        var y = value1e[1] - value2e[1];
        var z = value1e[2] - value2e[2];
        return (x * x) + (y * y) + (z * z);
    }
    static distance(value1, value2) {
        var value1e = value1.elements;
        var value2e = value2.elements;
        var x = value1e[0] - value2e[0];
        var y = value1e[1] - value2e[1];
        var z = value1e[2] - value2e[2];
        return Math.sqrt((x * x) + (y * y) + (z * z));
    }
    static min(a, b, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        e[0] = Math.min(f[0], g[0]);
        e[1] = Math.min(f[1], g[1]);
        e[2] = Math.min(f[2], g[2]);
    }
    static max(a, b, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        e[0] = Math.max(f[0], g[0]);
        e[1] = Math.max(f[1], g[1]);
        e[2] = Math.max(f[2], g[2]);
    }
    static transformQuat(source, rotation, out) {
        var destination = out.elements;
        var se = source.elements;
        var re = rotation.elements;
        var x = se[0], y = se[1], z = se[2], qx = re[0], qy = re[1], qz = re[2], qw = re[3], ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
        destination[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        destination[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        destination[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    }
    static scalarLength(a) {
        var f = a.elements;
        var x = f[0], y = f[1], z = f[2];
        return Math.sqrt(x * x + y * y + z * z);
    }
    static scalarLengthSquared(a) {
        var f = a.elements;
        var x = f[0], y = f[1], z = f[2];
        return x * x + y * y + z * z;
    }
    static normalize(s, out) {
        var se = s.elements;
        var oe = out.elements;
        var x = se[0], y = se[1], z = se[2];
        var len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            oe[0] = se[0] * len;
            oe[1] = se[1] * len;
            oe[2] = se[2] * len;
        }
    }
    static multiply(a, b, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        e[0] = f[0] * g[0];
        e[1] = f[1] * g[1];
        e[2] = f[2] * g[2];
    }
    static scale(a, b, out) {
        var e = out.elements;
        var f = a.elements;
        e[0] = f[0] * b;
        e[1] = f[1] * b;
        e[2] = f[2] * b;
    }
    static lerp(a, b, t, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        var ax = f[0], ay = f[1], az = f[2];
        e[0] = ax + t * (g[0] - ax);
        e[1] = ay + t * (g[1] - ay);
        e[2] = az + t * (g[2] - az);
    }
    static transformV3ToV3(vector, transform, result) {
        var intermediate = ConchVector3._tempVector4;
        ConchVector3.transformV3ToV4(vector, transform, intermediate);
        var intermediateElem = intermediate.elements;
        var resultElem = result.elements;
        resultElem[0] = intermediateElem[0];
        resultElem[1] = intermediateElem[1];
        resultElem[2] = intermediateElem[2];
    }
    static transformV3ToV4(vector, transform, result) {
        var vectorElem = vector.elements;
        var vectorX = vectorElem[0];
        var vectorY = vectorElem[1];
        var vectorZ = vectorElem[2];
        var transformElem = transform.elements;
        var resultElem = result.elements;
        resultElem[0] = (vectorX * transformElem[0]) + (vectorY * transformElem[4]) + (vectorZ * transformElem[8]) + transformElem[12];
        resultElem[1] = (vectorX * transformElem[1]) + (vectorY * transformElem[5]) + (vectorZ * transformElem[9]) + transformElem[13];
        resultElem[2] = (vectorX * transformElem[2]) + (vectorY * transformElem[6]) + (vectorZ * transformElem[10]) + transformElem[14];
        resultElem[3] = (vectorX * transformElem[3]) + (vectorY * transformElem[7]) + (vectorZ * transformElem[11]) + transformElem[15];
    }
    static TransformNormal(normal, transform, result) {
        var normalElem = normal.elements;
        var normalX = normalElem[0];
        var normalY = normalElem[1];
        var normalZ = normalElem[2];
        var transformElem = transform.elements;
        var resultElem = result.elements;
        resultElem[0] = (normalX * transformElem[0]) + (normalY * transformElem[4]) + (normalZ * transformElem[8]);
        resultElem[1] = (normalX * transformElem[1]) + (normalY * transformElem[5]) + (normalZ * transformElem[9]);
        resultElem[2] = (normalX * transformElem[2]) + (normalY * transformElem[6]) + (normalZ * transformElem[10]);
    }
    static transformCoordinate(coordinate, transform, result) {
        var coordinateElem = coordinate.elements;
        var coordinateX = coordinateElem[0];
        var coordinateY = coordinateElem[1];
        var coordinateZ = coordinateElem[2];
        var transformElem = transform.elements;
        var w = ((coordinateX * transformElem[3]) + (coordinateY * transformElem[7]) + (coordinateZ * transformElem[11]) + transformElem[15]);
        var resultElem = result.elements;
        resultElem[0] = (coordinateX * transformElem[0]) + (coordinateY * transformElem[4]) + (coordinateZ * transformElem[8]) + transformElem[12] / w;
        resultElem[1] = (coordinateX * transformElem[1]) + (coordinateY * transformElem[5]) + (coordinateZ * transformElem[9]) + transformElem[13] / w;
        resultElem[2] = (coordinateX * transformElem[2]) + (coordinateY * transformElem[6]) + (coordinateZ * transformElem[10]) + transformElem[14] / w;
    }
    static Clamp(value, min, max, out) {
        var valuee = value.elements;
        var x = valuee[0];
        var y = valuee[1];
        var z = valuee[2];
        var mine = min.elements;
        var mineX = mine[0];
        var mineY = mine[1];
        var mineZ = mine[2];
        var maxe = max.elements;
        var maxeX = maxe[0];
        var maxeY = maxe[1];
        var maxeZ = maxe[2];
        var oute = out.elements;
        x = (x > maxeX) ? maxeX : x;
        x = (x < mineX) ? mineX : x;
        y = (y > maxeY) ? maxeY : y;
        y = (y < mineY) ? mineY : y;
        z = (z > maxeZ) ? maxeZ : z;
        z = (z < mineZ) ? mineZ : z;
        oute[0] = x;
        oute[1] = y;
        oute[2] = z;
    }
    static add(a, b, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        e[0] = f[0] + g[0];
        e[1] = f[1] + g[1];
        e[2] = f[2] + g[2];
    }
    static subtract(a, b, o) {
        var oe = o.elements;
        var ae = a.elements;
        var be = b.elements;
        oe[0] = ae[0] - be[0];
        oe[1] = ae[1] - be[1];
        oe[2] = ae[2] - be[2];
    }
    static cross(a, b, o) {
        var ae = a.elements;
        var be = b.elements;
        var oe = o.elements;
        var ax = ae[0], ay = ae[1], az = ae[2], bx = be[0], by = be[1], bz = be[2];
        oe[0] = ay * bz - az * by;
        oe[1] = az * bx - ax * bz;
        oe[2] = ax * by - ay * bx;
    }
    static dot(a, b) {
        var ae = a.elements;
        var be = b.elements;
        var r = (ae[0] * be[0]) + (ae[1] * be[1]) + (ae[2] * be[2]);
        return r;
    }
    static equals(a, b) {
        var ae = a.elements;
        var be = b.elements;
        return MathUtils3D.nearEqual(ae[0], be[0]) && MathUtils3D.nearEqual(ae[1], be[1]) && MathUtils3D.nearEqual(ae[2], be[2]);
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
    setValue(x, y, z) {
        this.elements[0] = x;
        this.elements[1] = y;
        this.elements[2] = z;
    }
    fromArray(array, offset = 0) {
        this.elements[0] = array[offset + 0];
        this.elements[1] = array[offset + 1];
        this.elements[2] = array[offset + 2];
    }
    cloneTo(destObject) {
        var destVector3 = destObject;
        var destE = destVector3.elements;
        var s = this.elements;
        destE[0] = s[0];
        destE[1] = s[1];
        destE[2] = s[2];
    }
    clone() {
        var destVector3 = new ConchVector3();
        this.cloneTo(destVector3);
        return destVector3;
    }
    toDefault() {
        this.elements[0] = 0;
        this.elements[1] = 0;
        this.elements[2] = 0;
    }
}
ConchVector3._tempVector4 = new ConchVector4();
ConchVector3.ZERO = new ConchVector3(0.0, 0.0, 0.0);
ConchVector3.ONE = new ConchVector3(1.0, 1.0, 1.0);
ConchVector3.NegativeUnitX = new ConchVector3(-1, 0, 0);
ConchVector3.UnitX = new ConchVector3(1, 0, 0);
ConchVector3.UnitY = new ConchVector3(0, 1, 0);
ConchVector3.UnitZ = new ConchVector3(0, 0, 1);
ConchVector3.ForwardRH = new ConchVector3(0, 0, -1);
ConchVector3.ForwardLH = new ConchVector3(0, 0, 1);
ConchVector3.Up = new ConchVector3(0, 1, 0);
ConchVector3.NAN = new ConchVector3(NaN, NaN, NaN);
