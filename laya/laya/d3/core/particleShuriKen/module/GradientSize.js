export class GradientSize {
    constructor() {
        this._type = 0;
        this._separateAxes = false;
        this._gradient = null;
        this._gradientX = null;
        this._gradientY = null;
        this._gradientZ = null;
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
    }
    static createByGradient(gradient) {
        var gradientSize = new GradientSize();
        gradientSize._type = 0;
        gradientSize._separateAxes = false;
        gradientSize._gradient = gradient;
        return gradientSize;
    }
    static createByGradientSeparate(gradientX, gradientY, gradientZ) {
        var gradientSize = new GradientSize();
        gradientSize._type = 0;
        gradientSize._separateAxes = true;
        gradientSize._gradientX = gradientX;
        gradientSize._gradientY = gradientY;
        gradientSize._gradientZ = gradientZ;
        return gradientSize;
    }
    static createByRandomTwoConstant(constantMin, constantMax) {
        var gradientSize = new GradientSize();
        gradientSize._type = 1;
        gradientSize._separateAxes = false;
        gradientSize._constantMin = constantMin;
        gradientSize._constantMax = constantMax;
        return gradientSize;
    }
    static createByRandomTwoConstantSeparate(constantMinSeparate, constantMaxSeparate) {
        var gradientSize = new GradientSize();
        gradientSize._type = 1;
        gradientSize._separateAxes = true;
        gradientSize._constantMinSeparate = constantMinSeparate;
        gradientSize._constantMaxSeparate = constantMaxSeparate;
        return gradientSize;
    }
    static createByRandomTwoGradient(gradientMin, gradientMax) {
        var gradientSize = new GradientSize();
        gradientSize._type = 2;
        gradientSize._separateAxes = false;
        gradientSize._gradientMin = gradientMin;
        gradientSize._gradientMax = gradientMax;
        return gradientSize;
    }
    static createByRandomTwoGradientSeparate(gradientXMin, gradientXMax, gradientYMin, gradientYMax, gradientZMin, gradientZMax) {
        var gradientSize = new GradientSize();
        gradientSize._type = 2;
        gradientSize._separateAxes = true;
        gradientSize._gradientXMin = gradientXMin;
        gradientSize._gradientXMax = gradientXMax;
        gradientSize._gradientYMin = gradientYMin;
        gradientSize._gradientYMax = gradientYMax;
        gradientSize._gradientZMin = gradientZMin;
        gradientSize._gradientZMax = gradientZMax;
        return gradientSize;
    }
    get type() {
        return this._type;
    }
    get separateAxes() {
        return this._separateAxes;
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
    getMaxSizeInGradient() {
        var i, n;
        var maxSize = -Number.MAX_VALUE;
        switch (this._type) {
            case 0:
                if (this._separateAxes) {
                    for (i = 0, n = this._gradientX.gradientCount; i < n; i++)
                        maxSize = Math.max(maxSize, this._gradientX.getValueByIndex(i));
                    for (i = 0, n = this._gradientY.gradientCount; i < n; i++)
                        maxSize = Math.max(maxSize, this._gradientY.getValueByIndex(i));
                }
                else {
                    for (i = 0, n = this._gradient.gradientCount; i < n; i++)
                        maxSize = Math.max(maxSize, this._gradient.getValueByIndex(i));
                }
                break;
            case 1:
                if (this._separateAxes) {
                    maxSize = Math.max(this._constantMinSeparate.x, this._constantMaxSeparate.x);
                    maxSize = Math.max(maxSize, this._constantMinSeparate.y);
                    maxSize = Math.max(maxSize, this._constantMaxSeparate.y);
                }
                else {
                    maxSize = Math.max(this._constantMin, this._constantMax);
                }
                break;
            case 2:
                if (this._separateAxes) {
                    for (i = 0, n = this._gradientXMin.gradientCount; i < n; i++)
                        maxSize = Math.max(maxSize, this._gradientXMin.getValueByIndex(i));
                    for (i = 0, n = this._gradientXMax.gradientCount; i < n; i++)
                        maxSize = Math.max(maxSize, this._gradientXMax.getValueByIndex(i));
                    for (i = 0, n = this._gradientYMin.gradientCount; i < n; i++)
                        maxSize = Math.max(maxSize, this._gradientYMin.getValueByIndex(i));
                    for (i = 0, n = this._gradientZMax.gradientCount; i < n; i++)
                        maxSize = Math.max(maxSize, this._gradientZMax.getValueByIndex(i));
                }
                else {
                    for (i = 0, n = this._gradientMin.gradientCount; i < n; i++)
                        maxSize = Math.max(maxSize, this._gradientMin.getValueByIndex(i));
                    for (i = 0, n = this._gradientMax.gradientCount; i < n; i++)
                        maxSize = Math.max(maxSize, this._gradientMax.getValueByIndex(i));
                }
                break;
        }
        return maxSize;
    }
    cloneTo(destObject) {
        var destGradientSize = destObject;
        destGradientSize._type = this._type;
        destGradientSize._separateAxes = this._separateAxes;
        this._gradient.cloneTo(destGradientSize._gradient);
        this._gradientX.cloneTo(destGradientSize._gradientX);
        this._gradientY.cloneTo(destGradientSize._gradientY);
        this._gradientZ.cloneTo(destGradientSize._gradientZ);
        destGradientSize._constantMin = this._constantMin;
        destGradientSize._constantMax = this._constantMax;
        this._constantMinSeparate.cloneTo(destGradientSize._constantMinSeparate);
        this._constantMaxSeparate.cloneTo(destGradientSize._constantMaxSeparate);
        this._gradientMin.cloneTo(destGradientSize._gradientMin);
        this._gradientMax.cloneTo(destGradientSize._gradientMax);
        this._gradientXMin.cloneTo(destGradientSize._gradientXMin);
        this._gradientXMax.cloneTo(destGradientSize._gradientXMax);
        this._gradientYMin.cloneTo(destGradientSize._gradientYMin);
        this._gradientYMax.cloneTo(destGradientSize._gradientYMax);
        this._gradientZMin.cloneTo(destGradientSize._gradientZMin);
        this._gradientZMax.cloneTo(destGradientSize._gradientZMax);
    }
    clone() {
        var destGradientSize = new GradientSize();
        this.cloneTo(destGradientSize);
        return destGradientSize;
    }
}
