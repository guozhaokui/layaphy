import { LayoutBox } from "./LayoutBox";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class VBox extends LayoutBox {
    set width(value) {
        if (this._width != value) {
            super.width = value;
            this.callLater(this.changeItems);
        }
    }
    get width() {
        return super.width;
    }
    changeItems() {
        this._itemChanged = false;
        var items = [];
        var maxWidth = 0;
        for (var i = 0, n = this.numChildren; i < n; i++) {
            var item = this.getChildAt(i);
            if (item) {
                items.push(item);
                maxWidth = this._width ? this._width : Math.max(maxWidth, item.width * item.scaleX);
            }
        }
        this.sortItem(items);
        var top = 0;
        for (i = 0, n = items.length; i < n; i++) {
            item = items[i];
            item.y = top;
            top += item.height * item.scaleY + this._space;
            if (this._align == VBox.LEFT) {
                item.x = 0;
            }
            else if (this._align == VBox.CENTER) {
                item.x = (maxWidth - item.width * item.scaleX) * 0.5;
            }
            else if (this._align == VBox.RIGHT) {
                item.x = maxWidth - item.width * item.scaleX;
            }
        }
        this._sizeChanged();
    }
}
VBox.NONE = "none";
VBox.LEFT = "left";
VBox.CENTER = "center";
VBox.RIGHT = "right";
ILaya.regClass(VBox);
ClassUtils.regClass("laya.ui.VBox", VBox);
ClassUtils.regClass("Laya.VBox", VBox);
