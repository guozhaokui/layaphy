import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";
export class UnlitMaterial extends BaseMaterial {
    constructor() {
        super();
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        this._albedoIntensity = 1.0;
        this._enableVertexColor = false;
        this.setShaderName("Unlit");
        this._shaderValues.setVector(UnlitMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this.renderMode = UnlitMaterial.RENDERMODE_OPAQUE;
    }
    static __initDefine__() {
        UnlitMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE = UnlitMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
        UnlitMaterial.SHADERDEFINE_TILINGOFFSET = UnlitMaterial.shaderDefines.registerDefine("TILINGOFFSET");
        UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = UnlitMaterial.shaderDefines.registerDefine("ENABLEVERTEXCOLOR");
    }
    get _ColorR() {
        return this._albedoColor.x;
    }
    set _ColorR(value) {
        this._albedoColor.x = value;
        this.albedoColor = this._albedoColor;
    }
    get _ColorG() {
        return this._albedoColor.y;
    }
    set _ColorG(value) {
        this._albedoColor.y = value;
        this.albedoColor = this._albedoColor;
    }
    get _ColorB() {
        return this._albedoColor.z;
    }
    set _ColorB(value) {
        this._albedoColor.z = value;
        this.albedoColor = this._albedoColor;
    }
    get _ColorA() {
        return this._albedoColor.w;
    }
    set _ColorA(value) {
        this._albedoColor.w = value;
        this.albedoColor = this._albedoColor;
    }
    get _AlbedoIntensity() {
        return this._albedoIntensity;
    }
    set _AlbedoIntensity(value) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo = this._shaderValues.getVector(UnlitMaterial.ALBEDOCOLOR);
            Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(UnlitMaterial.ALBEDOCOLOR, finalAlbedo);
        }
    }
    get _MainTex_STX() {
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).x;
    }
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STY() {
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).y;
    }
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STZ() {
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).z;
    }
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STW() {
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).w;
    }
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }
    get _Cutoff() {
        return this.alphaTestValue;
    }
    set _Cutoff(value) {
        this.alphaTestValue = value;
    }
    get albedoColorR() {
        return this._ColorR;
    }
    set albedoColorR(value) {
        this._ColorR = value;
    }
    get albedoColorG() {
        return this._ColorG;
    }
    set albedoColorG(value) {
        this._ColorG = value;
    }
    get albedoColorB() {
        return this._ColorB;
    }
    set albedoColorB(value) {
        this._ColorB = value;
    }
    get albedoColorA() {
        return this._ColorA;
    }
    set albedoColorA(value) {
        this._ColorA = value;
    }
    get albedoColor() {
        return this._albedoColor;
    }
    set albedoColor(value) {
        var finalAlbedo = this._shaderValues.getVector(UnlitMaterial.ALBEDOCOLOR);
        Vector4.scale(value, this._albedoIntensity, finalAlbedo);
        this._albedoColor = value;
        this._shaderValues.setVector(UnlitMaterial.ALBEDOCOLOR, finalAlbedo);
    }
    get albedoIntensity() {
        return this._albedoIntensity;
    }
    set albedoIntensity(value) {
        this._AlbedoIntensity = value;
    }
    get albedoTexture() {
        return this._shaderValues.getTexture(UnlitMaterial.ALBEDOTEXTURE);
    }
    set albedoTexture(value) {
        if (value)
            this._shaderValues.addDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        this._shaderValues.setTexture(UnlitMaterial.ALBEDOTEXTURE, value);
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
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
    }
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(UnlitMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(UnlitMaterial.TILINGOFFSET, value);
    }
    get enableVertexColor() {
        return this._enableVertexColor;
    }
    set enableVertexColor(value) {
        this._enableVertexColor = value;
        if (value)
            this._shaderValues.addDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
    }
    set renderMode(value) {
        switch (value) {
            case UnlitMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case UnlitMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case UnlitMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            default:
                throw new Error("UnlitMaterial : renderMode value error.");
        }
    }
    set depthWrite(value) {
        this._shaderValues.setBool(UnlitMaterial.DEPTH_WRITE, value);
    }
    get depthWrite() {
        return this._shaderValues.getBool(UnlitMaterial.DEPTH_WRITE);
    }
    set cull(value) {
        this._shaderValues.setInt(UnlitMaterial.CULL, value);
    }
    get cull() {
        return this._shaderValues.getInt(UnlitMaterial.CULL);
    }
    set blend(value) {
        this._shaderValues.setInt(UnlitMaterial.BLEND, value);
    }
    get blend() {
        return this._shaderValues.getInt(UnlitMaterial.BLEND);
    }
    set blendSrc(value) {
        this._shaderValues.setInt(UnlitMaterial.BLEND_SRC, value);
    }
    get blendSrc() {
        return this._shaderValues.getInt(UnlitMaterial.BLEND_SRC);
    }
    set blendDst(value) {
        this._shaderValues.setInt(UnlitMaterial.BLEND_DST, value);
    }
    get blendDst() {
        return this._shaderValues.getInt(UnlitMaterial.BLEND_DST);
    }
    set depthTest(value) {
        this._shaderValues.setInt(UnlitMaterial.DEPTH_TEST, value);
    }
    get depthTest() {
        return this._shaderValues.getInt(UnlitMaterial.DEPTH_TEST);
    }
    clone() {
        var dest = new UnlitMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
UnlitMaterial.RENDERMODE_OPAQUE = 0;
UnlitMaterial.RENDERMODE_CUTOUT = 1;
UnlitMaterial.RENDERMODE_TRANSPARENT = 2;
UnlitMaterial.RENDERMODE_ADDTIVE = 3;
UnlitMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
UnlitMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
UnlitMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
UnlitMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
UnlitMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
UnlitMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
UnlitMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
UnlitMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
UnlitMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
UnlitMaterial.shaderDefines = null;
