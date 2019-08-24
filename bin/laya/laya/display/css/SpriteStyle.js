import { Pool } from "../../utils/Pool";
export class SpriteStyle {
    constructor() {
        this.reset();
    }
    reset() {
        this.scaleX = this.scaleY = 1;
        this.skewX = this.skewY = 0;
        this.pivotX = this.pivotY = this.rotation = 0;
        this.alpha = 1;
        if (this.scrollRect)
            this.scrollRect.recover();
        this.scrollRect = null;
        if (this.viewport)
            this.viewport.recover();
        this.viewport = null;
        this.hitArea = null;
        this.dragging = null;
        this.blendMode = null;
        return this;
    }
    recover() {
        if (this === SpriteStyle.EMPTY)
            return;
        Pool.recover("SpriteStyle", this.reset());
    }
    static create() {
        return Pool.getItemByClass("SpriteStyle", SpriteStyle);
    }
}
SpriteStyle.EMPTY = new SpriteStyle();
