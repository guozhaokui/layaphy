import { ICharRender } from "./ICharRender";
import { Browser } from "../../utils/Browser";
export class CharRender_Canvas extends ICharRender {
    constructor(maxw, maxh, scalefont = true, useImageData = true, showdbg = false) {
        super();
        this.ctx = null;
        this.lastScaleX = 1.0;
        this.lastScaleY = 1.0;
        this.needResetScale = false;
        this.maxTexW = 0;
        this.maxTexH = 0;
        this.scaleFontSize = true;
        this.showDbgInfo = false;
        this.supportImageData = true;
        this.maxTexW = maxw;
        this.maxTexH = maxh;
        this.scaleFontSize = scalefont;
        this.supportImageData = useImageData;
        this.showDbgInfo = showdbg;
        if (!CharRender_Canvas.canvas) {
            CharRender_Canvas.canvas = Browser.createElement('canvas');
            CharRender_Canvas.canvas.width = 1024;
            CharRender_Canvas.canvas.height = 512;
            CharRender_Canvas.canvas.style.left = "-10000px";
            CharRender_Canvas.canvas.style.position = "absolute";
            document.body.appendChild(CharRender_Canvas.canvas);
            ;
            this.ctx = CharRender_Canvas.canvas.getContext('2d');
        }
    }
    get canvasWidth() {
        return CharRender_Canvas.canvas.width;
    }
    set canvasWidth(w) {
        if (CharRender_Canvas.canvas.width == w)
            return;
        CharRender_Canvas.canvas.width = w;
        if (w > 2048) {
            console.warn("画文字设置的宽度太大，超过2048了");
        }
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.lastScaleX, this.lastScaleY);
    }
    getWidth(font, str) {
        if (!this.ctx)
            return 0;
        if (this.ctx._lastFont != font) {
            this.ctx.font = font;
            this.ctx._lastFont = font;
        }
        return this.ctx.measureText(str).width;
    }
    scale(sx, sy) {
        if (!this.supportImageData) {
            this.lastScaleX = sx;
            this.lastScaleY = sy;
            return;
        }
        if (this.lastScaleX != sx || this.lastScaleY != sy) {
            this.ctx.setTransform(sx, 0, 0, sy, 0, 0);
            this.lastScaleX = sx;
            this.lastScaleY = sy;
        }
    }
    getCharBmp(char, font, lineWidth, colStr, strokeColStr, cri, margin_left, margin_top, margin_right, margin_bottom, rect = null) {
        if (!this.supportImageData)
            return this.getCharCanvas(char, font, lineWidth, colStr, strokeColStr, cri, margin_left, margin_top, margin_right, margin_bottom);
        var ctx = this.ctx;
        if (ctx.font != font) {
            ctx.font = font;
            ctx._lastFont = font;
        }
        cri.width = ctx.measureText(char).width;
        var w = cri.width * this.lastScaleX;
        var h = cri.height * this.lastScaleY;
        w += (margin_left + margin_right) * this.lastScaleX;
        h += (margin_top + margin_bottom) * this.lastScaleY;
        w = Math.ceil(w);
        h = Math.ceil(h);
        w = Math.min(w, CharRender_Canvas.canvas.width);
        h = Math.min(h, CharRender_Canvas.canvas.height);
        var clearW = w + lineWidth * 2 + 1;
        var clearH = h + lineWidth * 2 + 1;
        if (rect) {
            clearW = Math.max(clearW, rect[0] + rect[2] + 1);
            clearH = Math.max(clearH, rect[1] + rect[3] + 1);
        }
        ctx.clearRect(0, 0, clearW, clearH);
        ctx.save();
        ctx.textBaseline = "top";
        if (lineWidth > 0) {
            ctx.strokeStyle = strokeColStr;
            ctx.lineWidth = lineWidth;
            ctx.strokeText(char, margin_left, margin_top);
        }
        ctx.fillStyle = colStr;
        ctx.fillText(char, margin_left, margin_top);
        if (this.showDbgInfo) {
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(0, 0, w, h);
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(margin_left, margin_top, cri.width, cri.height);
        }
        if (rect) {
            if (rect[2] == -1)
                rect[2] = Math.ceil((cri.width + lineWidth * 2) * this.lastScaleX);
        }
        var imgdt = rect ? (ctx.getImageData(rect[0], rect[1], rect[2], rect[3])) : (ctx.getImageData(0, 0, w, h));
        ctx.restore();
        cri.bmpWidth = imgdt.width;
        cri.bmpHeight = imgdt.height;
        return imgdt;
    }
    getCharCanvas(char, font, lineWidth, colStr, strokeColStr, cri, margin_left, margin_top, margin_right, margin_bottom) {
        var ctx = this.ctx;
        if (ctx.font != font) {
            ctx.font = font;
            ctx._lastFont = font;
        }
        cri.width = ctx.measureText(char).width;
        var w = cri.width * this.lastScaleX;
        var h = cri.height * this.lastScaleY;
        w += (margin_left + margin_right) * this.lastScaleX;
        h += ((margin_top + margin_bottom) * this.lastScaleY + 1);
        w = Math.min(w, this.maxTexW);
        h = Math.min(h, this.maxTexH);
        CharRender_Canvas.canvas.width = Math.min(w + 1, this.maxTexW);
        CharRender_Canvas.canvas.height = Math.min(h + 1, this.maxTexH);
        ctx.font = font;
        ctx.clearRect(0, 0, w + 1 + lineWidth, h + 1 + lineWidth);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.save();
        if (this.scaleFontSize) {
            ctx.scale(this.lastScaleX, this.lastScaleY);
        }
        ctx.translate(margin_left, margin_top);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        if (lineWidth > 0) {
            ctx.strokeStyle = strokeColStr;
            ctx.fillStyle = colStr;
            ctx.lineWidth = lineWidth;
            if (ctx.fillAndStrokeText) {
                ctx.fillAndStrokeText(char, 0, 0);
            }
            else {
                ctx.strokeText(char, 0, 0);
                ctx.fillText(char, 0, 0);
            }
        }
        else {
            ctx.fillStyle = colStr;
            ctx.fillText(char, 0, 0);
        }
        if (this.showDbgInfo) {
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(0, 0, w, h);
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(0, 0, cri.width, cri.height);
        }
        ctx.restore();
        cri.bmpWidth = CharRender_Canvas.canvas.width;
        cri.bmpHeight = CharRender_Canvas.canvas.height;
        return CharRender_Canvas.canvas;
    }
}
CharRender_Canvas.canvas = null;
