export class KeyframeNode {
    constructor() {
        this._ownerPath = [];
        this._propertys = [];
        this._keyFrames = [];
    }
    get ownerPathCount() {
        return this._ownerPath.length;
    }
    get propertyCount() {
        return this._propertys.length;
    }
    get keyFramesCount() {
        return this._keyFrames.length;
    }
    _setOwnerPathCount(value) {
        this._ownerPath.length = value;
    }
    _setOwnerPathByIndex(index, value) {
        this._ownerPath[index] = value;
    }
    _joinOwnerPath(sep) {
        return this._ownerPath.join(sep);
    }
    _setPropertyCount(value) {
        this._propertys.length = value;
    }
    _setPropertyByIndex(index, value) {
        this._propertys[index] = value;
    }
    _joinProperty(sep) {
        return this._propertys.join(sep);
    }
    _setKeyframeCount(value) {
        this._keyFrames.length = value;
    }
    _setKeyframeByIndex(index, value) {
        this._keyFrames[index] = value;
    }
    getOwnerPathByIndex(index) {
        return this._ownerPath[index];
    }
    getPropertyByIndex(index) {
        return this._propertys[index];
    }
    getKeyframeByIndex(index) {
        return this._keyFrames[index];
    }
}
if (window.conch && window.conchKeyframeNode) {
    KeyframeNode = window.conchKeyframeNode;
}
