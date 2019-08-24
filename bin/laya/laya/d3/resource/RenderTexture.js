import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { BaseTexture } from "../../resource/BaseTexture";
import { Texture2D } from "../../resource/Texture2D";
import { WebGLContext } from "../../webgl/WebGLContext";
export class RenderTexture extends BaseTexture {
    constructor(width, height, format = BaseTexture.FORMAT_R8G8B8, depthStencilFormat = BaseTexture.FORMAT_DEPTH_16) {
        super(format, false);
        this._inPool = false;
        this._glTextureType = LayaGL.instance.TEXTURE_2D;
        this._width = width;
        this._height = height;
        this._depthStencilFormat = depthStencilFormat;
        this._create(width, height);
    }
    static get currentActive() {
        return RenderTexture._currentActive;
    }
    static createFromPool(width, height, format = BaseTexture.FORMAT_R8G8B8, depthStencilFormat = BaseTexture.FORMAT_DEPTH_16, filterMode = BaseTexture.FILTERMODE_BILINEAR) {
        var tex;
        for (var i = 0, n = RenderTexture._pool.length; i < n; i++) {
            tex = RenderTexture._pool[i];
            if (tex._width == width && tex._height == height && tex._format == format && tex._depthStencilFormat == depthStencilFormat && tex._filterMode == filterMode) {
                tex._inPool = false;
                var end = RenderTexture._pool[n - 1];
                RenderTexture._pool[i] = end;
                RenderTexture._pool.length -= 1;
                return tex;
            }
        }
        tex = new RenderTexture(width, height, format, depthStencilFormat);
        tex.filterMode = filterMode;
        tex.lock = true;
        return tex;
    }
    static recoverToPool(renderTexture) {
        if (renderTexture._inPool)
            return;
        RenderTexture._pool.push(renderTexture);
        renderTexture._inPool = true;
    }
    get depthStencilFormat() {
        return this._depthStencilFormat;
    }
    get defaulteTexture() {
        return Texture2D.grayTexture;
    }
    _texImage2D(gl, glTextureType, width, height) {
        var glFormat;
        switch (this._format) {
            case BaseTexture.FORMAT_R8G8B8:
                gl.texImage2D(glTextureType, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
                break;
            case BaseTexture.FORMAT_R8G8B8A8:
                gl.texImage2D(glTextureType, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                break;
            case BaseTexture.FORMAT_ALPHA8:
                gl.texImage2D(glTextureType, 0, gl.ALPHA, width, height, 0, gl.ALPHA, gl.UNSIGNED_BYTE, null);
                break;
            case BaseTexture.RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT:
                if (LayaGL.layaGPUInstance._isWebGL2)
                    gl.texImage2D(this._glTextureType, 0, WebGL2RenderingContext.RGBA16F, width, height, 0, gl.RGBA, WebGL2RenderingContext.HALF_FLOAT, null);
                else
                    gl.texImage2D(this._glTextureType, 0, gl.RGBA, width, height, 0, gl.RGBA, LayaGL.layaGPUInstance._oesTextureHalfFloat.HALF_FLOAT_OES, null);
                break;
            default:
                break;
        }
    }
    _create(width, height) {
        var gl = LayaGL.instance;
        this._frameBuffer = gl.createFramebuffer();
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        this._texImage2D(gl, this._glTextureType, width, height);
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
                    throw "RenderTexture: unkonw depth format.";
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
    _start() {
        var gl = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        RenderTexture._currentActive = this;
        this._readyed = false;
    }
    _end() {
        var gl = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        RenderTexture._currentActive = null;
        this._readyed = true;
    }
    getData(x, y, width, height, out) {
        if (Render.isConchApp && window.conchConfig.threadMode == 2) {
            throw "native 2 thread mode use getDataAsync";
        }
        var gl = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        var canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE);
        if (!canRead) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return null;
        }
        gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return out;
    }
    getDataAsync(x, y, width, height, callBack) {
        var gl = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.readPixelsAsync(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, function (data) {
            callBack(new Uint8Array(data));
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
RenderTexture._pool = [];
