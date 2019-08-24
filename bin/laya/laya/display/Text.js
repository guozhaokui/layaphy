import { Sprite } from "./Sprite";
import { SpriteConst } from "./SpriteConst";
import { TextStyle } from "./css/TextStyle";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { WordText } from "../utils/WordText";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Text extends Sprite {
    constructor() {
        super();
        this._textWidth = 0;
        this._textHeight = 0;
        this._lines = [];
        this._lineWidths = [];
        this._startX = 0;
        this._startY = 0;
        this._charSize = {};
        this._valign = "top";
        this._fontSize = Text.defaultFontSize;
        this._font = Text.defaultFont;
        this._color = "#000000";
        this._singleCharRender = false;
        this.overflow = Text.VISIBLE;
        this._style = TextStyle.EMPTY;
    }
    static defaultFontStr() {
        return Text.defaultFontSize + "px " + Text.defaultFont;
    }
    getStyle() {
        this._style === TextStyle.EMPTY && (this._style = TextStyle.create());
        return this._style;
    }
    _getTextStyle() {
        if (this._style === TextStyle.EMPTY) {
            this._style = TextStyle.create();
        }
        return this._style;
    }
    static registerBitmapFont(name, bitmapFont) {
        Text._bitmapFonts || (Text._bitmapFonts = {});
        Text._bitmapFonts[name] = bitmapFont;
    }
    static unregisterBitmapFont(name, destroy = true) {
        if (Text._bitmapFonts && Text._bitmapFonts[name]) {
            var tBitmapFont = Text._bitmapFonts[name];
            if (destroy)
                tBitmapFont.destroy();
            delete Text._bitmapFonts[name];
        }
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._clipPoint = null;
        this._lines = null;
        this._lineWidths = null;
        this._words && this._words.forEach(function (w) {
            w.cleanCache();
        });
        this._words = null;
        this._charSize = null;
    }
    _getBoundPointsM(ifRotate = false) {
        var rec = Rectangle.TEMP;
        rec.setTo(0, 0, this.width, this.height);
        return rec._getBoundPoints();
    }
    getGraphicBounds(realSize = false) {
        var rec = Rectangle.TEMP;
        rec.setTo(0, 0, this.width, this.height);
        return rec;
    }
    get width() {
        if (this._width)
            return this._width;
        return this.textWidth + this.padding[1] + this.padding[3];
    }
    set width(value) {
        if (value != this._width) {
            super.set_width(value);
            this.isChanged = true;
            if (this.borderColor) {
                this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
            }
        }
    }
    _getCSSStyle() {
        return this._style;
    }
    get height() {
        if (this._height)
            return this._height;
        return this.textHeight;
    }
    set height(value) {
        if (value != this._height) {
            super.set_height(value);
            this.isChanged = true;
            if (this.borderColor) {
                this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
            }
        }
    }
    get textWidth() {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
        return this._textWidth;
    }
    get textHeight() {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
        return this._textHeight;
    }
    get text() {
        return this._text || "";
    }
    get_text() {
        return this._text || "";
    }
    set_text(value) {
        if (this._text !== value) {
            this.lang(value + "");
            this.isChanged = true;
            this.event(Event.CHANGE);
            if (this.borderColor) {
                this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
            }
        }
    }
    set text(value) {
        this.set_text(value);
    }
    lang(text, arg1 = null, arg2 = null, arg3 = null, arg4 = null, arg5 = null, arg6 = null, arg7 = null, arg8 = null, arg9 = null, arg10 = null) {
        text = Text.langPacks && Text.langPacks[text] ? Text.langPacks[text] : text;
        if (arguments.length < 2) {
            this._text = text;
        }
        else {
            for (var i = 0, n = arguments.length; i < n; i++) {
                text = text.replace("{" + i + "}", arguments[i + 1]);
            }
            this._text = text;
        }
    }
    get font() {
        return this._font;
    }
    set font(value) {
        if (this._style.currBitmapFont) {
            this._getTextStyle().currBitmapFont = null;
            this.scale(1, 1);
        }
        if (Text._bitmapFonts && Text._bitmapFonts[value]) {
            this._getTextStyle().currBitmapFont = Text._bitmapFonts[value];
        }
        this._font = value;
        this.isChanged = true;
    }
    get fontSize() {
        return this._fontSize;
    }
    set fontSize(value) {
        if (this._fontSize != value) {
            this._fontSize = value;
            this.isChanged = true;
        }
    }
    get bold() {
        return this._style.bold;
    }
    set bold(value) {
        this._getTextStyle().bold = value;
        this.isChanged = true;
    }
    get color() {
        return this._color;
    }
    set color(value) {
        this.set_color(value);
    }
    get_color() {
        return this._color;
    }
    set_color(value) {
        if (this._color != value) {
            this._color = value;
            if (!this._isChanged && this._graphics) {
                this._graphics.replaceTextColor(this.color);
            }
            else {
                this.isChanged = true;
            }
        }
    }
    get italic() {
        return this._style.italic;
    }
    set italic(value) {
        this._getTextStyle().italic = value;
        this.isChanged = true;
    }
    get align() {
        return this._style.align;
    }
    set align(value) {
        this._getTextStyle().align = value;
        this.isChanged = true;
    }
    get valign() {
        return this._valign;
    }
    set valign(value) {
        this._valign = value;
        this.isChanged = true;
    }
    get wordWrap() {
        return this._style.wordWrap;
    }
    set wordWrap(value) {
        this._getTextStyle().wordWrap = value;
        this.isChanged = true;
    }
    get leading() {
        return this._style.leading;
    }
    set leading(value) {
        this._getTextStyle().leading = value;
        this.isChanged = true;
    }
    get padding() {
        return this._style.padding;
    }
    set padding(value) {
        if (typeof (value) == 'string') {
            var arr;
            arr = value.split(",");
            var i, len;
            len = arr.length;
            while (arr.length < 4) {
                arr.push(0);
            }
            for (i = 0; i < len; i++) {
                arr[i] = parseFloat(arr[i]) || 0;
            }
            value = arr;
        }
        this._getTextStyle().padding = value;
        this.isChanged = true;
    }
    get bgColor() {
        return this._style.bgColor;
    }
    set bgColor(value) {
        this.set_bgColor(value);
    }
    set_bgColor(value) {
        this._getTextStyle().bgColor = value;
        this._renderType |= SpriteConst.STYLE;
        this._setBgStyleColor(0, 0, this.width, this.height, value);
        this._setRenderType(this._renderType);
        this.isChanged = true;
    }
    get_bgColor() {
        return this._style.bgColor;
    }
    get borderColor() {
        return this._style.borderColor;
    }
    set borderColor(value) {
        this._getTextStyle().borderColor = value;
        this._renderType |= SpriteConst.STYLE;
        this._setBorderStyleColor(0, 0, this.width, this.height, value, 1);
        this._setRenderType(this._renderType);
        this.isChanged = true;
    }
    get stroke() {
        return this._style.stroke;
    }
    set stroke(value) {
        this._getTextStyle().stroke = value;
        this.isChanged = true;
    }
    get strokeColor() {
        return this._style.strokeColor;
    }
    set strokeColor(value) {
        this._getTextStyle().strokeColor = value;
        this.isChanged = true;
    }
    set isChanged(value) {
        if (this._isChanged !== value) {
            this._isChanged = value;
            value && ILaya.systemTimer.callLater(this, this.typeset);
        }
    }
    _getContextFont() {
        return (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + (ILaya.Browser.onIPhone ? (Text.fontFamilyMap[this.font] || this.font) : this.font);
    }
    _isPassWordMode() {
        var style = this._style;
        var password = style.asPassword;
        if (("prompt" in this) && this['prompt'] == this._text)
            password = false;
        return password;
    }
    _getPassWordTxt(txt) {
        var len = txt.length;
        var word;
        word = "";
        for (var j = len; j > 0; j--) {
            word += "●";
        }
        return word;
    }
    _renderText() {
        var padding = this.padding;
        var visibleLineCount = this._lines.length;
        if (this.overflow != Text.VISIBLE) {
            visibleLineCount = Math.min(visibleLineCount, Math.floor((this.height - padding[0] - padding[2]) / (this.leading + this._charSize.height)) + 1);
        }
        var beginLine = this.scrollY / (this._charSize.height + this.leading) | 0;
        var graphics = this.graphics;
        graphics.clear(true);
        var ctxFont = this._getContextFont();
        ILaya.Browser.context.font = ctxFont;
        var startX = padding[3];
        var textAlgin = "left";
        var lines = this._lines;
        var lineHeight = this.leading + this._charSize.height;
        var tCurrBitmapFont = this._style.currBitmapFont;
        if (tCurrBitmapFont) {
            lineHeight = this.leading + tCurrBitmapFont.getMaxHeight();
        }
        var startY = padding[0];
        if ((!tCurrBitmapFont) && this._width > 0 && this._textWidth <= this._width) {
            if (this.align == "right") {
                textAlgin = "right";
                startX = this._width - padding[1];
            }
            else if (this.align == "center") {
                textAlgin = "center";
                startX = this._width * 0.5 + padding[3] - padding[1];
            }
        }
        if (this._height > 0) {
            var tempVAlign = (this._textHeight > this._height) ? "top" : this.valign;
            if (tempVAlign === "middle")
                startY = (this._height - visibleLineCount * lineHeight) * 0.5 + padding[0] - padding[2];
            else if (tempVAlign === "bottom")
                startY = this._height - visibleLineCount * lineHeight - padding[2];
        }
        var style = this._style;
        if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
            var bitmapScale = tCurrBitmapFont.fontSize / this.fontSize;
        }
        if (this._clipPoint) {
            graphics.save();
            if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
                var tClipWidth;
                var tClipHeight;
                this._width ? tClipWidth = (this._width - padding[3] - padding[1]) : tClipWidth = this._textWidth;
                this._height ? tClipHeight = (this._height - padding[0] - padding[2]) : tClipHeight = this._textHeight;
                tClipWidth *= bitmapScale;
                tClipHeight *= bitmapScale;
                graphics.clipRect(padding[3], padding[0], tClipWidth, tClipHeight);
            }
            else {
                graphics.clipRect(padding[3], padding[0], this._width ? (this._width - padding[3] - padding[1]) : this._textWidth, this._height ? (this._height - padding[0] - padding[2]) : this._textHeight);
            }
            this.repaint();
        }
        var password = style.asPassword;
        if (("prompt" in this) && this['prompt'] == this._text)
            password = false;
        var x = 0, y = 0;
        var end = Math.min(this._lines.length, visibleLineCount + beginLine) || 1;
        for (var i = beginLine; i < end; i++) {
            var word = lines[i];
            var _word;
            if (password) {
                var len = word.length;
                word = "";
                for (var j = len; j > 0; j--) {
                    word += "●";
                }
            }
            if (word == null)
                word = "";
            x = startX - (this._clipPoint ? this._clipPoint.x : 0);
            y = startY + lineHeight * i - (this._clipPoint ? this._clipPoint.y : 0);
            this.underline && this._drawUnderline(textAlgin, x, y, i);
            if (tCurrBitmapFont) {
                var tWidth = this.width;
                if (tCurrBitmapFont.autoScaleSize) {
                    tWidth = this.width * bitmapScale;
                }
                tCurrBitmapFont._drawText(word, this, x, y, this.align, tWidth);
            }
            else {
                this._words || (this._words = []);
                if (this._words.length > (i - beginLine)) {
                    _word = this._words[i - beginLine];
                }
                else {
                    _word = new WordText();
                    this._words.push(_word);
                }
                _word.setText(word);
                _word.splitRender = this._singleCharRender;
                style.stroke ? graphics.fillBorderText(_word, x, y, ctxFont, this.color, style.strokeColor, style.stroke, textAlgin) : graphics.fillText(_word, x, y, ctxFont, this.color, textAlgin);
            }
        }
        if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
            var tScale = 1 / bitmapScale;
            this.scale(tScale, tScale);
        }
        if (this._clipPoint)
            graphics.restore();
        this._startX = startX;
        this._startY = startY;
    }
    _drawUnderline(align, x, y, lineIndex) {
        var lineWidth = this._lineWidths[lineIndex];
        switch (align) {
            case 'center':
                x -= lineWidth / 2;
                break;
            case 'right':
                x -= lineWidth;
                break;
            case 'left':
            default:
                break;
        }
        y += this._charSize.height;
        this._graphics.drawLine(x, y, x + lineWidth, y, this.underlineColor || this.color, 1);
    }
    typeset() {
        this._isChanged = false;
        if (!this._text) {
            this._clipPoint = null;
            this._textWidth = this._textHeight = 0;
            this.graphics.clear(true);
            return;
        }
        if (ILaya.Render.isConchApp) {
            window.conchTextCanvas.font = this._getContextFont();
            ;
        }
        else {
            ILaya.Browser.context.font = this._getContextFont();
        }
        this._lines.length = 0;
        this._lineWidths.length = 0;
        if (this._isPassWordMode()) {
            this._parseLines(this._getPassWordTxt(this._text));
        }
        else
            this._parseLines(this._text);
        this._evalTextSize();
        if (this._checkEnabledViewportOrNot())
            this._clipPoint || (this._clipPoint = new Point(0, 0));
        else
            this._clipPoint = null;
        this._renderText();
    }
    _evalTextSize() {
        var nw, nh;
        nw = Math.max.apply(this, this._lineWidths);
        if (this._style.currBitmapFont)
            nh = this._lines.length * (this._style.currBitmapFont.getMaxHeight() + this.leading) + this.padding[0] + this.padding[2];
        else
            nh = this._lines.length * (this._charSize.height + this.leading) + this.padding[0] + this.padding[2];
        if (nw != this._textWidth || nh != this._textHeight) {
            this._textWidth = nw;
            this._textHeight = nh;
        }
    }
    _checkEnabledViewportOrNot() {
        return this.overflow == Text.SCROLL && ((this._width > 0 && this._textWidth > this._width) || (this._height > 0 && this._textHeight > this._height));
    }
    changeText(text) {
        if (this._text !== text) {
            this.lang(text + "");
            if (this._graphics && this._graphics.replaceText(this._text)) {
            }
            else {
                this.typeset();
            }
        }
    }
    _parseLines(text) {
        var needWordWrapOrTruncate = this.wordWrap || this.overflow == Text.HIDDEN;
        if (needWordWrapOrTruncate) {
            var wordWrapWidth = this._getWordWrapWidth();
        }
        var bitmapFont = this._style.currBitmapFont;
        if (bitmapFont) {
            this._charSize.width = bitmapFont.getMaxWidth();
            this._charSize.height = bitmapFont.getMaxHeight();
        }
        else {
            var measureResult = null;
            if (ILaya.Render.isConchApp) {
                measureResult = window.conchTextCanvas.measureText(Text._testWord);
            }
            else {
                measureResult = ILaya.Browser.context.measureText(Text._testWord);
            }
            if (!measureResult)
                measureResult = { width: 100 };
            this._charSize.width = measureResult.width;
            this._charSize.height = (measureResult.height || this.fontSize);
        }
        var lines = text.replace(/\r\n/g, "\n").split("\n");
        for (var i = 0, n = lines.length; i < n; i++) {
            var line = lines[i];
            if (needWordWrapOrTruncate)
                this._parseLine(line, wordWrapWidth);
            else {
                this._lineWidths.push(this._getTextWidth(line));
                this._lines.push(line);
            }
        }
    }
    _parseLine(line, wordWrapWidth) {
        var lines = this._lines;
        var maybeIndex = 0;
        var charsWidth;
        var wordWidth;
        var startIndex;
        charsWidth = this._getTextWidth(line);
        if (charsWidth <= wordWrapWidth) {
            lines.push(line);
            this._lineWidths.push(charsWidth);
            return;
        }
        charsWidth = this._charSize.width;
        maybeIndex = Math.floor(wordWrapWidth / charsWidth);
        (maybeIndex == 0) && (maybeIndex = 1);
        charsWidth = this._getTextWidth(line.substring(0, maybeIndex));
        wordWidth = charsWidth;
        for (var j = maybeIndex, m = line.length; j < m; j++) {
            charsWidth = this._getTextWidth(line.charAt(j));
            wordWidth += charsWidth;
            if (wordWidth > wordWrapWidth) {
                if (this.wordWrap) {
                    var newLine = line.substring(startIndex, j);
                    if (newLine.charCodeAt(newLine.length - 1) < 255) {
                        var execResult = /(?:\w|-)+$/.exec(newLine);
                        if (execResult) {
                            j = execResult.index + startIndex;
                            if (execResult.index == 0)
                                j += newLine.length;
                            else
                                newLine = line.substring(startIndex, j);
                        }
                    }
                    lines.push(newLine);
                    this._lineWidths.push(wordWidth - charsWidth);
                    startIndex = j;
                    if (j + maybeIndex < m) {
                        j += maybeIndex;
                        charsWidth = this._getTextWidth(line.substring(startIndex, j));
                        wordWidth = charsWidth;
                        j--;
                    }
                    else {
                        lines.push(line.substring(startIndex, m));
                        this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
                        startIndex = -1;
                        break;
                    }
                }
                else if (this.overflow == Text.HIDDEN) {
                    lines.push(line.substring(0, j));
                    this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
                    return;
                }
            }
        }
        if (this.wordWrap && startIndex != -1) {
            lines.push(line.substring(startIndex, m));
            this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
        }
    }
    _getTextWidth(text) {
        var bitmapFont = this._style.currBitmapFont;
        if (bitmapFont)
            return bitmapFont.getTextWidth(text);
        else {
            if (ILaya.Render.isConchApp) {
                return window.conchTextCanvas.measureText(text).width;
                ;
            }
            else
                return ILaya.Browser.context.measureText(text).width;
        }
    }
    _getWordWrapWidth() {
        var p = this.padding;
        var w;
        var bitmapFont = this._style.currBitmapFont;
        if (bitmapFont && bitmapFont.autoScaleSize)
            w = this._width * (bitmapFont.fontSize / this.fontSize);
        else
            w = this._width;
        if (w <= 0) {
            w = this.wordWrap ? 100 : ILaya.Browser.width;
        }
        w <= 0 && (w = 100);
        return w - p[3] - p[1];
    }
    getCharPoint(charIndex, out = null) {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
        var len = 0, lines = this._lines, startIndex = 0;
        for (var i = 0, n = lines.length; i < n; i++) {
            len += lines[i].length;
            if (charIndex < len) {
                var line = i;
                break;
            }
            startIndex = len;
        }
        var ctxFont = (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + this.font;
        ILaya.Browser.context.font = ctxFont;
        var width = this._getTextWidth(this._text.substring(startIndex, charIndex));
        var point = out || new Point();
        return point.setTo(this._startX + width - (this._clipPoint ? this._clipPoint.x : 0), this._startY + line * (this._charSize.height + this.leading) - (this._clipPoint ? this._clipPoint.y : 0));
    }
    set scrollX(value) {
        if (this.overflow != Text.SCROLL || (this.textWidth < this._width || !this._clipPoint))
            return;
        value = value < this.padding[3] ? this.padding[3] : value;
        var maxScrollX = this._textWidth - this._width;
        value = value > maxScrollX ? maxScrollX : value;
        this._clipPoint.x = value;
        this._renderText();
    }
    get scrollX() {
        if (!this._clipPoint)
            return 0;
        return this._clipPoint.x;
    }
    set scrollY(value) {
        if (this.overflow != Text.SCROLL || (this.textHeight < this._height || !this._clipPoint))
            return;
        value = value < this.padding[0] ? this.padding[0] : value;
        var maxScrollY = this._textHeight - this._height;
        value = value > maxScrollY ? maxScrollY : value;
        this._clipPoint.y = value;
        this._renderText();
    }
    get scrollY() {
        if (!this._clipPoint)
            return 0;
        return this._clipPoint.y;
    }
    get maxScrollX() {
        return (this.textWidth < this._width) ? 0 : this._textWidth - this._width;
    }
    get maxScrollY() {
        return (this.textHeight < this._height) ? 0 : this._textHeight - this._height;
    }
    get lines() {
        if (this._isChanged)
            this.typeset();
        return this._lines;
    }
    get underlineColor() {
        return this._style.underlineColor;
    }
    set underlineColor(value) {
        this._getTextStyle().underlineColor = value;
        if (!this._isChanged)
            this._renderText();
    }
    get underline() {
        return this._style.underline;
    }
    set underline(value) {
        this._getTextStyle().underline = value;
    }
    set singleCharRender(value) {
        this._singleCharRender = value;
    }
    get singleCharRender() {
        return this._singleCharRender;
    }
}
Text.VISIBLE = "visible";
Text.SCROLL = "scroll";
Text.HIDDEN = "hidden";
Text.defaultFontSize = 12;
Text.defaultFont = "Arial";
Text.isComplexText = false;
Text.fontFamilyMap = { "报隶": "报隶-简", "黑体": "黑体-简", "楷体": "楷体-简", "兰亭黑": "兰亭黑-简", "隶变": "隶变-简", "凌慧体": "凌慧体-简", "翩翩体": "翩翩体-简", "苹方": "苹方-简", "手札体": "手札体-简", "宋体": "宋体-简", "娃娃体": "娃娃体-简", "魏碑": "魏碑-简", "行楷": "行楷-简", "雅痞": "雅痞-简", "圆体": "圆体-简" };
Text._testWord = "游";
Text.CharacterCache = true;
Text.RightToLeft = false;
ILaya.regClass(Text);
ClassUtils.regClass("laya.display.Text", Text);
ClassUtils.regClass("Laya.Text", Text);
