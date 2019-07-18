import { Handler } from "../utils/Handler";
import { Component } from "../components/Component";
export class EffectBase extends Component {
    constructor() {
        super(...arguments);
        this.duration = 1000;
        this.delay = 0;
        this.repeat = 0;
        this.autoDestroyAtComplete = true;
    }
    _onAwake() {
        this.target = this.target || this.owner;
        if (this.autoDestroyAtComplete)
            this._comlete = Handler.create(this.target, this.target.destroy, null, false);
        if (this.eventName)
            this.owner.on(this.eventName, this, this._exeTween);
        else
            this._exeTween();
    }
    _exeTween() {
        this._tween = this._doTween();
        this._tween.repeat = this.repeat;
    }
    _doTween() {
        return null;
    }
    onReset() {
        this.duration = 1000;
        this.delay = 0;
        this.repeat = 0;
        this.ease = null;
        this.target = null;
        if (this.eventName) {
            this.owner.off(this.eventName, this, this._exeTween);
            this.eventName = null;
        }
        if (this._comlete) {
            this._comlete.recover();
            this._comlete = null;
        }
        if (this._tween) {
            this._tween.clear();
            this._tween = null;
        }
    }
}
