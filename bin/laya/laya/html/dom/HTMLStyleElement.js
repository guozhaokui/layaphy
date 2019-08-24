import { HTMLElement } from "./HTMLElement";
import { HTMLStyle } from "../utils/HTMLStyle";
import { ILaya } from "../../../ILaya";
export class HTMLStyleElement extends HTMLElement {
    _creates() {
    }
    drawToGraphic(graphic, gX, gY, recList) {
    }
    reset() {
        return this;
    }
    set innerTEXT(value) {
        HTMLStyle.parseCSS(value, null);
    }
    get innerTEXT() {
        return super.innerTEXT;
    }
}
ILaya.regClass(HTMLStyleElement);
