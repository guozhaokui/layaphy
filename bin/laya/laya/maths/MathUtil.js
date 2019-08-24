export class MathUtil {
    static subtractVector3(l, r, o) {
        o[0] = l[0] - r[0];
        o[1] = l[1] - r[1];
        o[2] = l[2] - r[2];
    }
    static lerp(left, right, amount) {
        return left * (1 - amount) + right * amount;
    }
    static scaleVector3(f, b, e) {
        e[0] = f[0] * b;
        e[1] = f[1] * b;
        e[2] = f[2] * b;
    }
    static lerpVector3(l, r, t, o) {
        var ax = l[0], ay = l[1], az = l[2];
        o[0] = ax + t * (r[0] - ax);
        o[1] = ay + t * (r[1] - ay);
        o[2] = az + t * (r[2] - az);
    }
    static lerpVector4(l, r, t, o) {
        var ax = l[0], ay = l[1], az = l[2], aw = l[3];
        o[0] = ax + t * (r[0] - ax);
        o[1] = ay + t * (r[1] - ay);
        o[2] = az + t * (r[2] - az);
        o[3] = aw + t * (r[3] - aw);
    }
    static slerpQuaternionArray(a, Offset1, b, Offset2, t, out, Offset3) {
        var ax = a[Offset1 + 0], ay = a[Offset1 + 1], az = a[Offset1 + 2], aw = a[Offset1 + 3], bx = b[Offset2 + 0], by = b[Offset2 + 1], bz = b[Offset2 + 2], bw = b[Offset2 + 3];
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
        out[Offset3 + 0] = scale0 * ax + scale1 * bx;
        out[Offset3 + 1] = scale0 * ay + scale1 * by;
        out[Offset3 + 2] = scale0 * az + scale1 * bz;
        out[Offset3 + 3] = scale0 * aw + scale1 * bw;
        return out;
    }
    static getRotation(x0, y0, x1, y1) {
        return Math.atan2(y1 - y0, x1 - x0) / Math.PI * 180;
    }
    static sortBigFirst(a, b) {
        if (a == b)
            return 0;
        return b > a ? 1 : -1;
    }
    static sortSmallFirst(a, b) {
        if (a == b)
            return 0;
        return b > a ? -1 : 1;
    }
    static sortNumBigFirst(a, b) {
        return parseFloat(b) - parseFloat(a);
    }
    static sortNumSmallFirst(a, b) {
        return parseFloat(a) - parseFloat(b);
    }
    static sortByKey(key, bigFirst = false, forceNum = true) {
        var _sortFun;
        if (bigFirst) {
            _sortFun = forceNum ? MathUtil.sortNumBigFirst : MathUtil.sortBigFirst;
        }
        else {
            _sortFun = forceNum ? MathUtil.sortNumSmallFirst : MathUtil.sortSmallFirst;
        }
        return function (a, b) {
            return _sortFun(a[key], b[key]);
        };
    }
}
