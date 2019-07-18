import { HTMLStyle } from "./HTMLStyle";
import { ILaya } from "../../../ILaya";
import { LayoutLine } from "./LayoutLine";
import { IHtml } from "./IHtml";
export class Layout {
    static later(element) {
        if (Layout._will == null) {
            Layout._will = [];
            ILaya.stage.frameLoop(1, null, function () {
                if (Layout._will.length < 1)
                    return;
                for (var i = 0; i < Layout._will.length; i++) {
                    Layout.layout(Layout._will[i]);
                }
                Layout._will.length = 0;
            });
        }
        Layout._will.push(element);
    }
    static layout(element) {
        if (!element || !element._style)
            return null;
        var style = element._style;
        if ((style._type & HTMLStyle.ADDLAYOUTED) === 0)
            return null;
        element.style._type &= ~HTMLStyle.ADDLAYOUTED;
        var arr = Layout._multiLineLayout(element);
        return arr;
    }
    static _multiLineLayout(element) {
        var elements = [];
        element._addChildsToLayout(elements);
        var i, n = elements.length, j;
        var style = element._getCSSStyle();
        var letterSpacing = style.letterSpacing;
        var leading = style.leading;
        var lineHeight = style.lineHeight;
        var widthAuto = style._widthAuto() || !style.wordWrap;
        var width = widthAuto ? 999999 : element.width;
        var height = element.height;
        var maxWidth = 0;
        var exWidth = style.italic ? style.fontSize / 3 : 0;
        var align = style.align;
        var valign = style.valign;
        var endAdjust = valign !== HTMLStyle.VALIGN_TOP || align !== HTMLStyle.ALIGN_LEFT || lineHeight != 0;
        var oneLayout;
        var x = 0;
        var y = 0;
        var w = 0;
        var h = 0;
        var tBottom = 0;
        var lines = [];
        var curStyle;
        var curPadding;
        var curLine = lines[0] = new LayoutLine();
        var newLine, nextNewline = false;
        var htmlWord;
        var sprite;
        curLine.h = 0;
        if (style.italic)
            width -= style.fontSize / 3;
        var tWordWidth = 0;
        var tLineFirstKey = true;
        function addLine() {
            curLine.y = y;
            y += curLine.h + leading;
            curLine.mWidth = tWordWidth;
            tWordWidth = 0;
            curLine = new LayoutLine();
            lines.push(curLine);
            curLine.h = 0;
            x = 0;
            tLineFirstKey = true;
            newLine = false;
        }
        for (i = 0; i < n; i++) {
            oneLayout = elements[i];
            if (oneLayout == null) {
                if (!tLineFirstKey) {
                    x += Layout.DIV_ELEMENT_PADDING;
                }
                curLine.wordStartIndex = curLine.elements.length;
                continue;
            }
            tLineFirstKey = false;
            if (oneLayout instanceof IHtml.HTMLBrElement) {
                addLine();
                curLine.y = y;
                curLine.h = lineHeight;
                continue;
            }
            else if (oneLayout._isChar()) {
                htmlWord = oneLayout;
                if (!htmlWord.isWord) {
                    if (lines.length > 0 && (x + w) > width && curLine.wordStartIndex > 0) {
                        var tLineWord = 0;
                        tLineWord = curLine.elements.length - curLine.wordStartIndex + 1;
                        curLine.elements.length = curLine.wordStartIndex;
                        i -= tLineWord;
                        addLine();
                        continue;
                    }
                    newLine = false;
                    tWordWidth += htmlWord.width;
                }
                else {
                    newLine = nextNewline || (htmlWord.char === '\n');
                    curLine.wordStartIndex = curLine.elements.length;
                }
                w = htmlWord.width + htmlWord.style.letterSpacing;
                h = htmlWord.height;
                nextNewline = false;
                newLine = newLine || ((x + w) > width);
                newLine && addLine();
                curLine.minTextHeight = Math.min(curLine.minTextHeight, oneLayout.height);
            }
            else {
                curStyle = oneLayout._getCSSStyle();
                sprite = oneLayout;
                curPadding = curStyle.padding;
                newLine = nextNewline || curStyle.getLineElement();
                w = sprite.width + curPadding[1] + curPadding[3] + curStyle.letterSpacing;
                h = sprite.height + curPadding[0] + curPadding[2];
                nextNewline = curStyle.getLineElement();
                newLine = newLine || ((x + w) > width && curStyle.wordWrap);
                newLine && addLine();
            }
            curLine.elements.push(oneLayout);
            curLine.h = Math.max(curLine.h, h);
            oneLayout.x = x;
            oneLayout.y = y;
            x += w;
            curLine.w = x - letterSpacing;
            curLine.y = y;
            maxWidth = Math.max(x + exWidth, maxWidth);
        }
        y = curLine.y + curLine.h;
        if (endAdjust) {
            var tY = 0;
            var tWidth = width;
            if (widthAuto && element.width > 0) {
                tWidth = element.width;
            }
            for (i = 0, n = lines.length; i < n; i++) {
                lines[i].updatePos(0, tWidth, i, tY, align, valign, lineHeight);
                tY += Math.max(lineHeight, lines[i].h + leading);
            }
            y = tY;
        }
        widthAuto && (element.width = maxWidth);
        (y > element.height) && (element.height = y);
        return [maxWidth, y];
    }
}
Layout.DIV_ELEMENT_PADDING = 0;
