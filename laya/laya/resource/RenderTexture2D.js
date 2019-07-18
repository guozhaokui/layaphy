import { Texture2D } from "./Texture2D";
import { LayaGL } from "../layagl/LayaGL";
import { BaseTexture } from "./BaseTexture";
import { WebGLContext } from "../webgl/WebGLContext";
import { BaseShader } from "../webgl/shader/BaseShader";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { ILaya } from "../../ILaya";
export class RenderTexture2D extends BaseTexture {
    constructor(width, height, format = BaseTexture.FORMAT_R8G8B8, depthStencilFormat = BaseTexture.FORMAT_DEPTH_16) {
        super(format, false);
        this._mgrKey = 0;
        this._glTextureType = LayaGL.instance.TEXTURE_2D;
        this._width = width;
        this._height = height;
        this._depthStencilFormat = depthStencilFormat;
        this._create(width, height);
        this.lock = true;
    }
    static get currentActive() {
        return RenderTexture2D._currentActive;
    }
    get depthStencilFormat() {
        return this._depthStencilFormat;
    }
    get defaulteTexture() {
        return Texture2D.grayTexture;
    }
    getIsReady() {
        return true;
    }
    get sourceWidth() {
        return this._width;
    }
    get sourceHeight() {
        return this._height;
    }
    get offsetX() {
        return 0;
    }
    get offsetY() {
        return 0;
    }
    _create(width, height) {
        var gl = LayaGL.instance;
        this._frameBuffer = gl.createFramebuffer();
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        var glFormat = this._getGLFormat();
        gl.texImage2D(this._glTextureType, 0, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, null);
        this._setGPUMemory(width * height * 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._glTexture, 0);
        if (this._depthStencilFormat !== BaseTexture.FORMAT_DEPTHSTENCIL_NONE) {
            this._depthStencilBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthStencilBuffer);
            switch (this._depthStencilFormat) {
                case BaseTexture.FORMAT_DEPTH_16:
                    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
                    break;
                case BaseTexture.FORMAT_STENCIL_8:
                    gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, width, height);
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
                    break;
                case BaseTexture.FORMAT_DEPTHSTENCIL_16_8:
                    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
                    break;
                default:
            }
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
        this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
        this._setFilterMode(this._filterMode);
        this._setAnisotropy(this._anisoLevel);
        this._readyed = true;
        this._activeResource();
    }
    generateMipmap() {
        if (this._isPot(this.width) && this._isPot(this.height)) {
            this._mipmap = true;
            LayaGL.instance.generateMipmap(this._glTextureType);
            this._setFilterMode(this._filterMode);
            this._setGPUMemory(this.width * this.height * 4 * (1 + 1 / 3));
        }
        else {
            this._mipmap = false;
            this._setGPUMemory(this.width * this.height * 4);
        }
    }
    static pushRT() {
        RenderTexture2D.rtStack.push({ rt: RenderTexture2D._currentActive, w: RenderState2D.width, h: RenderState2D.height });
    }
    static popRT() {
        var gl = LayaGL.instance;
        var top = RenderTexture2D.rtStack.pop();
        if (top) {
            if (RenderTexture2D._currentActive != top.rt) {
                LayaGL.instance.bindFramebuffer(gl.FRAMEBUFFER, top.rt ? top.rt._frameBuffer : null);
                RenderTexture2D._currentActive = top.rt;
            }
            gl.viewport(0, 0, top.w, top.h);
            RenderState2D.width = top.w;
            RenderState2D.height = top.h;
        }
    }
    start() {
        var gl = LayaGL.instance;
        LayaGL.instance.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        this._lastRT = RenderTexture2D._currentActive;
        RenderTexture2D._currentActive = this;
        this._readyed = true;
        gl.viewport(0, 0, this._width, this._height);
        this._lastWidth = RenderState2D.width;
        this._lastHeight = RenderState2D.height;
        RenderState2D.width = this._width;
        RenderState2D.height = this._height;
        BaseShader.activeShader = null;
    }
    end() {
        var gl = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        RenderTexture2D._currentActive = null;
        this._readyed = true;
    }
    restore() {
        var gl = LayaGL.instance;
        if (this._lastRT != RenderTexture2D._currentActive) {
            LayaGL.instance.bindFramebuffer(gl.FRAMEBUFFER, this._lastRT ? this._lastRT._frameBuffer : null);
            RenderTexture2D._currentActive = this._lastRT;
        }
        this._readyed = true;
        gl.viewport(0, 0, this._lastWidth, this._lastHeight);
        RenderState2D.width = this._lastWidth;
        RenderState2D.height = this._lastHeight;
        BaseShader.activeShader = null;
    }
    clear(r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
        var gl = LayaGL.instance;
        gl.clearColor(r, g, b, a);
        var clearFlag = gl.COLOR_BUFFER_BIT;
        switch (this._depthStencilFormat) {
            case gl.DEPTH_COMPONENT16:
                clearFlag |= gl.DEPTH_BUFFER_BIT;
                break;
            case gl.STENCIL_INDEX8:
                clearFlag |= gl.STENCIL_BUFFER_BIT;
                break;
            case gl.DEPTH_STENCIL:
                clearFlag |= gl.DEPTH_BUFFER_BIT;
                clearFlag |= gl.STENCIL_BUFFER_BIT;
                break;
        }
        gl.clear(clearFlag);
    }
    getData(x, y, width, height) {
        if (ILaya.Render.isConchApp && window.conchConfig.threadMode == 2) {
            throw "native 2 thread mode use getDataAsync";
        }
        var gl = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        var canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE);
        if (!canRead) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return null;
        }
        var pixels = new Uint8Array(this._width * this._height * 4);
        var glFormat = this._getGLFormat();
        gl.readPixels(x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return pixels;
    }
    getDataAsync(x, y, width, height, callBack) {
        var gl = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.readPixelsAsync(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, function (data) {
            callBack(new Uint8Array(data));
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    recycle() {
    }
    _disposeResource() {
        if (this._frameBuffer) {
            var gl = LayaGL.instance;
            gl.deleteTexture(this._glTexture);
            gl.deleteFramebuffer(this._frameBuffer);
            gl.deleteRenderbuffer(this._depthStencilBuffer);
            this._glTexture = null;
            this._frameBuffer = null;
            this._depthStencilBuffer = null;
            this._setGPUMemory(0);
        }
    }
}
RenderTexture2D.rtStack = [];
RenderTexture2D.defuv = [0, 0, 1, 0, 1, 1, 0, 1];
RenderTexture2D.flipyuv = [0, 1, 1, 1, 1, 0, 0, 0];
