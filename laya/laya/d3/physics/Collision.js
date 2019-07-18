export class Collision {
    constructor() {
        this._lastUpdateFrame = -2147483648;
        this._updateFrame = -2147483648;
        this._isTrigger = false;
        this.contacts = [];
    }
    _setUpdateFrame(farme) {
        this._lastUpdateFrame = this._updateFrame;
        this._updateFrame = farme;
    }
}
