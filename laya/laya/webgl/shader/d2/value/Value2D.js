import { Shader } from "../../Shader";
import { Shader2X } from "../Shader2X";
import { ShaderDefines2D } from "../ShaderDefines2D";
import { RenderState2D } from "../../../utils/RenderState2D";
import { ILaya } from "../../../../../ILaya";
export class Value2D {
    constructor(mainID, subID) {
        this.defines = new ShaderDefines2D();
        this.size = [0, 0];
        this.alpha = 1.0;
        this.ALPHA = 1.0;
        this.subID = 0;
        this.ref = 1;
        this._cacheID = 0;
        this.clipMatDir = [ILaya.Context._MAXSIZE, 0, 0, ILaya.Context._MAXSIZE];
        this.clipMatPos = [0, 0];
        this.clipOff = [0, 0];
        this.mainID = mainID;
        this.subID = subID;
        this.textureHost = null;
        this.texture = null;
        this.color = null;
        this.colorAdd = null;
        this.u_mmat2 = null;
        this._cacheID = mainID | subID;
        this._inClassCache = Value2D._cache[this._cacheID];
        if (mainID > 0 && !this._inClassCache) {
            this._inClassCache = Value2D._cache[this._cacheID] = [];
            this._inClassCache._length = 0;
        }
        this.clear();
    }
    static _initone(type, classT) {
        Value2D._typeClass[type] = classT;
        Value2D._cache[type] = [];
        Value2D._cache[type]._length = 0;
    }
    static __init__() {
    }
    setValue(value) { }
    _ShaderWithCompile() {
        var ret = Shader.withCompile2D(0, this.mainID, this.defines.toNameDic(), this.mainID | this.defines._value, Shader2X.create, this._attribLocation);
        return ret;
    }
    upload() {
        var renderstate2d = RenderState2D;
        RenderState2D.worldMatrix4 === RenderState2D.TEMPMAT4_ARRAY || this.defines.addInt(ShaderDefines2D.WORLDMAT);
        this.mmat = renderstate2d.worldMatrix4;
        if (RenderState2D.matWVP) {
            this.defines.addInt(ShaderDefines2D.MVP3D);
            this.u_MvpMatrix = RenderState2D.matWVP.elements;
        }
        var sd = Shader.sharders[this.mainID | this.defines._value] || this._ShaderWithCompile();
        if (sd._shaderValueWidth !== renderstate2d.width || sd._shaderValueHeight !== renderstate2d.height) {
            this.size[0] = renderstate2d.width;
            this.size[1] = renderstate2d.height;
            sd._shaderValueWidth = renderstate2d.width;
            sd._shaderValueHeight = renderstate2d.height;
            sd.upload(this, null);
        }
        else {
            sd.upload(this, sd._params2dQuick2 || sd._make2dQuick2());
        }
    }
    setFilters(value) {
        this.filters = value;
        if (!value)
            return;
        var n = value.length, f;
        for (var i = 0; i < n; i++) {
            f = value[i];
            if (f) {
                this.defines.add(f.type);
                f.action.setValue(this);
            }
        }
    }
    clear() {
        this.defines._value = this.subID + (ILaya.WebGL.shaderHighPrecision ? ShaderDefines2D.SHADERDEFINE_FSHIGHPRECISION : 0);
        this.clipOff[0] = 0;
    }
    release() {
        if ((--this.ref) < 1) {
            this._inClassCache && (this._inClassCache[this._inClassCache._length++] = this);
            this.clear();
            this.filters = null;
            this.ref = 1;
            this.clipOff[0] = 0;
        }
    }
    static create(mainType, subType) {
        var types = Value2D._cache[mainType | subType];
        if (types._length)
            return types[--types._length];
        else
            return new Value2D._typeClass[mainType | subType](subType);
    }
}
Value2D._cache = [];
Value2D._typeClass = [];
Value2D.TEMPMAT4_ARRAY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
