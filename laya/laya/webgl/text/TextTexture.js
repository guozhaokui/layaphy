import { LayaGL } from "../../layagl/LayaGL";
import { RenderInfo } from "../../renders/RenderInfo";
import { Resource } from "../../resource/Resource";
import { WebGLContext } from "../WebGLContext";
import { ILaya } from "../../../ILaya";
export class TextTexture extends Resource {
    constructor(textureW, textureH) {
        super();
        this._texW = 0;
        this._texH = 0;
        this.__destroyed = false;
        this._discardTm = 0;
        this.genID = 0;
        this.bitmap = { id: 0, _glTexture: null };
        this.curUsedCovRate = 0;
        this.curUsedCovRateAtlas = 0;
        this.lastTouchTm = 0;
        this.ri = null;
        this._texW = textureW || TextTexture.gTextRender.atlasWidth;
        this._texH = textureH || TextTexture.gTextRender.atlasWidth;
        this.bitmap.id = this.id;
        this.lock = true;
    }
    recreateResource() {
        if (this._source)
            return;
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        var glTex = this._source = gl.createTexture();
        this.bitmap._glTexture = glTex;
        WebGLContext.bindTexture(gl, gl.TEXTURE_2D, glTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._texW, this._texH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (TextTexture.gTextRender.debugUV) {
            this.fillWhite();
        }
    }
    addChar(data, x, y, uv = null) {
        if (TextTexture.gTextRender.isWan1Wan) {
            return this.addCharCanvas(data, x, y, uv);
        }
        !this._source && this.recreateResource();
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        WebGLContext.bindTexture(gl, gl.TEXTURE_2D, this._source);
        !ILaya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        var dt = data.data;
        if (data.data instanceof Uint8ClampedArray)
            dt = new Uint8Array(dt.buffer);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, data.width, data.height, gl.RGBA, gl.UNSIGNED_BYTE, dt);
        !ILaya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        var u0;
        var v0;
        var u1;
        var v1;
        if (ILaya.Render.isConchApp) {
            u0 = x / this._texW;
            v0 = y / this._texH;
            u1 = (x + data.width) / this._texW;
            v1 = (y + data.height) / this._texH;
        }
        else {
            u0 = (x + 1) / this._texW;
            v0 = (y) / this._texH;
            u1 = (x + data.width - 1) / this._texW;
            v1 = (y + data.height - 1) / this._texH;
        }
        uv = uv || new Array(8);
        uv[0] = u0, uv[1] = v0;
        uv[2] = u1, uv[3] = v0;
        uv[4] = u1, uv[5] = v1;
        uv[6] = u0, uv[7] = v1;
        return uv;
    }
    addCharCanvas(canv, x, y, uv = null) {
        !this._source && this.recreateResource();
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        WebGLContext.bindTexture(gl, gl.TEXTURE_2D, this._source);
        !ILaya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, canv);
        !ILaya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        var u0;
        var v0;
        var u1;
        var v1;
        if (ILaya.Render.isConchApp) {
            u0 = x / this._texW;
            v0 = y / this._texH;
            u1 = (x + canv.width) / this._texW;
            v1 = (y + canv.height) / this._texH;
        }
        else {
            u0 = (x + 1) / this._texW;
            v0 = (y + 1) / this._texH;
            u1 = (x + canv.width - 1) / this._texW;
            v1 = (y + canv.height - 1) / this._texH;
        }
        uv = uv || new Array(8);
        uv[0] = u0, uv[1] = v0;
        uv[2] = u1, uv[3] = v0;
        uv[4] = u1, uv[5] = v1;
        uv[6] = u0, uv[7] = v1;
        return uv;
    }
    fillWhite() {
        !this._source && this.recreateResource();
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        var dt = new Uint8Array(this._texW * this._texH * 4);
        dt.fill(0xff);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._texW, this._texH, gl.RGBA, gl.UNSIGNED_BYTE, dt);
    }
    discard() {
        if (this._texW != TextTexture.gTextRender.atlasWidth || this._texH != TextTexture.gTextRender.atlasWidth) {
            this.destroy();
            return;
        }
        this.genID++;
        if (TextTexture.poolLen >= TextTexture.pool.length) {
            TextTexture.pool = TextTexture.pool.concat(new Array(10));
        }
        this._discardTm = RenderInfo.loopStTm;
        TextTexture.pool[TextTexture.poolLen++] = this;
    }
    static getTextTexture(w, h) {
        if (w != TextTexture.gTextRender.atlasWidth || w != TextTexture.gTextRender.atlasWidth)
            return new TextTexture(w, h);
        if (TextTexture.poolLen > 0) {
            var ret = TextTexture.pool[--TextTexture.poolLen];
            if (TextTexture.poolLen > 0)
                TextTexture.clean();
            return ret;
        }
        return new TextTexture(w, h);
    }
    destroy() {
        this.__destroyed = true;
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        this._source && gl.deleteTexture(this._source);
        this._source = null;
    }
    static clean() {
        var curtm = RenderInfo.loopStTm;
        if (TextTexture.cleanTm === 0)
            TextTexture.cleanTm = curtm;
        if (curtm - TextTexture.cleanTm >= TextTexture.gTextRender.checkCleanTextureDt) {
            for (var i = 0; i < TextTexture.poolLen; i++) {
                var p = TextTexture.pool[i];
                if (curtm - p._discardTm >= TextTexture.gTextRender.destroyUnusedTextureDt) {
                    p.destroy();
                    TextTexture.pool[i] = TextTexture.pool[TextTexture.poolLen - 1];
                    TextTexture.poolLen--;
                    i--;
                }
            }
            TextTexture.cleanTm = curtm;
        }
    }
    touchRect(ri, curloop) {
        if (this.lastTouchTm != curloop) {
            this.curUsedCovRate = 0;
            this.curUsedCovRateAtlas = 0;
            this.lastTouchTm = curloop;
        }
        var texw2 = TextTexture.gTextRender.atlasWidth * TextTexture.gTextRender.atlasWidth;
        var gridw2 = ILaya.TextAtlas.atlasGridW * ILaya.TextAtlas.atlasGridW;
        this.curUsedCovRate += (ri.bmpWidth * ri.bmpHeight) / texw2;
        this.curUsedCovRateAtlas += (Math.ceil(ri.bmpWidth / ILaya.TextAtlas.atlasGridW) * Math.ceil(ri.bmpHeight / ILaya.TextAtlas.atlasGridW)) / (texw2 / gridw2);
    }
    get texture() {
        return this;
    }
    _getSource() {
        return this._source;
    }
    drawOnScreen(x, y) {
    }
}
TextTexture.gTextRender = null;
TextTexture.pool = new Array(10);
TextTexture.poolLen = 0;
TextTexture.cleanTm = 0;
