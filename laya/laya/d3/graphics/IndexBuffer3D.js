import { LayaGL } from "../../layagl/LayaGL";
import { BufferStateBase } from "../../webgl/BufferStateBase";
import { Buffer } from "../../webgl/utils/Buffer";
export class IndexBuffer3D extends Buffer {
    constructor(indexType, indexCount, bufferUsage = 0x88E4, canRead = false) {
        super();
        this._indexType = indexType;
        this._indexCount = indexCount;
        this._bufferUsage = bufferUsage;
        this._bufferType = LayaGL.instance.ELEMENT_ARRAY_BUFFER;
        this._canRead = canRead;
        var byteLength;
        if (indexType == IndexBuffer3D.INDEXTYPE_USHORT)
            this._indexTypeByteCount = 2;
        else if (indexType == IndexBuffer3D.INDEXTYPE_UBYTE)
            this._indexTypeByteCount = 1;
        else
            throw new Error("unidentification index type.");
        byteLength = this._indexTypeByteCount * indexCount;
        this._byteLength = byteLength;
        var curBufSta = BufferStateBase._curBindedBufferState;
        if (curBufSta) {
            if (curBufSta._bindedIndexBuffer === this) {
                LayaGL.instance.bufferData(this._bufferType, byteLength, this._bufferUsage);
            }
            else {
                curBufSta.unBind();
                this.bind();
                LayaGL.instance.bufferData(this._bufferType, byteLength, this._bufferUsage);
                curBufSta.bind();
            }
        }
        else {
            this.bind();
            LayaGL.instance.bufferData(this._bufferType, byteLength, this._bufferUsage);
        }
        if (canRead) {
            if (indexType == IndexBuffer3D.INDEXTYPE_USHORT)
                this._buffer = new Uint16Array(indexCount);
            else if (indexType == IndexBuffer3D.INDEXTYPE_UBYTE)
                this._buffer = new Uint8Array(indexCount);
        }
    }
    get indexType() {
        return this._indexType;
    }
    get indexTypeByteCount() {
        return this._indexTypeByteCount;
    }
    get indexCount() {
        return this._indexCount;
    }
    get canRead() {
        return this._canRead;
    }
    _bindForVAO() {
        if (BufferStateBase._curBindedBufferState) {
            var gl = LayaGL.instance;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glBuffer);
        }
        else {
            throw "IndexBuffer3D: must bind current BufferState.";
        }
    }
    bind() {
        if (BufferStateBase._curBindedBufferState) {
            throw "IndexBuffer3D: must unbind current BufferState.";
        }
        else {
            if (Buffer._bindedIndexBuffer !== this._glBuffer) {
                var gl = LayaGL.instance;
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glBuffer);
                Buffer._bindedIndexBuffer = this._glBuffer;
                return true;
            }
            else {
                return false;
            }
        }
    }
    setData(data, bufferOffset = 0, dataStartIndex = 0, dataCount = 4294967295) {
        var byteCount;
        if (this._indexType == IndexBuffer3D.INDEXTYPE_USHORT) {
            byteCount = 2;
            if (dataStartIndex !== 0 || dataCount !== 4294967295)
                data = new Uint16Array(data.buffer, dataStartIndex * byteCount, dataCount);
        }
        else if (this._indexType == IndexBuffer3D.INDEXTYPE_UBYTE) {
            byteCount = 1;
            if (dataStartIndex !== 0 || dataCount !== 4294967295)
                data = new Uint8Array(data.buffer, dataStartIndex * byteCount, dataCount);
        }
        var curBufSta = BufferStateBase._curBindedBufferState;
        if (curBufSta) {
            if (curBufSta._bindedIndexBuffer === this) {
                LayaGL.instance.bufferSubData(this._bufferType, bufferOffset * byteCount, data);
            }
            else {
                curBufSta.unBind();
                this.bind();
                LayaGL.instance.bufferSubData(this._bufferType, bufferOffset * byteCount, data);
                curBufSta.bind();
            }
        }
        else {
            this.bind();
            LayaGL.instance.bufferSubData(this._bufferType, bufferOffset * byteCount, data);
        }
        if (this._canRead) {
            if (bufferOffset !== 0 || dataStartIndex !== 0 || dataCount !== 4294967295) {
                var maxLength = this._buffer.length - bufferOffset;
                if (dataCount > maxLength)
                    dataCount = maxLength;
                for (var i = 0; i < dataCount; i++)
                    this._buffer[bufferOffset + i] = data[i];
            }
            else {
                this._buffer = data;
            }
        }
    }
    getData() {
        if (this._canRead)
            return this._buffer;
        else
            throw new Error("Can't read data from VertexBuffer with only write flag!");
    }
    destroy() {
        super.destroy();
        this._buffer = null;
    }
}
IndexBuffer3D.INDEXTYPE_UBYTE = "ubyte";
IndexBuffer3D.INDEXTYPE_USHORT = "ushort";
