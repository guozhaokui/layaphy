import { HTMLElement } from "./HTMLElement";
import { HTMLStyleElement } from "./HTMLStyleElement";
import { HTMLLinkElement } from "./HTMLLinkElement";
import { HTMLStyle } from "../utils/HTMLStyle";
import { Layout } from "../utils/Layout";
import { Rectangle } from "../../maths/Rectangle";
import { IHtml } from "../utils/IHtml";
import { ILaya } from "../../../ILaya";
export class HTMLDivParser extends HTMLElement {
    constructor() {
        super(...arguments);
        this.repaintHandler = null;
    }
    reset() {
        HTMLStyleElement;
        HTMLLinkElement;
        super.reset();
        this._style.block = true;
        this._style.setLineElement(true);
        this._style.width = 200;
        this._style.height = 200;
        this.repaintHandler = null;
        this.contextHeight = 0;
        this.contextWidth = 0;
        return this;
    }
    set innerHTML(text) {
        this.destroyChildren();
        this.appendHTML(text);
    }
    set width(value) {
        var changed;
        if (value === 0) {
            changed = value != this._width;
        }
        else {
            changed = value != this.width;
        }
        super.width = value;
        if (changed)
            this.layout();
    }
    appendHTML(text) {
        IHtml.HTMLParse.parse(this, text, this.URI);
        this.layout();
    }
    _addChildsToLayout(out) {
        var words = this._getWords();
        if (words == null && (!this._children || this._children.length == 0))
            return false;
        words && words.forEach(function (o) {
            out.push(o);
        });
        var tFirstKey = true;
        for (var i = 0, len = this._children.length; i < len; i++) {
            var o = this._children[i];
            if (tFirstKey) {
                tFirstKey = false;
            }
            else {
                out.push(null);
            }
            o._addToLayout(out);
        }
        return true;
    }
    _addToLayout(out) {
        this.layout();
        !this.style.absolute && out.push(this);
    }
    getBounds() {
        if (!this._htmlBounds)
            return null;
        if (!this._boundsRec)
            this._boundsRec = Rectangle.create();
        return this._boundsRec.copyFrom(this._htmlBounds);
    }
    parentRepaint(recreate = false) {
        super.parentRepaint();
        if (this.repaintHandler)
            this.repaintHandler.runWith(recreate);
    }
    layout() {
        this.style._type |= HTMLStyle.ADDLAYOUTED;
        var tArray = Layout.layout(this);
        if (tArray) {
            if (!this._htmlBounds)
                this._htmlBounds = Rectangle.create();
            var tRectangle = this._htmlBounds;
            tRectangle.x = tRectangle.y = 0;
            tRectangle.width = this.contextWidth = tArray[0];
            tRectangle.height = this.contextHeight = tArray[1];
        }
    }
    get height() {
        if (this._height)
            return this._height;
        return this.contextHeight;
    }
    set height(value) {
        super.height = value;
    }
    get width() {
        if (this._width)
            return this._width;
        return this.contextWidth;
    }
}
IHtml.HTMLDivParser = HTMLDivParser;
ILaya.regClass(HTMLDivParser);
