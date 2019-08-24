import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";
import { Bezier } from "../maths/Bezier";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { ColorUtils } from "../utils/ColorUtils";
import { Stat } from "../utils/Stat";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { DrawStyle } from "../webgl/canvas/DrawStyle";
import { Path } from "../webgl/canvas/Path";
import { SaveBase } from "../webgl/canvas/save/SaveBase";
import { SaveClipRect } from "../webgl/canvas/save/SaveClipRect";
import { SaveMark } from "../webgl/canvas/save/SaveMark";
import { SaveTransform } from "../webgl/canvas/save/SaveTransform";
import { SaveTranslate } from "../webgl/canvas/save/SaveTranslate";
import { WebGLCacheAsNormalCanvas } from "../webgl/canvas/WebGLCacheAsNormalCanvas";
import { BaseShader } from "../webgl/shader/BaseShader";
import { Shader2D } from "../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { SkinMeshBuffer } from "../webgl/shader/d2/skinAnishader/SkinMeshBuffer";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { BasePoly } from "../webgl/shapes/BasePoly";
import { Earcut } from "../webgl/shapes/Earcut";
import { Submit } from "../webgl/submit/Submit";
import { SubmitBase } from "../webgl/submit/SubmitBase";
import { SubmitCanvas } from "../webgl/submit/SubmitCanvas";
import { SubmitCMD } from "../webgl/submit/SubmitCMD";
import { SubmitKey } from "../webgl/submit/SubmitKey";
import { SubmitTarget } from "../webgl/submit/SubmitTarget";
import { SubmitTexture } from "../webgl/submit/SubmitTexture";
import { CharSubmitCache } from "../webgl/text/CharSubmitCache";
import { TextRender } from "../webgl/text/TextRender";
import { MeshQuadTexture } from "../webgl/utils/MeshQuadTexture";
import { MeshTexture } from "../webgl/utils/MeshTexture";
import { MeshVG } from "../webgl/utils/MeshVG";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { WebGLContext } from "../webgl/WebGLContext";
import { Texture } from "./Texture";
import { BaseTexture } from "./BaseTexture";
import { RenderTexture2D } from "./RenderTexture2D";
import { Texture2D } from "./Texture2D";
export class Context {
    constructor() {
        this._tmpMatrix = new Matrix();
        this._drawTexToDrawTri_Vert = new Float32Array(8);
        this._drawTexToDrawTri_Index = new Uint16Array([0, 1, 2, 0, 2, 3]);
        this._tempUV = new Float32Array(8);
        this._drawTriUseAbsMatrix = false;
        this._id = ++Context._COUNT;
        this._other = null;
        this._renderNextSubmitIndex = 0;
        this._path = null;
        this._drawCount = 1;
        this._width = Context._MAXSIZE;
        this._height = Context._MAXSIZE;
        this._renderCount = 0;
        this._isConvexCmd = true;
        this._submits = null;
        this._curSubmit = null;
        this._submitKey = new SubmitKey();
        this._mesh = null;
        this._pathMesh = null;
        this._triangleMesh = null;
        this.meshlist = [];
        this._transedPoints = new Array(8);
        this._temp4Points = new Array(8);
        this._clipRect = Context.MAXCLIPRECT;
        this._globalClipMatrix = new Matrix(Context._MAXSIZE, 0, 0, Context._MAXSIZE, 0, 0);
        this._clipInCache = false;
        this._clipInfoID = 0;
        this._clipID_Gen = 0;
        this._curMat = null;
        this._lastMatScaleX = 1.0;
        this._lastMatScaleY = 1.0;
        this._lastMat_a = 1.0;
        this._lastMat_b = 0.0;
        this._lastMat_c = 0.0;
        this._lastMat_d = 1.0;
        this._nBlendType = 0;
        this._save = null;
        this._targets = null;
        this._charSubmitCache = null;
        this._saveMark = null;
        this._shader2D = new Shader2D();
        this.sprite = null;
        this._italicDeg = 0;
        this._lastTex = null;
        this._fillColor = 0;
        this._flushCnt = 0;
        this.defTexture = null;
        this._colorFiler = null;
        this.drawTexAlign = false;
        this._incache = false;
        this.isMain = false;
        Context._contextcount++;
        Context._textRender = Context._textRender || new TextRender();
        if (!this.defTexture) {
            var defTex2d = new Texture2D(2, 2);
            defTex2d.setPixels(new Uint8Array(16));
            defTex2d.lock = true;
            this.defTexture = new Texture(defTex2d);
        }
        this._lastTex = this.defTexture;
        this.clear();
    }
    static __init__() {
        Context.MAXCLIPRECT = new Rectangle(0, 0, Context._MAXSIZE, Context._MAXSIZE);
        ContextParams.DEFAULT = new ContextParams();
        WebGLCacheAsNormalCanvas;
    }
    drawImage(...args) {
    }
    getImageData(...args) {
    }
    measureText(text) {
        return null;
    }
    setTransform(...args) {
    }
    $transform(a, b, c, d, tx, ty) {
    }
    get lineJoin() {
        return null;
    }
    set lineJoin(value) {
    }
    get lineCap() {
        return null;
    }
    set lineCap(value) {
    }
    get miterLimit() {
        return null;
    }
    set miterLimit(value) {
    }
    clearRect(x, y, width, height) {
    }
    _drawRect(x, y, width, height, style) {
        Stat.renderBatches++;
        style && (this.fillStyle = style);
        this.fillRect(x, y, width, height, null);
    }
    drawTexture2(x, y, pivotX, pivotY, m, args2) {
    }
    transformByMatrix(matrix, tx, ty) {
        this.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + tx, matrix.ty + ty);
    }
    saveTransform(matrix) {
        this.save();
    }
    restoreTransform(matrix) {
        this.restore();
    }
    drawRect(x, y, width, height, fillColor, lineColor, lineWidth) {
        var ctx = this;
        if (fillColor != null) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, y, width, height);
        }
        if (lineColor != null) {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(x, y, width, height);
        }
    }
    alpha(value) {
        this.globalAlpha *= value;
    }
    _transform(mat, pivotX, pivotY) {
        this.translate(pivotX, pivotY);
        this.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
        this.translate(-pivotX, -pivotY);
    }
    _rotate(angle, pivotX, pivotY) {
        this.translate(pivotX, pivotY);
        this.rotate(angle);
        this.translate(-pivotX, -pivotY);
    }
    _scale(scaleX, scaleY, pivotX, pivotY) {
        this.translate(pivotX, pivotY);
        this.scale(scaleX, scaleY);
        this.translate(-pivotX, -pivotY);
    }
    _drawLine(x, y, fromX, fromY, toX, toY, lineColor, lineWidth, vid) {
        this.beginPath();
        this.strokeStyle = lineColor;
        this.lineWidth = lineWidth;
        this.moveTo(x + fromX, y + fromY);
        this.lineTo(x + toX, y + toY);
        this.stroke();
    }
    _drawLines(x, y, points, lineColor, lineWidth, vid) {
        this.beginPath();
        this.strokeStyle = lineColor;
        this.lineWidth = lineWidth;
        var i = 2, n = points.length;
        this.addPath(points.slice(), false, false, x, y);
        this.stroke();
    }
    drawCurves(x, y, points, lineColor, lineWidth) {
        this.beginPath();
        this.strokeStyle = lineColor;
        this.lineWidth = lineWidth;
        this.moveTo(x + points[0], y + points[1]);
        var i = 2, n = points.length;
        while (i < n) {
            this.quadraticCurveTo(x + points[i++], y + points[i++], x + points[i++], y + points[i++]);
        }
        this.stroke();
    }
    _fillAndStroke(fillColor, strokeColor, lineWidth, isConvexPolygon = false) {
        if (fillColor != null) {
            this.fillStyle = fillColor;
            this.fill();
        }
        if (strokeColor != null && lineWidth > 0) {
            this.strokeStyle = strokeColor;
            this.lineWidth = lineWidth;
            this.stroke();
        }
    }
    _drawCircle(x, y, radius, fillColor, lineColor, lineWidth, vid) {
        Stat.renderBatches++;
        this.beginPath(true);
        this.arc(x, y, radius, 0, Context.PI2);
        this.closePath();
        this._fillAndStroke(fillColor, lineColor, lineWidth);
    }
    _drawPie(x, y, radius, startAngle, endAngle, fillColor, lineColor, lineWidth, vid) {
        this.beginPath();
        this.moveTo(x, y);
        this.arc(x, y, radius, startAngle, endAngle);
        this.closePath();
        this._fillAndStroke(fillColor, lineColor, lineWidth);
    }
    _drawPoly(x, y, points, fillColor, lineColor, lineWidth, isConvexPolygon, vid) {
        var i = 2, n = points.length;
        this.beginPath();
        this.addPath(points.slice(), true, isConvexPolygon, x, y);
        this.closePath();
        this._fillAndStroke(fillColor, lineColor, lineWidth, isConvexPolygon);
    }
    _drawPath(x, y, paths, brush, pen) {
        this.beginPath();
        for (var i = 0, n = paths.length; i < n; i++) {
            var path = paths[i];
            switch (path[0]) {
                case "moveTo":
                    this.moveTo(x + path[1], y + path[2]);
                    break;
                case "lineTo":
                    this.lineTo(x + path[1], y + path[2]);
                    break;
                case "arcTo":
                    this.arcTo(x + path[1], y + path[2], x + path[3], y + path[4], path[5]);
                    break;
                case "closePath":
                    this.closePath();
                    break;
            }
        }
        if (brush != null) {
            this.fillStyle = brush.fillStyle;
            this.fill();
        }
        if (pen != null) {
            this.strokeStyle = pen.strokeStyle;
            this.lineWidth = pen.lineWidth || 1;
            this.lineJoin = pen.lineJoin;
            this.lineCap = pen.lineCap;
            this.miterLimit = pen.miterLimit;
            this.stroke();
        }
    }
    static set2DRenderConfig() {
        var gl = LayaGL.instance;
        WebGLContext.setBlend(gl, true);
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        WebGLContext.setDepthTest(gl, false);
        WebGLContext.setCullFace(gl, false);
        WebGLContext.setDepthMask(gl, true);
        WebGLContext.setFrontFace(gl, gl.CCW);
        gl.viewport(0, 0, RenderState2D.width, RenderState2D.height);
    }
    clearBG(r, g, b, a) {
        var gl = WebGLContext.mainContext;
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    _getSubmits() {
        return this._submits;
    }
    _releaseMem(keepRT = false) {
        if (!this._submits)
            return;
        this._curMat.destroy();
        this._curMat = null;
        this._shader2D.destroy();
        this._shader2D = null;
        this._charSubmitCache.clear();
        for (var i = 0, n = this._submits._length; i < n; i++) {
            this._submits[i].releaseRender();
        }
        this._submits.length = 0;
        this._submits._length = 0;
        this._submits = null;
        this._curSubmit = null;
        this._path = null;
        this._save = null;
        var sz;
        for (i = 0, sz = this.meshlist.length; i < sz; i++) {
            var curm = this.meshlist[i];
            curm.destroy();
        }
        this.meshlist.length = 0;
        this.sprite = null;
        if (!keepRT) {
            this._targets && (this._targets.destroy());
            this._targets = null;
        }
    }
    destroy(keepRT = false) {
        --Context._contextcount;
        this.sprite = null;
        this._releaseMem(keepRT);
        this._charSubmitCache.destroy();
        this._mesh.destroy();
        if (!keepRT) {
            this._targets && this._targets.destroy();
            this._targets = null;
        }
    }
    clear() {
        if (!this._submits) {
            this._other = ContextParams.DEFAULT;
            this._curMat = Matrix.create();
            this._charSubmitCache = new CharSubmitCache();
            this._mesh = MeshQuadTexture.getAMesh(this.isMain);
            this.meshlist.push(this._mesh);
            this._pathMesh = MeshVG.getAMesh(this.isMain);
            this.meshlist.push(this._pathMesh);
            this._triangleMesh = MeshTexture.getAMesh(this.isMain);
            this.meshlist.push(this._triangleMesh);
            this._submits = [];
            this._save = [SaveMark.Create(this)];
            this._save.length = 10;
            this._shader2D = new Shader2D();
        }
        this._submitKey.clear();
        this._mesh.clearVB();
        this._renderCount++;
        this._drawCount = 1;
        this._other = ContextParams.DEFAULT;
        this._other.lineWidth = this._shader2D.ALPHA = 1.0;
        this._nBlendType = 0;
        this._clipRect = Context.MAXCLIPRECT;
        this._curSubmit = SubmitBase.RENDERBASE;
        SubmitBase.RENDERBASE._ref = 0xFFFFFF;
        SubmitBase.RENDERBASE._numEle = 0;
        this._shader2D.fillStyle = this._shader2D.strokeStyle = DrawStyle.DEFAULT;
        for (var i = 0, n = this._submits._length; i < n; i++)
            this._submits[i].releaseRender();
        this._submits._length = 0;
        this._curMat.identity();
        this._other.clear();
        this._saveMark = this._save[0];
        this._save._length = 1;
    }
    size(w, h) {
        if (this._width != w || this._height != h) {
            this._width = w;
            this._height = h;
            if (this._targets) {
                this._targets.destroy();
                this._targets = new RenderTexture2D(w, h, BaseTexture.FORMAT_R8G8B8A8, -1);
            }
            if (this.isMain) {
                WebGLContext.mainContext.viewport(0, 0, w, h);
                RenderState2D.width = w;
                RenderState2D.height = h;
            }
        }
        if (w === 0 && h === 0)
            this._releaseMem();
    }
    set asBitmap(value) {
        if (value) {
            this._targets || (this._targets = new RenderTexture2D(this._width, this._height, BaseTexture.FORMAT_R8G8B8A8, -1));
            if (!this._width || !this._height)
                throw Error("asBitmap no size!");
        }
        else {
            this._targets && this._targets.destroy();
            this._targets = null;
        }
    }
    getMatScaleX() {
        if (this._lastMat_a == this._curMat.a && this._lastMat_b == this._curMat.b)
            return this._lastMatScaleX;
        this._lastMatScaleX = this._curMat.getScaleX();
        this._lastMat_a = this._curMat.a;
        this._lastMat_b = this._curMat.b;
        return this._lastMatScaleX;
    }
    getMatScaleY() {
        if (this._lastMat_c == this._curMat.c && this._lastMat_d == this._curMat.d)
            return this._lastMatScaleY;
        this._lastMatScaleY = this._curMat.getScaleY();
        this._lastMat_c = this._curMat.c;
        this._lastMat_d = this._curMat.d;
        return this._lastMatScaleY;
    }
    setFillColor(color) {
        this._fillColor = color;
    }
    getFillColor() {
        return this._fillColor;
    }
    set fillStyle(value) {
        if (!this._shader2D.fillStyle.equal(value)) {
            SaveBase.save(this, SaveBase.TYPE_FILESTYLE, this._shader2D, false);
            this._shader2D.fillStyle = DrawStyle.create(value);
            this._submitKey.other = -this._shader2D.fillStyle.toInt();
        }
    }
    get fillStyle() {
        return this._shader2D.fillStyle;
    }
    set globalAlpha(value) {
        value = Math.floor(value * 1000) / 1000;
        if (value != this._shader2D.ALPHA) {
            SaveBase.save(this, SaveBase.TYPE_ALPHA, this._shader2D, false);
            this._shader2D.ALPHA = value;
        }
    }
    get globalAlpha() {
        return this._shader2D.ALPHA;
    }
    set textAlign(value) {
        (this._other.textAlign === value) || (this._other = this._other.make(), SaveBase.save(this, SaveBase.TYPE_TEXTALIGN, this._other, false), this._other.textAlign = value);
    }
    get textAlign() {
        return this._other.textAlign;
    }
    set textBaseline(value) {
        (this._other.textBaseline === value) || (this._other = this._other.make(), SaveBase.save(this, SaveBase.TYPE_TEXTBASELINE, this._other, false), this._other.textBaseline = value);
    }
    get textBaseline() {
        return this._other.textBaseline;
    }
    set globalCompositeOperation(value) {
        var n = BlendMode.TOINT[value];
        n == null || (this._nBlendType === n) || (SaveBase.save(this, SaveBase.TYPE_GLOBALCOMPOSITEOPERATION, this, true), this._curSubmit = SubmitBase.RENDERBASE, this._nBlendType = n);
    }
    get globalCompositeOperation() {
        return BlendMode.NAMES[this._nBlendType];
    }
    set strokeStyle(value) {
        this._shader2D.strokeStyle.equal(value) || (SaveBase.save(this, SaveBase.TYPE_STROKESTYLE, this._shader2D, false), this._shader2D.strokeStyle = DrawStyle.create(value), this._submitKey.other = -this._shader2D.strokeStyle.toInt());
    }
    get strokeStyle() {
        return this._shader2D.strokeStyle;
    }
    translate(x, y) {
        if (x !== 0 || y !== 0) {
            SaveTranslate.save(this);
            if (this._curMat._bTransform) {
                SaveTransform.save(this);
                this._curMat.tx += (x * this._curMat.a + y * this._curMat.c);
                this._curMat.ty += (x * this._curMat.b + y * this._curMat.d);
            }
            else {
                this._curMat.tx = x;
                this._curMat.ty = y;
            }
        }
    }
    set lineWidth(value) {
        (this._other.lineWidth === value) || (this._other = this._other.make(), SaveBase.save(this, SaveBase.TYPE_LINEWIDTH, this._other, false), this._other.lineWidth = value);
    }
    get lineWidth() {
        return this._other.lineWidth;
    }
    save() {
        this._save[this._save._length++] = SaveMark.Create(this);
    }
    restore() {
        var sz = this._save._length;
        var lastBlend = this._nBlendType;
        if (sz < 1)
            return;
        for (var i = sz - 1; i >= 0; i--) {
            var o = this._save[i];
            o.restore(this);
            if (o.isSaveMark()) {
                this._save._length = i;
                return;
            }
        }
        if (lastBlend != this._nBlendType) {
            this._curSubmit = SubmitBase.RENDERBASE;
        }
    }
    set font(str) {
        this._other = this._other.make();
        SaveBase.save(this, SaveBase.TYPE_FONT, this._other, false);
    }
    fillText(txt, x, y, fontStr, color, align) {
        this._fillText(txt, null, x, y, fontStr, color, null, 0, null);
    }
    _fillText(txt, words, x, y, fontStr, color, strokeColor, lineWidth, textAlign, underLine = 0) {
        if (txt)
            Context._textRender.filltext(this, txt, x, y, fontStr, color, strokeColor, lineWidth, textAlign, underLine);
        else if (words)
            Context._textRender.fillWords(this, words, x, y, fontStr, color, strokeColor, lineWidth);
    }
    _fast_filltext(data, x, y, fontObj, color, strokeColor, lineWidth, textAlign, underLine = 0) {
        Context._textRender._fast_filltext(this, data, null, x, y, fontObj, color, strokeColor, lineWidth, textAlign, underLine);
    }
    fillWords(words, x, y, fontStr, color) {
        this._fillText(null, words, x, y, fontStr, color, null, -1, null, 0);
    }
    fillBorderWords(words, x, y, font, color, borderColor, lineWidth) {
        this._fillBorderText(null, words, x, y, font, color, borderColor, lineWidth, null);
    }
    drawText(text, x, y, font, color, textAlign) {
        this._fillText(text, null, x, y, font, ColorUtils.create(color).strColor, null, -1, textAlign);
    }
    strokeWord(text, x, y, font, color, lineWidth, textAlign) {
        this._fillText(text, null, x, y, font, null, ColorUtils.create(color).strColor, lineWidth || 1, textAlign);
    }
    fillBorderText(txt, x, y, fontStr, fillColor, borderColor, lineWidth, textAlign) {
        this._fillBorderText(txt, null, x, y, fontStr, ColorUtils.create(fillColor).strColor, ColorUtils.create(borderColor).strColor, lineWidth, textAlign);
    }
    _fillBorderText(txt, words, x, y, fontStr, fillColor, borderColor, lineWidth, textAlign) {
        this._fillText(txt, words, x, y, fontStr, fillColor, borderColor, lineWidth || 1, textAlign);
    }
    _fillRect(x, y, width, height, rgba) {
        var submit = this._curSubmit;
        var sameKey = submit && (submit._key.submitType === SubmitBase.KEY_DRAWTEXTURE && submit._key.blendShader === this._nBlendType);
        if (this._mesh.vertNum + 4 > Context._MAXVERTNUM) {
            this._mesh = MeshQuadTexture.getAMesh(this.isMain);
            this.meshlist.push(this._mesh);
            sameKey = false;
        }
        sameKey && (sameKey = sameKey && this.isSameClipInfo(submit));
        this.transformQuad(x, y, width, height, 0, this._curMat, this._transedPoints);
        if (!this.clipedOff(this._transedPoints)) {
            this._mesh.addQuad(this._transedPoints, Texture.NO_UV, rgba, false);
            if (!sameKey) {
                submit = this._curSubmit = SubmitTexture.create(this, this._mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
                this._submits[this._submits._length++] = submit;
                this._copyClipInfo(submit, this._globalClipMatrix);
                submit.shaderValue.textureHost = this._lastTex;
                submit._key.other = (this._lastTex && this._lastTex.bitmap) ? this._lastTex.bitmap.id : -1;
                submit._renderType = SubmitBase.TYPE_TEXTURE;
            }
            this._curSubmit._numEle += 6;
            this._mesh.indexNum += 6;
            this._mesh.vertNum += 4;
        }
    }
    fillRect(x, y, width, height, fillStyle) {
        var drawstyle = fillStyle ? DrawStyle.create(fillStyle) : this._shader2D.fillStyle;
        var rgba = this.mixRGBandAlpha(drawstyle.toInt());
        this._fillRect(x, y, width, height, rgba);
    }
    fillTexture(texture, x, y, width, height, type, offset, other) {
        if (!texture._getSource()) {
            this.sprite && ILaya.systemTimer.callLater(this, this._repaintSprite);
            return;
        }
        this._fillTexture(texture, texture.width, texture.height, texture.uvrect, x, y, width, height, type, offset.x, offset.y);
    }
    _fillTexture(texture, texw, texh, texuvRect, x, y, width, height, type, offsetx, offsety) {
        var submit = this._curSubmit;
        var sameKey = false;
        if (this._mesh.vertNum + 4 > Context._MAXVERTNUM) {
            this._mesh = MeshQuadTexture.getAMesh(this.isMain);
            this.meshlist.push(this._mesh);
            sameKey = false;
        }
        var repeatx = true;
        var repeaty = true;
        switch (type) {
            case "repeat": break;
            case "repeat-x":
                repeaty = false;
                break;
            case "repeat-y":
                repeatx = false;
                break;
            case "no-repeat":
                repeatx = repeaty = false;
                break;
            default: break;
        }
        var uv = this._temp4Points;
        var stu = 0;
        var stv = 0;
        var stx = 0, sty = 0, edx = 0, edy = 0;
        if (offsetx < 0) {
            stx = x;
            stu = (-offsetx % texw) / texw;
        }
        else {
            stx = x + offsetx;
        }
        if (offsety < 0) {
            sty = y;
            stv = (-offsety % texh) / texh;
        }
        else {
            sty = y + offsety;
        }
        edx = x + width;
        edy = y + height;
        (!repeatx) && (edx = Math.min(edx, x + offsetx + texw));
        (!repeaty) && (edy = Math.min(edy, y + offsety + texh));
        if (edx < x || edy < y)
            return;
        if (stx > edx || sty > edy)
            return;
        var edu = (edx - x - offsetx) / texw;
        var edv = (edy - y - offsety) / texh;
        this.transformQuad(stx, sty, edx - stx, edy - sty, 0, this._curMat, this._transedPoints);
        uv[0] = stu;
        uv[1] = stv;
        uv[2] = edu;
        uv[3] = stv;
        uv[4] = edu;
        uv[5] = edv;
        uv[6] = stu;
        uv[7] = edv;
        if (!this.clipedOff(this._transedPoints)) {
            var rgba = this._mixRGBandAlpha(0xffffffff, this._shader2D.ALPHA);
            this._mesh.addQuad(this._transedPoints, uv, rgba, true);
            var sv = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
            sv.defines.add(ShaderDefines2D.FILLTEXTURE);
            sv.u_TexRange = texuvRect;
            submit = this._curSubmit = SubmitTexture.create(this, this._mesh, sv);
            this._submits[this._submits._length++] = submit;
            this._copyClipInfo(submit, this._globalClipMatrix);
            submit.shaderValue.textureHost = texture;
            submit._renderType = SubmitBase.TYPE_TEXTURE;
            this._curSubmit._numEle += 6;
            this._mesh.indexNum += 6;
            this._mesh.vertNum += 4;
        }
        this.breakNextMerge();
    }
    setColorFilter(filter) {
        SaveBase.save(this, SaveBase.TYPE_COLORFILTER, this, true);
        this._colorFiler = filter;
        this._curSubmit = SubmitBase.RENDERBASE;
    }
    drawTexture(tex, x, y, width, height) {
        this._drawTextureM(tex, x, y, width, height, null, 1, null);
    }
    drawTextures(tex, pos, tx, ty) {
        if (!tex._getSource()) {
            this.sprite && ILaya.systemTimer.callLater(this, this._repaintSprite);
            return;
        }
        var n = pos.length / 2;
        var ipos = 0;
        var bmpid = tex.bitmap.id;
        for (var i = 0; i < n; i++) {
            this._inner_drawTexture(tex, bmpid, pos[ipos++] + tx, pos[ipos++] + ty, 0, 0, null, null, 1.0, false);
        }
    }
    _drawTextureAddSubmit(imgid, tex) {
        var submit = null;
        submit = SubmitTexture.create(this, this._mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
        this._submits[this._submits._length++] = submit;
        submit.shaderValue.textureHost = tex;
        submit._key.other = imgid;
        submit._renderType = SubmitBase.TYPE_TEXTURE;
        this._curSubmit = submit;
    }
    _drawTextureM(tex, x, y, width, height, m, alpha, uv) {
        var cs = this.sprite;
        if (!tex._getSource(function () {
            if (cs) {
                cs.repaint();
            }
        })) {
            return false;
        }
        return this._inner_drawTexture(tex, tex.bitmap.id, x, y, width, height, m, uv, alpha, false);
    }
    _drawRenderTexture(tex, x, y, width, height, m, alpha, uv) {
        return this._inner_drawTexture(tex, -1, x, y, width, height, m, uv, 1.0, false);
    }
    submitDebugger() {
        this._submits[this._submits._length++] = SubmitCMD.create([], function () { debugger; }, this);
    }
    _copyClipInfo(submit, clipInfo) {
        var cm = submit.shaderValue.clipMatDir;
        cm[0] = clipInfo.a;
        cm[1] = clipInfo.b;
        cm[2] = clipInfo.c;
        cm[3] = clipInfo.d;
        var cmp = submit.shaderValue.clipMatPos;
        cmp[0] = clipInfo.tx;
        cmp[1] = clipInfo.ty;
        submit.clipInfoID = this._clipInfoID;
        if (this._clipInCache) {
            submit.shaderValue.clipOff[0] = 1;
        }
    }
    isSameClipInfo(submit) {
        return (submit.clipInfoID === this._clipInfoID);
    }
    _useNewTex2DSubmit(tex, minVertNum) {
        if (this._mesh.vertNum + minVertNum > Context._MAXVERTNUM) {
            this._mesh = MeshQuadTexture.getAMesh(this.isMain);
            this.meshlist.push(this._mesh);
        }
        var submit = SubmitTexture.create(this, this._mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
        this._submits[this._submits._length++] = this._curSubmit = submit;
        submit.shaderValue.textureHost = tex;
        this._copyClipInfo(submit, this._globalClipMatrix);
    }
    _drawTexRect(x, y, w, h, uv) {
        this.transformQuad(x, y, w, h, this._italicDeg, this._curMat, this._transedPoints);
        var ops = this._transedPoints;
        ops[0] = (ops[0] + 0.5) | 0;
        ops[1] = (ops[1] + 0.5) | 0;
        ops[2] = (ops[2] + 0.5) | 0;
        ops[3] = (ops[3] + 0.5) | 0;
        ops[4] = (ops[4] + 0.5) | 0;
        ops[5] = (ops[5] + 0.5) | 0;
        ops[6] = (ops[6] + 0.5) | 0;
        ops[7] = (ops[7] + 0.5) | 0;
        if (!this.clipedOff(this._transedPoints)) {
            this._mesh.addQuad(this._transedPoints, uv, this._fillColor, true);
            this._curSubmit._numEle += 6;
            this._mesh.indexNum += 6;
            this._mesh.vertNum += 4;
        }
    }
    drawCallOptimize(enbale) {
        this._charSubmitCache.enable(enbale, this);
        return enbale;
    }
    _inner_drawTexture(tex, imgid, x, y, width, height, m, uv, alpha, lastRender) {
        var preKey = this._curSubmit._key;
        uv = uv || tex._uv;
        if (preKey.submitType === SubmitBase.KEY_TRIANGLES && preKey.other === imgid) {
            var tv = this._drawTexToDrawTri_Vert;
            tv[0] = x;
            tv[1] = y;
            tv[2] = x + width, tv[3] = y, tv[4] = x + width, tv[5] = y + height, tv[6] = x, tv[7] = y + height;
            this._drawTriUseAbsMatrix = true;
            var tuv = this._tempUV;
            tuv[0] = uv[0];
            tuv[1] = uv[1];
            tuv[2] = uv[2];
            tuv[3] = uv[3];
            tuv[4] = uv[4];
            tuv[5] = uv[5];
            tuv[6] = uv[6];
            tuv[7] = uv[7];
            this.drawTriangles(tex, 0, 0, tv, tuv, this._drawTexToDrawTri_Index, m, alpha, null, null);
            this._drawTriUseAbsMatrix = false;
            return true;
        }
        var mesh = this._mesh;
        var submit = this._curSubmit;
        var ops = lastRender ? this._charSubmitCache.getPos() : this._transedPoints;
        this.transformQuad(x, y, width || tex.width, height || tex.height, this._italicDeg, m || this._curMat, ops);
        if (this.drawTexAlign) {
            var round = Math.round;
            ops[0] = round(ops[0]);
            ops[1] = round(ops[1]);
            ops[2] = round(ops[2]);
            ops[3] = round(ops[3]);
            ops[4] = round(ops[4]);
            ops[5] = round(ops[5]);
            ops[6] = round(ops[6]);
            ops[7] = round(ops[7]);
            this.drawTexAlign = false;
        }
        var rgba = this._mixRGBandAlpha(0xffffffff, this._shader2D.ALPHA * alpha);
        if (lastRender) {
            this._charSubmitCache.add(this, tex, imgid, ops, uv, rgba);
            return true;
        }
        this._drawCount++;
        var sameKey = imgid >= 0 && preKey.submitType === SubmitBase.KEY_DRAWTEXTURE && preKey.other === imgid;
        sameKey && (sameKey = sameKey && this.isSameClipInfo(submit));
        this._lastTex = tex;
        if (mesh.vertNum + 4 > Context._MAXVERTNUM) {
            mesh = this._mesh = MeshQuadTexture.getAMesh(this.isMain);
            this.meshlist.push(mesh);
            sameKey = false;
        }
        {
            mesh.addQuad(ops, uv, rgba, true);
            if (!sameKey) {
                this._submits[this._submits._length++] = this._curSubmit = submit = SubmitTexture.create(this, mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
                submit.shaderValue.textureHost = tex;
                submit._key.other = imgid;
                this._copyClipInfo(submit, this._globalClipMatrix);
            }
            submit._numEle += 6;
            mesh.indexNum += 6;
            mesh.vertNum += 4;
            return true;
        }
        return false;
    }
    transform4Points(a, m, out) {
        var tx = m.tx;
        var ty = m.ty;
        var ma = m.a;
        var mb = m.b;
        var mc = m.c;
        var md = m.d;
        var a0 = a[0];
        var a1 = a[1];
        var a2 = a[2];
        var a3 = a[3];
        var a4 = a[4];
        var a5 = a[5];
        var a6 = a[6];
        var a7 = a[7];
        if (m._bTransform) {
            out[0] = a0 * ma + a1 * mc + tx;
            out[1] = a0 * mb + a1 * md + ty;
            out[2] = a2 * ma + a3 * mc + tx;
            out[3] = a2 * mb + a3 * md + ty;
            out[4] = a4 * ma + a5 * mc + tx;
            out[5] = a4 * mb + a5 * md + ty;
            out[6] = a6 * ma + a7 * mc + tx;
            out[7] = a6 * mb + a7 * md + ty;
        }
        else {
            out[0] = a0 + tx;
            out[1] = a1 + ty;
            out[2] = a2 + tx;
            out[3] = a3 + ty;
            out[4] = a4 + tx;
            out[5] = a5 + ty;
            out[6] = a6 + tx;
            out[7] = a7 + ty;
        }
    }
    clipedOff(pt) {
        if (this._clipRect.width <= 0 || this._clipRect.height <= 0)
            return true;
        return false;
    }
    transformQuad(x, y, w, h, italicDeg, m, out) {
        var xoff = 0;
        if (italicDeg != 0) {
            xoff = Math.tan(italicDeg * Math.PI / 180) * h;
        }
        var maxx = x + w;
        var maxy = y + h;
        var tx = m.tx;
        var ty = m.ty;
        var ma = m.a;
        var mb = m.b;
        var mc = m.c;
        var md = m.d;
        var a0 = x + xoff;
        var a1 = y;
        var a2 = maxx + xoff;
        var a3 = y;
        var a4 = maxx;
        var a5 = maxy;
        var a6 = x;
        var a7 = maxy;
        if (m._bTransform) {
            out[0] = a0 * ma + a1 * mc + tx;
            out[1] = a0 * mb + a1 * md + ty;
            out[2] = a2 * ma + a3 * mc + tx;
            out[3] = a2 * mb + a3 * md + ty;
            out[4] = a4 * ma + a5 * mc + tx;
            out[5] = a4 * mb + a5 * md + ty;
            out[6] = a6 * ma + a7 * mc + tx;
            out[7] = a6 * mb + a7 * md + ty;
        }
        else {
            out[0] = a0 + tx;
            out[1] = a1 + ty;
            out[2] = a2 + tx;
            out[3] = a3 + ty;
            out[4] = a4 + tx;
            out[5] = a5 + ty;
            out[6] = a6 + tx;
            out[7] = a7 + ty;
        }
    }
    pushRT() {
        this.addRenderObject(SubmitCMD.create(null, RenderTexture2D.pushRT, this));
    }
    popRT() {
        this.addRenderObject(SubmitCMD.create(null, RenderTexture2D.popRT, this));
        this.breakNextMerge();
    }
    useRT(rt) {
        function _use(rt) {
            if (!rt) {
                throw 'error useRT';
            }
            else {
                rt.start();
                rt.clear(0, 0, 0, 0);
            }
        }
        this.addRenderObject(SubmitCMD.create([rt], _use, this));
        this.breakNextMerge();
    }
    RTRestore(rt) {
        function _restore(rt) {
            rt.restore();
        }
        this.addRenderObject(SubmitCMD.create([rt], _restore, this));
        this.breakNextMerge();
    }
    breakNextMerge() {
        this._curSubmit = SubmitBase.RENDERBASE;
    }
    _repaintSprite() {
        this.sprite && this.sprite.repaint();
    }
    drawTextureWithTransform(tex, x, y, width, height, transform, tx, ty, alpha, blendMode, colorfilter = null, uv) {
        var oldcomp = null;
        var curMat = this._curMat;
        if (blendMode) {
            oldcomp = this.globalCompositeOperation;
            this.globalCompositeOperation = blendMode;
        }
        var oldColorFilter = this._colorFiler;
        if (colorfilter) {
            this.setColorFilter(colorfilter);
        }
        if (!transform) {
            this._drawTextureM(tex, x + tx, y + ty, width, height, curMat, alpha, uv);
            if (blendMode) {
                this.globalCompositeOperation = oldcomp;
            }
            if (colorfilter) {
                this.setColorFilter(oldColorFilter);
            }
            return;
        }
        var tmpMat = this._tmpMatrix;
        tmpMat.a = transform.a;
        tmpMat.b = transform.b;
        tmpMat.c = transform.c;
        tmpMat.d = transform.d;
        tmpMat.tx = transform.tx + tx;
        tmpMat.ty = transform.ty + ty;
        tmpMat._bTransform = transform._bTransform;
        if (transform && curMat._bTransform) {
            Matrix.mul(tmpMat, curMat, tmpMat);
            transform = tmpMat;
            transform._bTransform = true;
        }
        else {
            tmpMat.tx += curMat.tx;
            tmpMat.ty += curMat.ty;
            transform = tmpMat;
        }
        this._drawTextureM(tex, x, y, width, height, transform, alpha, uv);
        if (blendMode) {
            this.globalCompositeOperation = oldcomp;
        }
        if (colorfilter) {
            this.setColorFilter(oldColorFilter);
        }
    }
    _flushToTarget(context, target) {
        RenderState2D.worldScissorTest = false;
        var gl = LayaGL.instance;
        gl.disable(gl.SCISSOR_TEST);
        var preAlpha = RenderState2D.worldAlpha;
        var preMatrix4 = RenderState2D.worldMatrix4;
        var preMatrix = RenderState2D.worldMatrix;
        var preShaderDefines = RenderState2D.worldShaderDefines;
        RenderState2D.worldMatrix = Matrix.EMPTY;
        RenderState2D.restoreTempArray();
        RenderState2D.worldMatrix4 = RenderState2D.TEMPMAT4_ARRAY;
        RenderState2D.worldAlpha = 1;
        BaseShader.activeShader = null;
        target.start();
        if (context._submits._length > 0)
            target.clear(0, 0, 0, 0);
        context._curSubmit = SubmitBase.RENDERBASE;
        context.flush();
        context.clear();
        target.restore();
        context._curSubmit = SubmitBase.RENDERBASE;
        BaseShader.activeShader = null;
        RenderState2D.worldAlpha = preAlpha;
        RenderState2D.worldMatrix4 = preMatrix4;
        RenderState2D.worldMatrix = preMatrix;
    }
    drawCanvas(canvas, x, y, width, height) {
        if (!canvas)
            return;
        var src = canvas.context;
        var submit;
        if (src._targets) {
            if (src._submits._length > 0) {
                submit = SubmitCMD.create([src, src._targets], this._flushToTarget, this);
                this._submits[this._submits._length++] = submit;
            }
            this._drawRenderTexture(src._targets, x, y, width, height, null, 1.0, RenderTexture2D.flipyuv);
            this._curSubmit = SubmitBase.RENDERBASE;
        }
        else {
            var canv = canvas;
            if (canv.touches) {
                canv.touches.forEach(function (v) { v.touch(); });
            }
            submit = SubmitCanvas.create(canvas, this._shader2D.ALPHA, this._shader2D.filters);
            this._submits[this._submits._length++] = submit;
            submit._key.clear();
            var mat = submit._matrix;
            this._curMat.copyTo(mat);
            var tx = mat.tx, ty = mat.ty;
            mat.tx = mat.ty = 0;
            mat.transformPoint(Point.TEMP.setTo(x, y));
            mat.translate(Point.TEMP.x + tx, Point.TEMP.y + ty);
            Matrix.mul(canv.invMat, mat, mat);
            this._curSubmit = SubmitBase.RENDERBASE;
        }
    }
    drawTarget(rt, x, y, width, height, m, shaderValue, uv = null, blend = -1) {
        this._drawCount++;
        var rgba = 0xffffffff;
        if (this._mesh.vertNum + 4 > Context._MAXVERTNUM) {
            this._mesh = MeshQuadTexture.getAMesh(this.isMain);
            this.meshlist.push(this._mesh);
        }
        this.transformQuad(x, y, width, height, 0, m || this._curMat, this._transedPoints);
        if (!this.clipedOff(this._transedPoints)) {
            this._mesh.addQuad(this._transedPoints, uv || Texture.DEF_UV, 0xffffffff, true);
            var submit = this._curSubmit = SubmitTarget.create(this, this._mesh, shaderValue, rt);
            submit.blendType = (blend == -1) ? this._nBlendType : blend;
            this._copyClipInfo(submit, this._globalClipMatrix);
            submit._numEle = 6;
            this._mesh.indexNum += 6;
            this._mesh.vertNum += 4;
            this._submits[this._submits._length++] = submit;
            this._curSubmit = SubmitBase.RENDERBASE;
            return true;
        }
        this._curSubmit = SubmitBase.RENDERBASE;
        return false;
    }
    drawTriangles(tex, x, y, vertices, uvs, indices, matrix, alpha, color, blendMode) {
        if (!tex._getSource()) {
            if (this.sprite) {
                ILaya.systemTimer.callLater(this, this._repaintSprite);
            }
            return;
        }
        this._drawCount++;
        var tmpMat = this._tmpMatrix;
        var triMesh = this._triangleMesh;
        var oldColorFilter = null;
        var needRestorFilter = false;
        if (color) {
            oldColorFilter = this._colorFiler;
            this._colorFiler = color;
            this._curSubmit = SubmitBase.RENDERBASE;
            needRestorFilter = oldColorFilter != color;
        }
        var webGLImg = tex.bitmap;
        var preKey = this._curSubmit._key;
        var sameKey = preKey.submitType === SubmitBase.KEY_TRIANGLES && preKey.other === webGLImg.id && preKey.blendShader == this._nBlendType;
        if (triMesh.vertNum + vertices.length / 2 > Context._MAXVERTNUM) {
            triMesh = this._triangleMesh = MeshTexture.getAMesh(this.isMain);
            this.meshlist.push(triMesh);
            sameKey = false;
        }
        if (!sameKey) {
            var submit = this._curSubmit = SubmitTexture.create(this, triMesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
            submit.shaderValue.textureHost = tex;
            submit._renderType = SubmitBase.TYPE_TEXTURE;
            submit._key.submitType = SubmitBase.KEY_TRIANGLES;
            submit._key.other = webGLImg.id;
            this._copyClipInfo(submit, this._globalClipMatrix);
            this._submits[this._submits._length++] = submit;
        }
        var rgba = this._mixRGBandAlpha(0xffffffff, this._shader2D.ALPHA * alpha);
        if (!this._drawTriUseAbsMatrix) {
            if (!matrix) {
                tmpMat.a = 1;
                tmpMat.b = 0;
                tmpMat.c = 0;
                tmpMat.d = 1;
                tmpMat.tx = x;
                tmpMat.ty = y;
            }
            else {
                tmpMat.a = matrix.a;
                tmpMat.b = matrix.b;
                tmpMat.c = matrix.c;
                tmpMat.d = matrix.d;
                tmpMat.tx = matrix.tx + x;
                tmpMat.ty = matrix.ty + y;
            }
            Matrix.mul(tmpMat, this._curMat, tmpMat);
            triMesh.addData(vertices, uvs, indices, tmpMat, rgba);
        }
        else {
            triMesh.addData(vertices, uvs, indices, matrix, rgba);
        }
        this._curSubmit._numEle += indices.length;
        if (needRestorFilter) {
            this._colorFiler = oldColorFilter;
            this._curSubmit = SubmitBase.RENDERBASE;
        }
    }
    transform(a, b, c, d, tx, ty) {
        SaveTransform.save(this);
        Matrix.mul(Matrix.TEMP.setTo(a, b, c, d, tx, ty), this._curMat, this._curMat);
        this._curMat._checkTransform();
    }
    _transformByMatrix(matrix, tx, ty) {
        matrix.setTranslate(tx, ty);
        Matrix.mul(matrix, this._curMat, this._curMat);
        matrix.setTranslate(0, 0);
        this._curMat._bTransform = true;
    }
    setTransformByMatrix(value) {
        value.copyTo(this._curMat);
    }
    rotate(angle) {
        SaveTransform.save(this);
        this._curMat.rotateEx(angle);
    }
    scale(scaleX, scaleY) {
        SaveTransform.save(this);
        this._curMat.scaleEx(scaleX, scaleY);
    }
    clipRect(x, y, width, height) {
        SaveClipRect.save(this);
        if (this._clipRect == Context.MAXCLIPRECT) {
            this._clipRect = new Rectangle(x, y, width, height);
        }
        else {
            this._clipRect.width = width;
            this._clipRect.height = height;
            this._clipRect.x = x;
            this._clipRect.y = y;
        }
        this._clipID_Gen++;
        this._clipID_Gen %= 10000;
        this._clipInfoID = this._clipID_Gen;
        var cm = this._globalClipMatrix;
        var minx = cm.tx;
        var miny = cm.ty;
        var maxx = minx + cm.a;
        var maxy = miny + cm.d;
        if (this._clipRect.width >= Context._MAXSIZE) {
            cm.a = cm.d = Context._MAXSIZE;
            cm.b = cm.c = cm.tx = cm.ty = 0;
        }
        else {
            if (this._curMat._bTransform) {
                cm.tx = this._clipRect.x * this._curMat.a + this._clipRect.y * this._curMat.c + this._curMat.tx;
                cm.ty = this._clipRect.x * this._curMat.b + this._clipRect.y * this._curMat.d + this._curMat.ty;
                cm.a = this._clipRect.width * this._curMat.a;
                cm.b = this._clipRect.width * this._curMat.b;
                cm.c = this._clipRect.height * this._curMat.c;
                cm.d = this._clipRect.height * this._curMat.d;
            }
            else {
                cm.tx = this._clipRect.x + this._curMat.tx;
                cm.ty = this._clipRect.y + this._curMat.ty;
                cm.a = this._clipRect.width;
                cm.b = cm.c = 0;
                cm.d = this._clipRect.height;
            }
            if (this._incache) {
                this._clipInCache = true;
            }
        }
        if (cm.a > 0 && cm.d > 0) {
            var cmaxx = cm.tx + cm.a;
            var cmaxy = cm.ty + cm.d;
            if (cmaxx <= minx || cmaxy <= miny || cm.tx >= maxx || cm.ty >= maxy) {
                cm.a = -0.1;
                cm.d = -0.1;
            }
            else {
                if (cm.tx < minx) {
                    cm.a -= (minx - cm.tx);
                    cm.tx = minx;
                }
                if (cmaxx > maxx) {
                    cm.a -= (cmaxx - maxx);
                }
                if (cm.ty < miny) {
                    cm.d -= (miny - cm.ty);
                    cm.ty = miny;
                }
                if (cmaxy > maxy) {
                    cm.d -= (cmaxy - maxy);
                }
                if (cm.a <= 0)
                    cm.a = -0.1;
                if (cm.d <= 0)
                    cm.d = -0.1;
            }
        }
    }
    drawMesh(x, y, ib, vb, numElement, mat, shader, shaderValues, startIndex = 0) {
        ;
    }
    addRenderObject(o) {
        this._submits[this._submits._length++] = o;
    }
    submitElement(start, end) {
        var mainCtx = this.isMain;
        var renderList = this._submits;
        var ret = renderList._length;
        end < 0 && (end = renderList._length);
        var submit = SubmitBase.RENDERBASE;
        while (start < end) {
            this._renderNextSubmitIndex = start + 1;
            if (renderList[start] === SubmitBase.RENDERBASE) {
                start++;
                continue;
            }
            SubmitBase.preRender = submit;
            submit = renderList[start];
            start += submit.renderSubmit();
        }
        return ret;
    }
    flush() {
        this._clipID_Gen = 0;
        var ret = this.submitElement(0, this._submits._length);
        this._path && this._path.reset();
        SkinMeshBuffer.instance && SkinMeshBuffer.getInstance().reset();
        this._curSubmit = SubmitBase.RENDERBASE;
        for (var i = 0, sz = this.meshlist.length; i < sz; i++) {
            var curm = this.meshlist[i];
            curm.canReuse ? (curm.releaseMesh()) : (curm.destroy());
        }
        this.meshlist.length = 0;
        this._mesh = MeshQuadTexture.getAMesh(this.isMain);
        this._pathMesh = MeshVG.getAMesh(this.isMain);
        this._triangleMesh = MeshTexture.getAMesh(this.isMain);
        this.meshlist.push(this._mesh, this._pathMesh, this._triangleMesh);
        this._flushCnt++;
        if (this._flushCnt % 60 == 0 && this.isMain) {
            if (TextRender.textRenderInst) {
                TextRender.textRenderInst.GC();
            }
        }
        return ret;
    }
    beginPath(convex = false) {
        var tPath = this._getPath();
        tPath.beginPath(convex);
    }
    closePath() {
        this._path.closePath();
    }
    addPath(points, close, convex, dx, dy) {
        var ci = 0;
        for (var i = 0, sz = points.length / 2; i < sz; i++) {
            var x1 = points[ci] + dx, y1 = points[ci + 1] + dy;
            points[ci] = x1;
            points[ci + 1] = y1;
            ci += 2;
        }
        this._getPath().push(points, convex);
    }
    fill() {
        var m = this._curMat;
        var tPath = this._getPath();
        var submit = this._curSubmit;
        var sameKey = (submit._key.submitType === SubmitBase.KEY_VG && submit._key.blendShader === this._nBlendType);
        sameKey && (sameKey = sameKey && this.isSameClipInfo(submit));
        if (!sameKey) {
            this._curSubmit = this.addVGSubmit(this._pathMesh);
        }
        var rgba = this.mixRGBandAlpha(this.fillStyle.toInt());
        var curEleNum = 0;
        var idx;
        for (var i = 0, sz = tPath.paths.length; i < sz; i++) {
            var p = tPath.paths[i];
            var vertNum = p.path.length / 2;
            if (vertNum < 3 || (vertNum == 3 && !p.convex))
                continue;
            var cpath = p.path.concat();
            var pi = 0;
            var xp, yp;
            var _x, _y;
            if (m._bTransform) {
                for (pi = 0; pi < vertNum; pi++) {
                    xp = pi << 1;
                    yp = xp + 1;
                    _x = cpath[xp];
                    _y = cpath[yp];
                    cpath[xp] = m.a * _x + m.c * _y + m.tx;
                    cpath[yp] = m.b * _x + m.d * _y + m.ty;
                }
            }
            else {
                for (pi = 0; pi < vertNum; pi++) {
                    xp = pi << 1;
                    yp = xp + 1;
                    _x = cpath[xp];
                    _y = cpath[yp];
                    cpath[xp] = _x + m.tx;
                    cpath[yp] = _y + m.ty;
                }
            }
            if (this._pathMesh.vertNum + vertNum > Context._MAXVERTNUM) {
                this._curSubmit._numEle += curEleNum;
                curEleNum = 0;
                this._pathMesh = MeshVG.getAMesh(this.isMain);
                this._curSubmit = this.addVGSubmit(this._pathMesh);
            }
            var curvert = this._pathMesh.vertNum;
            if (p.convex) {
                var faceNum = vertNum - 2;
                idx = new Array(faceNum * 3);
                var idxpos = 0;
                for (var fi = 0; fi < faceNum; fi++) {
                    idx[idxpos++] = curvert;
                    idx[idxpos++] = fi + 1 + curvert;
                    idx[idxpos++] = fi + 2 + curvert;
                }
            }
            else {
                idx = Earcut.earcut(cpath, null, 2);
                if (curvert > 0) {
                    for (var ii = 0; ii < idx.length; ii++) {
                        idx[ii] += curvert;
                    }
                }
            }
            this._pathMesh.addVertAndIBToMesh(this, cpath, rgba, idx);
            curEleNum += idx.length;
        }
        this._curSubmit._numEle += curEleNum;
    }
    addVGSubmit(mesh) {
        var submit = Submit.createShape(this, mesh, 0, Value2D.create(ShaderDefines2D.PRIMITIVE, 0));
        submit._key.submitType = SubmitBase.KEY_VG;
        this._submits[this._submits._length++] = submit;
        this._copyClipInfo(submit, this._globalClipMatrix);
        return submit;
    }
    stroke() {
        if (this.lineWidth > 0) {
            var rgba = this.mixRGBandAlpha(this.strokeStyle._color.numColor);
            var tPath = this._getPath();
            var submit = this._curSubmit;
            var sameKey = (submit._key.submitType === SubmitBase.KEY_VG && submit._key.blendShader === this._nBlendType);
            sameKey && (sameKey = sameKey && this.isSameClipInfo(submit));
            if (!sameKey) {
                this._curSubmit = this.addVGSubmit(this._pathMesh);
            }
            var curEleNum = 0;
            for (var i = 0, sz = tPath.paths.length; i < sz; i++) {
                var p = tPath.paths[i];
                if (p.path.length <= 0)
                    continue;
                var idx = [];
                var vertex = [];
                var maxVertexNum = p.path.length * 2;
                if (maxVertexNum < 2)
                    continue;
                if (this._pathMesh.vertNum + maxVertexNum > Context._MAXVERTNUM) {
                    this._curSubmit._numEle += curEleNum;
                    curEleNum = 0;
                    this._pathMesh = MeshVG.getAMesh(this.isMain);
                    this.meshlist.push(this._pathMesh);
                    this._curSubmit = this.addVGSubmit(this._pathMesh);
                }
                BasePoly.createLine2(p.path, idx, this.lineWidth, this._pathMesh.vertNum, vertex, p.loop);
                var ptnum = vertex.length / 2;
                var m = this._curMat;
                var pi = 0;
                var xp, yp;
                var _x, _y;
                if (m._bTransform) {
                    for (pi = 0; pi < ptnum; pi++) {
                        xp = pi << 1;
                        yp = xp + 1;
                        _x = vertex[xp];
                        _y = vertex[yp];
                        vertex[xp] = m.a * _x + m.c * _y + m.tx;
                        vertex[yp] = m.b * _x + m.d * _y + m.ty;
                    }
                }
                else {
                    for (pi = 0; pi < ptnum; pi++) {
                        xp = pi << 1;
                        yp = xp + 1;
                        _x = vertex[xp];
                        _y = vertex[yp];
                        vertex[xp] = _x + m.tx;
                        vertex[yp] = _y + m.ty;
                    }
                }
                this._pathMesh.addVertAndIBToMesh(this, vertex, rgba, idx);
                curEleNum += idx.length;
            }
            this._curSubmit._numEle += curEleNum;
        }
    }
    moveTo(x, y) {
        var tPath = this._getPath();
        tPath.newPath();
        tPath._lastOriX = x;
        tPath._lastOriY = y;
        tPath.addPoint(x, y);
    }
    lineTo(x, y) {
        var tPath = this._getPath();
        if (Math.abs(x - tPath._lastOriX) < 1e-3 && Math.abs(y - tPath._lastOriY) < 1e-3)
            return;
        tPath._lastOriX = x;
        tPath._lastOriY = y;
        tPath.addPoint(x, y);
    }
    arcTo(x1, y1, x2, y2, r) {
        var i = 0;
        var x = 0, y = 0;
        var dx = this._path._lastOriX - x1;
        var dy = this._path._lastOriY - y1;
        var len1 = Math.sqrt(dx * dx + dy * dy);
        if (len1 <= 0.000001) {
            return;
        }
        var ndx = dx / len1;
        var ndy = dy / len1;
        var dx2 = x2 - x1;
        var dy2 = y2 - y1;
        var len22 = dx2 * dx2 + dy2 * dy2;
        var len2 = Math.sqrt(len22);
        if (len2 <= 0.000001) {
            return;
        }
        var ndx2 = dx2 / len2;
        var ndy2 = dy2 / len2;
        var odx = ndx + ndx2;
        var ody = ndy + ndy2;
        var olen = Math.sqrt(odx * odx + ody * ody);
        if (olen <= 0.000001) {
            return;
        }
        var nOdx = odx / olen;
        var nOdy = ody / olen;
        var alpha = Math.acos(nOdx * ndx + nOdy * ndy);
        var halfAng = Math.PI / 2 - alpha;
        len1 = r / Math.tan(halfAng);
        var ptx1 = len1 * ndx + x1;
        var pty1 = len1 * ndy + y1;
        var orilen = Math.sqrt(len1 * len1 + r * r);
        var orix = x1 + nOdx * orilen;
        var oriy = y1 + nOdy * orilen;
        var ptx2 = len1 * ndx2 + x1;
        var pty2 = len1 * ndy2 + y1;
        var dir = ndx * ndy2 - ndy * ndx2;
        var fChgAng = 0;
        var sinx = 0.0;
        var cosx = 0.0;
        if (dir >= 0) {
            fChgAng = halfAng * 2;
            var fda = fChgAng / Context.SEGNUM;
            sinx = Math.sin(fda);
            cosx = Math.cos(fda);
        }
        else {
            fChgAng = -halfAng * 2;
            fda = fChgAng / Context.SEGNUM;
            sinx = Math.sin(fda);
            cosx = Math.cos(fda);
        }
        var lastx = this._path._lastOriX, lasty = this._path._lastOriY;
        var _x1 = ptx1, _y1 = pty1;
        if (Math.abs(_x1 - this._path._lastOriX) > 0.1 || Math.abs(_y1 - this._path._lastOriY) > 0.1) {
            x = _x1;
            y = _y1;
            lastx = _x1;
            lasty = _y1;
            this._path.addPoint(x, y);
        }
        var cvx = ptx1 - orix;
        var cvy = pty1 - oriy;
        var tx = 0.0;
        var ty = 0.0;
        for (i = 0; i < Context.SEGNUM; i++) {
            var cx = cvx * cosx + cvy * sinx;
            var cy = -cvx * sinx + cvy * cosx;
            x = cx + orix;
            y = cy + oriy;
            if (Math.abs(lastx - x) > 0.1 || Math.abs(lasty - y) > 0.1) {
                this._path.addPoint(x, y);
                lastx = x;
                lasty = y;
            }
            cvx = cx;
            cvy = cy;
        }
    }
    arc(cx, cy, r, startAngle, endAngle, counterclockwise = false, b = true) {
        var a = 0, da = 0, hda = 0, kappa = 0;
        var dx = 0, dy = 0, x = 0, y = 0, tanx = 0, tany = 0;
        var px = 0, py = 0, ptanx = 0, ptany = 0;
        var i, ndivs, nvals;
        da = endAngle - startAngle;
        if (!counterclockwise) {
            if (Math.abs(da) >= Math.PI * 2) {
                da = Math.PI * 2;
            }
            else {
                while (da < 0.0) {
                    da += Math.PI * 2;
                }
            }
        }
        else {
            if (Math.abs(da) >= Math.PI * 2) {
                da = -Math.PI * 2;
            }
            else {
                while (da > 0.0) {
                    da -= Math.PI * 2;
                }
            }
        }
        var sx = this.getMatScaleX();
        var sy = this.getMatScaleY();
        var sr = r * (sx > sy ? sx : sy);
        var cl = 2 * Math.PI * sr;
        ndivs = (Math.max(cl / 10, 10)) | 0;
        hda = (da / ndivs) / 2.0;
        kappa = Math.abs(4 / 3 * (1 - Math.cos(hda)) / Math.sin(hda));
        if (counterclockwise)
            kappa = -kappa;
        nvals = 0;
        var tPath = this._getPath();
        var _x1, _y1;
        for (i = 0; i <= ndivs; i++) {
            a = startAngle + da * (i / ndivs);
            dx = Math.cos(a);
            dy = Math.sin(a);
            x = cx + dx * r;
            y = cy + dy * r;
            if (x != this._path._lastOriX || y != this._path._lastOriY) {
                tPath.addPoint(x, y);
            }
        }
        dx = Math.cos(endAngle);
        dy = Math.sin(endAngle);
        x = cx + dx * r;
        y = cy + dy * r;
        if (x != this._path._lastOriX || y != this._path._lastOriY) {
            tPath.addPoint(x, y);
        }
    }
    quadraticCurveTo(cpx, cpy, x, y) {
        var tBezier = Bezier.I;
        var tResultArray = [];
        var tArray = tBezier.getBezierPoints([this._path._lastOriX, this._path._lastOriY, cpx, cpy, x, y], 30, 2);
        for (var i = 0, n = tArray.length / 2; i < n; i++) {
            this.lineTo(tArray[i * 2], tArray[i * 2 + 1]);
        }
        this.lineTo(x, y);
    }
    mixRGBandAlpha(color) {
        return this._mixRGBandAlpha(color, this._shader2D.ALPHA);
    }
    _mixRGBandAlpha(color, alpha) {
        if (alpha >= 1) {
            return color;
        }
        var a = ((color & 0xff000000) >>> 24);
        if (a != 0) {
            a *= alpha;
        }
        else {
            a = alpha * 255;
        }
        return (color & 0x00ffffff) | (a << 24);
    }
    strokeRect(x, y, width, height, parameterLineWidth) {
        var tW = parameterLineWidth * 0.5;
        if (this.lineWidth > 0) {
            var rgba = this.mixRGBandAlpha(this.strokeStyle._color.numColor);
            var hw = this.lineWidth / 2;
            this._fillRect(x - hw, y - hw, width + this.lineWidth, this.lineWidth, rgba);
            this._fillRect(x - hw, y - hw + height, width + this.lineWidth, this.lineWidth, rgba);
            this._fillRect(x - hw, y + hw, this.lineWidth, height - this.lineWidth, rgba);
            this._fillRect(x - hw + width, y + hw, this.lineWidth, height - this.lineWidth, rgba);
        }
    }
    clip() {
    }
    drawParticle(x, y, pt) {
        pt.x = x;
        pt.y = y;
        this._submits[this._submits._length++] = pt;
    }
    _getPath() {
        return this._path || (this._path = new Path());
    }
    get canvas() {
        return this._canvas;
    }
    _fillTexture_h(tex, imgid, uv, oriw, orih, x, y, w) {
        var stx = x;
        var num = Math.floor(w / oriw);
        var left = w % oriw;
        for (var i = 0; i < num; i++) {
            this._inner_drawTexture(tex, imgid, stx, y, oriw, orih, this._curMat, uv, 1, false);
            stx += oriw;
        }
        if (left > 0) {
            var du = uv[2] - uv[0];
            var uvr = uv[0] + du * (left / oriw);
            var tuv = Context.tmpuv1;
            tuv[0] = uv[0];
            tuv[1] = uv[1];
            tuv[2] = uvr;
            tuv[3] = uv[3];
            tuv[4] = uvr;
            tuv[5] = uv[5];
            tuv[6] = uv[6];
            tuv[7] = uv[7];
            this._inner_drawTexture(tex, imgid, stx, y, left, orih, this._curMat, tuv, 1, false);
        }
    }
    _fillTexture_v(tex, imgid, uv, oriw, orih, x, y, h) {
        var sty = y;
        var num = Math.floor(h / orih);
        var left = h % orih;
        for (var i = 0; i < num; i++) {
            this._inner_drawTexture(tex, imgid, x, sty, oriw, orih, this._curMat, uv, 1, false);
            sty += orih;
        }
        if (left > 0) {
            var dv = uv[7] - uv[1];
            var uvb = uv[1] + dv * (left / orih);
            var tuv = Context.tmpuv1;
            tuv[0] = uv[0];
            tuv[1] = uv[1];
            tuv[2] = uv[2];
            tuv[3] = uv[3];
            tuv[4] = uv[4];
            tuv[5] = uvb;
            tuv[6] = uv[6];
            tuv[7] = uvb;
            this._inner_drawTexture(tex, imgid, x, sty, oriw, left, this._curMat, tuv, 1, false);
        }
    }
    drawTextureWithSizeGrid(tex, tx, ty, width, height, sizeGrid, gx, gy) {
        if (!tex._getSource())
            return;
        tx += gx;
        ty += gy;
        var uv = tex.uv, w = tex.bitmap.width, h = tex.bitmap.height;
        var top = sizeGrid[0];
        var left = sizeGrid[3];
        var d_top = top / h;
        var d_left = left / w;
        var right = sizeGrid[1];
        var bottom = sizeGrid[2];
        var d_right = right / w;
        var d_bottom = bottom / h;
        var repeat = sizeGrid[4];
        var needClip = false;
        if (width == w) {
            left = right = 0;
        }
        if (height == h) {
            top = bottom = 0;
        }
        if (left + right > width) {
            var clipWidth = width;
            needClip = true;
            width = left + right;
            this.save();
            this.clipRect(0 + tx, 0 + ty, clipWidth, height);
        }
        var imgid = tex.bitmap.id;
        var mat = this._curMat;
        var tuv = this._tempUV;
        var uvl = uv[0];
        var uvt = uv[1];
        var uvr = uv[4];
        var uvb = uv[5];
        var uvl_ = uvl;
        var uvt_ = uvt;
        var uvr_ = uvr;
        var uvb_ = uvb;
        if (left && top) {
            uvr_ = uvl + d_left;
            uvb_ = uvt + d_top;
            tuv[0] = uvl, tuv[1] = uvt, tuv[2] = uvr_, tuv[3] = uvt,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl, tuv[7] = uvb_;
            this._inner_drawTexture(tex, imgid, tx, ty, left, top, mat, tuv, 1, false);
        }
        if (right && top) {
            uvl_ = uvr - d_right;
            uvt_ = uvt;
            uvr_ = uvr;
            uvb_ = uvt + d_top;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            this._inner_drawTexture(tex, imgid, width - right + tx, 0 + ty, right, top, mat, tuv, 1, false);
        }
        if (left && bottom) {
            uvl_ = uvl;
            uvt_ = uvb - d_bottom;
            uvr_ = uvl + d_left;
            uvb_ = uvb;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            this._inner_drawTexture(tex, imgid, 0 + tx, height - bottom + ty, left, bottom, mat, tuv, 1, false);
        }
        if (right && bottom) {
            uvl_ = uvr - d_right;
            uvt_ = uvb - d_bottom;
            uvr_ = uvr;
            uvb_ = uvb;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            this._inner_drawTexture(tex, imgid, width - right + tx, height - bottom + ty, right, bottom, mat, tuv, 1, false);
        }
        if (top) {
            uvl_ = uvl + d_left;
            uvt_ = uvt;
            uvr_ = uvr - d_right;
            uvb_ = uvt + d_top;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            if (repeat) {
                this._fillTexture_h(tex, imgid, tuv, tex.width - left - right, top, left + tx, ty, width - left - right);
            }
            else {
                this._inner_drawTexture(tex, imgid, left + tx, ty, width - left - right, top, mat, tuv, 1, false);
            }
        }
        if (bottom) {
            uvl_ = uvl + d_left;
            uvt_ = uvb - d_bottom;
            uvr_ = uvr - d_right;
            uvb_ = uvb;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            if (repeat) {
                this._fillTexture_h(tex, imgid, tuv, tex.width - left - right, bottom, left + tx, height - bottom + ty, width - left - right);
            }
            else {
                this._inner_drawTexture(tex, imgid, left + tx, height - bottom + ty, width - left - right, bottom, mat, tuv, 1, false);
            }
        }
        if (left) {
            uvl_ = uvl;
            uvt_ = uvt + d_top;
            uvr_ = uvl + d_left;
            uvb_ = uvb - d_bottom;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            if (repeat) {
                this._fillTexture_v(tex, imgid, tuv, left, tex.height - top - bottom, tx, top + ty, height - top - bottom);
            }
            else {
                this._inner_drawTexture(tex, imgid, tx, top + ty, left, height - top - bottom, mat, tuv, 1, false);
            }
        }
        if (right) {
            uvl_ = uvr - d_right;
            uvt_ = uvt + d_top;
            uvr_ = uvr;
            uvb_ = uvb - d_bottom;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            if (repeat) {
                this._fillTexture_v(tex, imgid, tuv, right, tex.height - top - bottom, width - right + tx, top + ty, height - top - bottom);
            }
            else {
                this._inner_drawTexture(tex, imgid, width - right + tx, top + ty, right, height - top - bottom, mat, tuv, 1, false);
            }
        }
        uvl_ = uvl + d_left;
        uvt_ = uvt + d_top;
        uvr_ = uvr - d_right;
        uvb_ = uvb - d_bottom;
        tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
            tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
        if (repeat) {
            var tuvr = Context.tmpUVRect;
            tuvr[0] = uvl_;
            tuvr[1] = uvt_;
            tuvr[2] = uvr_ - uvl_;
            tuvr[3] = uvb_ - uvt_;
            this._fillTexture(tex, tex.width - left - right, tex.height - top - bottom, tuvr, left + tx, top + ty, width - left - right, height - top - bottom, 'repeat', 0, 0);
        }
        else {
            this._inner_drawTexture(tex, imgid, left + tx, top + ty, width - left - right, height - top - bottom, mat, tuv, 1, false);
        }
        if (needClip)
            this.restore();
    }
}
Context.ENUM_TEXTALIGN_DEFAULT = 0;
Context.ENUM_TEXTALIGN_CENTER = 1;
Context.ENUM_TEXTALIGN_RIGHT = 2;
Context._SUBMITVBSIZE = 32000;
Context._MAXSIZE = 99999999;
Context._MAXVERTNUM = 65535;
Context.MAXCLIPRECT = null;
Context._COUNT = 0;
Context.SEGNUM = 32;
Context._contextcount = 0;
Context.PI2 = 2 * Math.PI;
Context._textRender = null;
Context.tmpuv1 = [0, 0, 0, 0, 0, 0, 0, 0];
Context.tmpUV = [0, 0, 0, 0, 0, 0, 0, 0];
Context.tmpUVRect = [0, 0, 0, 0];
class ContextParams {
    constructor() {
        this.lineWidth = 1;
    }
    clear() {
        this.lineWidth = 1;
        this.textAlign = this.textBaseline = null;
    }
    make() {
        return this === ContextParams.DEFAULT ? new ContextParams() : this;
    }
}
