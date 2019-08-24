import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";
export class PBRSpecularMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("PBRSpecular");
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        this._shaderValues.setVector(PBRSpecularMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this._emissionColor = new Vector4(0.0, 0.0, 0.0, 0.0);
        this._shaderValues.setVector(PBRSpecularMaterial.EMISSIONCOLOR, new Vector4(0.0, 0.0, 0.0, 0.0));
        this._specularColor = new Vector4(0.2, 0.2, 0.2, 0.2);
        this._shaderValues.setVector(PBRSpecularMaterial.SPECULARCOLOR, new Vector4(0.2, 0.2, 0.2, 0.2));
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESS, 0.5);
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSCALE, 1.0);
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSOURCE, 0);
        this._shaderValues.setNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH, 1.0);
        this._shaderValues.setNumber(PBRSpecularMaterial.NORMALSCALE, 1.0);
        this._shaderValues.setNumber(PBRSpecularMaterial.PARALLAXSCALE, 0.001);
        this._shaderValues.setBool(PBRSpecularMaterial.ENABLEEMISSION, false);
        this._shaderValues.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
        this.renderMode = PBRSpecularMaterial.RENDERMODE_OPAQUE;
    }
    static __initDefine__() {
        PBRSpecularMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("SPECULARTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA = PBRSpecularMaterial.shaderDefines.registerDefine("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA");
        PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("NORMALTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("PARALLAXTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("OCCLUSIONTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_EMISSION = PBRSpecularMaterial.shaderDefines.registerDefine("EMISSION");
        PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("EMISSIONTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET = PBRSpecularMaterial.shaderDefines.registerDefine("TILINGOFFSET");
        PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY = PBRSpecularMaterial.shaderDefines.registerDefine("ALPHAPREMULTIPLY");
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
    get _SpecColorR() {
        return this._specularColor.x;
    }
    set _SpecColorR(value) {
        this._specularColor.x = value;
        this.specularColor = this._specularColor;
    }
    get _SpecColorG() {
        return this._specularColor.y;
    }
    set _SpecColorG(value) {
        this._specularColor.y = value;
        this.specularColor = this._specularColor;
    }
    get _SpecColorB() {
        return this._specularColor.z;
    }
    set _SpecColorB(value) {
        this._specularColor.z = value;
        this.specularColor = this._specularColor;
    }
    get _SpecColorA() {
        return this._specularColor.w;
    }
    set _SpecColorA(value) {
        this._specularColor.w = value;
        this.specularColor = this._specularColor;
    }
    get _Glossiness() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.SMOOTHNESS);
    }
    set _Glossiness(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESS, value);
    }
    get _GlossMapScale() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.SMOOTHNESSSCALE);
    }
    set _GlossMapScale(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSCALE, value);
    }
    get _BumpScale() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.NORMALSCALE);
    }
    set _BumpScale(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.NORMALSCALE, value);
    }
    get _Parallax() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.PARALLAXSCALE);
    }
    set _Parallax(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.PARALLAXSCALE, value);
    }
    get _OcclusionStrength() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH);
    }
    set _OcclusionStrength(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH, value);
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
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).x;
    }
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STY() {
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).y;
    }
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STZ() {
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).z;
    }
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STW() {
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).w;
    }
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
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
        this._shaderValues.setVector(PBRSpecularMaterial.ALBEDOCOLOR, value);
    }
    get albedoTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.ALBEDOTEXTURE);
    }
    set albedoTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.ALBEDOTEXTURE, value);
    }
    get normalTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.NORMALTEXTURE);
    }
    set normalTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.NORMALTEXTURE, value);
    }
    get normalTextureScale() {
        return this._BumpScale;
    }
    set normalTextureScale(value) {
        this._BumpScale = value;
    }
    get parallaxTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.PARALLAXTEXTURE);
    }
    set parallaxTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.PARALLAXTEXTURE, value);
    }
    get parallaxTextureScale() {
        return this._Parallax;
    }
    set parallaxTextureScale(value) {
        this._Parallax = Math.max(0.005, Math.min(0.08, value));
    }
    get occlusionTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.OCCLUSIONTEXTURE);
    }
    set occlusionTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.OCCLUSIONTEXTURE, value);
    }
    get occlusionTextureStrength() {
        return this._OcclusionStrength;
    }
    set occlusionTextureStrength(value) {
        this._OcclusionStrength = Math.max(0.0, Math.min(1.0, value));
    }
    get specularTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.SPECULARTEXTURE);
    }
    set specularTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.SPECULARTEXTURE, value);
    }
    get specularColorR() {
        return this._SpecColorR;
    }
    set specularColorR(value) {
        this._SpecColorR = value;
    }
    get specularColorG() {
        return this._SpecColorG;
    }
    set specularColorG(value) {
        this._SpecColorG = value;
    }
    get specularColorB() {
        return this._SpecColorB;
    }
    set specularColorB(value) {
        this._SpecColorB = value;
    }
    get specularColorA() {
        return this._SpecColorA;
    }
    set specularColorA(value) {
        this._SpecColorA = value;
    }
    get specularColor() {
        return this._shaderValues.getVector(PBRSpecularMaterial.SPECULARCOLOR);
    }
    set specularColor(value) {
        this._shaderValues.setVector(PBRSpecularMaterial.SPECULARCOLOR, value);
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
        return this._shaderValues.getInt(PBRSpecularMaterial.SMOOTHNESSSOURCE);
    }
    set smoothnessSource(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
            this._shaderValues.setInt(PBRSpecularMaterial.SMOOTHNESSSOURCE, 1);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
            this._shaderValues.setInt(PBRSpecularMaterial.SMOOTHNESSSOURCE, 0);
        }
    }
    get enableEmission() {
        return this._shaderValues.getBool(PBRSpecularMaterial.ENABLEEMISSION);
    }
    set enableEmission(value) {
        if (value)
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSION);
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSION);
        }
        this._shaderValues.setBool(PBRSpecularMaterial.ENABLEEMISSION, value);
    }
    get emissionColor() {
        return this._shaderValues.getVector(PBRSpecularMaterial.EMISSIONCOLOR);
    }
    set emissionColor(value) {
        this._shaderValues.setVector(PBRSpecularMaterial.EMISSIONCOLOR, value);
    }
    get emissionTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.EMISSIONTEXTURE);
    }
    set emissionTexture(value) {
        if (value)
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        else
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        this._shaderValues.setTexture(PBRSpecularMaterial.EMISSIONTEXTURE, value);
    }
    get enableReflection() {
        return this._shaderValues.getBool(PBRSpecularMaterial.ENABLEREFLECT);
    }
    set enableReflection(value) {
        this._shaderValues.setBool(PBRSpecularMaterial.ENABLEREFLECT, true);
        if (value)
            this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        else
            this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
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
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
    }
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(PBRSpecularMaterial.TILINGOFFSET, value);
    }
    set renderMode(value) {
        switch (value) {
            case PBRSpecularMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRSpecularMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRSpecularMaterial.RENDERMODE_FADE:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRSpecularMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_ONE;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            default:
                throw new Error("PBRSpecularMaterial : renderMode value error.");
        }
    }
    set depthWrite(value) {
        this._shaderValues.setBool(PBRSpecularMaterial.DEPTH_WRITE, value);
    }
    get depthWrite() {
        return this._shaderValues.getBool(PBRSpecularMaterial.DEPTH_WRITE);
    }
    set cull(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.CULL, value);
    }
    get cull() {
        return this._shaderValues.getInt(PBRSpecularMaterial.CULL);
    }
    set blend(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.BLEND, value);
    }
    get blend() {
        return this._shaderValues.getInt(PBRSpecularMaterial.BLEND);
    }
    set blendSrc(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.BLEND_SRC, value);
    }
    get blendSrc() {
        return this._shaderValues.getInt(PBRSpecularMaterial.BLEND_SRC);
    }
    set blendDst(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.BLEND_DST, value);
    }
    get blendDst() {
        return this._shaderValues.getInt(PBRSpecularMaterial.BLEND_DST);
    }
    set depthTest(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.DEPTH_TEST, value);
    }
    get depthTest() {
        return this._shaderValues.getInt(PBRSpecularMaterial.DEPTH_TEST);
    }
    clone() {
        var dest = new PBRSpecularMaterial();
        this.cloneTo(dest);
        return dest;
    }
    cloneTo(destObject) {
        super.cloneTo(destObject);
        var destMaterial = destObject;
        this._albedoColor.cloneTo(destMaterial._albedoColor);
        this._specularColor.cloneTo(destMaterial._specularColor);
        this._emissionColor.cloneTo(destMaterial._emissionColor);
    }
}
PBRSpecularMaterial.SmoothnessSource_SpecularTexture_Alpha = 0;
PBRSpecularMaterial.SmoothnessSource_AlbedoTexture_Alpha = 1;
PBRSpecularMaterial.RENDERMODE_OPAQUE = 0;
PBRSpecularMaterial.RENDERMODE_CUTOUT = 1;
PBRSpecularMaterial.RENDERMODE_FADE = 2;
PBRSpecularMaterial.RENDERMODE_TRANSPARENT = 3;
PBRSpecularMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
PBRSpecularMaterial.SPECULARTEXTURE = Shader3D.propertyNameToID("u_SpecularTexture");
PBRSpecularMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
PBRSpecularMaterial.PARALLAXTEXTURE = Shader3D.propertyNameToID("u_ParallaxTexture");
PBRSpecularMaterial.OCCLUSIONTEXTURE = Shader3D.propertyNameToID("u_OcclusionTexture");
PBRSpecularMaterial.EMISSIONTEXTURE = Shader3D.propertyNameToID("u_EmissionTexture");
PBRSpecularMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
PBRSpecularMaterial.SPECULARCOLOR = Shader3D.propertyNameToID("u_SpecularColor");
PBRSpecularMaterial.EMISSIONCOLOR = Shader3D.propertyNameToID("u_EmissionColor");
PBRSpecularMaterial.SMOOTHNESS = Shader3D.propertyNameToID("u_smoothness");
PBRSpecularMaterial.SMOOTHNESSSCALE = Shader3D.propertyNameToID("u_smoothnessScale");
PBRSpecularMaterial.SMOOTHNESSSOURCE = -1;
PBRSpecularMaterial.OCCLUSIONSTRENGTH = Shader3D.propertyNameToID("u_occlusionStrength");
PBRSpecularMaterial.NORMALSCALE = Shader3D.propertyNameToID("u_normalScale");
PBRSpecularMaterial.PARALLAXSCALE = Shader3D.propertyNameToID("u_parallaxScale");
PBRSpecularMaterial.ENABLEEMISSION = -1;
PBRSpecularMaterial.ENABLEREFLECT = -1;
PBRSpecularMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
PBRSpecularMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
PBRSpecularMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
PBRSpecularMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
PBRSpecularMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
PBRSpecularMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
PBRSpecularMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
PBRSpecularMaterial.shaderDefines = null;
