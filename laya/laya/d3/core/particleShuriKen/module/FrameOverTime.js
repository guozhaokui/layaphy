export class FrameOverTime {
    constructor() {
        this._type = 0;
        this._constant = 0;
        this._overTime = null;
        this._constantMin = 0;
        this._constantMax = 0;
        this._overTimeMin = null;
        this._overTimeMax = null;
    }
    static createByConstant(constant) {
        var rotationOverLifetime = new FrameOverTime();
        rotationOverLifetime._type = 0;
        rotationOverLifetime._constant = constant;
        return rotationOverLifetime;
    }
    static createByOverTime(overTime) {
        var rotationOverLifetime = new FrameOverTime();
        rotationOverLifetime._type = 1;
        rotationOverLifetime._overTime = overTime;
        return rotationOverLifetime;
    }
    static createByRandomTwoConstant(constantMin, constantMax) {
        var rotationOverLifetime = new FrameOverTime();
        rotationOverLifetime._type = 2;
        rotationOverLifetime._constantMin = constantMin;
        rotationOverLifetime._constantMax = constantMax;
        return rotationOverLifetime;
    }
    static createByRandomTwoOverTime(gradientFrameMin, gradientFrameMax) {
        var rotationOverLifetime = new FrameOverTime();
        rotationOverLifetime._type = 3;
        rotationOverLifetime._overTimeMin = gradientFrameMin;
        rotationOverLifetime._overTimeMax = gradientFrameMax;
        return rotationOverLifetime;
    }
    get type() {
        return this._type;
    }
    get constant() {
        return this._constant;
    }
    get frameOverTimeData() {
        return this._overTime;
    }
    get constantMin() {
        return this._constantMin;
    }
    get constantMax() {
        return this._constantMax;
    }
    get frameOverTimeDataMin() {
        return this._overTimeMin;
    }
    get frameOverTimeDataMax() {
        return this._overTimeMax;
    }
    cloneTo(destObject) {
        var destFrameOverTime = destObject;
        destFrameOverTime._type = this._type;
        destFrameOverTime._constant = this._constant;
        this._overTime.cloneTo(destFrameOverTime._overTime);
        destFrameOverTime._constantMin = this._constantMin;
        destFrameOverTime._constantMax = this._constantMax;
        this._overTimeMin.cloneTo(destFrameOverTime._overTimeMin);
        this._overTimeMax.cloneTo(destFrameOverTime._overTimeMax);
    }
    clone() {
        var destFrameOverTime = new FrameOverTime();
        this.cloneTo(destFrameOverTime);
        return destFrameOverTime;
    }
}
