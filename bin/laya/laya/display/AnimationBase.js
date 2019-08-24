import { Sprite } from "./Sprite";
import { Config } from "./../../Config";
import { Const } from "../Const";
import { Event } from "../events/Event";
import { ClassUtils } from "../utils/ClassUtils";
export class AnimationBase extends Sprite {
    constructor() {
        super();
        this.wrapMode = 0;
        this._interval = Config.animationInterval;
        this._isReverse = false;
        this._frameRateChanged = false;
        this._setBitUp(Const.DISPLAY);
    }
    play(start = 0, loop = true, name = "") {
        this._isPlaying = true;
        this._actionName = name;
        this.index = (typeof (start) == 'string') ? this._getFrameByLabel(start) : start;
        this.loop = loop;
        this._isReverse = this.wrapMode === AnimationBase.WRAP_REVERSE;
        if (this.index == 0 && this._isReverse) {
            this.index = this.count - 1;
        }
        if (this.interval > 0)
            this.timerLoop(this.interval, this, this._frameLoop, null, true, true);
    }
    get interval() {
        return this._interval;
    }
    set interval(value) {
        if (this._interval != value) {
            this._frameRateChanged = true;
            this._interval = value;
            if (this._isPlaying && value > 0) {
                this.timerLoop(value, this, this._frameLoop, null, true, true);
            }
        }
    }
    _getFrameByLabel(label) {
        for (var i = 0; i < this._count; i++) {
            var item = this._labels[i];
            if (item && item.indexOf(label) > -1)
                return i;
        }
        return 0;
    }
    _frameLoop() {
        if (this._isReverse) {
            this._index--;
            if (this._index < 0) {
                if (this.loop) {
                    if (this.wrapMode == AnimationBase.WRAP_PINGPONG) {
                        this._index = this._count > 0 ? 1 : 0;
                        this._isReverse = false;
                    }
                    else {
                        this._index = this._count - 1;
                    }
                    this.event(Event.COMPLETE);
                }
                else {
                    this._index = 0;
                    this.stop();
                    this.event(Event.COMPLETE);
                    return;
                }
            }
        }
        else {
            this._index++;
            if (this._index >= this._count) {
                if (this.loop) {
                    if (this.wrapMode == AnimationBase.WRAP_PINGPONG) {
                        this._index = this._count - 2 >= 0 ? this._count - 2 : 0;
                        this._isReverse = true;
                    }
                    else {
                        this._index = 0;
                    }
                    this.event(Event.COMPLETE);
                }
                else {
                    this._index--;
                    this.stop();
                    this.event(Event.COMPLETE);
                    return;
                }
            }
        }
        this.index = this._index;
    }
    _setControlNode(node) {
        if (this._controlNode) {
            this._controlNode.off(Event.DISPLAY, this, this._resumePlay);
            this._controlNode.off(Event.UNDISPLAY, this, this._resumePlay);
        }
        this._controlNode = node;
        if (node && node != this) {
            node.on(Event.DISPLAY, this, this._resumePlay);
            node.on(Event.UNDISPLAY, this, this._resumePlay);
        }
    }
    _setDisplay(value) {
        super._setDisplay(value);
        this._resumePlay();
    }
    _resumePlay() {
        if (this._isPlaying) {
            if (this._controlNode.displayedInStage)
                this.play(this._index, this.loop, this._actionName);
            else
                this.clearTimer(this, this._frameLoop);
        }
    }
    stop() {
        this._isPlaying = false;
        this.clearTimer(this, this._frameLoop);
    }
    get isPlaying() {
        return this._isPlaying;
    }
    addLabel(label, index) {
        if (!this._labels)
            this._labels = {};
        if (!this._labels[index])
            this._labels[index] = [];
        this._labels[index].push(label);
    }
    removeLabel(label) {
        if (!label)
            this._labels = null;
        else if (this._labels) {
            for (var name in this._labels) {
                this._removeLabelFromList(this._labels[name], label);
            }
        }
    }
    _removeLabelFromList(list, label) {
        if (!list)
            return;
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i] == label) {
                list.splice(i, 1);
            }
        }
    }
    gotoAndStop(position) {
        this.index = (typeof (position) == 'string') ? this._getFrameByLabel(position) : position;
        this.stop();
    }
    get index() {
        return this._index;
    }
    set index(value) {
        this._index = value;
        this._displayToIndex(value);
        if (this._labels && this._labels[value]) {
            var tArr = this._labels[value];
            for (var i = 0, len = tArr.length; i < len; i++) {
                this.event(Event.LABEL, tArr[i]);
            }
        }
    }
    _displayToIndex(value) {
    }
    get count() {
        return this._count;
    }
    clear() {
        this.stop();
        this._labels = null;
        return this;
    }
}
AnimationBase.WRAP_POSITIVE = 0;
AnimationBase.WRAP_REVERSE = 1;
AnimationBase.WRAP_PINGPONG = 2;
ClassUtils.regClass("laya.display.AnimationBase", AnimationBase);
ClassUtils.regClass("Laya.AnimationBase", AnimationBase);
