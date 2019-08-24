import { Buffer2D } from "./Buffer2D";
import { LayaGL } from "../../layagl/LayaGL";
import { Buffer } from "./Buffer";
export class VertexBuffer2D extends Buffer2D {
    constructor(vertexStride, bufferUsage) {
        super();
        this._vertexStride = vertexStride;
        this._bufferUsage = bufferUsage;
        this._bufferType = LayaGL.instance.ARRAY_BUFFER;
        this._buffer = new ArrayBuffer(8);
        this._floatArray32 = new Float32Array(this._buffer);
        this._uint32Array = new Uint32Array(this._buffer);
    }
    get vertexStride() {
        return this._vertexStride;
    }
    getFloat32Array() {
        return this._floatArray32;
    }
    appendArray(data) {
        var oldoff = this._byteLength >> 2;
        this.setByteLength(this._byteLength + data.length * 4);
        var vbdata = this.getFloat32Array();
        vbdata.set(data, oldoff);
        this._upload = true;
    }
    _checkArrayUse() {
        this._floatArray32 && (this._floatArray32 = new Float32Array(this._buffer));
        this._uint32Array && (this._uint32Array = new Uint32Array(this._buffer));
    }
    deleteBuffer() {
        super._disposeResource();
    }
    _bindForVAO() {
        var gl = LayaGL.instance;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._glBuffer);
    }
    bind() {
        if (Buffer._bindedVertexBuffer !== this._glBuffer) {
            var gl = LayaGL.instance;
            gl.bindBuffer(gl.ARRAY_BUFFER, this._glBuffer);
            Buffer._bindedVertexBuffer = this._glBuffer;
            return true;
        }
        return false;
    }
    destroy() {
        super.destroy();
        this._byteLength = 0;
        this._upload = true;
        this._buffer = null;
        this._floatArray32 = null;
    }
}
VertexBuffer2D.create = function (vertexStride, bufferUsage = 0x88e8) {
    return new VertexBuffer2D(vertexStride, bufferUsage);
};
