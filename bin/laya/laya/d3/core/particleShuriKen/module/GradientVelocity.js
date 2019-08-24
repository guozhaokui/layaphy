export class GradientVelocity {
    constructor() {
        this._type = 0;
        this._constant = null;
        this._gradientX = null;
        this._gradientY = null;
        this._gradientZ = null;
        this._constantMin = null;
        this._constantMax = null;
        this._gradientXMin = null;
        this._gradientXMax = null;
        this._gradientYMin = null;
        this._gradientYMax = null;
        this._gradientZMin = null;
        this._gradientZMax = null;
    }
    static createByConstant(constant) {
        var gradientVelocity = new GradientVelocity();
        gradientVelocity._type = 0;
        gradientVelocity._constant = constant;
        return gradientVelocity;
    }
    static createByGradient(gradientX, gradientY, gradientZ) {
        var gradientVelocity = new GradientVelocity();
        gradientVelocity._type = 1;
        gradientVelocity._gradientX = gradientX;
        gradientVelocity._gradientY = gradientY;
        gradientVelocity._gradientZ = gradientZ;
        return gradientVelocity;
    }
    static createByRandomTwoConstant(constantMin, constantMax) {
        var gradientVelocity = new GradientVelocity();
        gradientVelocity._type = 2;
        gradientVelocity._constantMin = constantMin;
        gradientVelocity._constantMax = constantMax;
        return gradientVelocity;
    }
    static createByRandomTwoGradient(gradientXMin, gradientXMax, gradientYMin, gradientYMax, gradientZMin, gradientZMax) {
        var gradientVelocity = new GradientVelocity();
        gradientVelocity._type = 3;
        gradientVelocity._gradientXMin = gradientXMin;
        gradientVelocity._gradientXMax = gradientXMax;
        gradientVelocity._gradientYMin = gradientYMin;
        gradientVelocity._gradientYMax = gradientYMax;
        gradientVelocity._gradientZMin = gradientZMin;
        gradientVelocity._gradientZMax = gradientZMax;
        return gradientVelocity;
    }
    get type() {
        return this._type;
    }
    get constant() {
        return this._constant;
    }
    get gradientX() {
        return this._gradientX;
    }
    get gradientY() {
        return this._gradientY;
    }
    get gradientZ() {
        return this._gradientZ;
    }
    get constantMin() {
        return this._constantMin;
    }
    get constantMax() {
        return this._constantMax;
    }
    get gradientXMin() {
        return this._gradientXMin;
    }
    get gradientXMax() {
        return this._gradientXMax;
    }
    get gradientYMin() {
        return this._gradientYMin;
    }
    get gradientYMax() {
        return this._gradientYMax;
    }
    get gradientZMin() {
        return this._gradientZMin;
    }
    get gradientZMax() {
        return this._gradientZMax;
    }
    cloneTo(destObject) {
        var destGradientVelocity = destObject;
        destGradientVelocity._type = this._type;
        this._constant.cloneTo(destGradientVelocity._constant);
        this._gradientX.cloneTo(destGradientVelocity._gradientX);
        this._gradientY.cloneTo(destGradientVelocity._gradientY);
        this._gradientZ.cloneTo(destGradientVelocity._gradientZ);
        this._constantMin.cloneTo(destGradientVelocity._constantMin);
        this._constantMax.cloneTo(destGradientVelocity._constantMax);
        this._gradientXMin.cloneTo(destGradientVelocity._gradientXMin);
        this._gradientXMax.cloneTo(destGradientVelocity._gradientXMax);
        this._gradientYMin.cloneTo(destGradientVelocity._gradientYMin);
        this._gradientYMax.cloneTo(destGradientVelocity._gradientYMax);
        this._gradientZMin.cloneTo(destGradientVelocity._gradientZMin);
        this._gradientZMax.cloneTo(destGradientVelocity._gradientZMax);
    }
    clone() {
        var destGradientVelocity = new GradientVelocity();
        this.cloneTo(destGradientVelocity);
        return destGradientVelocity;
    }
}
