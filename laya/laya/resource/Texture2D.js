import { LayaGL } from "../layagl/LayaGL";
import { BaseTexture } from "./BaseTexture";
import { WebGLContext } from "../webgl/WebGLContext";
import { ILaya } from "../../ILaya";
export class Texture2D extends BaseTexture {
    constructor(width = 0, height = 0, format = BaseTexture.FORMAT_R8G8B8A8, mipmap = true, canRead = false) {
        super(format, mipmap);
        var gl = LayaGL.instance;
        this._glTextureType = gl.TEXTURE_2D;
        this._width = width;
        this._height = height;
        this._canRead = canRead;
        this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
        this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
        this._setFilterMode(this._filterMode);
        this._setAnisotropy(this._anisoLevel);
        if (this._mipmap) {
            this._mipmapCount = Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1);
            for (var i = 0; i < this._mipmapCount; i++)
                this._setPixels(null, i, Math.max(width >> i, 1), Math.max(height >> i, 1));
            this._setGPUMemory(width * height * 4 * (1 + 1 / 3));
        }
        else {
            this._mipmapCount = 1;
            this._setGPUMemory(width * height * 4);
        }
    }
    static __init__() {
        var pixels = new Uint8Array(3);
        pixels[0] = 128;
        pixels[1] = 128;
        pixels[2] = 128;
        Texture2D.grayTexture = new Texture2D(1, 1, BaseTexture.FORMAT_R8G8B8, false, false);
        Texture2D.grayTexture.setPixels(pixels);
        Texture2D.grayTexture.lock = true;
        pixels[0] = 255;
        pixels[1] = 255;
        pixels[2] = 255;
        Texture2D.whiteTexture = new Texture2D(1, 1, BaseTexture.FORMAT_R8G8B8, false, false);
        Texture2D.whiteTexture.setPixels(pixels);
        Texture2D.whiteTexture.lock = true;
        pixels[0] = 0;
        pixels[1] = 0;
        pixels[2] = 0;
        Texture2D.blackTexture = new Texture2D(1, 1, BaseTexture.FORMAT_R8G8B8, false, false);
        Texture2D.blackTexture.setPixels(pixels);
        Texture2D.blackTexture.lock = true;
    }
    static _parse(data, propertyParams = null, constructParams = null) {
        var texture = constructParams ? new Texture2D(constructParams[0], constructParams[1], constructParams[2], constructParams[3], constructParams[4]) : new Texture2D(0, 0);
        if (propertyParams) {
            texture.wrapModeU = propertyParams.wrapModeU;
            texture.wrapModeV = propertyParams.wrapModeV;
            texture.filterMode = propertyParams.filterMode;
            texture.anisoLevel = propertyParams.anisoLevel;
        }
        switch (texture._format) {
            case BaseTexture.FORMAT_R8G8B8:
            case BaseTexture.FORMAT_R8G8B8A8:
                texture.loadImageSource(data);
                break;
            case BaseTexture.FORMAT_DXT1:
            case BaseTexture.FORMAT_DXT5:
            case BaseTexture.FORMAT_ETC1RGB:
            case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
            case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
            case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
            case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
                texture.setCompressData(data);
                break;
            default:
                throw "Texture2D:unkonwn format.";
        }
        return texture;
    }
    static load(url, complete) {
        ILaya.loader.create(url, complete, null, ILaya.Loader.TEXTURE2D);
    }
    get defaulteTexture() {
        return Texture2D.grayTexture;
    }
    _setPixels(pixels, miplevel, width, height) {
        var gl = LayaGL.instance;
        var textureType = this._glTextureType;
        var glFormat = this._getGLFormat();
        WebGLContext.bindTexture(gl, textureType, this._glTexture);
        if (this.format === BaseTexture.FORMAT_R8G8B8) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
            gl.texImage2D(textureType, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels);
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        }
        else {
            gl.texImage2D(textureType, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels);
        }
    }
    _calcualatesCompressedDataSize(format, width, height) {
        switch (format) {
            case BaseTexture.FORMAT_DXT1:
            case BaseTexture.FORMAT_ETC1RGB:
                return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;
            case BaseTexture.FORMAT_DXT5:
                return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;
            case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
            case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
                return Math.floor((Math.max(width, 8) * Math.max(height, 8) * 4 + 7) / 8);
            case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
            case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
                return Math.floor((Math.max(width, 16) * Math.max(height, 8) * 2 + 7) / 8);
            default:
                return 0;
        }
    }
    _pharseDDS(arrayBuffer) {
        const FOURCC_DXT1 = 827611204;
        const FOURCC_DXT5 = 894720068;
        const DDPF_FOURCC = 0x4;
        const DDSD_MIPMAPCOUNT = 0x20000;
        const DDS_MAGIC = 0x20534444;
        const DDS_HEADER_LENGTH = 31;
        const DDS_HEADER_MAGIC = 0;
        const DDS_HEADER_SIZE = 1;
        const DDS_HEADER_FLAGS = 2;
        const DDS_HEADER_HEIGHT = 3;
        const DDS_HEADER_WIDTH = 4;
        const DDS_HEADER_MIPMAPCOUNT = 7;
        const DDS_HEADER_PF_FLAGS = 20;
        const DDS_HEADER_PF_FOURCC = 21;
        var header = new Int32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);
        if (header[DDS_HEADER_MAGIC] != DDS_MAGIC)
            throw "Invalid magic number in DDS header";
        if (!(header[DDS_HEADER_PF_FLAGS] & DDPF_FOURCC))
            throw "Unsupported format, must contain a FourCC code";
        var compressedFormat = header[DDS_HEADER_PF_FOURCC];
        switch (this._format) {
            case BaseTexture.FORMAT_DXT1:
                if (compressedFormat !== FOURCC_DXT1)
                    throw "the FourCC code is not same with texture format.";
                break;
            case BaseTexture.FORMAT_DXT5:
                if (compressedFormat !== FOURCC_DXT5)
                    throw "the FourCC code is not same with texture format.";
                break;
            default:
                throw "unknown texture format.";
        }
        var mipLevels = 1;
        if (header[DDS_HEADER_FLAGS] & DDSD_MIPMAPCOUNT) {
            mipLevels = Math.max(1, header[DDS_HEADER_MIPMAPCOUNT]);
            if (!this._mipmap)
                throw "the mipmap is not same with Texture2D.";
        }
        else {
            if (this._mipmap)
                throw "the mipmap is not same with Texture2D.";
        }
        var width = header[DDS_HEADER_WIDTH];
        var height = header[DDS_HEADER_HEIGHT];
        this._width = width;
        this._height = height;
        var dataOffset = header[DDS_HEADER_SIZE] + 4;
        this._upLoadCompressedTexImage2D(arrayBuffer, width, height, mipLevels, dataOffset, 0);
    }
    _pharseKTX(arrayBuffer) {
        const ETC_HEADER_LENGTH = 13;
        const ETC_HEADER_FORMAT = 4;
        const ETC_HEADER_HEIGHT = 7;
        const ETC_HEADER_WIDTH = 6;
        const ETC_HEADER_MIPMAPCOUNT = 11;
        const ETC_HEADER_METADATA = 12;
        var id = new Uint8Array(arrayBuffer, 0, 12);
        if (id[0] != 0xAB || id[1] != 0x4B || id[2] != 0x54 || id[3] != 0x58 || id[4] != 0x20 || id[5] != 0x31 || id[6] != 0x31 || id[7] != 0xBB || id[8] != 0x0D || id[9] != 0x0A || id[10] != 0x1A || id[11] != 0x0A)
            throw ("Invalid fileIdentifier in KTX header");
        var header = new Int32Array(id.buffer, id.length, ETC_HEADER_LENGTH);
        var compressedFormat = header[ETC_HEADER_FORMAT];
        switch (compressedFormat) {
            case LayaGL.layaGPUInstance._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL:
                this._format = BaseTexture.FORMAT_ETC1RGB;
                break;
            default:
                throw "unknown texture format.";
        }
        var mipLevels = header[ETC_HEADER_MIPMAPCOUNT];
        var width = header[ETC_HEADER_WIDTH];
        var height = header[ETC_HEADER_HEIGHT];
        this._width = width;
        this._height = height;
        var dataOffset = 64 + header[ETC_HEADER_METADATA];
        this._upLoadCompressedTexImage2D(arrayBuffer, width, height, mipLevels, dataOffset, 4);
    }
    _pharsePVR(arrayBuffer) {
        const PVR_FORMAT_2BPP_RGB = 0;
        const PVR_FORMAT_2BPP_RGBA = 1;
        const PVR_FORMAT_4BPP_RGB = 2;
        const PVR_FORMAT_4BPP_RGBA = 3;
        const PVR_MAGIC = 0x03525650;
        const PVR_HEADER_LENGTH = 13;
        const PVR_HEADER_MAGIC = 0;
        const PVR_HEADER_FORMAT = 2;
        const PVR_HEADER_HEIGHT = 6;
        const PVR_HEADER_WIDTH = 7;
        const PVR_HEADER_MIPMAPCOUNT = 11;
        const PVR_HEADER_METADATA = 12;
        var header = new Int32Array(arrayBuffer, 0, PVR_HEADER_LENGTH);
        if (header[PVR_HEADER_MAGIC] != PVR_MAGIC)
            throw ("Invalid magic number in PVR header");
        var compressedFormat = header[PVR_HEADER_FORMAT];
        switch (compressedFormat) {
            case PVR_FORMAT_2BPP_RGB:
                this._format = BaseTexture.FORMAT_PVRTCRGB_2BPPV;
                break;
            case PVR_FORMAT_4BPP_RGB:
                this._format = BaseTexture.FORMAT_PVRTCRGB_4BPPV;
                break;
            case PVR_FORMAT_2BPP_RGBA:
                this._format = BaseTexture.FORMAT_PVRTCRGBA_2BPPV;
                break;
            case PVR_FORMAT_4BPP_RGBA:
                this._format = BaseTexture.FORMAT_PVRTCRGBA_4BPPV;
                break;
            default:
                throw "Texture2D:unknown PVR format.";
        }
        var mipLevels = header[PVR_HEADER_MIPMAPCOUNT];
        var width = header[PVR_HEADER_WIDTH];
        var height = header[PVR_HEADER_HEIGHT];
        this._width = width;
        this._height = height;
        var dataOffset = header[PVR_HEADER_METADATA] + 52;
        this._upLoadCompressedTexImage2D(arrayBuffer, width, height, mipLevels, dataOffset, 0);
    }
    _upLoadCompressedTexImage2D(data, width, height, miplevelCount, dataOffset, imageSizeOffset) {
        var gl = LayaGL.instance;
        var textureType = this._glTextureType;
        WebGLContext.bindTexture(gl, textureType, this._glTexture);
        var glFormat = this._getGLFormat();
        var offset = dataOffset;
        for (var i = 0; i < miplevelCount; i++) {
            offset += imageSizeOffset;
            var mipDataSize = this._calcualatesCompressedDataSize(this._format, width, height);
            var mipData = new Uint8Array(data, offset, mipDataSize);
            gl.compressedTexImage2D(textureType, i, glFormat, width, height, 0, mipData);
            width = Math.max(width >> 1, 1.0);
            height = Math.max(height >> 1, 1.0);
            offset += mipDataSize;
        }
        var memory = offset;
        this._setGPUMemory(memory);
        this._readyed = true;
        this._activeResource();
    }
    loadImageSource(source, premultiplyAlpha = false) {
        var gl = LayaGL.instance;
        var width = source.width;
        var height = source.height;
        this._width = width;
        this._height = height;
        if (!(this._isPot(width) && this._isPot(height)))
            this._mipmap = false;
        this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
        this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
        this._setFilterMode(this._filterMode);
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        var glFormat = this._getGLFormat();
        if (ILaya.Render.isConchApp) {
            if (source.setPremultiplyAlpha) {
                source.setPremultiplyAlpha(premultiplyAlpha);
            }
            gl.texImage2D(this._glTextureType, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        }
        else {
            gl.texImage2D(this._glTextureType, 0, glFormat, glFormat, gl.UNSIGNED_BYTE, source);
        }
        if (this._mipmap) {
            gl.generateMipmap(this._glTextureType);
            this._setGPUMemory(width * height * 4 * (1 + 1 / 3));
        }
        else {
            this._setGPUMemory(width * height * 4);
        }
        if (this._canRead) {
            if (ILaya.Render.isConchApp) {
                this._pixels = new Uint8Array(source._nativeObj.getImageData(0, 0, width, height));
            }
            else {
                ILaya.Browser.canvas.size(width, height);
                ILaya.Browser.canvas.clear();
                ILaya.Browser.context.drawImage(source, 0, 0, width, height);
                this._pixels = new Uint8Array(ILaya.Browser.context.getImageData(0, 0, width, height).data.buffer);
            }
        }
        this._readyed = true;
        this._activeResource();
    }
    setPixels(pixels, miplevel = 0) {
        if (!pixels)
            throw "Texture2D:pixels can't be null.";
        var width = Math.max(this._width >> miplevel, 1);
        var height = Math.max(this._height >> miplevel, 1);
        var pixelsCount = width * height * this._getFormatByteCount();
        if (pixels.length < pixelsCount)
            throw "Texture2D:pixels length should at least " + pixelsCount + ".";
        this._setPixels(pixels, miplevel, width, height);
        if (this._canRead)
            this._pixels = pixels;
        this._readyed = true;
        this._activeResource();
    }
    setSubPixels(x, y, width, height, pixels, miplevel = 0) {
        if (!pixels)
            throw "Texture2D:pixels can't be null.";
        var gl = LayaGL.instance;
        var textureType = this._glTextureType;
        WebGLContext.bindTexture(gl, textureType, this._glTexture);
        var glFormat = this._getGLFormat();
        if (this._format === BaseTexture.FORMAT_R8G8B8) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
            gl.texSubImage2D(textureType, miplevel, x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        }
        else {
            gl.texSubImage2D(textureType, miplevel, x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
        }
        this._readyed = true;
        this._activeResource();
    }
    setCompressData(data) {
        switch (this._format) {
            case BaseTexture.FORMAT_DXT1:
            case BaseTexture.FORMAT_DXT5:
                this._pharseDDS(data);
                break;
            case BaseTexture.FORMAT_ETC1RGB:
                this._pharseKTX(data);
                break;
            case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
            case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
            case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
            case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
                this._pharsePVR(data);
                break;
            default:
                throw "Texture2D:unkonwn format.";
        }
    }
    _recoverResource() {
    }
    getPixels() {
        if (this._canRead)
            return this._pixels;
        else
            throw new Error("Texture2D: must set texture canRead is true.");
    }
}
Texture2D.TEXTURE2D = "TEXTURE2D";
Texture2D.grayTexture = null;
Texture2D.whiteTexture = null;
Texture2D.blackTexture = null;
