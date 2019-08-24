export class GradientColor {
    constructor() {
        this._type = 0;
        this._constant = null;
        this._constantMin = null;
        this._constantMax = null;
        this._gradient = null;
        this._gradientMin = null;
        this._gradientMax = null;
    }
    static createByConstant(constant) {
        var gradientColor = new GradientColor();
        gradientColor._type = 0;
        gradientColor._constant = constant;
        return gradientColor;
    }
    static createByGradient(gradient) {
        var gradientColor = new GradientColor();
        gradientColor._type = 1;
        gradientColor._gradient = gradient;
        return gradientColor;
    }
    static createByRandomTwoConstant(minConstant, maxConstant) {
        var gradientColor = new GradientColor();
        gradientColor._type = 2;
        gradientColor._constantMin = minConstant;
        gradientColor._constantMax = maxConstant;
        return gradientColor;
    }
    static createByRandomTwoGradient(minGradient, maxGradient) {
        var gradientColor = new GradientColor();
        gradientColor._type = 3;
        gradientColor._gradientMin = minGradient;
        gradientColor._gradientMax = maxGradient;
        return gradientColor;
    }
    get type() {
        return this._type;
    }
    get constant() {
        return this._constant;
    }
    get constantMin() {
        return this._constantMin;
    }
    get constantMax() {
        return this._constantMax;
    }
    get gradient() {
        return this._gradient;
    }
    get gradientMin() {
        return this._gradientMin;
    }
    get gradientMax() {
        return this._gradientMax;
    }
    cloneTo(destObject) {
        var destGradientColor = destObject;
        destGradientColor._type = this._type;
        this._constant.cloneTo(destGradientColor._constant);
        this._constantMin.cloneTo(destGradientColor._constantMin);
        this._constantMax.cloneTo(destGradientColor._constantMax);
        this._gradient.cloneTo(destGradientColor._gradient);
        this._gradientMin.cloneTo(destGradientColor._gradientMin);
        this._gradientMax.cloneTo(destGradientColor._gradientMax);
    }
    clone() {
        var destGradientColor = new GradientColor();
        this.cloneTo(destGradientColor);
        return destGradientColor;
    }
}
