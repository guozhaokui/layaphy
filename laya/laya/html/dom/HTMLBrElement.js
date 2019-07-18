import { HTMLElement } from "./HTMLElement";
import { HTMLStyle } from "../utils/HTMLStyle";
import { Pool } from "../../utils/Pool";
import { IHtml } from "../utils/IHtml";
import { ILaya } from "../../../ILaya";
export class HTMLBrElement {
    _addToLayout(out) {
        out.push(this);
    }
    reset() {
        return this;
    }
    destroy() {
        Pool.recover(HTMLElement.getClassName(this), this.reset());
    }
    _setParent(value) {
    }
    set parent(value) {
    }
    set URI(value) {
    }
    set href(value) {
    }
    _getCSSStyle() {
        if (!HTMLBrElement.brStyle) {
            HTMLBrElement.brStyle = new HTMLStyle();
            HTMLBrElement.brStyle.setLineElement(true);
            HTMLBrElement.brStyle.block = true;
        }
        return HTMLBrElement.brStyle;
    }
    renderSelfToGraphic(graphic, gX, gY, recList) {
    }
}
IHtml.HTMLBrElement = HTMLBrElement;
ILaya.regClass(HTMLBrElement);
