import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { Rectangle } from "../maths/Rectangle";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
export class Texture extends EventDispatcher {
    constructor(bitmap = null, uv = null, sourceWidth = 0, sourceHeight = 0) {
        super();
        this.uvrect = [0, 0, 1, 1];
        this._destroyed = false;
        this._referenceCount = 0;
        this.$_GID = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this._w = 0;
        this._h = 0;
        this.sourceWidth = 0;
        this.sourceHeight = 0;
        this.url = null;
        this.scaleRate = 1;
        this.setTo(bitmap, uv, sourceWidth, sourceHeight);
    }
    static moveUV(offsetX, offsetY, uv) {
        for (var i = 0; i < 8; i += 2) {
            uv[i] += offsetX;
            uv[i + 1] += offsetY;
        }
        return uv;
    }
    static create(source, x, y, width, height, offsetX = 0, offsetY = 0, sourceWidth = 0, sourceHeight = 0) {
        return Texture._create(source, x, y, width, height, offsetX, offsetY, sourceWidth, sourceHeight);
    }
    static _create(source, x, y, width, height, offsetX = 0, offsetY = 0, sourceWidth = 0, sourceHeight = 0, outTexture = null) {
        var btex = source instanceof Texture;
        var uv = btex ? source.uv : Texture.DEF_UV;
        var bitmap = btex ? source.bitmap : source;
        if (bitmap.width && (x + width) > bitmap.width)
            width = bitmap.width - x;
        if (bitmap.height && (y + height) > bitmap.height)
            height = bitmap.height - y;
        var tex;
        if (outTexture) {
            tex = outTexture;
            tex.setTo(bitmap, null, sourceWidth || width, sourceHeight || height);
        }
        else {
            tex = new Texture(bitmap, null, sourceWidth || width, sourceHeight || height);
        }
        tex.width = width;
        tex.height = height;
        tex.offsetX = offsetX;
        tex.offsetY = offsetY;
        var dwidth = 1 / bitmap.width;
        var dheight = 1 / bitmap.height;
        x *= dwidth;
        y *= dheight;
        width *= dwidth;
        height *= dheight;
        var u1 = tex.uv[0], v1 = tex.uv[1], u2 = tex.uv[4], v2 = tex.uv[5];
        var inAltasUVWidth = (u2 - u1), inAltasUVHeight = (v2 - v1);
        var oriUV = Texture.moveUV(uv[0], uv[1], [x, y, x + width, y, x + width, y + height, x, y + height]);
        tex.uv = new Float32Array([u1 + oriUV[0] * inAltasUVWidth, v1 + oriUV[1] * inAltasUVHeight,
            u2 - (1 - oriUV[2]) * inAltasUVWidth, v1 + oriUV[3] * inAltasUVHeight,
            u2 - (1 - oriUV[4]) * inAltasUVWidth, v2 - (1 - oriUV[5]) * inAltasUVHeight,
            u1 + oriUV[6] * inAltasUVWidth, v2 - (1 - oriUV[7]) * inAltasUVHeight]);
        var bitmapScale = bitmap.scaleRate;
        if (bitmapScale && bitmapScale != 1) {
            tex.sourceWidth /= bitmapScale;
            tex.sourceHeight /= bitmapScale;
            tex.width /= bitmapScale;
            tex.height /= bitmapScale;
            tex.scaleRate = bitmapScale;
        }
        else {
            tex.scaleRate = 1;
        }
        return tex;
    }
    static createFromTexture(texture, x, y, width, height) {
        var texScaleRate = texture.scaleRate;
        if (texScaleRate != 1) {
            x *= texScaleRate;
            y *= texScaleRate;
            width *= texScaleRate;
            height *= texScaleRate;
        }
        var rect = Rectangle.TEMP.setTo(x - texture.offsetX, y - texture.offsetY, width, height);
        var result = rect.intersection(Texture._rect1.setTo(0, 0, texture.width, texture.height), Texture._rect2);
        if (result)
            var tex = Texture.create(texture, result.x, result.y, result.width, result.height, result.x - rect.x, result.y - rect.y, width, height);
        else
            return null;
        return tex;
    }
    get uv() {
        return this._uv;
    }
    set uv(value) {
        this.uvrect[0] = Math.min(value[0], value[2], value[4], value[6]);
        this.uvrect[1] = Math.min(value[1], value[3], value[5], value[7]);
        this.uvrect[2] = Math.max(value[0], value[2], value[4], value[6]) - this.uvrect[0];
        this.uvrect[3] = Math.max(value[1], value[3], value[5], value[7]) - this.uvrect[1];
        this._uv = value;
    }
    get width() {
        if (this._w)
            return this._w;
        if (!this.bitmap)
            return 0;
        return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[2] - this.uv[0]) * this.bitmap.width : this.bitmap.width;
    }
    set width(value) {
        this._w = value;
        this.sourceWidth || (this.sourceWidth = value);
    }
    get height() {
        if (this._h)
            return this._h;
        if (!this.bitmap)
            return 0;
        return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[5] - this.uv[1]) * this.bitmap.height : this.bitmap.height;
    }
    set height(value) {
        this._h = value;
        this.sourceHeight || (this.sourceHeight = value);
    }
    get bitmap() {
        return this._bitmap;
    }
    set bitmap(value) {
        this._bitmap && this._bitmap._removeReference(this._referenceCount);
        this._bitmap = value;
        value && (value._addReference(this._referenceCount));
    }
    get destroyed() {
        return this._destroyed;
    }
    _addReference() {
        this._bitmap && this._bitmap._addReference();
        this._referenceCount++;
    }
    _removeReference() {
        this._bitmap && this._bitmap._removeReference();
        this._referenceCount--;
    }
    _getSource(cb = null) {
        if (this._destroyed || !this._bitmap)
            return null;
        this.recoverBitmap(cb);
        return this._bitmap.destroyed ? null : this.bitmap._getSource();
    }
    _onLoaded(complete, context) {
        if (!context) {
        }
        else if (context == this) {
        }
        else if (context instanceof Texture) {
            var tex = context;
            Texture._create(context, 0, 0, tex.width, tex.height, 0, 0, tex.sourceWidth, tex.sourceHeight, this);
        }
        else {
            this.bitmap = context;
            this.sourceWidth = this._w = context.width;
            this.sourceHeight = this._h = context.height;
        }
        complete && complete.run();
        this.event(Event.READY, this);
    }
    getIsReady() {
        return this._destroyed ? false : (this._bitmap ? true : false);
    }
    setTo(bitmap = null, uv = null, sourceWidth = 0, sourceHeight = 0) {
        this.bitmap = bitmap;
        this.sourceWidth = sourceWidth;
        this.sourceHeight = sourceHeight;
        if (bitmap) {
            this._w = bitmap.width;
            this._h = bitmap.height;
            this.sourceWidth = this.sourceWidth || bitmap.width;
            this.sourceHeight = this.sourceHeight || bitmap.height;
        }
        this.uv = uv || Texture.DEF_UV;
    }
    load(url, complete = null) {
        if (!this._destroyed)
            ILaya.loader.load(url, Handler.create(this, this._onLoaded, [complete]), null, "htmlimage", 1, false, null, true);
    }
    getTexturePixels(x, y, width, height) {
        var st, dst, i;
        var tex2d = this.bitmap;
        var texw = tex2d.width;
        var texh = tex2d.height;
        if (x + width > texw)
            width -= (x + width) - texw;
        if (y + height > texh)
            height -= (y + height) - texh;
        if (width <= 0 || height <= 0)
            return null;
        var wstride = width * 4;
        var pix = null;
        try {
            pix = tex2d.getPixels();
        }
        catch (e) {
        }
        if (pix) {
            if (x == 0 && y == 0 && width == texw && height == texh)
                return pix;
            var ret = new Uint8Array(width * height * 4);
            wstride = texw * 4;
            st = x * 4;
            dst = (y + height - 1) * wstride + x * 4;
            for (i = height - 1; i >= 0; i--) {
                ret.set(dt.slice(dst, dst + width * 4), st);
                st += wstride;
                dst -= wstride;
            }
            return ret;
        }
        var ctx = new ILaya.Context();
        ctx.size(width, height);
        ctx.asBitmap = true;
        var uv = null;
        if (x != 0 || y != 0 || width != texw || height != texh) {
            uv = this._uv.slice();
            var stu = uv[0];
            var stv = uv[1];
            var uvw = uv[2] - stu;
            var uvh = uv[7] - stv;
            var uk = uvw / texw;
            var vk = uvh / texh;
            uv = [stu + x * uk, stv + y * vk,
                stu + (x + width) * uk, stv + y * vk,
                stu + (x + width) * uk, stv + (y + height) * vk,
                stu + x * uk, stv + (y + height) * vk];
        }
        ctx._drawTextureM(this, 0, 0, width, height, null, 1.0, uv);
        ctx._targets.start();
        ctx.flush();
        ctx._targets.end();
        ctx._targets.restore();
        var dt = ctx._targets.getData(0, 0, width, height);
        ctx.destroy();
        ret = new Uint8Array(width * height * 4);
        st = 0;
        dst = (height - 1) * wstride;
        for (i = height - 1; i >= 0; i--) {
            ret.set(dt.slice(dst, dst + wstride), st);
            st += wstride;
            dst -= wstride;
        }
        return ret;
    }
    getPixels(x, y, width, height) {
        if (window.conch) {
            return this._nativeObj.getImageData(x, y, width, height);
        }
        else {
            return this.getTexturePixels(x, y, width, height);
        }
    }
    recoverBitmap(onok = null) {
        var url = this._bitmap.url;
        if (!this._destroyed && (!this._bitmap || this._bitmap.destroyed) && url) {
            ILaya.loader.load(url, Handler.create(this, function (bit) {
                this.bitmap = bit;
                onok && onok();
            }), null, "htmlimage", 1, false, null, true);
        }
    }
    disposeBitmap() {
        if (!this._destroyed && this._bitmap) {
            this._bitmap.destroy();
        }
    }
    destroy(force = false) {
        if (!this._destroyed) {
            this._destroyed = true;
            var bit = this._bitmap;
            if (bit) {
                bit._removeReference(this._referenceCount);
                if (bit.referenceCount === 0 || force)
                    bit.destroy();
                bit = null;
            }
            if (this.url && this === ILaya.loader.getRes(this.url))
                ILaya.loader.clearRes(this.url);
        }
    }
}
Texture.DEF_UV = new Float32Array([0, 0, 1.0, 0, 1.0, 1.0, 0, 1.0]);
Texture.NO_UV = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
Texture.INV_UV = new Float32Array([0, 1, 1.0, 1, 1.0, 0.0, 0, 0.0]);
Texture._rect1 = new Rectangle();
Texture._rect2 = new Rectangle();
