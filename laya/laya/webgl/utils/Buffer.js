import { LayaGL } from "../../layagl/LayaGL";
export class Buffer {
    constructor() {
        this._byteLength = 0;
        this._glBuffer = LayaGL.instance.createBuffer();
    }
    get bufferUsage() {
        return this._bufferUsage;
    }
    _bindForVAO() {
    }
    bind() {
        return false;
    }
    destroy() {
        if (this._glBuffer) {
            LayaGL.instance.deleteBuffer(this._glBuffer);
            this._glBuffer = null;
        }
    }
}
