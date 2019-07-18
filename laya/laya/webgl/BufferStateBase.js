import { LayaGL } from "../layagl/LayaGL";
export class BufferStateBase {
    constructor() {
        this._nativeVertexArrayObject = LayaGL.layaGPUInstance.createVertexArray();
    }
    bind() {
        if (BufferStateBase._curBindedBufferState !== this) {
            LayaGL.layaGPUInstance.bindVertexArray(this._nativeVertexArrayObject);
            BufferStateBase._curBindedBufferState = this;
        }
    }
    unBind() {
        if (BufferStateBase._curBindedBufferState === this) {
            LayaGL.layaGPUInstance.bindVertexArray(null);
            BufferStateBase._curBindedBufferState = null;
        }
        else {
            throw "BufferState: must call bind() function first.";
        }
    }
    destroy() {
        LayaGL.layaGPUInstance.deleteVertexArray(this._nativeVertexArrayObject);
    }
    bindForNative() {
        LayaGL.instance.bindVertexArray(this._nativeVertexArrayObject);
        BufferStateBase._curBindedBufferState = this;
    }
    unBindForNative() {
        LayaGL.instance.bindVertexArray(null);
        BufferStateBase._curBindedBufferState = null;
    }
}
