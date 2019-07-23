import { LayaGL } from "../../layagl/LayaGL";
import { BaseTexture } from "../../resource/BaseTexture";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { DefineDatas } from "./DefineDatas";
export class ShaderData {
    constructor(ownerResource = null) {
        this._ownerResource = null;
        this._data = null;
        this._defineDatas = new DefineDatas();
        this._runtimeCopyValues = [];
        this._ownerResource = ownerResource;
        this._initData();
    }
    _initData() {
        this._data = new Object();
    }
    getData() {
        return this._data;
    }
    addDefine(define) {
        this._defineDatas.add(define);
    }
    removeDefine(define) {
        this._defineDatas.remove(define);
    }
    hasDefine(define) {
        return (this._defineDatas.value & define) > 0;
    }
    clearDefine() {
        this._defineDatas.value = 0;
    }
    getBool(index) {
        return this._data[index];
    }
    setBool(index, value) {
        this._data[index] = value;
    }
    getInt(index) {
        return this._data[index];
    }
    setInt(index, value) {
        this._data[index] = value;
    }
    getNumber(index) {
        return this._data[index];
    }
    setNumber(index, value) {
        this._data[index] = value;
    }
    getVector2(index) {
        return this._data[index];
    }
    setVector2(index, value) {
        this._data[index] = value;
    }
    getVector3(index) {
        return this._data[index];
    }
    setVector3(index, value) {
        this._data[index] = value;
    }
    getVector(index) {
        return this._data[index];
    }
    setVector(index, value) {
        this._data[index] = value;
    }
    getQuaternion(index) {
        return this._data[index];
    }
    setQuaternion(index, value) {
        this._data[index] = value;
    }
    getMatrix4x4(index) {
        return this._data[index];
    }
    setMatrix4x4(index, value) {
        this._data[index] = value;
    }
    getBuffer(shaderIndex) {
        return this._data[shaderIndex];
    }
    setBuffer(index, value) {
        this._data[index] = value;
    }
    setTexture(index, value) {
        var lastValue = this._data[index];
        this._data[index] = value;
        if (this._ownerResource && this._ownerResource.referenceCount > 0) {
            (lastValue) && (lastValue._removeReference());
            (value) && (value._addReference());
        }
    }
    getTexture(index) {
        return this._data[index];
    }
    setAttribute(index, value) {
        this._data[index] = value;
    }
    getAttribute(index) {
        return this._data[index];
    }
    getLength() {
        return this._data.length;
    }
    setLength(value) {
        this._data.length = value;
    }
    cloneTo(destObject) {
        var dest = destObject;
        var destData = dest._data;
        for (var k in this._data) {
            var value = this._data[k];
            if (value != null) {
                if (typeof (value) == 'number') {
                    destData[k] = value;
                }
                else if (typeof (value) == 'number') {
                    destData[k] = value;
                }
                else if (typeof (value) == "boolean") {
                    destData[k] = value;
                }
                else if (value instanceof Vector2) {
                    var v2 = (destData[k]) || (destData[k] = new Vector2());
                    value.cloneTo(v2);
                    destData[k] = v2;
                }
                else if (value instanceof Vector3) {
                    var v3 = (destData[k]) || (destData[k] = new Vector3());
                    value.cloneTo(v3);
                    destData[k] = v3;
                }
                else if (value instanceof Vector4) {
                    var v4 = (destData[k]) || (destData[k] = new Vector4());
                    value.cloneTo(v4);
                    destData[k] = v4;
                }
                else if (value instanceof Matrix4x4) {
                    var mat = (destData[k]) || (destData[k] = new Matrix4x4());
                    value.cloneTo(mat);
                    destData[k] = mat;
                }
                else if (value instanceof BaseTexture) {
                    destData[k] = value;
                }
            }
        }
        this._defineDatas.cloneTo(dest._defineDatas);
    }
    clone() {
        var dest = new ShaderData();
        this.cloneTo(dest);
        return dest;
    }
    cloneToForNative(destObject) {
        var dest = destObject;
        var diffSize = this._int32Data.length - dest._int32Data.length;
        if (diffSize > 0) {
            dest.needRenewArrayBufferForNative(this._int32Data.length);
        }
        dest._int32Data.set(this._int32Data, 0);
        var destData = dest._nativeArray;
        var dataCount = this._nativeArray.length;
        destData.length = dataCount;
        for (var i = 0; i < dataCount; i++) {
            var value = this._nativeArray[i];
            if (value) {
                if (typeof (value) == 'number') {
                    destData[i] = value;
                    dest.setNumber(i, value);
                }
                else if (typeof (value) == 'number') {
                    destData[i] = value;
                    dest.setInt(i, value);
                }
                else if (typeof (value) == "boolean") {
                    destData[i] = value;
                    dest.setBool(i, value);
                }
                else if (value instanceof Vector2) {
                    var v2 = (destData[i]) || (destData[i] = new Vector2());
                    value.cloneTo(v2);
                    destData[i] = v2;
                    dest.setVector2(i, v2);
                }
                else if (value instanceof Vector3) {
                    var v3 = (destData[i]) || (destData[i] = new Vector3());
                    value.cloneTo(v3);
                    destData[i] = v3;
                    dest.setVector3(i, v3);
                }
                else if (value instanceof Vector4) {
                    var v4 = (destData[i]) || (destData[i] = new Vector4());
                    value.cloneTo(v4);
                    destData[i] = v4;
                    dest.setVector(i, v4);
                }
                else if (value instanceof Matrix4x4) {
                    var mat = (destData[i]) || (destData[i] = new Matrix4x4());
                    value.cloneTo(mat);
                    destData[i] = mat;
                    dest.setMatrix4x4(i, mat);
                }
                else if (value instanceof BaseTexture) {
                    destData[i] = value;
                    dest.setTexture(i, value);
                }
            }
        }
    }
    _initDataForNative() {
        var length = 8;
        if (!length) {
            alert("ShaderData _initDataForNative error length=0");
        }
        this._frameCount = -1;
        this._runtimeCopyValues.length = 0;
        this._nativeArray = [];
        this._data = new ArrayBuffer(length * 4);
        this._int32Data = new Int32Array(this._data);
        this._float32Data = new Float32Array(this._data);
        LayaGL.instance.createArrayBufferRef(this._data, LayaGL.ARRAY_BUFFER_TYPE_DATA, true);
    }
    needRenewArrayBufferForNative(index) {
        if (index >= this._int32Data.length) {
            var nByteLen = (index + 1) * 4;
            var pre = this._int32Data;
            var preConchRef = this._data["conchRef"];
            var prePtrID = this._data["_ptrID"];
            this._data = new ArrayBuffer(nByteLen);
            this._int32Data = new Int32Array(this._data);
            this._float32Data = new Float32Array(this._data);
            this._data["conchRef"] = preConchRef;
            this._data["_ptrID"] = prePtrID;
            pre && this._int32Data.set(pre, 0);
            window.conch.updateArrayBufferRef(this._data['_ptrID'], preConchRef.isSyncToRender(), this._data);
        }
    }
    getDataForNative() {
        return this._nativeArray;
    }
    getIntForNative(index) {
        return this._int32Data[index];
    }
    setIntForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._int32Data[index] = value;
        this._nativeArray[index] = value;
    }
    getBoolForNative(index) {
        return this._int32Data[index] == 1;
    }
    setBoolForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._int32Data[index] = value ? 1 : 0;
        this._nativeArray[index] = value;
    }
    getNumberForNative(index) {
        return this._float32Data[index];
    }
    setNumberForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._float32Data[index] = value;
        this._nativeArray[index] = value;
    }
    getMatrix4x4ForNative(index) {
        return this._nativeArray[index];
    }
    setMatrix4x4ForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value;
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    getVectorForNative(index) {
        return this._nativeArray[index];
    }
    setVectorForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value;
        if (!value.elements) {
            value.forNativeElement();
        }
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    getVector2ForNative(index) {
        return this._nativeArray[index];
    }
    setVector2ForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value;
        if (!value.elements) {
            value.forNativeElement();
        }
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    getVector3ForNative(index) {
        return this._nativeArray[index];
    }
    setVector3ForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value;
        if (!value.elements) {
            value.forNativeElement();
        }
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    getQuaternionForNative(index) {
        return this._nativeArray[index];
    }
    setQuaternionForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value;
        if (!value.elements) {
            value.forNativeElement();
        }
        var nPtrID = this.setReferenceForNative(value.elements);
        this._int32Data[index] = nPtrID;
    }
    getBufferForNative(shaderIndex) {
        return this._nativeArray[shaderIndex];
    }
    setBufferForNative(index, value) {
        this.needRenewArrayBufferForNative(index);
        this._nativeArray[index] = value;
        var nPtrID = this.setReferenceForNative(value);
        this._int32Data[index] = nPtrID;
    }
    getAttributeForNative(index) {
        return this._nativeArray[index];
    }
    setAttributeForNative(index, value) {
        this._nativeArray[index] = value;
        if (!value["_ptrID"]) {
            LayaGL.instance.createArrayBufferRef(value, LayaGL.ARRAY_BUFFER_TYPE_DATA, true);
        }
        LayaGL.instance.syncBufferToRenderThread(value);
        this._int32Data[index] = value["_ptrID"];
    }
    getTextureForNative(index) {
        return this._nativeArray[index];
    }
    setTextureForNative(index, value) {
        if (!value)
            return;
        this.needRenewArrayBufferForNative(index);
        var lastValue = this._nativeArray[index];
        this._nativeArray[index] = value;
        this._int32Data[index] = value._glTexture.id;
        if (this._ownerResource && this._ownerResource.referenceCount > 0) {
            (lastValue) && (lastValue._removeReference());
            (value) && (value._addReference());
        }
    }
    setReferenceForNative(value) {
        this.clearRuntimeCopyArray();
        var nRefID = 0;
        var nPtrID = 0;
        if (ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_) {
            LayaGL.instance.createArrayBufferRefs(value, LayaGL.ARRAY_BUFFER_TYPE_DATA, true, LayaGL.ARRAY_BUFFER_REF_REFERENCE);
            nRefID = 0;
            nPtrID = value.getPtrID(nRefID);
        }
        else {
            LayaGL.instance.createArrayBufferRefs(value, LayaGL.ARRAY_BUFFER_TYPE_DATA, true, LayaGL.ARRAY_BUFFER_REF_COPY);
            nRefID = value.getRefNum() - 1;
            nPtrID = value.getPtrID(nRefID);
            this._runtimeCopyValues.push({ "obj": value, "refID": nRefID, "ptrID": nPtrID });
        }
        LayaGL.instance.syncBufferToRenderThread(value, nRefID);
        return nPtrID;
    }
    static setRuntimeValueMode(bReference) {
        ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_ = bReference;
    }
    clearRuntimeCopyArray() {
        var currentFrame = LayaGL.instance.getFrameCount();
        if (this._frameCount != currentFrame) {
            this._frameCount = currentFrame;
            for (var i = 0, n = this._runtimeCopyValues.length; i < n; i++) {
                var obj = this._runtimeCopyValues[i];
                obj.obj.clearRefNum();
            }
            this._runtimeCopyValues.length = 0;
        }
    }
}
ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_ = true;
