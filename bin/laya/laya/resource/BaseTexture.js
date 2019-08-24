import { LayaGL } from "../layagl/LayaGL";
import { Bitmap } from "./Bitmap";
import { WebGLContext } from "../webgl/WebGLContext";
export class BaseTexture extends Bitmap {
    constructor(format, mipMap) {
        super();
        this._wrapModeU = BaseTexture.WARPMODE_REPEAT;
        this._wrapModeV = BaseTexture.WARPMODE_REPEAT;
        this._filterMode = BaseTexture.FILTERMODE_BILINEAR;
        this._readyed = false;
        this._width = -1;
        this._height = -1;
        this._format = format;
        this._mipmap = mipMap;
        this._anisoLevel = 1;
        this._glTexture = LayaGL.instance.createTexture();
    }
    get mipmap() {
        return this._mipmap;
    }
    get format() {
        return this._format;
    }
    get wrapModeU() {
        return this._wrapModeU;
    }
    set wrapModeU(value) {
        if (this._wrapModeU !== value) {
            this._wrapModeU = value;
            (this._width !== -1) && (this._setWarpMode(LayaGL.instance.TEXTURE_WRAP_S, value));
        }
    }
    get wrapModeV() {
        return this._wrapModeV;
    }
    set wrapModeV(value) {
        if (this._wrapModeV !== value) {
            this._wrapModeV = value;
            (this._height !== -1) && (this._setWarpMode(LayaGL.instance.TEXTURE_WRAP_T, value));
        }
    }
    get filterMode() {
        return this._filterMode;
    }
    set filterMode(value) {
        if (value !== this._filterMode) {
            this._filterMode = value;
            ((this._width !== -1) && (this._height !== -1)) && (this._setFilterMode(value));
        }
    }
    get anisoLevel() {
        return this._anisoLevel;
    }
    set anisoLevel(value) {
        if (value !== this._anisoLevel) {
            this._anisoLevel = Math.max(1, Math.min(16, value));
            ((this._width !== -1) && (this._height !== -1)) && (this._setAnisotropy(value));
        }
    }
    get mipmapCount() {
        return this._mipmapCount;
    }
    get defaulteTexture() {
        throw "BaseTexture:must override it.";
    }
    _getFormatByteCount() {
        switch (this._format) {
            case BaseTexture.FORMAT_R8G8B8:
                return 3;
            case BaseTexture.FORMAT_R8G8B8A8:
                return 4;
            case BaseTexture.FORMAT_ALPHA8:
                return 1;
            default:
                throw "Texture2D: unknown format.";
        }
    }
    _isPot(size) {
        return (size & (size - 1)) === 0;
    }
    _getGLFormat() {
        var glFormat;
        var gl = LayaGL.instance;
        var gpu = LayaGL.layaGPUInstance;
        switch (this._format) {
            case BaseTexture.FORMAT_R8G8B8:
                glFormat = gl.RGB;
                break;
            case BaseTexture.FORMAT_R8G8B8A8:
                glFormat = gl.RGBA;
                break;
            case BaseTexture.FORMAT_ALPHA8:
                glFormat = gl.ALPHA;
                break;
            case BaseTexture.FORMAT_DXT1:
                if (gpu._compressedTextureS3tc)
                    glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGB_S3TC_DXT1_EXT;
                else
                    throw "BaseTexture: not support DXT1 format.";
                break;
            case BaseTexture.FORMAT_DXT5:
                if (gpu._compressedTextureS3tc)
                    glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                else
                    throw "BaseTexture: not support DXT5 format.";
                break;
            case BaseTexture.FORMAT_ETC1RGB:
                if (gpu._compressedTextureEtc1)
                    glFormat = gpu._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL;
                else
                    throw "BaseTexture: not support ETC1RGB format.";
                break;
            case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
                if (gpu._compressedTexturePvrtc)
                    glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                else
                    throw "BaseTexture: not support PVRTCRGB_2BPPV format.";
                break;
            case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
                if (gpu._compressedTexturePvrtc)
                    glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
                else
                    throw "BaseTexture: not support PVRTCRGBA_2BPPV format.";
                break;
            case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
                if (gpu._compressedTexturePvrtc)
                    glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                else
                    throw "BaseTexture: not support PVRTCRGB_4BPPV format.";
                break;
            case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
                if (gpu._compressedTexturePvrtc)
                    glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                else
                    throw "BaseTexture: not support PVRTCRGBA_4BPPV format.";
                break;
            default:
                throw "BaseTexture: unknown texture format.";
        }
        return glFormat;
    }
    _setFilterMode(value) {
        var gl = LayaGL.instance;
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        switch (value) {
            case BaseTexture.FILTERMODE_POINT:
                if (this._mipmap)
                    gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                else
                    gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(this._glTextureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                break;
            case BaseTexture.FILTERMODE_BILINEAR:
                if (this._mipmap)
                    gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                else
                    gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(this._glTextureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                break;
            case BaseTexture.FILTERMODE_TRILINEAR:
                if (this._mipmap)
                    gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                else
                    gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(this._glTextureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                break;
            default:
                throw new Error("BaseTexture:unknown filterMode value.");
        }
    }
    _setWarpMode(orientation, mode) {
        var gl = LayaGL.instance;
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        if (this._isPot(this._width) && this._isPot(this._height)) {
            switch (mode) {
                case BaseTexture.WARPMODE_REPEAT:
                    gl.texParameteri(this._glTextureType, orientation, gl.REPEAT);
                    break;
                case BaseTexture.WARPMODE_CLAMP:
                    gl.texParameteri(this._glTextureType, orientation, gl.CLAMP_TO_EDGE);
                    break;
            }
        }
        else {
            gl.texParameteri(this._glTextureType, orientation, gl.CLAMP_TO_EDGE);
        }
    }
    _setAnisotropy(value) {
        var anisotropic = LayaGL.layaGPUInstance._extTextureFilterAnisotropic;
        if (anisotropic) {
            value = Math.max(value, 1);
            var gl = LayaGL.instance;
            WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
            value = Math.min(gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT), value);
            gl.texParameterf(this._glTextureType, anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, value);
        }
    }
    _disposeResource() {
        if (this._glTexture) {
            LayaGL.instance.deleteTexture(this._glTexture);
            this._glTexture = null;
            this._setGPUMemory(0);
        }
    }
    _getSource() {
        if (this._readyed)
            return this._glTexture;
        else
            return null;
    }
    generateMipmap() {
        if (this._isPot(this.width) && this._isPot(this.height))
            LayaGL.instance.generateMipmap(this._glTextureType);
    }
}
BaseTexture.WARPMODE_REPEAT = 0;
BaseTexture.WARPMODE_CLAMP = 1;
BaseTexture.FILTERMODE_POINT = 0;
BaseTexture.FILTERMODE_BILINEAR = 1;
BaseTexture.FILTERMODE_TRILINEAR = 2;
BaseTexture.FORMAT_R8G8B8 = 0;
BaseTexture.FORMAT_R8G8B8A8 = 1;
BaseTexture.FORMAT_ALPHA8 = 2;
BaseTexture.FORMAT_DXT1 = 3;
BaseTexture.FORMAT_DXT5 = 4;
BaseTexture.FORMAT_ETC1RGB = 5;
BaseTexture.FORMAT_PVRTCRGB_2BPPV = 9;
BaseTexture.FORMAT_PVRTCRGBA_2BPPV = 10;
BaseTexture.FORMAT_PVRTCRGB_4BPPV = 11;
BaseTexture.FORMAT_PVRTCRGBA_4BPPV = 12;
BaseTexture.RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT = 14;
BaseTexture.FORMAT_DEPTH_16 = 0;
BaseTexture.FORMAT_STENCIL_8 = 1;
BaseTexture.FORMAT_DEPTHSTENCIL_16_8 = 2;
BaseTexture.FORMAT_DEPTHSTENCIL_NONE = 3;
