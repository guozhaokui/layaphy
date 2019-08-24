import { BaseMaterial } from "../material/BaseMaterial";
import { RenderState } from "../material/RenderState";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
export class ShurikenParticleMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("PARTICLESHURIKEN");
        this._color = new Vector4(1.0, 1.0, 1.0, 1.0);
        this.renderMode = ShurikenParticleMaterial.RENDERMODE_ALPHABLENDED;
    }
    static __initDefine__() {
        ShurikenParticleMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP = ShurikenParticleMaterial.shaderDefines.registerDefine("DIFFUSEMAP");
        ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR = ShurikenParticleMaterial.shaderDefines.registerDefine("TINTCOLOR");
        ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG = ShurikenParticleMaterial.shaderDefines.registerDefine("ADDTIVEFOG");
        ShurikenParticleMaterial.SHADERDEFINE_TILINGOFFSET = ShurikenParticleMaterial.shaderDefines.registerDefine("TILINGOFFSET");
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
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).x;
    }
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STY() {
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).y;
    }
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STZ() {
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).z;
    }
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STW() {
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).w;
    }
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }
    set renderMode(value) {
        switch (value) {
            case ShurikenParticleMaterial.RENDERMODE_ADDTIVE:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.depthWrite = false;
                this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE;
                this.alphaTest = false;
                this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            case ShurikenParticleMaterial.RENDERMODE_ALPHABLENDED:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.depthWrite = false;
                this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.alphaTest = false;
                this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            default:
                throw new Error("ShurikenParticleMaterial : renderMode value error.");
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
        return this._shaderValues.getVector(ShurikenParticleMaterial.TINTCOLOR);
    }
    set color(value) {
        if (value)
            this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR);
        else
            this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR);
        this._shaderValues.setVector(ShurikenParticleMaterial.TINTCOLOR, value);
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
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
    }
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(ShurikenParticleMaterial.TILINGOFFSET, value);
    }
    get texture() {
        return this._shaderValues.getTexture(ShurikenParticleMaterial.DIFFUSETEXTURE);
    }
    set texture(value) {
        if (value)
            this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP);
        else
            this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP);
        this._shaderValues.setTexture(ShurikenParticleMaterial.DIFFUSETEXTURE, value);
    }
    set depthWrite(value) {
        this._shaderValues.setBool(ShurikenParticleMaterial.DEPTH_WRITE, value);
    }
    get depthWrite() {
        return this._shaderValues.getBool(ShurikenParticleMaterial.DEPTH_WRITE);
    }
    set cull(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.CULL, value);
    }
    get cull() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.CULL);
    }
    set blend(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.BLEND, value);
    }
    get blend() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.BLEND);
    }
    set blendSrc(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.BLEND_SRC, value);
    }
    get blendSrc() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.BLEND_SRC);
    }
    set blendDst(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.BLEND_DST, value);
    }
    get blendDst() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.BLEND_DST);
    }
    set depthTest(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.DEPTH_TEST, value);
    }
    get depthTest() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.DEPTH_TEST);
    }
    clone() {
        var dest = new ShurikenParticleMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
ShurikenParticleMaterial.RENDERMODE_ALPHABLENDED = 0;
ShurikenParticleMaterial.RENDERMODE_ADDTIVE = 1;
ShurikenParticleMaterial.DIFFUSETEXTURE = Shader3D.propertyNameToID("u_texture");
ShurikenParticleMaterial.TINTCOLOR = Shader3D.propertyNameToID("u_Tintcolor");
ShurikenParticleMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
ShurikenParticleMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
ShurikenParticleMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
ShurikenParticleMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
ShurikenParticleMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
ShurikenParticleMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
ShurikenParticleMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
ShurikenParticleMaterial.shaderDefines = null;
