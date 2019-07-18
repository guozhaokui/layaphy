import { Pool } from "./Pool";
import { Browser } from "./Browser";
import { Utils } from "./Utils";
import { ILaya } from "./../../ILaya";
export class Tween {
    constructor() {
        this.gid = 0;
        this.repeat = 1;
        this._count = 0;
    }
    static to(target, props, duration, ease = null, complete = null, delay = 0, coverBefore = false, autoRecover = true) {
        return Pool.getItemByClass("tween", Tween)._create(target, props, duration, ease, complete, delay, coverBefore, true, autoRecover, true);
    }
    static from(target, props, duration, ease = null, complete = null, delay = 0, coverBefore = false, autoRecover = true) {
        return Pool.getItemByClass("tween", Tween)._create(target, props, duration, ease, complete, delay, coverBefore, false, autoRecover, true);
    }
    to(target, props, duration, ease = null, complete = null, delay = 0, coverBefore = false) {
        return this._create(target, props, duration, ease, complete, delay, coverBefore, true, false, true);
    }
    from(target, props, duration, ease = null, complete = null, delay = 0, coverBefore = false) {
        return this._create(target, props, duration, ease, complete, delay, coverBefore, false, false, true);
    }
    _create(target, props, duration, ease, complete, delay, coverBefore, isTo, usePool, runNow) {
        if (!target)
            throw new Error("Tween:target is null");
        this._target = target;
        this._duration = duration;
        this._ease = ease || props.ease || Tween.easeNone;
        this._complete = complete || props.complete;
        this._delay = delay;
        this._props = [];
        this._usedTimer = 0;
        this._startTimer = Browser.now();
        this._usedPool = usePool;
        this._delayParam = null;
        this.update = props.update;
        var gid = (target.$_GID || (target.$_GID = Utils.getGID()));
        if (!Tween.tweenMap[gid]) {
            Tween.tweenMap[gid] = [this];
        }
        else {
            if (coverBefore)
                Tween.clearTween(target);
            Tween.tweenMap[gid].push(this);
        }
        if (runNow) {
            if (delay <= 0)
                this.firstStart(target, props, isTo);
            else {
                this._delayParam = [target, props, isTo];
                ILaya.timer.once(delay, this, this.firstStart, this._delayParam);
            }
        }
        else {
            this._initProps(target, props, isTo);
        }
        return this;
    }
    firstStart(target, props, isTo) {
        this._delayParam = null;
        if (target.destroyed) {
            this.clear();
            return;
        }
        this._initProps(target, props, isTo);
        this._beginLoop();
    }
    _initProps(target, props, isTo) {
        for (var p in props) {
            if (typeof (target[p]) == 'number') {
                var start = isTo ? target[p] : props[p];
                var end = isTo ? props[p] : target[p];
                this._props.push([p, start, end - start]);
                if (!isTo)
                    target[p] = start;
            }
        }
    }
    _beginLoop() {
        ILaya.timer.frameLoop(1, this, this._doEase);
    }
    _doEase() {
        this._updateEase(Browser.now());
    }
    _updateEase(time) {
        var target = this._target;
        if (!target)
            return;
        if (target.destroyed)
            return Tween.clearTween(target);
        var usedTimer = this._usedTimer = time - this._startTimer - this._delay;
        if (usedTimer < 0)
            return;
        if (usedTimer >= this._duration)
            return this.complete();
        var ratio = usedTimer > 0 ? this._ease(usedTimer, 0, 1, this._duration) : 0;
        var props = this._props;
        for (var i = 0, n = props.length; i < n; i++) {
            var prop = props[i];
            target[prop[0]] = prop[1] + (ratio * prop[2]);
        }
        if (this.update)
            this.update.run();
    }
    set progress(v) {
        var uTime = v * this._duration;
        this._startTimer = Browser.now() - this._delay - uTime;
    }
    complete() {
        if (!this._target)
            return;
        ILaya.timer.runTimer(this, this.firstStart);
        var target = this._target;
        var props = this._props;
        var handler = this._complete;
        for (var i = 0, n = props.length; i < n; i++) {
            var prop = props[i];
            target[prop[0]] = prop[1] + prop[2];
        }
        if (this.update)
            this.update.run();
        this._count++;
        if (this.repeat != 0 && this._count >= this.repeat) {
            this.clear();
            handler && handler.run();
        }
        else {
            this.restart();
        }
    }
    pause() {
        ILaya.timer.clear(this, this._beginLoop);
        ILaya.timer.clear(this, this._doEase);
        ILaya.timer.clear(this, this.firstStart);
        var time = Browser.now();
        var dTime;
        dTime = time - this._startTimer - this._delay;
        if (dTime < 0) {
            this._usedTimer = dTime;
        }
    }
    setStartTime(startTime) {
        this._startTimer = startTime;
    }
    static clearAll(target) {
        if (!target || !target.$_GID)
            return;
        var tweens = Tween.tweenMap[target.$_GID];
        if (tweens) {
            for (var i = 0, n = tweens.length; i < n; i++) {
                tweens[i]._clear();
            }
            tweens.length = 0;
        }
    }
    static clear(tween) {
        tween.clear();
    }
    static clearTween(target) {
        Tween.clearAll(target);
    }
    clear() {
        if (this._target) {
            this._remove();
            this._clear();
        }
    }
    _clear() {
        this.pause();
        ILaya.timer.clear(this, this.firstStart);
        this._complete = null;
        this._target = null;
        this._ease = null;
        this._props = null;
        this._delayParam = null;
        if (this._usedPool) {
            this.update = null;
            Pool.recover("tween", this);
        }
    }
    recover() {
        this._usedPool = true;
        this._clear();
    }
    _remove() {
        var tweens = Tween.tweenMap[this._target.$_GID];
        if (tweens) {
            for (var i = 0, n = tweens.length; i < n; i++) {
                if (tweens[i] === this) {
                    tweens.splice(i, 1);
                    break;
                }
            }
        }
    }
    restart() {
        this.pause();
        this._usedTimer = 0;
        this._startTimer = Browser.now();
        if (this._delayParam) {
            ILaya.timer.once(this._delay, this, this.firstStart, this._delayParam);
            return;
        }
        var props = this._props;
        for (var i = 0, n = props.length; i < n; i++) {
            var prop = props[i];
            this._target[prop[0]] = prop[1];
        }
        ILaya.timer.once(this._delay, this, this._beginLoop);
    }
    resume() {
        if (this._usedTimer >= this._duration)
            return;
        this._startTimer = Browser.now() - this._usedTimer - this._delay;
        if (this._delayParam) {
            if (this._usedTimer < 0) {
                ILaya.timer.once(-this._usedTimer, this, this.firstStart, this._delayParam);
            }
            else {
                this.firstStart.apply(this, this._delayParam);
            }
        }
        else {
            this._beginLoop();
        }
    }
    static easeNone(t, b, c, d) {
        return c * t / d + b;
    }
}
Tween.tweenMap = [];
