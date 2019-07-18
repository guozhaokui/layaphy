import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";
export class WebGLContext {
    static __init__() {
        var gl = LayaGL.instance;
        WebGLContext._depthFunc = gl.LESS;
        WebGLContext._sFactor = gl.ONE;
        WebGLContext._dFactor = gl.ZERO;
        WebGLContext._srcAlpha = gl.ONE;
        WebGLContext._dstAlpha = gl.ZERO;
        WebGLContext._activedTextureID = gl.TEXTURE0;
        WebGLContext._glTextureIDs = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7];
    }
    static useProgram(gl, program) {
        if (WebGLContext._useProgram === program)
            return false;
        gl.useProgram(program);
        WebGLContext._useProgram = program;
        return true;
    }
    static setDepthTest(gl, value) {
        value !== WebGLContext._depthTest && (WebGLContext._depthTest = value, value ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST));
    }
    static setDepthMask(gl, value) {
        value !== WebGLContext._depthMask && (WebGLContext._depthMask = value, gl.depthMask(value));
    }
    static setDepthFunc(gl, value) {
        value !== WebGLContext._depthFunc && (WebGLContext._depthFunc = value, gl.depthFunc(value));
    }
    static setBlend(gl, value) {
        value !== WebGLContext._blend && (WebGLContext._blend = value, value ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND));
    }
    static setBlendFunc(gl, sFactor, dFactor) {
        (sFactor !== WebGLContext._sFactor || dFactor !== WebGLContext._dFactor) && (WebGLContext._sFactor = WebGLContext._srcAlpha = sFactor, WebGLContext._dFactor = WebGLContext._dstAlpha = dFactor, gl.blendFunc(sFactor, dFactor));
    }
    static setBlendFuncSeperate(gl, srcRGB, dstRGB, srcAlpha, dstAlpha) {
        if (srcRGB !== WebGLContext._sFactor || dstRGB !== WebGLContext._dFactor || srcAlpha !== WebGLContext._srcAlpha || dstAlpha !== WebGLContext._dstAlpha) {
            WebGLContext._sFactor = srcRGB;
            WebGLContext._dFactor = dstRGB;
            WebGLContext._srcAlpha = srcAlpha;
            WebGLContext._dstAlpha = dstAlpha;
            gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
        }
    }
    static setCullFace(gl, value) {
        value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE));
    }
    static setFrontFace(gl, value) {
        value !== WebGLContext._frontFace && (WebGLContext._frontFace = value, gl.frontFace(value));
    }
    static activeTexture(gl, textureID) {
        if (WebGLContext._activedTextureID !== textureID) {
            gl.activeTexture(textureID);
            WebGLContext._activedTextureID = textureID;
        }
    }
    static bindTexture(gl, target, texture) {
        if (WebGLContext._activeTextures[WebGLContext._activedTextureID - gl.TEXTURE0] !== texture) {
            gl.bindTexture(target, texture);
            WebGLContext._activeTextures[WebGLContext._activedTextureID - gl.TEXTURE0] = texture;
        }
    }
    static __init_native() {
        if (!ILaya.Render.supportWebGLPlusRendering)
            return;
        var webGLContext = WebGLContext;
        webGLContext.activeTexture = webGLContext.activeTextureForNative;
        webGLContext.bindTexture = webGLContext.bindTextureForNative;
    }
    static useProgramForNative(gl, program) {
        gl.useProgram(program);
        return true;
    }
    static setDepthTestForNative(gl, value) {
        if (value)
            gl.enable(gl.DEPTH_TEST);
        else
            gl.disable(gl.DEPTH_TEST);
    }
    static setDepthMaskForNative(gl, value) {
        gl.depthMask(value);
    }
    static setDepthFuncForNative(gl, value) {
        gl.depthFunc(value);
    }
    static setBlendForNative(gl, value) {
        if (value)
            gl.enable(gl.BLEND);
        else
            gl.disable(gl.BLEND);
    }
    static setBlendFuncForNative(gl, sFactor, dFactor) {
        gl.blendFunc(sFactor, dFactor);
    }
    static setCullFaceForNative(gl, value) {
        if (value)
            gl.enable(gl.CULL_FACE);
        else
            gl.disable(gl.CULL_FACE);
    }
    static setFrontFaceForNative(gl, value) {
        gl.frontFace(value);
    }
    static activeTextureForNative(gl, textureID) {
        gl.activeTexture(textureID);
    }
    static bindTextureForNative(gl, target, texture) {
        gl.bindTexture(target, texture);
    }
    static bindVertexArrayForNative(gl, vertexArray) {
        gl.bindVertexArray(vertexArray);
    }
}
WebGLContext.mainContext = null;
WebGLContext._activeTextures = new Array(8);
WebGLContext._useProgram = null;
WebGLContext._depthTest = true;
WebGLContext._depthMask = true;
WebGLContext._blend = false;
WebGLContext._cullFace = false;
