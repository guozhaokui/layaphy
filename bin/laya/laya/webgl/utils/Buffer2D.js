import { LayaGL } from "../../layagl/LayaGL";
import { RenderInfo } from "../../renders/RenderInfo";
import { BaseShader } from "../shader/BaseShader";
import { Buffer } from "./Buffer";
export class Buffer2D extends Buffer {
    constructor() {
        super();
        this._maxsize = 0;
        this._upload = true;
        this._uploadSize = 0;
        this._bufferSize = 0;
        this._u8Array = null;
    }
    static __int__(gl) {
    }
    get bufferLength() {
        return this._buffer.byteLength;
    }
    set byteLength(value) {
        this.setByteLength(value);
    }
    setByteLength(value) {
        if (this._byteLength !== value) {
            value <= this._bufferSize || (this._resizeBuffer(value * 2 + 256, true));
            this._byteLength = value;
        }
    }
    needSize(sz) {
        var old = this._byteLength;
        if (sz) {
            var needsz = this._byteLength + sz;
            needsz <= this._bufferSize || (this._resizeBuffer(needsz << 1, true));
            this._byteLength = needsz;
        }
        return old;
    }
    _bufferData() {
        this._maxsize = Math.max(this._maxsize, this._byteLength);
        if (RenderInfo.loopCount % 30 == 0) {
            if (this._buffer.byteLength > (this._maxsize + 64)) {
                this._buffer = this._buffer.slice(0, this._maxsize + 64);
                this._bufferSize = this._buffer.byteLength;
                this._checkArrayUse();
            }
            this._maxsize = this._byteLength;
        }
        if (this._uploadSize < this._buffer.byteLength) {
            this._uploadSize = this._buffer.byteLength;
            LayaGL.instance.bufferData(this._bufferType, this._uploadSize, this._bufferUsage);
        }
        LayaGL.instance.bufferSubData(this._bufferType, 0, new Uint8Array(this._buffer, 0, this._byteLength));
    }
    _bufferSubData(offset = 0, dataStart = 0, dataLength = 0) {
        this._maxsize = Math.max(this._maxsize, this._byteLength);
        if (RenderInfo.loopCount % 30 == 0) {
            if (this._buffer.byteLength > (this._maxsize + 64)) {
                this._buffer = this._buffer.slice(0, this._maxsize + 64);
                this._bufferSize = this._buffer.byteLength;
                this._checkArrayUse();
            }
            this._maxsize = this._byteLength;
        }
        if (this._uploadSize < this._buffer.byteLength) {
            this._uploadSize = this._buffer.byteLength;
            LayaGL.instance.bufferData(this._bufferType, this._uploadSize, this._bufferUsage);
        }
        if (dataStart || dataLength) {
            var subBuffer = this._buffer.slice(dataStart, dataLength);
            LayaGL.instance.bufferSubData(this._bufferType, offset, subBuffer);
        }
        else {
            LayaGL.instance.bufferSubData(this._bufferType, offset, this._buffer);
        }
    }
    _checkArrayUse() {
    }
    _bind_uploadForVAO() {
        if (!this._upload)
            return false;
        this._upload = false;
        this._bindForVAO();
        this._bufferData();
        return true;
    }
    _bind_upload() {
        if (!this._upload)
            return false;
        this._upload = false;
        this.bind();
        this._bufferData();
        return true;
    }
    _bind_subUpload(offset = 0, dataStart = 0, dataLength = 0) {
        if (!this._upload)
            return false;
        this._upload = false;
        this.bind();
        this._bufferSubData(offset, dataStart, dataLength);
        return true;
    }
    _resizeBuffer(nsz, copy) {
        var buff = this._buffer;
        if (nsz <= buff.byteLength)
            return this;
        var u8buf = this._u8Array;
        if (copy && buff && buff.byteLength > 0) {
            var newbuffer = new ArrayBuffer(nsz);
            var oldU8Arr = (u8buf && u8buf.buffer == buff) ? u8buf : new Uint8Array(buff);
            u8buf = this._u8Array = new Uint8Array(newbuffer);
            u8buf.set(oldU8Arr, 0);
            buff = this._buffer = newbuffer;
        }
        else {
            buff = this._buffer = new ArrayBuffer(nsz);
            this._u8Array = null;
        }
        this._checkArrayUse();
        this._upload = true;
        this._bufferSize = buff.byteLength;
        return this;
    }
    append(data) {
        this._upload = true;
        var byteLen, n;
        byteLen = data.byteLength;
        if (data instanceof Uint8Array) {
            this._resizeBuffer(this._byteLength + byteLen, true);
            n = new Uint8Array(this._buffer, this._byteLength);
        }
        else if (data instanceof Uint16Array) {
            this._resizeBuffer(this._byteLength + byteLen, true);
            n = new Uint16Array(this._buffer, this._byteLength);
        }
        else if (data instanceof Float32Array) {
            this._resizeBuffer(this._byteLength + byteLen, true);
            n = new Float32Array(this._buffer, this._byteLength);
        }
        n.set(data, 0);
        this._byteLength += byteLen;
        this._checkArrayUse();
    }
    appendU16Array(data, len) {
        this._resizeBuffer(this._byteLength + len * 2, true);
        var u = new Uint16Array(this._buffer, this._byteLength, len);
        if (len == 6) {
            u[0] = data[0];
            u[1] = data[1];
            u[2] = data[2];
            u[3] = data[3];
            u[4] = data[4];
            u[5] = data[5];
        }
        else if (len >= 100) {
            u.set(new Uint16Array(data.buffer, 0, len));
        }
        else {
            for (var i = 0; i < len; i++) {
                u[i] = data[i];
            }
        }
        this._byteLength += len * 2;
        this._checkArrayUse();
    }
    appendEx(data, type) {
        this._upload = true;
        var byteLen, n;
        byteLen = data.byteLength;
        this._resizeBuffer(this._byteLength + byteLen, true);
        n = new type(this._buffer, this._byteLength);
        n.set(data, 0);
        this._byteLength += byteLen;
        this._checkArrayUse();
    }
    appendEx2(data, type, dataLen, perDataLen = 1) {
        this._upload = true;
        var byteLen, n;
        byteLen = dataLen * perDataLen;
        this._resizeBuffer(this._byteLength + byteLen, true);
        n = new type(this._buffer, this._byteLength);
        var i;
        for (i = 0; i < dataLen; i++) {
            n[i] = data[i];
        }
        this._byteLength += byteLen;
        this._checkArrayUse();
    }
    getBuffer() {
        return this._buffer;
    }
    setNeedUpload() {
        this._upload = true;
    }
    getNeedUpload() {
        return this._upload;
    }
    upload() {
        var gl = LayaGL.instance;
        var scuess = this._bind_upload();
        gl.bindBuffer(this._bufferType, null);
        if (this._bufferType == gl.ARRAY_BUFFER)
            Buffer._bindedVertexBuffer = null;
        if (this._bufferType == gl.ELEMENT_ARRAY_BUFFER)
            Buffer._bindedIndexBuffer = null;
        BaseShader.activeShader = null;
        return scuess;
    }
    subUpload(offset = 0, dataStart = 0, dataLength = 0) {
        var gl = LayaGL.instance;
        var scuess = this._bind_subUpload();
        gl.bindBuffer(this._bufferType, null);
        if (this._bufferType == gl.ARRAY_BUFFER)
            Buffer._bindedVertexBuffer = null;
        if (this._bufferType == gl.ELEMENT_ARRAY_BUFFER)
            Buffer._bindedIndexBuffer = null;
        BaseShader.activeShader = null;
        return scuess;
    }
    _disposeResource() {
        this._upload = true;
        this._uploadSize = 0;
    }
    clear() {
        this._byteLength = 0;
        this._upload = true;
    }
}
Buffer2D.FLOAT32 = 4;
Buffer2D.SHORT = 2;
