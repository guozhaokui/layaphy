import { SpriteStyle } from "./SpriteStyle";
import { Pool } from "../../utils/Pool";
export class TextStyle extends SpriteStyle {
    constructor() {
        super(...arguments);
        this.italic = false;
    }
    reset() {
        super.reset();
        this.italic = false;
        this.align = "left";
        this.wordWrap = false;
        this.leading = 0;
        this.padding = [0, 0, 0, 0];
        this.bgColor = null;
        this.borderColor = null;
        this.asPassword = false;
        this.stroke = 0;
        this.strokeColor = "#000000";
        this.bold = false;
        this.underline = false;
        this.underlineColor = null;
        this.currBitmapFont = null;
        return this;
    }
    recover() {
        if (this === TextStyle.EMPTY)
            return;
        Pool.recover("TextStyle", this.reset());
    }
    static create() {
        return Pool.getItemByClass("TextStyle", TextStyle);
    }
    render(sprite, context, x, y) {
        (this.bgColor || this.borderColor) && context.drawRect(x, y, sprite.width, sprite.height, this.bgColor, this.borderColor, 1);
    }
}
TextStyle.EMPTY = new TextStyle();
