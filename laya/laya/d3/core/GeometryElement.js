export class GeometryElement {
    constructor() {
        this._destroyed = false;
    }
    get destroyed() {
        return this._destroyed;
    }
    _getType() {
        throw "GeometryElement:must override it.";
    }
    _prepareRender(state) {
        return true;
    }
    _render(state) {
        throw "GeometryElement:must override it.";
    }
    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
    }
}
GeometryElement._typeCounter = 0;
