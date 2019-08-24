import { FrameAnimation } from "./FrameAnimation";
import { ClassUtils } from "../utils/ClassUtils";
import { Ease } from "../utils/Ease";
export class EffectAnimation extends FrameAnimation {
    constructor() {
        super(...arguments);
        this._initData = {};
    }
    set target(v) {
        if (this._target)
            this._target.off(EffectAnimation.EFFECT_BEGIN, this, this._onOtherBegin);
        this._target = v;
        if (this._target)
            this._target.on(EffectAnimation.EFFECT_BEGIN, this, this._onOtherBegin);
        this._addEvent();
    }
    get target() {
        return this._target;
    }
    _onOtherBegin(effect) {
        if (effect === this)
            return;
        this.stop();
    }
    set playEvent(event) {
        this._playEvent = event;
        if (!event)
            return;
        this._addEvent();
    }
    _addEvent() {
        if (!this._target || !this._playEvent)
            return;
        this._setControlNode(this._target);
        this._target.on(this._playEvent, this, this._onPlayAction);
    }
    _onPlayAction() {
        this.play(0, false);
    }
    play(start = 0, loop = true, name = "") {
        if (!this._target)
            return;
        this._target.event(EffectAnimation.EFFECT_BEGIN, [this]);
        this._recordInitData();
        super.play(start, loop, name);
    }
    _recordInitData() {
        if (!this._aniKeys)
            return;
        var i, len;
        len = this._aniKeys.length;
        var key;
        for (i = 0; i < len; i++) {
            key = this._aniKeys[i];
            this._initData[key] = this._target[key];
        }
    }
    set effectClass(classStr) {
        this._effectClass = ClassUtils.getClass(classStr);
        if (this._effectClass) {
            var uiData = this._effectClass["uiView"];
            if (uiData) {
                var aniData = uiData["animations"];
                if (aniData && aniData[0]) {
                    var data = aniData[0];
                    this._setUp({}, data);
                    if (data.nodes && data.nodes[0]) {
                        this._aniKeys = data.nodes[0].keys;
                    }
                }
            }
        }
    }
    set effectData(uiData) {
        if (uiData) {
            var aniData = uiData["animations"];
            if (aniData && aniData[0]) {
                var data = aniData[0];
                this._setUp({}, data);
                if (data.nodes && data.nodes[0]) {
                    this._aniKeys = data.nodes[0].keys;
                }
            }
        }
    }
    _displayToIndex(value) {
        if (!this._animationData)
            return;
        if (value < 0)
            value = 0;
        if (value > this._count)
            value = this._count;
        var nodes = this._animationData.nodes, i, len = nodes.length;
        len = len > 1 ? 1 : len;
        for (i = 0; i < len; i++) {
            this._displayNodeToFrame(nodes[i], value);
        }
    }
    _displayNodeToFrame(node, frame, targetDic = null) {
        if (!this._target)
            return;
        var target = this._target;
        var frames = node.frames, key, propFrames, value;
        var keys = node.keys, i, len = keys.length;
        var secondFrames = node.secondFrames;
        var tSecondFrame;
        var easeFun;
        var tKeyFrames;
        var startFrame;
        var endFrame;
        for (i = 0; i < len; i++) {
            key = keys[i];
            propFrames = frames[key];
            tSecondFrame = secondFrames[key];
            if (tSecondFrame == -1) {
                value = this._initData[key];
            }
            else {
                if (frame < tSecondFrame) {
                    tKeyFrames = node.keyframes[key];
                    startFrame = tKeyFrames[0];
                    if (startFrame.tween) {
                        easeFun = Ease[startFrame.tweenMethod];
                        if (easeFun == null)
                            easeFun = Ease.linearNone;
                        endFrame = tKeyFrames[1];
                        value = easeFun(frame, this._initData[key], endFrame.value - this._initData[key], endFrame.index);
                    }
                    else {
                        value = this._initData[key];
                    }
                }
                else {
                    if (propFrames.length > frame)
                        value = propFrames[frame];
                    else
                        value = propFrames[propFrames.length - 1];
                }
            }
            target[key] = value;
        }
    }
    _calculateKeyFrames(node) {
        super._calculateKeyFrames(node);
        var keyFrames = node.keyframes, key, tKeyFrames, target = node.target;
        var secondFrames = {};
        node.secondFrames = secondFrames;
        for (key in keyFrames) {
            tKeyFrames = keyFrames[key];
            if (tKeyFrames.length <= 1)
                secondFrames[key] = -1;
            else
                secondFrames[key] = tKeyFrames[1].index;
        }
    }
}
EffectAnimation.EFFECT_BEGIN = "effectbegin";
ClassUtils.regClass("laya.display.EffectAnimation", EffectAnimation);
ClassUtils.regClass("Laya.EffectAnimation", EffectAnimation);
