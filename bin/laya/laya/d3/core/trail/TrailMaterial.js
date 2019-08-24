import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "../material/BaseMaterial";
import { RenderState } from "../material/RenderState";
export class TrailMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("Trail");
        this._color = new Vector4(1.0, 1.0, 1.0, 1.0);
        this._shaderValues.setVector(TrailMaterial.TINTCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this.renderMode = TrailMaterial.RENDERMODE_ALPHABLENDED;
    }
    static __initDefine__() {
        TrailMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        TrailMaterial.SHADERDEFINE_MAINTEXTURE = TrailMaterial.shaderDefines.registerDefine("MAINTEXTURE");
        TrailMaterial.SHADERDEFINE_TILINGOFFSET = TrailMaterial.shaderDefines.registerDefine("TILINGOFFSET");
        TrailMaterial.SHADERDEFINE_ADDTIVEFOG = TrailMaterial.shaderDefines.registerDefine("ADDTIVEFOG");
    }
    get _TintColorR() {
        return this._color.x;
    }
    set _TintColorR(value) {
        this._color.x = value;
        this.color = this._color;
    }
    get _TintColorG() {
        return this._color.y;
    }
    set _TintColorG(value) {
        this._color.y = value;
        this.color = this._color;
    }
    get _TintColorB() {
        return this._color.z;
    }
    set _TintColorB(value) {
        this._color.z = value;
        this.color = this._color;
    }
    get _TintColorA() {
        return this._color.w;
    }
    set _TintColorA(value) {
        this._color.w = value;
        this.color = this._color;
    }
    get _MainTex_STX() {
        return this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).x;
    }
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(TrailMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STY() {
        return this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).y;
    }
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(TrailMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STZ() {
        return this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).z;
    }
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(TrailMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STW() {
        return this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).w;
    }
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(TrailMaterial.TILINGOFFSET);
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }
    set renderMode(value) {
        switch (value) {
            case TrailMaterial.RENDERMODE_ADDTIVE:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.addDefine(TrailMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            case TrailMaterial.RENDERMODE_ALPHABLENDED:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(TrailMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            default:
                throw new Error("TrailMaterial : renderMode value error.");
        }
    }
    get colorR() {
        return this._TintColorR;
    }
    set colorR(value) {
        this._TintColorR = value;
    }
    get colorG() {
        return this._TintColorG;
    }
    set colorG(value) {
        this._TintColorG = value;
    }
    get colorB() {
        return this._TintColorB;
    }
    set colorB(value) {
        this._TintColorB = value;
    }
    get colorA() {
        return this._TintColorA;
    }
    set colorA(value) {
        this._TintColorA = value;
    }
    get color() {
        return this._shaderValues.getVector(TrailMaterial.TINTCOLOR);
    }
    set color(value) {
        this._shaderValues.setVector(TrailMaterial.TINTCOLOR, value);
    }
    get texture() {
        return this._shaderValues.getTexture(TrailMaterial.MAINTEXTURE);
    }
    set texture(value) {
        if (value)
            this._shaderValues.addDefine(TrailMaterial.SHADERDEFINE_MAINTEXTURE);
        else
            this._shaderValues.removeDefine(TrailMaterial.SHADERDEFINE_MAINTEXTURE);
        this._shaderValues.setTexture(TrailMaterial.MAINTEXTURE, value);
    }
    get tilingOffsetX() {
        return this._MainTex_STX;
    }
    set tilingOffsetX(x) {
        this._MainTex_STX = x;
    }
    get tilingOffsetY() {
        return this._MainTex_STY;
    }
    set tilingOffsetY(y) {
        this._MainTex_STY = y;
    }
    get tilingOffsetZ() {
        return this._MainTex_STZ;
    }
    set tilingOffsetZ(z) {
        this._MainTex_STZ = z;
    }
    get tilingOffsetW() {
        return this._MainTex_STW;
    }
    set tilingOffsetW(w) {
        this._MainTex_STW = w;
    }
    get tilingOffset() {
        return this._shaderValues.getVector(TrailMaterial.TILINGOFFSET);
    }
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(TrailMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(TrailMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(TrailMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(TrailMaterial.TILINGOFFSET, value);
    }
    set depthWrite(value) {
        this._shaderValues.setBool(TrailMaterial.DEPTH_WRITE, value);
    }
    get depthWrite() {
        return this._shaderValues.getBool(TrailMaterial.DEPTH_WRITE);
    }
    set cull(value) {
        this._shaderValues.setInt(TrailMaterial.CULL, value);
    }
    get cull() {
        return this._shaderValues.getInt(TrailMaterial.CULL);
    }
    set blend(value) {
        this._shaderValues.setInt(TrailMaterial.BLEND, value);
    }
    get blend() {
        return this._shaderValues.getInt(TrailMaterial.BLEND);
    }
    set blendSrc(value) {
        this._shaderValues.setInt(TrailMaterial.BLEND_SRC, value);
    }
    get blendSrc() {
        return this._shaderValues.getInt(TrailMaterial.BLEND_SRC);
    }
    set blendDst(value) {
        this._shaderValues.setInt(TrailMaterial.BLEND_DST, value);
    }
    get blendDst() {
        return this._shaderValues.getInt(TrailMaterial.BLEND_DST);
    }
    set depthTest(value) {
        this._shaderValues.setInt(TrailMaterial.DEPTH_TEST, value);
    }
    get depthTest() {
        return this._shaderValues.getInt(TrailMaterial.DEPTH_TEST);
    }
    clone() {
        var dest = new TrailMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
TrailMaterial.RENDERMODE_ALPHABLENDED = 0;
TrailMaterial.RENDERMODE_ADDTIVE = 1;
TrailMaterial.MAINTEXTURE = Shader3D.propertyNameToID("u_MainTexture");
TrailMaterial.TINTCOLOR = Shader3D.propertyNameToID("u_MainColor");
TrailMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
TrailMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
TrailMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
TrailMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
TrailMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
TrailMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
TrailMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
TrailMaterial.shaderDefines = null;
