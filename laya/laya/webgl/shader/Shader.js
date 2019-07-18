import { ILaya } from "../../../ILaya";
import { Stat } from "../../utils/Stat";
import { StringKey } from "../../utils/StringKey";
import { WebGLContext } from "../WebGLContext";
import { BaseShader } from "./BaseShader";
import { LayaGL } from "../../layagl/LayaGL";
export class Shader extends BaseShader {
    constructor(vs, ps, saveName = null, nameMap = null, bindAttrib = null) {
        super();
        this._attribInfo = null;
        this.customCompile = false;
        this._curActTexIndex = 0;
        this.tag = {};
        this._program = null;
        this._params = null;
        this._paramsMap = {};
        if ((!vs) || (!ps))
            throw "Shader Error";
        this._attribInfo = bindAttrib;
        this._id = ++Shader._count;
        this._vs = vs;
        this._ps = ps;
        this._nameMap = nameMap ? nameMap : {};
        saveName != null && (Shader.sharders[saveName] = this);
        this.recreateResource();
        this.lock = true;
    }
    static getShader(name) {
        return Shader.sharders[name];
    }
    static create(vs, ps, saveName = null, nameMap = null, bindAttrib = null) {
        return new Shader(vs, ps, saveName, nameMap, bindAttrib);
    }
    static withCompile(nameID, define, shaderName, createShader) {
        if (shaderName && Shader.sharders[shaderName])
            return Shader.sharders[shaderName];
        var pre = Shader._preCompileShader[Shader.SHADERNAME2ID * nameID];
        if (!pre)
            throw new Error("withCompile shader err!" + nameID);
        return pre.createShader(define, shaderName, createShader, null);
    }
    static withCompile2D(nameID, mainID, define, shaderName, createShader, bindAttrib = null) {
        if (shaderName && Shader.sharders[shaderName])
            return Shader.sharders[shaderName];
        var pre = Shader._preCompileShader[Shader.SHADERNAME2ID * nameID + mainID];
        if (!pre)
            throw new Error("withCompile shader err!" + nameID + " " + mainID);
        return pre.createShader(define, shaderName, createShader, bindAttrib);
    }
    static addInclude(fileName, txt) {
        ILaya.ShaderCompile.addInclude(fileName, txt);
    }
    static preCompile(nameID, vs, ps, nameMap) {
        var id = Shader.SHADERNAME2ID * nameID;
        Shader._preCompileShader[id] = new ILaya.ShaderCompile(vs, ps, nameMap);
    }
    static preCompile2D(nameID, mainID, vs, ps, nameMap) {
        var id = Shader.SHADERNAME2ID * nameID + mainID;
        Shader._preCompileShader[id] = new ILaya.ShaderCompile(vs, ps, nameMap);
    }
    recreateResource() {
        this._compile();
        this._setGPUMemory(0);
    }
    _disposeResource() {
        WebGLContext.mainContext.deleteShader(this._vshader);
        WebGLContext.mainContext.deleteShader(this._pshader);
        WebGLContext.mainContext.deleteProgram(this._program);
        this._vshader = this._pshader = this._program = null;
        this._params = null;
        this._paramsMap = {};
        this._setGPUMemory(0);
        this._curActTexIndex = 0;
    }
    _compile() {
        if (!this._vs || !this._ps || this._params)
            return;
        this._reCompile = true;
        this._params = [];
        var result;
        if (this.customCompile)
            result = ILaya.ShaderCompile.preGetParams(this._vs, this._ps);
        var gl = WebGLContext.mainContext;
        this._program = gl.createProgram();
        this._vshader = Shader._createShader(gl, this._vs, gl.VERTEX_SHADER);
        this._pshader = Shader._createShader(gl, this._ps, gl.FRAGMENT_SHADER);
        gl.attachShader(this._program, this._vshader);
        gl.attachShader(this._program, this._pshader);
        var one, i, j, n, location;
        var attribDescNum = this._attribInfo ? this._attribInfo.length : 0;
        for (i = 0; i < attribDescNum; i += 2) {
            gl.bindAttribLocation(this._program, this._attribInfo[i + 1], this._attribInfo[i]);
        }
        gl.linkProgram(this._program);
        if (!this.customCompile && !gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
            throw gl.getProgramInfoLog(this._program);
        }
        var nUniformNum = this.customCompile ? result.uniforms.length : gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
        for (i = 0; i < nUniformNum; i++) {
            var uniform = this.customCompile ? result.uniforms[i] : gl.getActiveUniform(this._program, i);
            location = gl.getUniformLocation(this._program, uniform.name);
            one = { vartype: "uniform", glfun: null, ivartype: 1, location: location, name: uniform.name, type: uniform.type, isArray: false, isSame: false, preValue: null, indexOfParams: 0 };
            if (one.name.indexOf('[0]') > 0) {
                one.name = one.name.substr(0, one.name.length - 3);
                one.isArray = true;
                one.location = gl.getUniformLocation(this._program, one.name);
            }
            this._params.push(one);
        }
        for (i = 0, n = this._params.length; i < n; i++) {
            one = this._params[i];
            one.indexOfParams = i;
            one.index = 1;
            one.value = [one.location, null];
            one.codename = one.name;
            one.name = this._nameMap[one.codename] ? this._nameMap[one.codename] : one.codename;
            this._paramsMap[one.name] = one;
            one._this = this;
            one.uploadedValue = [];
            switch (one.type) {
                case gl.INT:
                    one.fun = one.isArray ? this._uniform1iv : this._uniform1i;
                    break;
                case gl.FLOAT:
                    one.fun = one.isArray ? this._uniform1fv : this._uniform1f;
                    break;
                case gl.FLOAT_VEC2:
                    one.fun = one.isArray ? this._uniform_vec2v : this._uniform_vec2;
                    break;
                case gl.FLOAT_VEC3:
                    one.fun = one.isArray ? this._uniform_vec3v : this._uniform_vec3;
                    break;
                case gl.FLOAT_VEC4:
                    one.fun = one.isArray ? this._uniform_vec4v : this._uniform_vec4;
                    break;
                case gl.SAMPLER_2D:
                    one.fun = this._uniform_sampler2D;
                    break;
                case gl.SAMPLER_CUBE:
                    one.fun = this._uniform_samplerCube;
                    break;
                case gl.FLOAT_MAT4:
                    one.glfun = gl.uniformMatrix4fv;
                    one.fun = this._uniformMatrix4fv;
                    break;
                case gl.BOOL:
                    one.fun = this._uniform1i;
                    break;
                case gl.FLOAT_MAT2:
                case gl.FLOAT_MAT3:
                    throw new Error("compile shader err!");
                default:
                    throw new Error("compile shader err!");
            }
        }
    }
    static _createShader(gl, str, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        }
        else {
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }
    }
    getUniform(name) {
        return this._paramsMap[name];
    }
    _uniform1f(one, value) {
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] !== value) {
            WebGLContext.mainContext.uniform1f(one.location, uploadedValue[0] = value);
            return 1;
        }
        return 0;
    }
    _uniform1fv(one, value) {
        if (value.length < 4) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                WebGLContext.mainContext.uniform1fv(one.location, value);
                uploadedValue[0] = value[0];
                uploadedValue[1] = value[1];
                uploadedValue[2] = value[2];
                uploadedValue[3] = value[3];
                return 1;
            }
            return 0;
        }
        else {
            WebGLContext.mainContext.uniform1fv(one.location, value);
            return 1;
        }
    }
    _uniform_vec2(one, value) {
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1]) {
            WebGLContext.mainContext.uniform2f(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1]);
            return 1;
        }
        return 0;
    }
    _uniform_vec2v(one, value) {
        if (value.length < 2) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                WebGLContext.mainContext.uniform2fv(one.location, value);
                uploadedValue[0] = value[0];
                uploadedValue[1] = value[1];
                uploadedValue[2] = value[2];
                uploadedValue[3] = value[3];
                return 1;
            }
            return 0;
        }
        else {
            WebGLContext.mainContext.uniform2fv(one.location, value);
            return 1;
        }
    }
    _uniform_vec3(one, value) {
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2]) {
            WebGLContext.mainContext.uniform3f(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2]);
            return 1;
        }
        return 0;
    }
    _uniform_vec3v(one, value) {
        WebGLContext.mainContext.uniform3fv(one.location, value);
        return 1;
    }
    _uniform_vec4(one, value) {
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
            WebGLContext.mainContext.uniform4f(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2], uploadedValue[3] = value[3]);
            return 1;
        }
        return 0;
    }
    _uniform_vec4v(one, value) {
        WebGLContext.mainContext.uniform4fv(one.location, value);
        return 1;
    }
    _uniformMatrix2fv(one, value) {
        WebGLContext.mainContext.uniformMatrix2fv(one.location, false, value);
        return 1;
    }
    _uniformMatrix3fv(one, value) {
        WebGLContext.mainContext.uniformMatrix3fv(one.location, false, value);
        return 1;
    }
    _uniformMatrix4fv(one, value) {
        WebGLContext.mainContext.uniformMatrix4fv(one.location, false, value);
        return 1;
    }
    _uniform1i(one, value) {
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] !== value) {
            WebGLContext.mainContext.uniform1i(one.location, uploadedValue[0] = value);
            return 1;
        }
        return 0;
    }
    _uniform1iv(one, value) {
        WebGLContext.mainContext.uniform1iv(one.location, value);
        return 1;
    }
    _uniform_ivec2(one, value) {
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1]) {
            WebGLContext.mainContext.uniform2i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1]);
            return 1;
        }
        return 0;
    }
    _uniform_ivec2v(one, value) {
        WebGLContext.mainContext.uniform2iv(one.location, value);
        return 1;
    }
    _uniform_vec3i(one, value) {
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2]) {
            WebGLContext.mainContext.uniform3i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2]);
            return 1;
        }
        return 0;
    }
    _uniform_vec3vi(one, value) {
        WebGLContext.mainContext.uniform3iv(one.location, value);
        return 1;
    }
    _uniform_vec4i(one, value) {
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
            WebGLContext.mainContext.uniform4i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2], uploadedValue[3] = value[3]);
            return 1;
        }
        return 0;
    }
    _uniform_vec4vi(one, value) {
        WebGLContext.mainContext.uniform4iv(one.location, value);
        return 1;
    }
    _uniform_sampler2D(one, value) {
        var gl = WebGLContext.mainContext;
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] == null) {
            uploadedValue[0] = this._curActTexIndex;
            gl.uniform1i(one.location, this._curActTexIndex);
            WebGLContext.activeTexture(gl, gl.TEXTURE0 + this._curActTexIndex);
            WebGLContext.bindTexture(gl, gl.TEXTURE_2D, value);
            this._curActTexIndex++;
            return 1;
        }
        else {
            WebGLContext.activeTexture(gl, gl.TEXTURE0 + uploadedValue[0]);
            WebGLContext.bindTexture(gl, gl.TEXTURE_2D, value);
            return 0;
        }
    }
    _uniform_samplerCube(one, value) {
        var gl = WebGLContext.mainContext;
        var uploadedValue = one.uploadedValue;
        if (uploadedValue[0] == null) {
            uploadedValue[0] = this._curActTexIndex;
            gl.uniform1i(one.location, this._curActTexIndex);
            WebGLContext.activeTexture(gl, gl.TEXTURE0 + this._curActTexIndex);
            WebGLContext.bindTexture(gl, gl.TEXTURE_CUBE_MAP, value);
            this._curActTexIndex++;
            return 1;
        }
        else {
            WebGLContext.activeTexture(gl, gl.TEXTURE0 + uploadedValue[0]);
            WebGLContext.bindTexture(gl, gl.TEXTURE_CUBE_MAP, value);
            return 0;
        }
    }
    _noSetValue(one) {
        console.log("no....:" + one.name);
    }
    uploadOne(name, value) {
        WebGLContext.useProgram(WebGLContext.mainContext, this._program);
        var one = this._paramsMap[name];
        one.fun.call(this, one, value);
    }
    uploadTexture2D(value) {
        var CTX = WebGLContext;
        if (CTX._activeTextures[0] !== value) {
            CTX.bindTexture(WebGLContext.mainContext, LayaGL.instance.TEXTURE_2D, value);
            CTX._activeTextures[0] = value;
        }
    }
    upload(shaderValue, params = null) {
        BaseShader.activeShader = BaseShader.bindShader = this;
        var gl = WebGLContext.mainContext;
        WebGLContext.useProgram(gl, this._program);
        if (this._reCompile) {
            params = this._params;
            this._reCompile = false;
        }
        else {
            params = params || this._params;
        }
        var one, value, n = params.length, shaderCall = 0;
        for (var i = 0; i < n; i++) {
            one = params[i];
            if ((value = shaderValue[one.name]) !== null)
                shaderCall += one.fun.call(this, one, value);
        }
        Stat.shaderCall += shaderCall;
    }
    uploadArray(shaderValue, length, _bufferUsage) {
        BaseShader.activeShader = this;
        BaseShader.bindShader = this;
        WebGLContext.useProgram(WebGLContext.mainContext, this._program);
        var params = this._params, value;
        var one, shaderCall = 0;
        for (var i = length - 2; i >= 0; i -= 2) {
            one = this._paramsMap[shaderValue[i]];
            if (!one)
                continue;
            value = shaderValue[i + 1];
            if (value != null) {
                _bufferUsage && _bufferUsage[one.name] && _bufferUsage[one.name].bind();
                shaderCall += one.fun.call(this, one, value);
            }
        }
        Stat.shaderCall += shaderCall;
    }
    getParams() {
        return this._params;
    }
    setAttributesLocation(attribDesc) {
        this._attribInfo = attribDesc;
    }
}
Shader._count = 0;
Shader._preCompileShader = {};
Shader.SHADERNAME2ID = 0.0002;
Shader.nameKey = new StringKey();
Shader.sharders = new Array(0x20);
