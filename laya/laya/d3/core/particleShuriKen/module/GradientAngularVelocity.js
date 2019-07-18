export class GradientAngularVelocity {
    constructor() {
        this._type = 0;
        this._separateAxes = false;
        this._constant = 0;
        this._constantSeparate = null;
        this._gradient = null;
        this._gradientX = null;
        this._gradientY = null;
        this._gradientZ = null;
        this._gradientW = null;
        this._constantMin = 0;
        this._constantMax = 0;
        this._constantMinSeparate = null;
        this._constantMaxSeparate = null;
        this._gradientMin = null;
        this._gradientMax = null;
        this._gradientXMin = null;
        this._gradientXMax = null;
        this._gradientYMin = null;
        this._gradientYMax = null;
        this._gradientZMin = null;
        this._gradientZMax = null;
        this._gradientWMin = null;
        this._gradientWMax = null;
    }
    static createByConstant(constant) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 0;
        gradientAngularVelocity._separateAxes = false;
        gradientAngularVelocity._constant = constant;
        return gradientAngularVelocity;
    }
    static createByConstantSeparate(separateConstant) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 0;
        gradientAngularVelocity._separateAxes = true;
        gradientAngularVelocity._constantSeparate = separateConstant;
        return gradientAngularVelocity;
    }
    static createByGradient(gradient) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 1;
        gradientAngularVelocity._separateAxes = false;
        gradientAngularVelocity._gradient = gradient;
        return gradientAngularVelocity;
    }
    static createByGradientSeparate(gradientX, gradientY, gradientZ) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 1;
        gradientAngularVelocity._separateAxes = true;
        gradientAngularVelocity._gradientX = gradientX;
        gradientAngularVelocity._gradientY = gradientY;
        gradientAngularVelocity._gradientZ = gradientZ;
        return gradientAngularVelocity;
    }
    static createByRandomTwoConstant(constantMin, constantMax) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 2;
        gradientAngularVelocity._separateAxes = false;
        gradientAngularVelocity._constantMin = constantMin;
        gradientAngularVelocity._constantMax = constantMax;
        return gradientAngularVelocity;
    }
    static createByRandomTwoConstantSeparate(separateConstantMin, separateConstantMax) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 2;
        gradientAngularVelocity._separateAxes = true;
        gradientAngularVelocity._constantMinSeparate = separateConstantMin;
        gradientAngularVelocity._constantMaxSeparate = separateConstantMax;
        return gradientAngularVelocity;
    }
    static createByRandomTwoGradient(gradientMin, gradientMax) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 3;
        gradientAngularVelocity._separateAxes = false;
        gradientAngularVelocity._gradientMin = gradientMin;
        gradientAngularVelocity._gradientMax = gradientMax;
        return gradientAngularVelocity;
    }
    static createByRandomTwoGradientSeparate(gradientXMin, gradientXMax, gradientYMin, gradientYMax, gradientZMin, gradientZMax, gradientWMin, gradientWMax) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 3;
        gradientAngularVelocity._separateAxes = true;
        gradientAngularVelocity._gradientXMin = gradientXMin;
        gradientAngularVelocity._gradientXMax = gradientXMax;
        gradientAngularVelocity._gradientYMin = gradientYMin;
        gradientAngularVelocity._gradientYMax = gradientYMax;
        gradientAngularVelocity._gradientZMin = gradientZMin;
        gradientAngularVelocity._gradientZMax = gradientZMax;
        gradientAngularVelocity._gradientWMin = gradientWMin;
        gradientAngularVelocity._gradientWMax = gradientWMax;
        return gradientAngularVelocity;
    }
    get type() {
        return this._type;
    }
    get separateAxes() {
        return this._separateAxes;
    }
    get constant() {
        return this._constant;
    }
    get constantSeparate() {
        return this._constantSeparate;
    }
    get gradient() {
        return this._gradient;
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
    get gradientW() {
        return this._gradientW;
    }
    get constantMin() {
        return this._constantMin;
    }
    get constantMax() {
        return this._constantMax;
    }
    get constantMinSeparate() {
        return this._constantMinSeparate;
    }
    get constantMaxSeparate() {
        return this._constantMaxSeparate;
    }
    get gradientMin() {
        return this._gradientMin;
    }
    get gradientMax() {
        return this._gradientMax;
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
    get gradientWMin() {
        return this._gradientWMin;
    }
    get gradientWMax() {
        return this._gradientWMax;
    }
    cloneTo(destObject) {
        var destGradientAngularVelocity = destObject;
        destGradientAngularVelocity._type = this._type;
        destGradientAngularVelocity._separateAxes = this._separateAxes;
        destGradientAngularVelocity._constant = this._constant;
        this._constantSeparate.cloneTo(destGradientAngularVelocity._constantSeparate);
        this._gradient.cloneTo(destGradientAngularVelocity._gradient);
        this._gradientX.cloneTo(destGradientAngularVelocity._gradientX);
        this._gradientY.cloneTo(destGradientAngularVelocity._gradientY);
        this._gradientZ.cloneTo(destGradientAngularVelocity._gradientZ);
        destGradientAngularVelocity._constantMin = this._constantMin;
        destGradientAngularVelocity._constantMax = this._constantMax;
        this._constantMinSeparate.cloneTo(destGradientAngularVelocity._constantMinSeparate);
        this._constantMaxSeparate.cloneTo(destGradientAngularVelocity._constantMaxSeparate);
        this._gradientMin.cloneTo(destGradientAngularVelocity._gradientMin);
        this._gradientMax.cloneTo(destGradientAngularVelocity._gradientMax);
        this._gradientXMin.cloneTo(destGradientAngularVelocity._gradientXMin);
        this._gradientXMax.cloneTo(destGradientAngularVelocity._gradientXMax);
        this._gradientYMin.cloneTo(destGradientAngularVelocity._gradientYMin);
        this._gradientYMax.cloneTo(destGradientAngularVelocity._gradientYMax);
        this._gradientZMin.cloneTo(destGradientAngularVelocity._gradientZMin);
        this._gradientZMax.cloneTo(destGradientAngularVelocity._gradientZMax);
    }
    clone() {
        var destGradientAngularVelocity = new GradientAngularVelocity();
        this.cloneTo(destGradientAngularVelocity);
        return destGradientAngularVelocity;
    }
}
