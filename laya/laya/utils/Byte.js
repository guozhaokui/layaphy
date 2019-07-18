import { Matrix } from "../maths/Matrix";
export class Byte {
    constructor(data = null) {
        this._xd_ = true;
        this._allocated_ = 8;
        this._pos_ = 0;
        this._length = 0;
        if (data) {
            this._u8d_ = new Uint8Array(data);
            this._d_ = new DataView(this._u8d_.buffer);
            this._length = this._d_.byteLength;
        }
        else {
            this._resizeBuffer(this._allocated_);
        }
    }
    static getSystemEndian() {
        if (!Byte._sysEndian) {
            var buffer = new ArrayBuffer(2);
            new DataView(buffer).setInt16(0, 256, true);
            Byte._sysEndian = (new Int16Array(buffer))[0] === 256 ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
        }
        return Byte._sysEndian;
    }
    get buffer() {
        var rstBuffer = this._d_.buffer;
        if (rstBuffer.byteLength === this._length)
            return rstBuffer;
        return rstBuffer.slice(0, this._length);
    }
    get endian() {
        return this._xd_ ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
    }
    set endian(value) {
        this._xd_ = (value === Byte.LITTLE_ENDIAN);
    }
    set length(value) {
        if (this._allocated_ < value)
            this._resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2)));
        else if (this._allocated_ > value)
            this._resizeBuffer(this._allocated_ = value);
        this._length = value;
    }
    get length() {
        return this._length;
    }
    _resizeBuffer(len) {
        try {
            var newByteView = new Uint8Array(len);
            if (this._u8d_ != null) {
                if (this._u8d_.length <= len)
                    newByteView.set(this._u8d_);
                else
                    newByteView.set(this._u8d_.subarray(0, len));
            }
            this._u8d_ = newByteView;
            this._d_ = new DataView(newByteView.buffer);
        }
        catch (err) {
            throw "Invalid typed array length:" + len;
        }
    }
    getString() {
        return this.readString();
    }
    readString() {
        return this._rUTF(this.getUint16());
    }
    getFloat32Array(start, len) {
        return this.readFloat32Array(start, len);
    }
    readFloat32Array(start, len) {
        var end = start + len;
        end = (end > this._length) ? this._length : end;
        var v = new Float32Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }
    getUint8Array(start, len) {
        return this.readUint8Array(start, len);
    }
    readUint8Array(start, len) {
        var end = start + len;
        end = (end > this._length) ? this._length : end;
        var v = new Uint8Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }
    getInt16Array(start, len) {
        return this.readInt16Array(start, len);
    }
    readInt16Array(start, len) {
        var end = start + len;
        end = (end > this._length) ? this._length : end;
        var v = new Int16Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }
    getFloat32() {
        return this.readFloat32();
    }
    readFloat32() {
        if (this._pos_ + 4 > this._length)
            throw "getFloat32 error - Out of bounds";
        var v = this._d_.getFloat32(this._pos_, this._xd_);
        this._pos_ += 4;
        return v;
    }
    getFloat64() {
        return this.readFloat64();
    }
    readFloat64() {
        if (this._pos_ + 8 > this._length)
            throw "getFloat64 error - Out of bounds";
        var v = this._d_.getFloat64(this._pos_, this._xd_);
        this._pos_ += 8;
        return v;
    }
    writeFloat32(value) {
        this._ensureWrite(this._pos_ + 4);
        this._d_.setFloat32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }
    writeFloat64(value) {
        this._ensureWrite(this._pos_ + 8);
        this._d_.setFloat64(this._pos_, value, this._xd_);
        this._pos_ += 8;
    }
    getInt32() {
        return this.readInt32();
    }
    readInt32() {
        if (this._pos_ + 4 > this._length)
            throw "getInt32 error - Out of bounds";
        var float = this._d_.getInt32(this._pos_, this._xd_);
        this._pos_ += 4;
        return float;
    }
    getUint32() {
        return this.readUint32();
    }
    readUint32() {
        if (this._pos_ + 4 > this._length)
            throw "getUint32 error - Out of bounds";
        var v = this._d_.getUint32(this._pos_, this._xd_);
        this._pos_ += 4;
        return v;
    }
    writeInt32(value) {
        this._ensureWrite(this._pos_ + 4);
        this._d_.setInt32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }
    writeUint32(value) {
        this._ensureWrite(this._pos_ + 4);
        this._d_.setUint32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }
    getInt16() {
        return this.readInt16();
    }
    readInt16() {
        if (this._pos_ + 2 > this._length)
            throw "getInt16 error - Out of bounds";
        var us = this._d_.getInt16(this._pos_, this._xd_);
        this._pos_ += 2;
        return us;
    }
    getUint16() {
        return this.readUint16();
    }
    readUint16() {
        if (this._pos_ + 2 > this._length)
            throw "getUint16 error - Out of bounds";
        var us = this._d_.getUint16(this._pos_, this._xd_);
        this._pos_ += 2;
        return us;
    }
    writeUint16(value) {
        this._ensureWrite(this._pos_ + 2);
        this._d_.setUint16(this._pos_, value, this._xd_);
        this._pos_ += 2;
    }
    writeInt16(value) {
        this._ensureWrite(this._pos_ + 2);
        this._d_.setInt16(this._pos_, value, this._xd_);
        this._pos_ += 2;
    }
    getUint8() {
        return this.readUint8();
    }
    readUint8() {
        if (this._pos_ + 1 > this._length)
            throw "getUint8 error - Out of bounds";
        return this._u8d_[this._pos_++];
    }
    writeUint8(value) {
        this._ensureWrite(this._pos_ + 1);
        this._d_.setUint8(this._pos_, value);
        this._pos_++;
    }
    _getUInt8(pos) {
        return this._readUInt8(pos);
    }
    _readUInt8(pos) {
        return this._d_.getUint8(pos);
    }
    _getUint16(pos) {
        return this._readUint16(pos);
    }
    _readUint16(pos) {
        return this._d_.getUint16(pos, this._xd_);
    }
    _getMatrix() {
        return this._readMatrix();
    }
    _readMatrix() {
        var rst = new Matrix(this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32());
        return rst;
    }
    _rUTF(len) {
        var v = "", max = this._pos_ + len, c, c2, c3, f = String.fromCharCode;
        var u = this._u8d_, i = 0;
        var strs = [];
        var n = 0;
        strs.length = 1000;
        while (this._pos_ < max) {
            c = u[this._pos_++];
            if (c < 0x80) {
                if (c != 0)
                    strs[n++] = f(c);
            }
            else if (c < 0xE0) {
                strs[n++] = f(((c & 0x3F) << 6) | (u[this._pos_++] & 0x7F));
            }
            else if (c < 0xF0) {
                c2 = u[this._pos_++];
                strs[n++] = f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[this._pos_++] & 0x7F));
            }
            else {
                c2 = u[this._pos_++];
                c3 = u[this._pos_++];
                strs[n++] = f(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (u[this._pos_++] & 0x7F));
            }
            i++;
        }
        strs.length = n;
        return strs.join('');
    }
    getCustomString(len) {
        return this.readCustomString(len);
    }
    readCustomString(len) {
        var v = "", ulen = 0, c, c2, f = String.fromCharCode;
        var u = this._u8d_, i = 0;
        while (len > 0) {
            c = u[this._pos_];
            if (c < 0x80) {
                v += f(c);
                this._pos_++;
                len--;
            }
            else {
                ulen = c - 0x80;
                this._pos_++;
                len -= ulen;
                while (ulen > 0) {
                    c = u[this._pos_++];
                    c2 = u[this._pos_++];
                    v += f((c2 << 8) | c);
                    ulen--;
                }
            }
        }
        return v;
    }
    get pos() {
        return this._pos_;
    }
    set pos(value) {
        this._pos_ = value;
    }
    get bytesAvailable() {
        return this._length - this._pos_;
    }
    clear() {
        this._pos_ = 0;
        this.length = 0;
    }
    __getBuffer() {
        return this._d_.buffer;
    }
    writeUTFBytes(value) {
        value = value + "";
        for (var i = 0, sz = value.length; i < sz; i++) {
            var c = value.charCodeAt(i);
            if (c <= 0x7F) {
                this.writeByte(c);
            }
            else if (c <= 0x7FF) {
                this._ensureWrite(this._pos_ + 2);
                this._u8d_.set([0xC0 | (c >> 6), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 2;
            }
            else if (c <= 0xFFFF) {
                this._ensureWrite(this._pos_ + 3);
                this._u8d_.set([0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 3;
            }
            else {
                this._ensureWrite(this._pos_ + 4);
                this._u8d_.set([0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 4;
            }
        }
    }
    writeUTFString(value) {
        var tPos = this.pos;
        this.writeUint16(1);
        this.writeUTFBytes(value);
        var dPos = this.pos - tPos - 2;
        this._d_.setUint16(tPos, dPos, this._xd_);
    }
    readUTFString() {
        return this.readUTFBytes(this.getUint16());
    }
    getUTFString() {
        return this.readUTFString();
    }
    readUTFBytes(len = -1) {
        if (len === 0)
            return "";
        var lastBytes = this.bytesAvailable;
        if (len > lastBytes)
            throw "readUTFBytes error - Out of bounds";
        len = len > 0 ? len : lastBytes;
        return this._rUTF(len);
    }
    getUTFBytes(len = -1) {
        return this.readUTFBytes(len);
    }
    writeByte(value) {
        this._ensureWrite(this._pos_ + 1);
        this._d_.setInt8(this._pos_, value);
        this._pos_ += 1;
    }
    readByte() {
        if (this._pos_ + 1 > this._length)
            throw "readByte error - Out of bounds";
        return this._d_.getInt8(this._pos_++);
    }
    getByte() {
        return this.readByte();
    }
    _ensureWrite(lengthToEnsure) {
        if (this._length < lengthToEnsure)
            this._length = lengthToEnsure;
        if (this._allocated_ < lengthToEnsure)
            this.length = lengthToEnsure;
    }
    writeArrayBuffer(arraybuffer, offset = 0, length = 0) {
        if (offset < 0 || length < 0)
            throw "writeArrayBuffer error - Out of bounds";
        if (length == 0)
            length = arraybuffer.byteLength - offset;
        this._ensureWrite(this._pos_ + length);
        var uint8array = new Uint8Array(arraybuffer);
        this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
        this._pos_ += length;
    }
    readArrayBuffer(length) {
        var rst;
        rst = this._u8d_.buffer.slice(this._pos_, this._pos_ + length);
        this._pos_ = this._pos_ + length;
        return rst;
    }
}
Byte.BIG_ENDIAN = "bigEndian";
Byte.LITTLE_ENDIAN = "littleEndian";
Byte._sysEndian = null;
