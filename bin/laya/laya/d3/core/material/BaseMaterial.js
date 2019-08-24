import { Loader } from "../../../net/Loader";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { DefineDatas } from "../../shader/DefineDatas";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { ClassUtils } from "../../../utils/ClassUtils";
import { Laya } from "../../../../Laya";
export class BaseMaterial extends Resource {
    constructor() {
        super();
        this._shaderValues = null;
        this._disablePublicDefineDatas = new DefineDatas();
        this._shaderValues = new ShaderData(this);
        this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
        this._alphaTest = false;
    }
    static load(url, complete) {
        Laya.loader.create(url, complete, null, BaseMaterial.MATERIAL);
    }
    static __initDefine__() {
        BaseMaterial.shaderDefines = new ShaderDefines();
        BaseMaterial.SHADERDEFINE_ALPHATEST = BaseMaterial.shaderDefines.registerDefine("ALPHATEST");
    }
    static _parse(data, propertyParams = null, constructParams = null) {
        var jsonData = data;
        var props = jsonData.props;
        var material;
        var classType = props.type;
        var clas = ClassUtils.getRegClass(classType);
        if (clas)
            material = new clas();
        else
            throw ('_getSprite3DHierarchyInnerUrls 错误: ' + data.type + ' 不是类');
        switch (jsonData.version) {
            case "LAYAMATERIAL:01":
            case "LAYAMATERIAL:02":
                var i, n;
                for (var key in props) {
                    switch (key) {
                        case "vectors":
                            var vectors = props[key];
                            for (i = 0, n = vectors.length; i < n; i++) {
                                var vector = vectors[i];
                                var vectorValue = vector.value;
                                switch (vectorValue.length) {
                                    case 2:
                                        material[vector.name] = new Vector2(vectorValue[0], vectorValue[1]);
                                        break;
                                    case 3:
                                        material[vector.name] = new Vector3(vectorValue[0], vectorValue[1], vectorValue[2]);
                                        break;
                                    case 4:
                                        material[vector.name] = new Vector4(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3]);
                                        break;
                                    default:
                                        throw new Error("BaseMaterial:unkonwn color length.");
                                }
                            }
                            break;
                        case "textures":
                            var textures = props[key];
                            for (i = 0, n = textures.length; i < n; i++) {
                                var texture = textures[i];
                                var path = texture.path;
                                (path) && (material[texture.name] = Loader.getRes(path));
                            }
                            break;
                        case "defines":
                            var defineNames = props[key];
                            for (i = 0, n = defineNames.length; i < n; i++) {
                                var define = material._shader.getSubShaderAt(0).getMaterialDefineByName(defineNames[i]);
                                material._shaderValues.addDefine(define);
                            }
                            break;
                        case "renderStates":
                            var renderStatesData = props[key];
                            var renderStateData = renderStatesData[0];
                            var mat = material;
                            mat.blend = renderStateData.blend;
                            mat.cull = renderStateData.cull;
                            mat.depthTest = renderStateData.depthTest;
                            mat.depthWrite = renderStateData.depthWrite;
                            mat.blendSrc = renderStateData.srcBlend;
                            mat.blendDst = renderStateData.dstBlend;
                            break;
                        case "cull":
                            material.cull = props[key];
                            break;
                        case "blend":
                            material.blend = props[key];
                            break;
                        case "depthWrite":
                            material.depthWrite = props[key];
                            break;
                        case "srcBlend":
                            material.blendSrc = props[key];
                            break;
                        case "dstBlend":
                            material.blendDst = props[key];
                            break;
                        default:
                            material[key] = props[key];
                    }
                }
                break;
            default:
                throw new Error("BaseMaterial:unkonwn version.");
        }
        return material;
    }
    get alphaTestValue() {
        return this._shaderValues.getNumber(BaseMaterial.ALPHATESTVALUE);
    }
    set alphaTestValue(value) {
        this._shaderValues.setNumber(BaseMaterial.ALPHATESTVALUE, value);
    }
    get alphaTest() {
        return this._alphaTest;
    }
    set alphaTest(value) {
        this._alphaTest = value;
        if (value)
            this._shaderValues.addDefine(BaseMaterial.SHADERDEFINE_ALPHATEST);
        else
            this._shaderValues.removeDefine(BaseMaterial.SHADERDEFINE_ALPHATEST);
    }
    _removeTetxureReference() {
        var data = this._shaderValues.getData();
        for (var k in data) {
            var value = data[k];
            if (value && value instanceof BaseTexture)
                value._removeReference();
        }
    }
    _addReference(count = 1) {
        super._addReference(count);
        var data = this._shaderValues.getData();
        for (var k in data) {
            var value = data[k];
            if (value && value instanceof BaseTexture)
                value._addReference();
        }
    }
    _removeReference(count = 1) {
        super._removeReference(count);
        this._removeTetxureReference();
    }
    _disposeResource() {
        if (this._referenceCount > 0)
            this._removeTetxureReference();
        this._shaderValues = null;
    }
    setShaderName(name) {
        this._shader = Shader3D.find(name);
        if (!this._shader)
            throw new Error("BaseMaterial: unknown shader name.");
    }
    cloneTo(destObject) {
        var destBaseMaterial = destObject;
        destBaseMaterial.name = this.name;
        destBaseMaterial.renderQueue = this.renderQueue;
        this._disablePublicDefineDatas.cloneTo(destBaseMaterial._disablePublicDefineDatas);
        this._shaderValues.cloneTo(destBaseMaterial._shaderValues);
    }
    clone() {
        var dest = new BaseMaterial();
        this.cloneTo(dest);
        return dest;
    }
    get _defineDatas() {
        return this._shaderValues._defineDatas;
    }
}
BaseMaterial.MATERIAL = "MATERIAL";
BaseMaterial.RENDERQUEUE_OPAQUE = 2000;
BaseMaterial.RENDERQUEUE_ALPHATEST = 2450;
BaseMaterial.RENDERQUEUE_TRANSPARENT = 3000;
BaseMaterial.ALPHATESTVALUE = Shader3D.propertyNameToID("u_AlphaTestValue");
BaseMaterial.shaderDefines = null;
