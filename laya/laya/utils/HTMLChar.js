import { Pool } from "./Pool";
export class HTMLChar {
    constructor() {
        this.reset();
    }
    setData(char, w, h, style) {
        this.char = char;
        this.charNum = char.charCodeAt(0);
        this.x = this.y = 0;
        this.width = w;
        this.height = h;
        this.style = style;
        this.isWord = !HTMLChar._isWordRegExp.test(char);
        return this;
    }
    reset() {
        this.x = this.y = this.width = this.height = 0;
        this.isWord = false;
        this.char = null;
        this.charNum = 0;
        this.style = null;
        return this;
    }
    recover() {
        Pool.recover("HTMLChar", this.reset());
    }
    static create() {
        return Pool.getItemByClass("HTMLChar", HTMLChar);
    }
    _isChar() {
        return true;
    }
    _getCSSStyle() {
        return this.style;
    }
}
HTMLChar._isWordRegExp = new RegExp("[\\w\.]", "");
