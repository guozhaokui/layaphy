import { WebGL } from "./WebGL";
import { ILaya } from "../../ILaya";
import { VertexArrayObject } from "../../laya/webgl/VertexArrayObject";
export class LayaGPU {
    constructor(gl, isWebGL2) {
        this._gl = null;
        this._vaoExt = null;
        this._angleInstancedArrays = null;
        this._isWebGL2 = false;
        this._oesTextureHalfFloat = null;
        this._extTextureFilterAnisotropic = null;
        this._compressedTextureS3tc = null;
        this._compressedTexturePvrtc = null;
        this._compressedTextureEtc1 = null;
        this._gl = gl;
        this._isWebGL2 = isWebGL2;
        try {
            var precisionFormat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
            precisionFormat.precision ? (WebGL.shaderHighPrecision = true) : WebGL.shaderHighPrecision = false;
        }
        catch (e) {
        }
        if (!isWebGL2) {
            var forceVAO = LayaGPU._forceSupportVAOPlatform();
            if (!ILaya.Render.isConchApp) {
                VertexArrayObject;
                if (window._setupVertexArrayObject) {
                    if (forceVAO)
                        window._forceSetupVertexArrayObject(gl);
                    else
                        window._setupVertexArrayObject(gl);
                }
            }
            this._vaoExt = this._getExtension("OES_vertex_array_object");
            if (!forceVAO)
                this._angleInstancedArrays = this._getExtension("ANGLE_instanced_arrays");
            this._oesTextureHalfFloat = this._getExtension("OES_texture_half_float");
            this._getExtension("OES_texture_half_float_linear");
        }
        else {
            this._getExtension("EXT_color_buffer_float");
        }
        this._extTextureFilterAnisotropic = this._getExtension("EXT_texture_filter_anisotropic");
        this._compressedTextureS3tc = this._getExtension("WEBGL_compressed_texture_s3tc");
        this._compressedTexturePvrtc = this._getExtension("WEBGL_compressed_texture_pvrtc");
        this._compressedTextureEtc1 = this._getExtension("WEBGL_compressed_texture_etc1");
    }
    static _forceSupportVAOPlatform() {
        let Browser = ILaya.Browser;
        return (Browser.onMiniGame && Browser.onIOS) || Browser.onBDMiniGame || Browser.onQGMiniGame;
    }
    _getExtension(name) {
        var prefixes = LayaGPU._extentionVendorPrefixes;
        for (var k in prefixes) {
            var ext = this._gl.getExtension(prefixes[k] + name);
            if (ext)
                return ext;
        }
        return null;
    }
    createVertexArray() {
        if (this._isWebGL2)
            return this._gl.createVertexArray();
        else
            return this._vaoExt.createVertexArrayOES();
    }
    bindVertexArray(vertexArray) {
        if (this._isWebGL2)
            this._gl.bindVertexArray(vertexArray);
        else
            this._vaoExt.bindVertexArrayOES(vertexArray);
    }
    deleteVertexArray(vertexArray) {
        if (this._isWebGL2)
            this._gl.deleteVertexArray(vertexArray);
        else
            this._vaoExt.deleteVertexArrayOES(vertexArray);
    }
    isVertexArray(vertexArray) {
        if (this._isWebGL2)
            this._gl.isVertexArray(vertexArray);
        else
            this._vaoExt.isVertexArrayOES(vertexArray);
    }
    drawElementsInstanced(mode, count, type, offset, instanceCount) {
        if (this._isWebGL2)
            this._gl.drawElementsInstanced(mode, count, type, offset, instanceCount);
        else
            this._angleInstancedArrays.drawElementsInstancedANGLE(mode, count, type, offset, instanceCount);
    }
    drawArraysInstanced(mode, first, count, instanceCount) {
        if (this._isWebGL2)
            this._gl.drawArraysInstanced(mode, first, count, instanceCount);
        else
            this._angleInstancedArrays.drawArraysInstancedANGLE(mode, first, count, instanceCount);
    }
    vertexAttribDivisor(index, divisor) {
        if (this._isWebGL2)
            this._gl.vertexAttribDivisor(index, divisor);
        else
            this._angleInstancedArrays.vertexAttribDivisorANGLE(index, divisor);
    }
    supportInstance() {
        if (this._isWebGL2 || this._angleInstancedArrays)
            return true;
        else
            return false;
    }
}
LayaGPU._extentionVendorPrefixes = ["", "WEBKIT_", "MOZ_"];
