import { HTMLStyle } from "./HTMLStyle";
import { IHtml } from "./IHtml";
export class LayoutLine {
    constructor() {
        this.elements = [];
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.wordStartIndex = 0;
        this.minTextHeight = 99999;
        this.mWidth = 0;
    }
    updatePos(left, width, lineNum, dy, align, valign, lineHeight) {
        var w = 0;
        var one;
        if (this.elements.length > 0) {
            one = this.elements[this.elements.length - 1];
            w = one.x + one.width - this.elements[0].x;
        }
        lineHeight = lineHeight || this.h;
        var dx = 0, ddy;
        if (align === HTMLStyle.ALIGN_CENTER)
            dx = (width - w) / 2;
        if (align === HTMLStyle.ALIGN_RIGHT)
            dx = (width - w);
        for (var i = 0, n = this.elements.length; i < n; i++) {
            one = this.elements[i];
            var tCSSStyle = one._getCSSStyle();
            dx !== 0 && (one.x += dx);
            switch (tCSSStyle.valign) {
                case "top":
                    one.y = dy;
                    break;
                case "middle":
                    var tMinTextHeight = 0;
                    if (this.minTextHeight != 99999)
                        tMinTextHeight = this.minTextHeight;
                    var tBottomLineY = (tMinTextHeight + lineHeight) / 2;
                    tBottomLineY = Math.max(tBottomLineY, this.h);
                    if (one.eletype == IHtml.HTMLElementType.IMAGE)
                        ddy = dy + tBottomLineY - one.height;
                    else
                        ddy = dy + tBottomLineY - one.height;
                    one.y = ddy;
                    break;
                case "bottom":
                    one.y = dy + (lineHeight - one.height);
                    break;
            }
        }
    }
}
