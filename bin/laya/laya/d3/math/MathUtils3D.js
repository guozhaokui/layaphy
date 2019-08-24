export class MathUtils3D {
    constructor() {
    }
    static isZero(v) {
        return Math.abs(v) < MathUtils3D.zeroTolerance;
    }
    static nearEqual(n1, n2) {
        if (MathUtils3D.isZero(n1 - n2))
            return true;
        return false;
    }
    static fastInvSqrt(value) {
        if (MathUtils3D.isZero(value))
            return value;
        return 1.0 / Math.sqrt(value);
    }
}
MathUtils3D.zeroTolerance = 1e-6;
MathUtils3D.MaxValue = 3.40282347e+38;
MathUtils3D.MinValue = -3.40282347e+38;
