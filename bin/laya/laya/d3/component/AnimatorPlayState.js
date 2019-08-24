export class AnimatorPlayState {
    get normalizedTime() {
        return this._normalizedTime;
    }
    get duration() {
        return this._duration;
    }
    constructor() {
    }
    _resetPlayState(startTime) {
        this._finish = false;
        this._startPlayTime = startTime;
        this._elapsedTime = startTime;
        this._playEventIndex = 0;
        this._lastIsFront = true;
    }
    _cloneTo(dest) {
        dest._finish = this._finish;
        dest._startPlayTime = this._startPlayTime;
        dest._elapsedTime = this._elapsedTime;
        dest._playEventIndex = this._playEventIndex;
        dest._lastIsFront = this._lastIsFront;
    }
}
