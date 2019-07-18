import { GradientVelocity } from "./GradientVelocity";
export class VelocityOverLifetime {
    constructor(velocity) {
        this.enbale = false;
        this.space = 0;
        this._velocity = velocity;
    }
    get velocity() {
        return this._velocity;
    }
    cloneTo(destObject) {
        var destVelocityOverLifetime = destObject;
        this._velocity.cloneTo(destVelocityOverLifetime._velocity);
        destVelocityOverLifetime.enbale = this.enbale;
        destVelocityOverLifetime.space = this.space;
    }
    clone() {
        var destVelocity;
        switch (this._velocity.type) {
            case 0:
                destVelocity = GradientVelocity.createByConstant(this._velocity.constant.clone());
                break;
            case 1:
                destVelocity = GradientVelocity.createByGradient(this._velocity.gradientX.clone(), this._velocity.gradientY.clone(), this._velocity.gradientZ.clone());
                break;
            case 2:
                destVelocity = GradientVelocity.createByRandomTwoConstant(this._velocity.constantMin.clone(), this._velocity.constantMax.clone());
                break;
            case 3:
                destVelocity = GradientVelocity.createByRandomTwoGradient(this._velocity.gradientXMin.clone(), this._velocity.gradientYMin.clone(), this._velocity.gradientZMin.clone(), this._velocity.gradientXMax.clone(), this._velocity.gradientYMax.clone(), this._velocity.gradientZMax.clone());
                break;
        }
        var destVelocityOverLifetime = new VelocityOverLifetime(destVelocity);
        destVelocityOverLifetime.enbale = this.enbale;
        destVelocityOverLifetime.space = this.space;
        return destVelocityOverLifetime;
    }
}
