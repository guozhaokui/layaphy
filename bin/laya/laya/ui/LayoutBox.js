import { Box } from "./Box";
import { Event } from "../events/Event";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class LayoutBox extends Box {
    constructor() {
        super(...arguments);
        this._space = 0;
        this._align = "none";
        this._itemChanged = false;
    }
    addChild(child) {
        child.on(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.addChild(child);
    }
    onResize(e) {
        this._setItemChanged();
    }
    addChildAt(child, index) {
        child.on(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.addChildAt(child, index);
    }
    removeChildAt(index) {
        this.getChildAt(index).off(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.removeChildAt(index);
    }
    refresh() {
        this._setItemChanged();
    }
    changeItems() {
        this._itemChanged = false;
    }
    get space() {
        return this._space;
    }
    set space(value) {
        this._space = value;
        this._setItemChanged();
    }
    get align() {
        return this._align;
    }
    set align(value) {
        this._align = value;
        this._setItemChanged();
    }
    sortItem(items) {
        if (items)
            items.sort(function (a, b) { return a.y - b.y; });
    }
    _setItemChanged() {
        if (!this._itemChanged) {
            this._itemChanged = true;
            this.callLater(this.changeItems);
        }
    }
}
ILaya.regClass(LayoutBox);
ClassUtils.regClass("laya.ui.LayoutBox", LayoutBox);
ClassUtils.regClass("Laya.LayoutBox", LayoutBox);
