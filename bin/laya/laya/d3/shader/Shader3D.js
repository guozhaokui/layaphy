import { WebGL } from "../../webgl/WebGL";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";
export class Shader3D {
    constructor(name, attributeMap, uniformMap, enableInstancing) {
        this._attributeMap = null;
        this._uniformMap = null;
        this._enableInstancing = false;
        this._subShaders = [];
        this._name = name;
        this._attributeMap = attributeMap;
        this._uniformMap = uniformMap;
        this._enableInstancing = enableInstancing;
    }
    static propertyNameToID(name) {
        if (Shader3D._propertyNameMap[name] != null) {
            return Shader3D._propertyNameMap[name];
        }
        else {
            var id = Shader3D._propertyNameCounter++;
            Shader3D._propertyNameMap[name] = id;
            return id;
        }
    }
    static addInclude(fileName, txt) {
        txt = txt.replace(ShaderCompile._clearCR, "");
        ShaderCompile.addInclude(fileName, txt);
    }
    static registerPublicDefine(name) {
        var value = Math.pow(2, Shader3D._publicCounter++);
        Shader3D._globleDefines[value] = name;
        return value;
    }
    static compileShader(name, subShaderIndex, passIndex, publicDefine, spriteDefine, materialDefine) {
        var shader = Shader3D.find(name);
        if (shader) {
            var subShader = shader.getSubShaderAt(subShaderIndex);
            if (subShader) {
                var pass = subShader._passes[passIndex];
                if (pass) {
                    if (WebGL.shaderHighPrecision)
                        pass.withCompile(publicDefine, spriteDefine, materialDefine);
                    else
                        pass.withCompile(publicDefine - Shader3D.SHADERDEFINE_HIGHPRECISION, spriteDefine, materialDefine);
                }
                else {
                    console.warn("Shader3D: unknown passIndex.");
                }
            }
            else {
                console.warn("Shader3D: unknown subShaderIndex.");
            }
        }
        else {
            console.warn("Shader3D: unknown shader name.");
        }
    }
    static add(name, attributeMap = null, uniformMap = null, enableInstancing = false) {
        return Shader3D._preCompileShader[name] = new Shader3D(name, attributeMap, uniformMap, enableInstancing);
    }
    static find(name) {
        return Shader3D._preCompileShader[name];
    }
    addSubShader(subShader) {
        this._subShaders.push(subShader);
        subShader._owner = this;
    }
    getSubShaderAt(index) {
        return this._subShaders[index];
    }
}
Shader3D.RENDER_STATE_CULL = 0;
Shader3D.RENDER_STATE_BLEND = 1;
Shader3D.RENDER_STATE_BLEND_SRC = 2;
Shader3D.RENDER_STATE_BLEND_DST = 3;
Shader3D.RENDER_STATE_BLEND_SRC_RGB = 4;
Shader3D.RENDER_STATE_BLEND_DST_RGB = 5;
Shader3D.RENDER_STATE_BLEND_SRC_ALPHA = 6;
Shader3D.RENDER_STATE_BLEND_DST_ALPHA = 7;
Shader3D.RENDER_STATE_BLEND_CONST_COLOR = 8;
Shader3D.RENDER_STATE_BLEND_EQUATION = 9;
Shader3D.RENDER_STATE_BLEND_EQUATION_RGB = 10;
Shader3D.RENDER_STATE_BLEND_EQUATION_ALPHA = 11;
Shader3D.RENDER_STATE_DEPTH_TEST = 12;
Shader3D.RENDER_STATE_DEPTH_WRITE = 13;
Shader3D.PERIOD_CUSTOM = 0;
Shader3D.PERIOD_MATERIAL = 1;
Shader3D.PERIOD_SPRITE = 2;
Shader3D.PERIOD_CAMERA = 3;
Shader3D.PERIOD_SCENE = 4;
Shader3D._propertyNameCounter = 0;
Shader3D._propertyNameMap = {};
Shader3D._publicCounter = 0;
Shader3D._globleDefines = [];
Shader3D._preCompileShader = {};
Shader3D.debugMode = true;
