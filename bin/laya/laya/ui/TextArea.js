import { TextInput } from "./TextInput";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { Styles } from "./Styles";
import { Event } from "../events/Event";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class TextArea extends TextInput {
    constructor(text = "") {
        super(text);
        this.on(Event.CHANGE, this, this._onTextChange);
    }
    _onTextChange() {
        this.callLater(this.changeScroll);
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._vScrollBar && this._vScrollBar.destroy();
        this._hScrollBar && this._hScrollBar.destroy();
        this._vScrollBar = null;
        this._hScrollBar = null;
    }
    initialize() {
        this.width = 180;
        this.height = 150;
        this._tf.wordWrap = true;
        this.multiline = true;
    }
    set width(value) {
        super.width = value;
        this.callLater(this.changeScroll);
    }
    get width() {
        return super.width;
    }
    set height(value) {
        super.height = value;
        this.callLater(this.changeScroll);
    }
    get height() {
        return super.height;
    }
    get vScrollBarSkin() {
        return this._vScrollBar ? this._vScrollBar.skin : null;
    }
    set vScrollBarSkin(value) {
        if (this._vScrollBar == null) {
            this.addChild(this._vScrollBar = new VScrollBar());
            this._vScrollBar.on(Event.CHANGE, this, this.onVBarChanged);
            this._vScrollBar.target = this._tf;
            this.callLater(this.changeScroll);
        }
        this._vScrollBar.skin = value;
    }
    get hScrollBarSkin() {
        return this._hScrollBar ? this._hScrollBar.skin : null;
    }
    set hScrollBarSkin(value) {
        if (this._hScrollBar == null) {
            this.addChild(this._hScrollBar = new HScrollBar());
            this._hScrollBar.on(Event.CHANGE, this, this.onHBarChanged);
            this._hScrollBar.mouseWheelEnable = false;
            this._hScrollBar.target = this._tf;
            this.callLater(this.changeScroll);
        }
        this._hScrollBar.skin = value;
    }
    onVBarChanged(e) {
        if (this._tf.scrollY != this._vScrollBar.value) {
            this._tf.scrollY = this._vScrollBar.value;
        }
    }
    onHBarChanged(e) {
        if (this._tf.scrollX != this._hScrollBar.value) {
            this._tf.scrollX = this._hScrollBar.value;
        }
    }
    get vScrollBar() {
        return this._vScrollBar;
    }
    get hScrollBar() {
        return this._hScrollBar;
    }
    get maxScrollY() {
        return this._tf.maxScrollY;
    }
    get scrollY() {
        return this._tf.scrollY;
    }
    get maxScrollX() {
        return this._tf.maxScrollX;
    }
    get scrollX() {
        return this._tf.scrollX;
    }
    changeScroll() {
        var vShow = this._vScrollBar && this._tf.maxScrollY > 0;
        var hShow = this._hScrollBar && this._tf.maxScrollX > 0;
        var showWidth = vShow ? this._width - this._vScrollBar.width : this._width;
        var showHeight = hShow ? this._height - this._hScrollBar.height : this._height;
        var padding = this._tf.padding || Styles.labelPadding;
        this._tf.width = showWidth;
        this._tf.height = showHeight;
        if (this._vScrollBar) {
            this._vScrollBar.x = this._width - this._vScrollBar.width - padding[2];
            this._vScrollBar.y = padding[1];
            this._vScrollBar.height = this._height - (hShow ? this._hScrollBar.height : 0) - padding[1] - padding[3];
            this._vScrollBar.scrollSize = 1;
            this._vScrollBar.thumbPercent = showHeight / Math.max(this._tf.textHeight, showHeight);
            this._vScrollBar.setScroll(1, this._tf.maxScrollY, this._tf.scrollY);
            this._vScrollBar.visible = vShow;
        }
        if (this._hScrollBar) {
            this._hScrollBar.x = padding[0];
            this._hScrollBar.y = this._height - this._hScrollBar.height - padding[3];
            this._hScrollBar.width = this._width - (vShow ? this._vScrollBar.width : 0) - padding[0] - padding[2];
            this._hScrollBar.scrollSize = Math.max(showWidth * 0.033, 1);
            this._hScrollBar.thumbPercent = showWidth / Math.max(this._tf.textWidth, showWidth);
            this._hScrollBar.setScroll(0, this.maxScrollX, this.scrollX);
            this._hScrollBar.visible = hShow;
        }
    }
    scrollTo(y) {
        this.commitMeasure();
        this._tf.scrollY = y;
    }
}
ILaya.regClass(TextArea);
ClassUtils.regClass("laya.ui.TextArea", TextArea);
ClassUtils.regClass("Laya.TextArea", TextArea);
