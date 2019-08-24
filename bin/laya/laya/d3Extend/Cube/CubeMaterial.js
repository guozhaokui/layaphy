import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D";
import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { RenderState } from "laya/d3/core/material/RenderState";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector4 } from "laya/d3/math/Vector4";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderDefines } from "laya/d3/shader/ShaderDefines";
import { SubShader } from "laya/d3/shader/SubShader";
export class CubeMaterial extends BaseMaterial {
    constructor() {
        super(12);
        this._enableVertexColor = false;
        this.setShaderName("CUBESHADER");
        this._albedoIntensity = 1.0;
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        var sv = this._shaderValues;
        sv.setVector(CubeMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        sv.setVector(CubeMaterial.MATERIALSPECULAR, new Vector4(1.0, 1.0, 1.0, 1.0));
        sv.setNumber(CubeMaterial.SHININESS, 0.078125);
        sv.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
        sv.setVector(CubeMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
        this._enableLighting = true;
        this.renderMode = CubeMaterial.RENDERMODE_OPAQUE;
    }
    static __init__() {
        CubeMaterial.SHADERDEFINE_DIFFUSEMAP = CubeMaterial.shaderDefines.registerDefine("DIFFUSEMAP");
        CubeMaterial.SHADERDEFINE_NORMALMAP = CubeMaterial.shaderDefines.registerDefine("NORMALMAP");
        CubeMaterial.SHADERDEFINE_SPECULARMAP = CubeMaterial.shaderDefines.registerDefine("SPECULARMAP");
        CubeMaterial.SHADERDEFINE_TILINGOFFSET = CubeMaterial.shaderDefines.registerDefine("TILINGOFFSET");
        CubeMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = CubeMaterial.shaderDefines.registerDefine("ENABLEVERTEXCOLOR");
        CubeMaterial.SHADERDEFINE_MODENABLEVERTEXCOLOR = CubeMaterial.shaderDefines.registerDefine("MODENABLEVERTEXCOLOR");
        CubeMaterial.SHADERDEFINE_SOLIDCOLORTEXTURE = CubeMaterial.shaderDefines.registerDefine("SOLIDCOLORTEXTURE");
        var vs, ps;
        var attributeMap = {
            'a_Position': VertexMesh.MESH_POSITION0,
            'a_Color': VertexMesh.MESH_COLOR0,
            'a_Normal': VertexMesh.MESH_NORMAL0,
            'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1,
            'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0,
            'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
            'a_Tangent0': VertexMesh.MESH_TANGENT0
        };
        var uniformMap = {
            'u_Bones': Shader3D.PERIOD_CUSTOM,
            'u_DiffuseTexture': Shader3D.PERIOD_MATERIAL,
            'u_SpecularTexture': Shader3D.PERIOD_MATERIAL,
            'u_NormalTexture': Shader3D.PERIOD_MATERIAL,
            'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,
            'u_DiffuseColor': Shader3D.PERIOD_MATERIAL,
            'u_MaterialSpecular': Shader3D.PERIOD_MATERIAL,
            'u_Shininess': Shader3D.PERIOD_MATERIAL,
            'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
            'u_WorldMat': Shader3D.PERIOD_SPRITE,
            'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
            'u_LightmapScaleOffset': Shader3D.PERIOD_SPRITE,
            'u_LightMap': Shader3D.PERIOD_SPRITE,
            'u_CameraPos': Shader3D.PERIOD_CAMERA,
            'u_ReflectTexture': Shader3D.PERIOD_SCENE,
            'u_ReflectIntensity': Shader3D.PERIOD_SCENE,
            'u_FogStart': Shader3D.PERIOD_SCENE,
            'u_FogRange': Shader3D.PERIOD_SCENE,
            'u_FogColor': Shader3D.PERIOD_SCENE,
            'u_DirectionLight.Color': Shader3D.PERIOD_SCENE,
            'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE,
            'u_PointLight.Position': Shader3D.PERIOD_SCENE,
            'u_PointLight.Range': Shader3D.PERIOD_SCENE,
            'u_PointLight.Color': Shader3D.PERIOD_SCENE,
            'u_SpotLight.Position': Shader3D.PERIOD_SCENE,
            'u_SpotLight.Direction': Shader3D.PERIOD_SCENE,
            'u_SpotLight.Range': Shader3D.PERIOD_SCENE,
            'u_SpotLight.Spot': Shader3D.PERIOD_SCENE,
            'u_SpotLight.Color': Shader3D.PERIOD_SCENE,
            'u_AmbientColor': Shader3D.PERIOD_SCENE,
            'u_shadowMap1': Shader3D.PERIOD_SCENE,
            'u_shadowMap2': Shader3D.PERIOD_SCENE,
            'u_shadowMap3': Shader3D.PERIOD_SCENE,
            'u_shadowPSSMDistance': Shader3D.PERIOD_SCENE,
            'u_lightShadowVP': Shader3D.PERIOD_SCENE,
            'u_shadowPCFoffset': Shader3D.PERIOD_SCENE
        };
        vs = this.__INCLUDESTR__("CubeShader/CubeShader.vs");
        ps = this.__INCLUDESTR__("CubeShader/CubeShader.ps");
        var shader = Shader3D.add("CUBESHADER");
        var subShader = new SubShader(attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines, CubeMaterial.shaderDefines);
        shader.addSubShader(subShader);
        subShader.addShaderPass(vs, ps);
    }
    get _ColorR() {
        return this._albedoColor.elements[0];
    }
    set _ColorR(value) {
        this._albedoColor.elements[0] = value;
        this.albedoColor = this._albedoColor;
    }
    get _ColorG() {
        return this._albedoColor.elements[1];
    }
    set _ColorG(value) {
        this._albedoColor.elements[1] = value;
        this.albedoColor = this._albedoColor;
    }
    get _ColorB() {
        return this._albedoColor.elements[2];
    }
    set _ColorB(value) {
        this._albedoColor.elements[2] = value;
        this.albedoColor = this._albedoColor;
    }
    get _ColorA() {
        return this._albedoColor.elements[3];
    }
    set _ColorA(value) {
        this._albedoColor.elements[3] = value;
        this.albedoColor = this._albedoColor;
    }
    get _SpecColorR() {
        return this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[0];
    }
    set _SpecColorR(value) {
        this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[0] = value;
    }
    get _SpecColorG() {
        return this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[1];
    }
    set _SpecColorG(value) {
        this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[1] = value;
    }
    get _SpecColorB() {
        return this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[2];
    }
    set _SpecColorB(value) {
        this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[2] = value;
    }
    get _SpecColorA() {
        return this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[3];
    }
    set _SpecColorA(value) {
        this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR).elements[3] = value;
    }
    get _AlbedoIntensity() {
        return this._albedoIntensity;
    }
    set _AlbedoIntensity(value) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo = this._shaderValues.getVector(CubeMaterial.ALBEDOCOLOR);
            Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(CubeMaterial.ALBEDOCOLOR, finalAlbedo);
        }
    }
    get _Shininess() {
        return this._shaderValues.getNumber(CubeMaterial.SHININESS);
    }
    set _Shininess(value) {
        value = Math.max(0.0, Math.min(1.0, value));
        this._shaderValues.setNumber(CubeMaterial.SHININESS, value);
    }
    get _MainTex_STX() {
        return this._shaderValues.getVector(CubeMaterial.TILINGOFFSET).elements[0];
    }
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(CubeMaterial.TILINGOFFSET);
        tilOff.elements[0] = x;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STY() {
        return this._shaderValues.getVector(CubeMaterial.TILINGOFFSET).elements[1];
    }
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(CubeMaterial.TILINGOFFSET);
        tilOff.elements[1] = y;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STZ() {
        return this._shaderValues.getVector(CubeMaterial.TILINGOFFSET).elements[2];
    }
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(CubeMaterial.TILINGOFFSET);
        tilOff.elements[2] = z;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STW() {
        return this._shaderValues.getVector(CubeMaterial.TILINGOFFSET).elements[3];
    }
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(CubeMaterial.TILINGOFFSET);
        tilOff.elements[3] = w;
        this.tilingOffset = tilOff;
    }
    get _Cutoff() {
        return this.alphaTestValue;
    }
    set _Cutoff(value) {
        this.alphaTestValue = value;
    }
    set renderMode(value) {
        var renderState = this.getRenderState();
        switch (value) {
            case CubeMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                renderState.depthWrite = true;
                renderState.cull = RenderState.CULL_BACK;
                renderState.blend = RenderState.BLEND_DISABLE;
                renderState.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case CubeMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                renderState.depthWrite = true;
                renderState.cull = RenderState.CULL_BACK;
                renderState.blend = RenderState.BLEND_DISABLE;
                renderState.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case CubeMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                renderState.depthWrite = false;
                renderState.cull = RenderState.CULL_BACK;
                renderState.blend = RenderState.BLEND_ENABLE_ALL;
                renderState.srcBlend = RenderState.BLENDPARAM_SRC_ALPHA;
                renderState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                renderState.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            default:
                throw new Error("Material:renderMode value error.");
        }
    }
    get enableVertexColor() {
        return this._enableVertexColor;
    }
    set enableVertexColor(value) {
        this._enableVertexColor = value;
        if (value)
            this._defineDatas.add(CubeMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._defineDatas.remove(CubeMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
    }
    set modEnableVertexColor(value) {
        if (value)
            this._defineDatas.add(CubeMaterial.SHADERDEFINE_MODENABLEVERTEXCOLOR);
        else
            this._defineDatas.remove(CubeMaterial.SHADERDEFINE_MODENABLEVERTEXCOLOR);
    }
    set solidColorTexture(value) {
        if (value)
            this._defineDatas.add(CubeMaterial.SHADERDEFINE_SOLIDCOLORTEXTURE);
        else
            this._defineDatas.remove(CubeMaterial.SHADERDEFINE_SOLIDCOLORTEXTURE);
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
        return this._shaderValues.getVector(CubeMaterial.TILINGOFFSET);
    }
    set tilingOffset(value) {
        if (value) {
            var valueE = value.elements;
            if (valueE[0] != 1 || valueE[1] != 1 || valueE[2] != 0 || valueE[3] != 0)
                this._defineDatas.add(CubeMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._defineDatas.remove(CubeMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._defineDatas.remove(CubeMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(CubeMaterial.TILINGOFFSET, value);
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
        var finalAlbedo = this._shaderValues.getVector(CubeMaterial.ALBEDOCOLOR);
        Vector4.scale(value, this._albedoIntensity, finalAlbedo);
        this._albedoColor = value;
        this._shaderValues.setVector(CubeMaterial.ALBEDOCOLOR, finalAlbedo);
    }
    get albedoIntensity() {
        return this._albedoIntensity;
    }
    set albedoIntensity(value) {
        this._AlbedoIntensity = value;
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
        return this._shaderValues.getVector(CubeMaterial.MATERIALSPECULAR);
    }
    set specularColor(value) {
        this._shaderValues.setVector(CubeMaterial.MATERIALSPECULAR, value);
    }
    get shininess() {
        return this._Shininess;
    }
    set shininess(value) {
        this._Shininess = value;
    }
    get albedoTexture() {
        return this._shaderValues.getTexture(CubeMaterial.ALBEDOTEXTURE);
    }
    set albedoTexture(value) {
        if (value)
            this._defineDatas.add(CubeMaterial.SHADERDEFINE_DIFFUSEMAP);
        else
            this._defineDatas.remove(CubeMaterial.SHADERDEFINE_DIFFUSEMAP);
        this._shaderValues.setTexture(CubeMaterial.ALBEDOTEXTURE, value);
    }
    get normalTexture() {
        return this._shaderValues.getTexture(CubeMaterial.NORMALTEXTURE);
    }
    set normalTexture(value) {
        if (value)
            this._defineDatas.add(CubeMaterial.SHADERDEFINE_NORMALMAP);
        else
            this._defineDatas.remove(CubeMaterial.SHADERDEFINE_NORMALMAP);
        this._shaderValues.setTexture(CubeMaterial.NORMALTEXTURE, value);
    }
    get specularTexture() {
        return this._shaderValues.getTexture(CubeMaterial.SPECULARTEXTURE);
    }
    set specularTexture(value) {
        if (value)
            this._defineDatas.add(CubeMaterial.SHADERDEFINE_SPECULARMAP);
        else
            this._defineDatas.remove(CubeMaterial.SHADERDEFINE_SPECULARMAP);
        this._shaderValues.setTexture(CubeMaterial.SPECULARTEXTURE, value);
    }
    get enableLighting() {
        return this._enableLighting;
    }
    set enableLighting(value) {
        if (this._enableLighting !== value) {
            if (value)
                this._disablePublicDefineDatas.remove(Scene3D.SHADERDEFINE_POINTLIGHT | Scene3D.SHADERDEFINE_SPOTLIGHT | Scene3D.SHADERDEFINE_DIRECTIONLIGHT);
            else
                this._disablePublicDefineDatas.add(Scene3D.SHADERDEFINE_POINTLIGHT | Scene3D.SHADERDEFINE_SPOTLIGHT | Scene3D.SHADERDEFINE_DIRECTIONLIGHT);
            this._enableLighting = value;
        }
    }
    disableFog() {
        this._disablePublicDefineDatas.add(Scene3D.SHADERDEFINE_FOG);
    }
    clone() {
        var dest = new CubeMaterial();
        this.cloneTo(dest);
        return dest;
    }
    cloneTo(destObject) {
        super.cloneTo(destObject);
        var destMaterial = destObject;
        destMaterial._enableLighting = this._enableLighting;
        destMaterial._albedoIntensity = this._albedoIntensity;
        this._albedoColor.cloneTo(destMaterial._albedoColor);
    }
}
CubeMaterial.RENDERMODE_OPAQUE = 0;
CubeMaterial.RENDERMODE_CUTOUT = 1;
CubeMaterial.RENDERMODE_TRANSPARENT = 2;
CubeMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_DiffuseTexture");
CubeMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
CubeMaterial.SPECULARTEXTURE = Shader3D.propertyNameToID("u_SpecularTexture");
CubeMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_DiffuseColor");
CubeMaterial.MATERIALSPECULAR = Shader3D.propertyNameToID("u_MaterialSpecular");
CubeMaterial.SHININESS = Shader3D.propertyNameToID("u_Shininess");
CubeMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
CubeMaterial.defaultMaterial = new CubeMaterial();
CubeMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
