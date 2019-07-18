import { Shader3D } from "./Shader3D";
import { ShaderPass } from "./ShaderPass";
export class SubShader {
    constructor(attributeMap, uniformMap, spriteDefines = null, materialDefines = null) {
        this._flags = {};
        this._passes = [];
        this._publicDefines = [];
        this._publicDefinesMap = {};
        this._spriteDefines = [];
        this._spriteDefinesMap = {};
        this._materialDefines = [];
        this._materialDefinesMap = {};
        this._addDefines(this._publicDefines, this._publicDefinesMap, Shader3D._globleDefines);
        (spriteDefines) && (this._addDefines(this._spriteDefines, this._spriteDefinesMap, spriteDefines.defines));
        (materialDefines) && (this._addDefines(this._materialDefines, this._materialDefinesMap, materialDefines.defines));
        this._attributeMap = attributeMap;
        this._uniformMap = uniformMap;
    }
    _addDefines(defines, definesMap, supportDefines) {
        for (var k in supportDefines) {
            var name = supportDefines[k];
            var i = parseInt(k);
            defines[i] = name;
            definesMap[name] = i;
        }
    }
    getMaterialDefineByName(name) {
        return this._materialDefinesMap[name];
    }
    setFlag(key, value) {
        if (value)
            this._flags[key] = value;
        else
            delete this._flags[key];
    }
    getFlag(key) {
        return this._flags[key];
    }
    addShaderPass(vs, ps, stateMap = null) {
        var shaderPass = new ShaderPass(this, vs, ps, stateMap);
        this._passes.push(shaderPass);
        return shaderPass;
    }
}
