import { LayaGL } from "../../layagl/LayaGL";
import { Buffer } from "../../webgl/utils/Buffer";
export class VertexBuffer3D extends Buffer {
    constructor(byteLength, bufferUsage, canRead = false) {
        super();
        this._vertexCount = 0;
        this._vertexDeclaration = null;
        this._float32Reader = null;
        var gl = LayaGL.instance;
        this._vertexCount = -1;
        this._bufferUsage = bufferUsage;
        this._bufferType = gl.ARRAY_BUFFER;
        this._canRead = canRead;
        this._byteLength = byteLength;
        this.bind();
        gl.bufferData(this._bufferType, this._byteLength, this._bufferUsage);
        if (canRead) {
            this._buffer = new Uint8Array(byteLength);
            this._float32Reader = new Float32Array(this._buffer.buffer);
        }
    }
    get vertexDeclaration() {
        return this._vertexDeclaration;
    }
    set vertexDeclaration(value) {
        if (this._vertexDeclaration !== value) {
            this._vertexDeclaration = value;
            this._vertexCount = value ? this._byteLength / value.vertexStride : -1;
        }
    }
    get vertexCount() {
        return this._vertexCount;
    }
    get canRead() {
        return this._canRead;
    }
    bind() {
        if (Buffer._bindedVertexBuffer !== this._glBuffer) {
            var gl = LayaGL.instance;
            gl.bindBuffer(gl.ARRAY_BUFFER, this._glBuffer);
            Buffer._bindedVertexBuffer = this._glBuffer;
            return true;
        }
        else {
            return false;
        }
    }
    setData(buffer, bufferOffset = 0, dataStartIndex = 0, dataCount = 4294967295) {
        this.bind();
        var needSubData = dataStartIndex !== 0 || dataCount !== 4294967295;
        if (needSubData) {
            var subData = new Uint8Array(buffer, dataStartIndex, dataCount);
            LayaGL.instance.bufferSubData(this._bufferType, bufferOffset, subData);
            if (this._canRead)
                this._buffer.set(subData, bufferOffset);
        }
        else {
            LayaGL.instance.bufferSubData(this._bufferType, bufferOffset, buffer);
            if (this._canRead)
                this._buffer.set(new Uint8Array(buffer), bufferOffset);
        }
    }
    getUint8Data() {
        if (this._canRead)
            return this._buffer;
        else
            throw new Error("Can't read data from VertexBuffer with only write flag!");
    }
    getFloat32Data() {
        if (this._canRead)
            return this._float32Reader;
        else
            throw new Error("Can't read data from VertexBuffer with only write flag!");
    }
    markAsUnreadbale() {
        this._canRead = false;
        this._buffer = null;
        this._float32Reader = null;
    }
    destroy() {
        super.destroy();
        this._buffer = null;
        this._float32Reader = null;
        this._vertexDeclaration = null;
    }
}
VertexBuffer3D.DATATYPE_FLOAT32ARRAY = 0;
VertexBuffer3D.DATATYPE_UINT8ARRAY = 1;
