import { Pool } from "./Pool";
import { Tween } from "./Tween";
import { Browser } from "./Browser";
import { Handler } from "./Handler";
import { Utils } from "./Utils";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { ILaya } from "../../ILaya";
export class TimeLine extends EventDispatcher {
    constructor() {
        super(...arguments);
        this._tweenDic = {};
        this._tweenDataList = [];
        this._currTime = 0;
        this._lastTime = 0;
        this._startTime = 0;
        this._index = 0;
        this._gidIndex = 0;
        this._firstTweenDic = {};
        this._startTimeSort = false;
        this._endTimeSort = false;
        this._loopKey = false;
        this.scale = 1;
        this._frameRate = 60;
        this._frameIndex = 0;
        this._total = 0;
    }
    static to(target, props, duration, ease = null, offset = 0) {
        return (new TimeLine()).to(target, props, duration, ease, offset);
    }
    static from(target, props, duration, ease = null, offset = 0) {
        return (new TimeLine()).from(target, props, duration, ease, offset);
    }
    to(target, props, duration, ease = null, offset = 0) {
        return this._create(target, props, duration, ease, offset, true);
    }
    from(target, props, duration, ease = null, offset = 0) {
        return this._create(target, props, duration, ease, offset, false);
    }
    _create(target, props, duration, ease, offset, isTo) {
        var tTweenData = Pool.getItemByClass("tweenData", tweenData);
        tTweenData.isTo = isTo;
        tTweenData.type = 0;
        tTweenData.target = target;
        tTweenData.duration = duration;
        tTweenData.data = props;
        tTweenData.startTime = this._startTime + offset;
        tTweenData.endTime = tTweenData.startTime + tTweenData.duration;
        tTweenData.ease = ease;
        this._startTime = Math.max(tTweenData.endTime, this._startTime);
        this._tweenDataList.push(tTweenData);
        this._startTimeSort = true;
        this._endTimeSort = true;
        return this;
    }
    addLabel(label, offset) {
        var tTweenData = Pool.getItemByClass("tweenData", tweenData);
        tTweenData.type = 1;
        tTweenData.data = label;
        tTweenData.endTime = tTweenData.startTime = this._startTime + offset;
        this._labelDic || (this._labelDic = {});
        this._labelDic[label] = tTweenData;
        this._tweenDataList.push(tTweenData);
        return this;
    }
    removeLabel(label) {
        if (this._labelDic && this._labelDic[label]) {
            var tTweenData = this._labelDic[label];
            if (tTweenData) {
                var tIndex = this._tweenDataList.indexOf(tTweenData);
                if (tIndex > -1) {
                    this._tweenDataList.splice(tIndex, 1);
                }
            }
            delete this._labelDic[label];
        }
    }
    gotoTime(time) {
        if (this._tweenDataList == null || this._tweenDataList.length == 0)
            return;
        var tTween;
        var tObject;
        for (var p in this._firstTweenDic) {
            tObject = this._firstTweenDic[p];
            if (tObject) {
                for (var tDataP in tObject) {
                    if (tDataP in tObject.diyTarget) {
                        tObject.diyTarget[tDataP] = tObject[tDataP];
                    }
                }
            }
        }
        for (p in this._tweenDic) {
            tTween = this._tweenDic[p];
            tTween.clear();
            delete this._tweenDic[p];
        }
        this._index = 0;
        this._gidIndex = 0;
        this._currTime = time;
        this._lastTime = Browser.now();
        var tTweenDataCopyList;
        if (this._endTweenDataList == null || this._endTimeSort) {
            this._endTimeSort = false;
            this._endTweenDataList = tTweenDataCopyList = this._tweenDataList.concat();
            function Compare(paraA, paraB) {
                if (paraA.endTime > paraB.endTime) {
                    return 1;
                }
                else if (paraA.endTime < paraB.endTime) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
            tTweenDataCopyList.sort(Compare);
        }
        else {
            tTweenDataCopyList = this._endTweenDataList;
        }
        var tTweenData;
        for (var i = 0, n = tTweenDataCopyList.length; i < n; i++) {
            tTweenData = tTweenDataCopyList[i];
            if (tTweenData.type == 0) {
                if (time >= tTweenData.endTime) {
                    this._index = Math.max(this._index, i + 1);
                    var props = tTweenData.data;
                    if (tTweenData.isTo) {
                        for (var tP in props) {
                            tTweenData.target[tP] = props[tP];
                        }
                    }
                }
                else {
                    break;
                }
            }
        }
        for (i = 0, n = this._tweenDataList.length; i < n; i++) {
            tTweenData = this._tweenDataList[i];
            if (tTweenData.type == 0) {
                if (time >= tTweenData.startTime && time < tTweenData.endTime) {
                    this._index = Math.max(this._index, i + 1);
                    this._gidIndex++;
                    tTween = Pool.getItemByClass("tween", Tween);
                    tTween._create(tTweenData.target, tTweenData.data, tTweenData.duration, tTweenData.ease, Handler.create(this, this._animComplete, [this._gidIndex]), 0, false, tTweenData.isTo, true, false);
                    tTween.setStartTime(this._currTime - (time - tTweenData.startTime));
                    tTween._updateEase(this._currTime);
                    tTween.gid = this._gidIndex;
                    this._tweenDic[this._gidIndex] = tTween;
                }
            }
        }
    }
    gotoLabel(Label) {
        if (this._labelDic == null)
            return;
        var tLabelData = this._labelDic[Label];
        if (tLabelData)
            this.gotoTime(tLabelData.startTime);
    }
    pause() {
        ILaya.timer.clear(this, this._update);
    }
    resume() {
        this.play(this._currTime, this._loopKey);
    }
    play(timeOrLabel = 0, loop = false) {
        if (!this._tweenDataList)
            return;
        if (this._startTimeSort) {
            this._startTimeSort = false;
            function Compare(paraA, paraB) {
                if (paraA.startTime > paraB.startTime) {
                    return 1;
                }
                else if (paraA.startTime < paraB.startTime) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
            this._tweenDataList.sort(Compare);
            for (var i = 0, n = this._tweenDataList.length; i < n; i++) {
                var tTweenData = this._tweenDataList[i];
                if (tTweenData != null && tTweenData.type == 0) {
                    var tTarget = tTweenData.target;
                    var gid = (tTarget.$_GID || (tTarget.$_GID = Utils.getGID()));
                    var tSrcData = null;
                    if (this._firstTweenDic[gid] == null) {
                        tSrcData = {};
                        tSrcData.diyTarget = tTarget;
                        this._firstTweenDic[gid] = tSrcData;
                    }
                    else {
                        tSrcData = this._firstTweenDic[gid];
                    }
                    for (var p in tTweenData.data) {
                        if (tSrcData[p] == null) {
                            tSrcData[p] = tTarget[p];
                        }
                    }
                }
            }
        }
        if (typeof (timeOrLabel) == 'string') {
            this.gotoLabel(timeOrLabel);
        }
        else {
            this.gotoTime(timeOrLabel);
        }
        this._loopKey = loop;
        this._lastTime = Browser.now();
        ILaya.timer.frameLoop(1, this, this._update);
    }
    _update() {
        if (this._currTime >= this._startTime) {
            if (this._loopKey) {
                this._complete();
                if (!this._tweenDataList)
                    return;
                this.gotoTime(0);
            }
            else {
                for (var p in this._tweenDic) {
                    tTween = this._tweenDic[p];
                    tTween.complete();
                }
                this._complete();
                this.pause();
                return;
            }
        }
        var tNow = Browser.now();
        var tFrameTime = tNow - this._lastTime;
        var tCurrTime = this._currTime += tFrameTime * this.scale;
        this._lastTime = tNow;
        for (p in this._tweenDic) {
            tTween = this._tweenDic[p];
            tTween._updateEase(tCurrTime);
        }
        var tTween;
        if (this._tweenDataList.length != 0 && this._index < this._tweenDataList.length) {
            var tTweenData = this._tweenDataList[this._index];
            if (tCurrTime >= tTweenData.startTime) {
                this._index++;
                if (tTweenData.type == 0) {
                    this._gidIndex++;
                    tTween = Pool.getItemByClass("tween", Tween);
                    tTween._create(tTweenData.target, tTweenData.data, tTweenData.duration, tTweenData.ease, Handler.create(this, this._animComplete, [this._gidIndex]), 0, false, tTweenData.isTo, true, false);
                    tTween.setStartTime(tCurrTime);
                    tTween.gid = this._gidIndex;
                    this._tweenDic[this._gidIndex] = tTween;
                    tTween._updateEase(tCurrTime);
                }
                else {
                    this.event(Event.LABEL, tTweenData.data);
                }
            }
        }
    }
    _animComplete(index) {
        var tTween = this._tweenDic[index];
        if (tTween)
            delete this._tweenDic[index];
    }
    _complete() {
        this.event(Event.COMPLETE);
    }
    get index() {
        return this._frameIndex;
    }
    set index(value) {
        this._frameIndex = value;
        this.gotoTime(this._frameIndex / this._frameRate * 1000);
    }
    get total() {
        this._total = Math.floor(this._startTime / 1000 * this._frameRate);
        return this._total;
    }
    reset() {
        var p;
        if (this._labelDic) {
            for (p in this._labelDic) {
                delete this._labelDic[p];
            }
        }
        var tTween;
        for (p in this._tweenDic) {
            tTween = this._tweenDic[p];
            tTween.clear();
            delete this._tweenDic[p];
        }
        for (p in this._firstTweenDic) {
            delete this._firstTweenDic[p];
        }
        this._endTweenDataList = null;
        if (this._tweenDataList && this._tweenDataList.length) {
            var i, len;
            len = this._tweenDataList.length;
            for (i = 0; i < len; i++) {
                if (this._tweenDataList[i])
                    this._tweenDataList[i].destroy();
            }
        }
        this._tweenDataList.length = 0;
        this._currTime = 0;
        this._lastTime = 0;
        this._startTime = 0;
        this._index = 0;
        this._gidIndex = 0;
        this.scale = 1;
        ILaya.timer.clear(this, this._update);
    }
    destroy() {
        this.reset();
        this._labelDic = null;
        this._tweenDic = null;
        this._tweenDataList = null;
        this._firstTweenDic = null;
    }
}
class tweenData {
    constructor() {
        this.type = 0;
        this.isTo = true;
    }
    destroy() {
        this.target = null;
        this.ease = null;
        this.data = null;
        this.isTo = true;
        this.type = 0;
        Pool.recover("tweenData", this);
    }
}
