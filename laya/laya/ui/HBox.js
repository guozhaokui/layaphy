import { LayoutBox } from "./LayoutBox";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class HBox extends LayoutBox {
    sortItem(items) {
        if (items)
            items.sort(function (a, b) { return a.x - b.x; });
    }
    set height(value) {
        if (this._height != value) {
            super.height = value;
            this.callLater(this.changeItems);
        }
    }
    get height() {
        return super.height;
    }
    changeItems() {
        this._itemChanged = false;
        var items = [];
        var maxHeight = 0;
        for (var i = 0, n = this.numChildren; i < n; i++) {
            var item = this.getChildAt(i);
            if (item) {
                items.push(item);
                maxHeight = this._height ? this._height : Math.max(maxHeight, item.height * item.scaleY);
            }
        }
        this.sortItem(items);
        var left = 0;
        for (i = 0, n = items.length; i < n; i++) {
            item = items[i];
            item.x = left;
            left += item.width * item.scaleX + this._space;
            if (this._align == HBox.TOP) {
                item.y = 0;
            }
            else if (this._align == HBox.MIDDLE) {
                item.y = (maxHeight - item.height * item.scaleY) * 0.5;
            }
            else if (this._align == HBox.BOTTOM) {
                item.y = maxHeight - item.height * item.scaleY;
            }
        }
        this._sizeChanged();
    }
}
HBox.NONE = "none";
HBox.TOP = "top";
HBox.MIDDLE = "middle";
HBox.BOTTOM = "bottom";
ILaya.regClass(HBox);
ClassUtils.regClass("laya.ui.HBox", HBox);
ClassUtils.regClass("Laya.HBox", HBox);
