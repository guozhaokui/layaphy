import { AnimationState } from "./AnimationState";
import { Stat } from "../utils/Stat";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
export class AnimationPlayer extends EventDispatcher {
    constructor() {
        super();
        this.isCache = true;
        this.playbackRate = 1.0;
        this._destroyed = false;
        this._currentAnimationClipIndex = -1;
        this._currentKeyframeIndex = -1;
        this._currentTime = 0.0;
        this._overallDuration = Number.MAX_VALUE;
        this._stopWhenCircleFinish = false;
        this._elapsedPlaybackTime = 0;
        this._startUpdateLoopCount = -1;
        this._cachePlayRate = 1.0;
        this.cacheFrameRate = 60;
        this.returnToZeroStopped = false;
    }
    get templet() {
        return this._templet;
    }
    set templet(value) {
        if (!(this.state === AnimationState.stopped))
            this.stop(true);
        if (this._templet !== value) {
            this._templet = value;
            this._computeFullKeyframeIndices();
        }
    }
    get playStart() {
        return this._playStart;
    }
    get playEnd() {
        return this._playEnd;
    }
    get playDuration() {
        return this._playDuration;
    }
    get overallDuration() {
        return this._overallDuration;
    }
    get currentAnimationClipIndex() {
        return this._currentAnimationClipIndex;
    }
    get currentKeyframeIndex() {
        return this._currentKeyframeIndex;
    }
    get currentPlayTime() {
        return this._currentTime + this._playStart;
    }
    get currentFrameTime() {
        return this._currentFrameTime;
    }
    get cachePlayRate() {
        return this._cachePlayRate;
    }
    set cachePlayRate(value) {
        if (this._cachePlayRate !== value) {
            this._cachePlayRate = value;
            if (this._templet)
                this._computeFullKeyframeIndices();
        }
    }
    get cacheFrameRate() {
        return this._cacheFrameRate;
    }
    set cacheFrameRate(value) {
        if (this._cacheFrameRate !== value) {
            this._cacheFrameRate = value;
            this._cacheFrameRateInterval = 1000.0 / this._cacheFrameRate;
            if (this._templet)
                this._computeFullKeyframeIndices();
        }
    }
    set currentTime(value) {
        if (this._currentAnimationClipIndex === -1 || !this._templet)
            return;
        if (value < this._playStart || value > this._playEnd)
            throw new Error("AnimationPlayer:value must large than playStartTime,small than playEndTime.");
        this._startUpdateLoopCount = Stat.loopCount;
        var cacheFrameInterval = this._cacheFrameRateInterval * this._cachePlayRate;
        this._currentTime = value;
        this._currentKeyframeIndex = Math.floor(this.currentPlayTime / cacheFrameInterval);
        this._currentFrameTime = this._currentKeyframeIndex * cacheFrameInterval;
    }
    get paused() {
        return this._paused;
    }
    set paused(value) {
        this._paused = value;
        value && this.event(Event.PAUSED);
    }
    get cacheFrameRateInterval() {
        return this._cacheFrameRateInterval;
    }
    get state() {
        if (this._currentAnimationClipIndex === -1)
            return AnimationState.stopped;
        if (this._paused)
            return AnimationState.paused;
        return AnimationState.playing;
    }
    get destroyed() {
        return this._destroyed;
    }
    _onTempletLoadedComputeFullKeyframeIndices(cachePlayRate, cacheFrameRate, templet) {
        if (this._templet === templet && this._cachePlayRate === cachePlayRate && this._cacheFrameRate === cacheFrameRate)
            this._computeFullKeyframeIndices();
    }
    _computeFullKeyframeIndices() {
        return;
        var templet = this._templet;
        if (templet._fullFrames)
            return;
        var anifullFrames = this._templet._fullFrames = [];
        var cacheFrameInterval = this._cacheFrameRateInterval * this._cachePlayRate;
        for (var i = 0, iNum = templet.getAnimationCount(); i < iNum; i++) {
            var aniFullFrame = [];
            if (!templet.getAnimation(i).nodes) {
                anifullFrames.push(aniFullFrame);
                continue;
            }
            for (var j = 0, jNum = templet.getAnimation(i).nodes.length; j < jNum; j++) {
                var node = templet.getAnimation(i).nodes[j];
                var frameCount = Math.round(node.playTime / cacheFrameInterval);
                var nodeFullFrames = new Uint16Array(frameCount + 1);
                var stidx = -1;
                var nodeframes = node.keyFrame;
                for (var n = 0, nNum = nodeframes.length; n < nNum; n++) {
                    var keyFrame = nodeframes[n];
                    var pos = Math.round(keyFrame.startTime / cacheFrameInterval);
                    if (stidx < 0 && pos > 0) {
                        stidx = pos;
                    }
                    if (pos <= frameCount) {
                        nodeFullFrames[pos] = n;
                    }
                }
                var cf = 0;
                for (n = stidx; n < frameCount; n++) {
                    if (nodeFullFrames[n] == 0) {
                        nodeFullFrames[n] = cf;
                    }
                    else {
                        cf = nodeFullFrames[n];
                    }
                }
                aniFullFrame.push(nodeFullFrames);
            }
            anifullFrames.push(aniFullFrame);
        }
    }
    _onAnimationTempletLoaded() {
        (this.destroyed) || (this._calculatePlayDuration());
    }
    _calculatePlayDuration() {
        if (this.state !== AnimationState.stopped) {
            var oriDuration = this._templet.getAniDuration(this._currentAnimationClipIndex);
            (this._playEnd === 0) && (this._playEnd = oriDuration);
            if (this._playEnd > oriDuration)
                this._playEnd = oriDuration;
            this._playDuration = this._playEnd - this._playStart;
        }
    }
    _setPlayParams(time, cacheFrameInterval) {
        this._currentTime = time;
        this._currentKeyframeIndex = Math.floor((this.currentPlayTime) / cacheFrameInterval + 0.01);
        this._currentFrameTime = this._currentKeyframeIndex * cacheFrameInterval;
    }
    _setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval) {
        this._currentTime = currentAniClipPlayDuration;
        this._currentKeyframeIndex = Math.floor(currentAniClipPlayDuration / cacheFrameInterval + 0.01);
        this._currentFrameTime = this._currentKeyframeIndex * cacheFrameInterval;
        this._currentAnimationClipIndex = -1;
    }
    _update(elapsedTime) {
        if (this._currentAnimationClipIndex === -1 || this._paused || !this._templet)
            return;
        var cacheFrameInterval = this._cacheFrameRateInterval * this._cachePlayRate;
        var time = 0;
        (this._startUpdateLoopCount !== Stat.loopCount) && (time = elapsedTime * this.playbackRate, this._elapsedPlaybackTime += time);
        var currentAniClipPlayDuration = this.playDuration;
        if ((this._overallDuration !== 0 && this._elapsedPlaybackTime >= this._overallDuration) || (this._overallDuration === 0 && this._elapsedPlaybackTime >= currentAniClipPlayDuration)) {
            this._setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval);
            this.event(Event.STOPPED);
            return;
        }
        time += this._currentTime;
        if (currentAniClipPlayDuration > 0) {
            if (time >= currentAniClipPlayDuration) {
                if (this._stopWhenCircleFinish) {
                    this._setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval);
                    this._stopWhenCircleFinish = false;
                    this.event(Event.STOPPED);
                    return;
                }
                else {
                    time = time % currentAniClipPlayDuration;
                    this._setPlayParams(time, cacheFrameInterval);
                    this.event(Event.COMPLETE);
                    return;
                }
            }
            else {
                this._setPlayParams(time, cacheFrameInterval);
            }
        }
        else {
            if (this._stopWhenCircleFinish) {
                this._setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval);
                this._stopWhenCircleFinish = false;
                this.event(Event.STOPPED);
                return;
            }
            this._currentTime = this._currentFrameTime = this._currentKeyframeIndex = 0;
            this.event(Event.COMPLETE);
        }
    }
    _destroy() {
        this.offAll();
        this._templet = null;
        this._destroyed = true;
    }
    play(index = 0, playbackRate = 1.0, overallDuration = 2147483647, playStart = 0, playEnd = 0) {
        if (!this._templet)
            throw new Error("AnimationPlayer:templet must not be null,maybe you need to set url.");
        if (overallDuration < 0 || playStart < 0 || playEnd < 0)
            throw new Error("AnimationPlayer:overallDuration,playStart and playEnd must large than zero.");
        if ((playEnd !== 0) && (playStart > playEnd))
            throw new Error("AnimationPlayer:start must less than end.");
        this._currentTime = 0;
        this._currentFrameTime = 0;
        this._elapsedPlaybackTime = 0;
        this.playbackRate = playbackRate;
        this._overallDuration = overallDuration;
        this._playStart = playStart;
        this._playEnd = playEnd;
        this._paused = false;
        this._currentAnimationClipIndex = index;
        this._currentKeyframeIndex = 0;
        this._startUpdateLoopCount = Stat.loopCount;
        this.event(Event.PLAYED);
        this._calculatePlayDuration();
        this._update(0);
    }
    playByFrame(index = 0, playbackRate = 1.0, overallDuration = 2147483647, playStartFrame = 0, playEndFrame = 0, fpsIn3DBuilder = 30) {
        var interval = 1000.0 / fpsIn3DBuilder;
        this.play(index, playbackRate, overallDuration, playStartFrame * interval, playEndFrame * interval);
    }
    stop(immediate = true) {
        if (immediate) {
            this._currentTime = this._currentFrameTime = this._currentKeyframeIndex = 0;
            this._currentAnimationClipIndex = -1;
            this.event(Event.STOPPED);
        }
        else {
            this._stopWhenCircleFinish = true;
        }
    }
    destroy() {
    }
}
