import { Buffer2D } from "./Buffer2D";
import { LayaGL } from "../../layagl/LayaGL";
import { Buffer } from "./Buffer";
export class IndexBuffer2D extends Buffer2D {
    constructor(bufferUsage = 0x88e4) {
        super();
        this._bufferUsage = bufferUsage;
        this._bufferType = LayaGL.instance.ELEMENT_ARRAY_BUFFER;
        this._buffer = new ArrayBuffer(8);
    }
    _checkArrayUse() {
        this._uint16Array && (this._uint16Array = new Uint16Array(this._buffer));
    }
    getUint16Array() {
        return this._uint16Array || (this._uint16Array = new Uint16Array(this._buffer));
    }
    _bindForVAO() {
        var gl = LayaGL.instance;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glBuffer);
    }
    bind() {
        if (Buffer._bindedIndexBuffer !== this._glBuffer) {
            var gl = LayaGL.instance;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glBuffer);
            Buffer._bindedIndexBuffer = this._glBuffer;
            return true;
        }
        return false;
    }
    destory() {
        this._uint16Array = null;
        this._buffer = null;
    }
    disposeResource() {
        this._disposeResource();
    }
}
IndexBuffer2D.create = function (bufferUsage = 0x88e4) {
    return new IndexBuffer2D(bufferUsage);
};
