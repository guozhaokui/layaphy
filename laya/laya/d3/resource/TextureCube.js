import { Render } from "../../renders/Render";
import { WebGLContext } from "../../webgl/WebGLContext";
import { BaseTexture } from "../../resource/BaseTexture";
import { LayaGL } from "../../layagl/LayaGL";
import { ILaya } from "../../../ILaya";
export class TextureCube extends BaseTexture {
    constructor(size, format = BaseTexture.FORMAT_R8G8B8, mipmap = false) {
        super(format, mipmap);
        this._glTextureType = LayaGL.instance.TEXTURE_CUBE_MAP;
        this._width = size;
        this._height = size;
        if (this._mipmap) {
            this._mipmapCount = Math.ceil(Math.log2(size));
            for (var i = 0; i < this._mipmapCount; i++)
                this._setPixels([], i, Math.max(size >> i, 1), Math.max(size >> i, 1));
            this._setGPUMemory(size * size * 4 * (1 + 1 / 3) * 6);
        }
        else {
            this._mipmapCount = 1;
            this._setGPUMemory(size * size * 4 * 6);
        }
    }
    static __init__() {
        var pixels = new Uint8Array(3);
        pixels[0] = 128;
        pixels[1] = 128;
        pixels[2] = 128;
        TextureCube.grayTexture = new TextureCube(1, BaseTexture.FORMAT_R8G8B8, false);
        TextureCube.grayTexture.setSixSidePixels([pixels, pixels, pixels, pixels, pixels, pixels]);
        TextureCube.grayTexture.lock = true;
    }
    static _parse(data, propertyParams = null, constructParams = null) {
        var texture = constructParams ? new TextureCube(0, constructParams[0], constructParams[1]) : new TextureCube(0);
        texture.setSixSideImageSources(data);
        return texture;
    }
    static load(url, complete) {
        ILaya.loader.create(url, complete, null, TextureCube.TEXTURECUBE);
    }
    get defaulteTexture() {
        return TextureCube.grayTexture;
    }
    _setPixels(pixels, miplevel, width, height) {
        var gl = LayaGL.instance;
        var textureType = this._glTextureType;
        var glFormat = this._getGLFormat();
        WebGLContext.bindTexture(gl, textureType, this._glTexture);
        if (this.format === BaseTexture.FORMAT_R8G8B8) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[0]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[1]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[2]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[3]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[4]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[5]);
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        }
        else {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[0]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[1]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[2]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[3]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[4]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels[5]);
        }
    }
    setSixSideImageSources(source, premultiplyAlpha = false) {
        var width;
        var height;
        for (var i = 0; i < 6; i++) {
            var img = source[i];
            if (!img) {
                console.log("TextureCube: image Source can't be null.");
                return;
            }
            var nextWidth = img.width;
            var nextHeight = img.height;
            if (i > 0) {
                if (width !== nextWidth) {
                    console.log("TextureCube: each side image's width and height must same.");
                    return;
                }
            }
            width = nextWidth;
            height = nextHeight;
            if (width !== height) {
                console.log("TextureCube: each side image's width and height must same.");
                return;
            }
        }
        this._width = width;
        this._height = height;
        var gl = LayaGL.instance;
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        var glFormat = this._getGLFormat();
        if (!Render.isConchApp) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFormat, glFormat, gl.UNSIGNED_BYTE, source[0]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFormat, glFormat, gl.UNSIGNED_BYTE, source[1]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFormat, glFormat, gl.UNSIGNED_BYTE, source[2]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFormat, glFormat, gl.UNSIGNED_BYTE, source[3]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFormat, glFormat, gl.UNSIGNED_BYTE, source[4]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFormat, glFormat, gl.UNSIGNED_BYTE, source[5]);
        }
        else {
            if (premultiplyAlpha == true) {
                for (var j = 0; j < 6; j++)
                    source[j].setPremultiplyAlpha(premultiplyAlpha);
            }
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source[0]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source[1]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source[2]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source[3]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source[4]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source[5]);
        }
        if (this._mipmap && this._isPot(width) && this._isPot(height)) {
            gl.generateMipmap(this._glTextureType);
            this._setGPUMemory(width * height * 4 * (1 + 1 / 3) * 6);
        }
        else {
            this._setGPUMemory(width * height * 4 * 6);
        }
        this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
        this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
        this._setFilterMode(this._filterMode);
        this._readyed = true;
        this._activeResource();
    }
    setSixSidePixels(pixels, miplevel = 0) {
        if (!pixels)
            throw new Error("TextureCube:pixels can't be null.");
        var width = Math.max(this._width >> miplevel, 1);
        var height = Math.max(this._height >> miplevel, 1);
        this._setPixels(pixels, miplevel, width, height);
        this._readyed = true;
        this._activeResource();
    }
    _recoverResource() {
    }
}
TextureCube.TEXTURECUBE = "TEXTURECUBE";
