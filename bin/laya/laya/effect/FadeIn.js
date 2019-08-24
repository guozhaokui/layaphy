import { EffectBase } from "././EffectBase";
import { Tween } from "../utils/Tween";
import { Ease } from "../utils/Ease";
export class FadeIn extends EffectBase {
    _doTween() {
        this.target.alpha = 0;
        return Tween.to(this.target, { alpha: 1 }, this.duration, Ease[this.ease], this._comlete, this.delay);
    }
}
