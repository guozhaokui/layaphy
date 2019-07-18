export class StartFrame {
    constructor() {
        this._type = 0;
        this._constant = 0;
        this._constantMin = 0;
        this._constantMax = 0;
    }
    static createByConstant(constant) {
        var rotationOverLifetime = new StartFrame();
        rotationOverLifetime._type = 0;
        rotationOverLifetime._constant = constant;
        return rotationOverLifetime;
    }
    static createByRandomTwoConstant(constantMin, constantMax) {
        var rotationOverLifetime = new StartFrame();
        rotationOverLifetime._type = 1;
        rotationOverLifetime._constantMin = constantMin;
        rotationOverLifetime._constantMax = constantMax;
        return rotationOverLifetime;
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
    cloneTo(destObject) {
        var destStartFrame = destObject;
        destStartFrame._type = this._type;
        destStartFrame._constant = this._constant;
        destStartFrame._constantMin = this._constantMin;
        destStartFrame._constantMax = this._constantMax;
    }
    clone() {
        var destStartFrame = new StartFrame();
        this.cloneTo(destStartFrame);
        return destStartFrame;
    }
}
