import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";
export class PBRStandardMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("PBRStandard");
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        this._shaderValues.setVector(PBRStandardMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this._emissionColor = new Vector4(0.0, 0.0, 0.0, 0.0);
        this._shaderValues.setVector(PBRStandardMaterial.EMISSIONCOLOR, new Vector4(0.0, 0.0, 0.0, 0.0));
        this._shaderValues.setNumber(PBRStandardMaterial.METALLIC, 0.0);
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESS, 0.5);
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESSSCALE, 1.0);
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESSSOURCE, 0);
        this._shaderValues.setNumber(PBRStandardMaterial.OCCLUSIONSTRENGTH, 1.0);
        this._shaderValues.setNumber(PBRStandardMaterial.NORMALSCALE, 1.0);
        this._shaderValues.setNumber(PBRStandardMaterial.PARALLAXSCALE, 0.001);
        this._shaderValues.setBool(PBRStandardMaterial.ENABLEEMISSION, false);
        this._shaderValues.setBool(PBRStandardMaterial.ENABLEREFLECT, true);
        this._shaderValues.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
        this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        this.renderMode = PBRStandardMaterial.RENDERMODE_OPAQUE;
    }
    static __initDefine__() {
        PBRStandardMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        PBRStandardMaterial.SHADERDEFINE_ALBEDOTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("METALLICGLOSSTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA = PBRStandardMaterial.shaderDefines.registerDefine("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA");
        PBRStandardMaterial.SHADERDEFINE_NORMALTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("NORMALTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_PARALLAXTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("PARALLAXTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_OCCLUSIONTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("OCCLUSIONTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_EMISSION = PBRStandardMaterial.shaderDefines.registerDefine("EMISSION");
        PBRStandardMaterial.SHADERDEFINE_EMISSIONTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("EMISSIONTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_REFLECTMAP = PBRStandardMaterial.shaderDefines.registerDefine("REFLECTMAP");
        PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET = PBRStandardMaterial.shaderDefines.registerDefine("TILINGOFFSET");
        PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY = PBRStandardMaterial.shaderDefines.registerDefine("ALPHAPREMULTIPLY");
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
    get _Metallic() {
        return this._shaderValues.getNumber(PBRStandardMaterial.METALLIC);
    }
    set _Metallic(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.METALLIC, value);
    }
    get _Glossiness() {
        return this._shaderValues.getNumber(PBRStandardMaterial.SMOOTHNESS);
    }
    set _Glossiness(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESS, value);
    }
    get _GlossMapScale() {
        return this._shaderValues.getNumber(PBRStandardMaterial.SMOOTHNESSSCALE);
    }
    set _GlossMapScale(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESSSCALE, value);
    }
    get _BumpScale() {
        return this._shaderValues.getNumber(PBRStandardMaterial.NORMALSCALE);
    }
    set _BumpScale(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.NORMALSCALE, value);
    }
    get _Parallax() {
        return this._shaderValues.getNumber(PBRStandardMaterial.PARALLAXSCALE);
    }
    set _Parallax(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.PARALLAXSCALE, value);
    }
    get _OcclusionStrength() {
        return this._shaderValues.getNumber(PBRStandardMaterial.OCCLUSIONSTRENGTH);
    }
    set _OcclusionStrength(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.OCCLUSIONSTRENGTH, value);
    }
    get _EmissionColorR() {
        return this._emissionColor.x;
    }
    set _EmissionColorR(value) {
        this._emissionColor.x = value;
        this.emissionColor = this._emissionColor;
    }
    get _EmissionColorG() {
        return this._emissionColor.y;
    }
    set _EmissionColorG(value) {
        this._emissionColor.y = value;
        this.emissionColor = this._emissionColor;
    }
    get _EmissionColorB() {
        return this._emissionColor.z;
    }
    set _EmissionColorB(value) {
        this._emissionColor.z = value;
        this.emissionColor = this._emissionColor;
    }
    get _EmissionColorA() {
        return this._emissionColor.w;
    }
    set _EmissionColorA(value) {
        this._emissionColor.w = value;
        this.emissionColor = this._emissionColor;
    }
    get _MainTex_STX() {
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET).x;
    }
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STY() {
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET).y;
    }
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STZ() {
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET).z;
    }
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STW() {
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET).w;
    }
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
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
        this._albedoColor = value;
        this._shaderValues.setVector(PBRStandardMaterial.ALBEDOCOLOR, value);
    }
    get albedoTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.ALBEDOTEXTURE);
    }
    set albedoTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.ALBEDOTEXTURE, value);
    }
    get normalTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.NORMALTEXTURE);
    }
    set normalTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_NORMALTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_NORMALTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.NORMALTEXTURE, value);
    }
    get normalTextureScale() {
        return this._BumpScale;
    }
    set normalTextureScale(value) {
        this._BumpScale = value;
    }
    get parallaxTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.PARALLAXTEXTURE);
    }
    set parallaxTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.PARALLAXTEXTURE, value);
    }
    get parallaxTextureScale() {
        return this._Parallax;
    }
    set parallaxTextureScale(value) {
        this._Parallax = Math.max(0.005, Math.min(0.08, value));
    }
    get occlusionTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.OCCLUSIONTEXTURE);
    }
    set occlusionTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.OCCLUSIONTEXTURE, value);
    }
    get occlusionTextureStrength() {
        return this._OcclusionStrength;
    }
    set occlusionTextureStrength(value) {
        this._OcclusionStrength = Math.max(0.0, Math.min(1.0, value));
    }
    get metallicGlossTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.METALLICGLOSSTEXTURE);
    }
    set metallicGlossTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.METALLICGLOSSTEXTURE, value);
    }
    get metallic() {
        return this._Metallic;
    }
    set metallic(value) {
        this._Metallic = Math.max(0.0, Math.min(1.0, value));
    }
    get smoothness() {
        return this._Glossiness;
    }
    set smoothness(value) {
        this._Glossiness = Math.max(0.0, Math.min(1.0, value));
    }
    get smoothnessTextureScale() {
        return this._GlossMapScale;
    }
    set smoothnessTextureScale(value) {
        this._GlossMapScale = Math.max(0.0, Math.min(1.0, value));
    }
    get smoothnessSource() {
        return this._shaderValues.getInt(PBRStandardMaterial.SMOOTHNESSSOURCE);
    }
    set smoothnessSource(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
            this._shaderValues.setInt(PBRStandardMaterial.SMOOTHNESSSOURCE, 1);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
            this._shaderValues.setInt(PBRStandardMaterial.SMOOTHNESSSOURCE, 0);
        }
    }
    get enableEmission() {
        return this._shaderValues.getBool(PBRStandardMaterial.ENABLEEMISSION);
    }
    set enableEmission(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_EMISSION);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_EMISSION);
        }
        this._shaderValues.setBool(PBRStandardMaterial.ENABLEEMISSION, value);
    }
    get emissionColorR() {
        return this._EmissionColorR;
    }
    set emissionColorR(value) {
        this._EmissionColorR = value;
    }
    get emissionColorG() {
        return this._EmissionColorG;
    }
    set emissionColorG(value) {
        this._EmissionColorG = value;
    }
    get emissionColorB() {
        return this._EmissionColorB;
    }
    set emissionColorB(value) {
        this._EmissionColorB = value;
    }
    get emissionColorA() {
        return this._EmissionColorA;
    }
    set emissionColorA(value) {
        this._EmissionColorA = value;
    }
    get emissionColor() {
        return this._shaderValues.getVector(PBRStandardMaterial.EMISSIONCOLOR);
    }
    set emissionColor(value) {
        this._shaderValues.setVector(PBRStandardMaterial.EMISSIONCOLOR, value);
    }
    get emissionTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.EMISSIONTEXTURE);
    }
    set emissionTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.EMISSIONTEXTURE, value);
    }
    get enableReflection() {
        return this._shaderValues.getBool(PBRStandardMaterial.ENABLEREFLECT);
    }
    set enableReflection(value) {
        this._shaderValues.setBool(PBRStandardMaterial.ENABLEREFLECT, true);
        if (value) {
            this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        }
        else {
            this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        }
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
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
    }
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0) {
                this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET);
            }
            else {
                this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET);
            }
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(PBRStandardMaterial.TILINGOFFSET, value);
    }
    set renderMode(value) {
        switch (value) {
            case PBRStandardMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRStandardMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRStandardMaterial.RENDERMODE_FADE:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
                break;
            case PBRStandardMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_ONE;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            default:
                throw new Error("PBRSpecularMaterial : renderMode value error.");
        }
    }
    set depthWrite(value) {
        this._shaderValues.setBool(PBRStandardMaterial.DEPTH_WRITE, value);
    }
    get depthWrite() {
        return this._shaderValues.getBool(PBRStandardMaterial.DEPTH_WRITE);
    }
    set cull(value) {
        this._shaderValues.setInt(PBRStandardMaterial.CULL, value);
    }
    get cull() {
        return this._shaderValues.getInt(PBRStandardMaterial.CULL);
    }
    set blend(value) {
        this._shaderValues.setInt(PBRStandardMaterial.BLEND, value);
    }
    get blend() {
        return this._shaderValues.getInt(PBRStandardMaterial.BLEND);
    }
    set blendSrc(value) {
        this._shaderValues.setInt(PBRStandardMaterial.BLEND_SRC, value);
    }
    get blendSrc() {
        return this._shaderValues.getInt(PBRStandardMaterial.BLEND_SRC);
    }
    set blendDst(value) {
        this._shaderValues.setInt(PBRStandardMaterial.BLEND_DST, value);
    }
    get blendDst() {
        return this._shaderValues.getInt(PBRStandardMaterial.BLEND_DST);
    }
    set depthTest(value) {
        this._shaderValues.setInt(PBRStandardMaterial.DEPTH_TEST, value);
    }
    get depthTest() {
        return this._shaderValues.getInt(PBRStandardMaterial.DEPTH_TEST);
    }
    clone() {
        var dest = new PBRStandardMaterial();
        this.cloneTo(dest);
        return dest;
    }
    cloneTo(destObject) {
        super.cloneTo(destObject);
        var destMaterial = destObject;
        this._albedoColor.cloneTo(destMaterial._albedoColor);
        this._emissionColor.cloneTo(destMaterial._emissionColor);
    }
}
PBRStandardMaterial.SmoothnessSource_MetallicGlossTexture_Alpha = 0;
PBRStandardMaterial.SmoothnessSource_AlbedoTexture_Alpha = 1;
PBRStandardMaterial.RENDERMODE_OPAQUE = 0;
PBRStandardMaterial.RENDERMODE_CUTOUT = 1;
PBRStandardMaterial.RENDERMODE_FADE = 2;
PBRStandardMaterial.RENDERMODE_TRANSPARENT = 3;
PBRStandardMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
PBRStandardMaterial.METALLICGLOSSTEXTURE = Shader3D.propertyNameToID("u_MetallicGlossTexture");
PBRStandardMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
PBRStandardMaterial.PARALLAXTEXTURE = Shader3D.propertyNameToID("u_ParallaxTexture");
PBRStandardMaterial.OCCLUSIONTEXTURE = Shader3D.propertyNameToID("u_OcclusionTexture");
PBRStandardMaterial.EMISSIONTEXTURE = Shader3D.propertyNameToID("u_EmissionTexture");
PBRStandardMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
PBRStandardMaterial.EMISSIONCOLOR = Shader3D.propertyNameToID("u_EmissionColor");
PBRStandardMaterial.METALLIC = Shader3D.propertyNameToID("u_metallic");
PBRStandardMaterial.SMOOTHNESS = Shader3D.propertyNameToID("u_smoothness");
PBRStandardMaterial.SMOOTHNESSSCALE = Shader3D.propertyNameToID("u_smoothnessScale");
PBRStandardMaterial.SMOOTHNESSSOURCE = -1;
PBRStandardMaterial.OCCLUSIONSTRENGTH = Shader3D.propertyNameToID("u_occlusionStrength");
PBRStandardMaterial.NORMALSCALE = Shader3D.propertyNameToID("u_normalScale");
PBRStandardMaterial.PARALLAXSCALE = Shader3D.propertyNameToID("u_parallaxScale");
PBRStandardMaterial.ENABLEEMISSION = -1;
PBRStandardMaterial.ENABLEREFLECT = -1;
PBRStandardMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
PBRStandardMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
PBRStandardMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
PBRStandardMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
PBRStandardMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
PBRStandardMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
PBRStandardMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
PBRStandardMaterial.shaderDefines = null;
