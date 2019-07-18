import { GraphicsBounds } from "./GraphicsBounds";
import { SpriteConst } from "./SpriteConst";
import { AlphaCmd } from "./cmd/AlphaCmd";
import { ClipRectCmd } from "./cmd/ClipRectCmd";
import { Draw9GridTexture } from "./cmd/Draw9GridTexture";
import { DrawCircleCmd } from "./cmd/DrawCircleCmd";
import { DrawCurvesCmd } from "./cmd/DrawCurvesCmd";
import { DrawImageCmd } from "./cmd/DrawImageCmd";
import { DrawLineCmd } from "./cmd/DrawLineCmd";
import { DrawLinesCmd } from "./cmd/DrawLinesCmd";
import { DrawPathCmd } from "./cmd/DrawPathCmd";
import { DrawPieCmd } from "./cmd/DrawPieCmd";
import { DrawPolyCmd } from "./cmd/DrawPolyCmd";
import { DrawRectCmd } from "./cmd/DrawRectCmd";
import { DrawTextureCmd } from "./cmd/DrawTextureCmd";
import { DrawTexturesCmd } from "./cmd/DrawTexturesCmd";
import { DrawTrianglesCmd } from "./cmd/DrawTrianglesCmd";
import { FillBorderTextCmd } from "./cmd/FillBorderTextCmd";
import { FillBorderWordsCmd } from "./cmd/FillBorderWordsCmd";
import { FillTextCmd } from "./cmd/FillTextCmd";
import { FillTextureCmd } from "./cmd/FillTextureCmd";
import { FillWordsCmd } from "./cmd/FillWordsCmd";
import { RestoreCmd } from "./cmd/RestoreCmd";
import { RotateCmd } from "./cmd/RotateCmd";
import { SaveCmd } from "./cmd/SaveCmd";
import { ScaleCmd } from "./cmd/ScaleCmd";
import { StrokeTextCmd } from "./cmd/StrokeTextCmd";
import { TransformCmd } from "./cmd/TransformCmd";
import { TranslateCmd } from "./cmd/TranslateCmd";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Render } from "../renders/Render";
import { Texture } from "../resource/Texture";
import { Utils } from "../utils/Utils";
import { VectorGraphManager } from "../utils/VectorGraphManager";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Graphics {
    constructor() {
        this._sp = null;
        this._one = null;
        this._render = this._renderEmpty;
        this._cmds = null;
        this._vectorgraphArray = null;
        this._graphicBounds = null;
        this.autoDestroy = false;
        this._createData();
    }
    _createData() {
    }
    _clearData() {
    }
    _destroyData() {
    }
    destroy() {
        this.clear(true);
        if (this._graphicBounds)
            this._graphicBounds.destroy();
        this._graphicBounds = null;
        this._vectorgraphArray = null;
        if (this._sp) {
            this._sp._renderType = 0;
            this._sp._setRenderType(0);
            this._sp = null;
        }
        this._destroyData();
    }
    clear(recoverCmds = true) {
        if (recoverCmds) {
            var tCmd = this._one;
            if (this._cmds) {
                var i, len = this._cmds.length;
                for (i = 0; i < len; i++) {
                    tCmd = this._cmds[i];
                    tCmd.recover();
                }
                this._cmds.length = 0;
            }
            else if (tCmd) {
                tCmd.recover();
            }
        }
        else {
            this._cmds = null;
        }
        this._one = null;
        this._render = this._renderEmpty;
        this._clearData();
        if (this._sp) {
            this._sp._renderType &= ~SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }
        this._repaint();
        if (this._vectorgraphArray) {
            for (i = 0, len = this._vectorgraphArray.length; i < len; i++) {
                VectorGraphManager.getInstance().deleteShape(this._vectorgraphArray[i]);
            }
            this._vectorgraphArray.length = 0;
        }
    }
    _clearBoundsCache() {
        if (this._graphicBounds)
            this._graphicBounds.reset();
    }
    _initGraphicBounds() {
        if (!this._graphicBounds) {
            this._graphicBounds = GraphicsBounds.create();
            this._graphicBounds._graphics = this;
        }
    }
    _repaint() {
        this._clearBoundsCache();
        this._sp && this._sp.repaint();
    }
    _isOnlyOne() {
        return !this._cmds || this._cmds.length === 0;
    }
    get cmds() {
        return this._cmds;
    }
    set cmds(value) {
        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }
        this._cmds = value;
        this._render = this._renderAll;
        this._repaint();
    }
    getBounds(realSize = false) {
        this._initGraphicBounds();
        return this._graphicBounds.getBounds(realSize);
    }
    getBoundPoints(realSize = false) {
        this._initGraphicBounds();
        return this._graphicBounds.getBoundPoints(realSize);
    }
    drawImage(texture, x = 0, y = 0, width = 0, height = 0) {
        if (!texture)
            return null;
        if (!width)
            width = texture.sourceWidth;
        if (!height)
            height = texture.sourceHeight;
        if (texture.getIsReady()) {
            var wRate = width / texture.sourceWidth;
            var hRate = height / texture.sourceHeight;
            width = texture.width * wRate;
            height = texture.height * hRate;
            if (width <= 0 || height <= 0)
                return null;
            x += texture.offsetX * wRate;
            y += texture.offsetY * hRate;
        }
        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }
        var args = DrawImageCmd.create.call(this, texture, x, y, width, height);
        if (this._one == null) {
            this._one = args;
            this._render = this._renderOneImg;
        }
        else {
            this._saveToCmd(null, args);
        }
        this._repaint();
        return args;
    }
    drawTexture(texture, x = 0, y = 0, width = 0, height = 0, matrix = null, alpha = 1, color = null, blendMode = null, uv) {
        if (!texture || alpha < 0.01)
            return null;
        if (!texture.getIsReady())
            return null;
        if (!width)
            width = texture.sourceWidth;
        if (!height)
            height = texture.sourceHeight;
        if (texture.getIsReady()) {
            var wRate = width / texture.sourceWidth;
            var hRate = height / texture.sourceHeight;
            width = texture.width * wRate;
            height = texture.height * hRate;
            if (width <= 0 || height <= 0)
                return null;
            x += texture.offsetX * wRate;
            y += texture.offsetY * hRate;
        }
        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }
        var args = DrawTextureCmd.create.call(this, texture, x, y, width, height, matrix, alpha, color, blendMode, uv);
        this._repaint();
        return this._saveToCmd(null, args);
    }
    drawTextures(texture, pos) {
        if (!texture)
            return null;
        return this._saveToCmd(Render._context.drawTextures, DrawTexturesCmd.create.call(this, texture, pos));
    }
    drawTriangles(texture, x, y, vertices, uvs, indices, matrix = null, alpha = 1, color = null, blendMode = null) {
        return this._saveToCmd(Render._context.drawTriangles, DrawTrianglesCmd.create.call(this, texture, x, y, vertices, uvs, indices, matrix, alpha, color, blendMode));
    }
    fillTexture(texture, x, y, width = 0, height = 0, type = "repeat", offset = null) {
        if (texture && texture.getIsReady())
            return this._saveToCmd(Render._context._fillTexture, FillTextureCmd.create.call(this, texture, x, y, width, height, type, offset || Point.EMPTY, {}));
        else
            return null;
    }
    _saveToCmd(fun, args) {
        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }
        if (this._one == null) {
            this._one = args;
            this._render = this._renderOne;
        }
        else {
            this._render = this._renderAll;
            (this._cmds || (this._cmds = [])).length === 0 && this._cmds.push(this._one);
            this._cmds.push(args);
        }
        this._repaint();
        return args;
    }
    clipRect(x, y, width, height) {
        return this._saveToCmd(Render._context.clipRect, ClipRectCmd.create.call(this, x, y, width, height));
    }
    fillText(text, x, y, font, color, textAlign) {
        return this._saveToCmd(Render._context.fillText, FillTextCmd.create.call(this, text, x, y, font || ILaya.Text.defaultFontStr(), color, textAlign));
    }
    fillBorderText(text, x, y, font, fillColor, borderColor, lineWidth, textAlign) {
        return this._saveToCmd(Render._context.fillBorderText, FillBorderTextCmd.create.call(this, text, x, y, font || ILaya.Text.defaultFontStr(), fillColor, borderColor, lineWidth, textAlign));
    }
    fillWords(words, x, y, font, color) {
        return this._saveToCmd(Render._context.fillWords, FillWordsCmd.create.call(this, words, x, y, font || ILaya.Text.defaultFontStr(), color));
    }
    fillBorderWords(words, x, y, font, fillColor, borderColor, lineWidth) {
        return this._saveToCmd(Render._context.fillBorderWords, FillBorderWordsCmd.create.call(this, words, x, y, font || ILaya.Text.defaultFontStr(), fillColor, borderColor, lineWidth));
    }
    strokeText(text, x, y, font, color, lineWidth, textAlign) {
        return this._saveToCmd(Render._context.fillBorderText, StrokeTextCmd.create.call(this, text, x, y, font || ILaya.Text.defaultFontStr(), null, color, lineWidth, textAlign));
    }
    alpha(alpha) {
        return this._saveToCmd(Render._context.alpha, AlphaCmd.create.call(this, alpha));
    }
    transform(matrix, pivotX = 0, pivotY = 0) {
        return this._saveToCmd(Render._context._transform, TransformCmd.create.call(this, matrix, pivotX, pivotY));
    }
    rotate(angle, pivotX = 0, pivotY = 0) {
        return this._saveToCmd(Render._context._rotate, RotateCmd.create.call(this, angle, pivotX, pivotY));
    }
    scale(scaleX, scaleY, pivotX = 0, pivotY = 0) {
        return this._saveToCmd(Render._context._scale, ScaleCmd.create.call(this, scaleX, scaleY, pivotX, pivotY));
    }
    translate(tx, ty) {
        return this._saveToCmd(Render._context.translate, TranslateCmd.create.call(this, tx, ty));
    }
    save() {
        return this._saveToCmd(Render._context._save, SaveCmd.create.call(this));
    }
    restore() {
        return this._saveToCmd(Render._context.restore, RestoreCmd.create.call(this));
    }
    replaceText(text) {
        this._repaint();
        var cmds = this._cmds;
        if (!cmds) {
            if (this._one && this._isTextCmd(this._one)) {
                this._one.text = text;
                return true;
            }
        }
        else {
            for (var i = cmds.length - 1; i > -1; i--) {
                if (this._isTextCmd(cmds[i])) {
                    cmds[i].text = text;
                    return true;
                }
            }
        }
        return false;
    }
    _isTextCmd(cmd) {
        var cmdID = cmd.cmdID;
        return cmdID == FillTextCmd.ID || cmdID == StrokeTextCmd.ID || cmdID == FillBorderTextCmd.ID;
    }
    replaceTextColor(color) {
        this._repaint();
        var cmds = this._cmds;
        if (!cmds) {
            if (this._one && this._isTextCmd(this._one)) {
                this._setTextCmdColor(this._one, color);
            }
        }
        else {
            for (var i = cmds.length - 1; i > -1; i--) {
                if (this._isTextCmd(cmds[i])) {
                    this._setTextCmdColor(cmds[i], color);
                }
            }
        }
    }
    _setTextCmdColor(cmdO, color) {
        var cmdID = cmdO.cmdID;
        switch (cmdID) {
            case FillTextCmd.ID:
            case StrokeTextCmd.ID:
                cmdO.color = color;
                break;
            case FillBorderTextCmd.ID:
            case FillBorderWordsCmd.ID:
            case FillBorderTextCmd.ID:
                cmdO.fillColor = color;
                break;
        }
    }
    loadImage(url, x = 0, y = 0, width = 0, height = 0, complete = null) {
        var tex = ILaya.Loader.getRes(url);
        if (!tex) {
            tex = new Texture();
            tex.load(url);
            ILaya.Loader.cacheRes(url, tex);
            tex.once(Event.READY, this, this.drawImage, [tex, x, y, width, height]);
        }
        else {
            if (!tex.getIsReady()) {
                tex.once(Event.READY, this, this.drawImage, [tex, x, y, width, height]);
            }
            else
                this.drawImage(tex, x, y, width, height);
        }
        if (complete != null) {
            tex.getIsReady() ? complete.call(this._sp) : tex.on(Event.READY, this._sp, complete);
        }
    }
    _renderEmpty(sprite, context, x, y) {
    }
    _renderAll(sprite, context, x, y) {
        var cmds = this._cmds;
        for (var i = 0, n = cmds.length; i < n; i++) {
            cmds[i].run(context, x, y);
        }
    }
    _renderOne(sprite, context, x, y) {
        context.sprite = sprite;
        this._one.run(context, x, y);
    }
    _renderOneImg(sprite, context, x, y) {
        context.sprite = sprite;
        this._one.run(context, x, y);
    }
    drawLine(fromX, fromY, toX, toY, lineColor, lineWidth = 1) {
        var offset = (lineWidth < 1 || lineWidth % 2 === 0) ? 0 : 0.5;
        return this._saveToCmd(Render._context._drawLine, DrawLineCmd.create.call(this, fromX + offset, fromY + offset, toX + offset, toY + offset, lineColor, lineWidth, 0));
    }
    drawLines(x, y, points, lineColor, lineWidth = 1) {
        if (!points || points.length < 4)
            return null;
        var offset = (lineWidth < 1 || lineWidth % 2 === 0) ? 0 : 0.5;
        return this._saveToCmd(Render._context._drawLines, DrawLinesCmd.create.call(this, x + offset, y + offset, points, lineColor, lineWidth, 0));
    }
    drawCurves(x, y, points, lineColor, lineWidth = 1) {
        return this._saveToCmd(Render._context.drawCurves, DrawCurvesCmd.create.call(this, x, y, points, lineColor, lineWidth));
    }
    drawRect(x, y, width, height, fillColor, lineColor = null, lineWidth = 1) {
        var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
        var lineOffset = lineColor ? lineWidth : 0;
        return this._saveToCmd(Render._context.drawRect, DrawRectCmd.create.call(this, x + offset, y + offset, width - lineOffset, height - lineOffset, fillColor, lineColor, lineWidth));
    }
    drawCircle(x, y, radius, fillColor, lineColor = null, lineWidth = 1) {
        var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
        return this._saveToCmd(Render._context._drawCircle, DrawCircleCmd.create.call(this, x, y, radius - offset, fillColor, lineColor, lineWidth, 0));
    }
    drawPie(x, y, radius, startAngle, endAngle, fillColor, lineColor = null, lineWidth = 1) {
        var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
        var lineOffset = lineColor ? lineWidth : 0;
        return this._saveToCmd(Render._context._drawPie, DrawPieCmd.create.call(this, x + offset, y + offset, radius - lineOffset, Utils.toRadian(startAngle), Utils.toRadian(endAngle), fillColor, lineColor, lineWidth, 0));
    }
    drawPoly(x, y, points, fillColor, lineColor = null, lineWidth = 1) {
        var tIsConvexPolygon = false;
        if (points.length > 6) {
            tIsConvexPolygon = false;
        }
        else {
            tIsConvexPolygon = true;
        }
        var offset = (lineWidth >= 1 && lineColor) ? (lineWidth % 2 === 0 ? 0 : 0.5) : 0;
        return this._saveToCmd(Render._context._drawPoly, DrawPolyCmd.create.call(this, x + offset, y + offset, points, fillColor, lineColor, lineWidth, tIsConvexPolygon, 0));
    }
    drawPath(x, y, paths, brush = null, pen = null) {
        return this._saveToCmd(Render._context._drawPath, DrawPathCmd.create.call(this, x, y, paths, brush, pen));
    }
    draw9Grid(texture, x = 0, y = 0, width = 0, height = 0, sizeGrid = null) {
        this._saveToCmd(null, Draw9GridTexture.create(texture, x, y, width, height, sizeGrid));
    }
}
ClassUtils.regClass("laya.display.Graphics", Graphics);
ClassUtils.regClass("Laya.Graphics", Graphics);
