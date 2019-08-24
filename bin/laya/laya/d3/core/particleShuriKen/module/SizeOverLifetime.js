import { GradientSize } from "./GradientSize";
export class SizeOverLifetime {
    get size() {
        return this._size;
    }
    constructor(size) {
        this._size = size;
    }
    cloneTo(destObject) {
        var destSizeOverLifetime = destObject;
        this._size.cloneTo(destSizeOverLifetime._size);
        destSizeOverLifetime.enbale = this.enbale;
    }
    clone() {
        var destSize;
        switch (this._size.type) {
            case 0:
                if (this._size.separateAxes)
                    destSize = GradientSize.createByGradientSeparate(this._size.gradientX.clone(), this._size.gradientY.clone(), this._size.gradientZ.clone());
                else
                    destSize = GradientSize.createByGradient(this._size.gradient.clone());
                break;
            case 1:
                if (this._size.separateAxes)
                    destSize = GradientSize.createByRandomTwoConstantSeparate(this._size.constantMinSeparate.clone(), this._size.constantMaxSeparate.clone());
                else
                    destSize = GradientSize.createByRandomTwoConstant(this._size.constantMin, this._size.constantMax);
                break;
            case 2:
                if (this._size.separateAxes)
                    destSize = GradientSize.createByRandomTwoGradientSeparate(this._size.gradientXMin.clone(), this._size.gradientYMin.clone(), this._size.gradientZMin.clone(), this._size.gradientXMax.clone(), this._size.gradientYMax.clone(), this._size.gradientZMax.clone());
                else
                    destSize = GradientSize.createByRandomTwoGradient(this._size.gradientMin.clone(), this._size.gradientMax.clone());
                break;
        }
        var destSizeOverLifetime = new SizeOverLifetime(destSize);
        destSizeOverLifetime.enbale = this.enbale;
        return destSizeOverLifetime;
    }
}
