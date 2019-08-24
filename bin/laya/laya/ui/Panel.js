import { Box } from "./Box";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { Event } from "../events/Event";
import { Rectangle } from "../maths/Rectangle";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Panel extends Box {
    constructor() {
        super();
        this._usedCache = null;
        this._elasticEnabled = false;
        this.width = this.height = 100;
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._content && this._content.destroy(destroyChild);
        this._vScrollBar && this._vScrollBar.destroy(destroyChild);
        this._hScrollBar && this._hScrollBar.destroy(destroyChild);
        this._vScrollBar = null;
        this._hScrollBar = null;
        this._content = null;
    }
    destroyChildren() {
        this._content.destroyChildren();
    }
    createChildren() {
        super.addChild(this._content = new Box());
    }
    addChild(child) {
        child.on(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.addChild(child);
    }
    onResize() {
        this._setScrollChanged();
    }
    addChildAt(child, index) {
        child.on(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.addChildAt(child, index);
    }
    removeChild(child) {
        child.off(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.removeChild(child);
    }
    removeChildAt(index) {
        this.getChildAt(index).off(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.removeChildAt(index);
    }
    removeChildren(beginIndex = 0, endIndex = 0x7fffffff) {
        this._content.removeChildren(beginIndex, endIndex);
        this._setScrollChanged();
        return this;
    }
    getChildAt(index) {
        return this._content.getChildAt(index);
    }
    getChildByName(name) {
        return this._content.getChildByName(name);
    }
    getChildIndex(child) {
        return this._content.getChildIndex(child);
    }
    get numChildren() {
        return this._content.numChildren;
    }
    changeScroll() {
        this._scrollChanged = false;
        var contentW = this.contentWidth || 1;
        var contentH = this.contentHeight || 1;
        var vscroll = this._vScrollBar;
        var hscroll = this._hScrollBar;
        var vShow = vscroll && contentH > this._height;
        var hShow = hscroll && contentW > this._width;
        var showWidth = vShow ? this._width - vscroll.width : this._width;
        var showHeight = hShow ? this._height - hscroll.height : this._height;
        if (vscroll) {
            vscroll.x = this._width - vscroll.width;
            vscroll.y = 0;
            vscroll.height = this._height - (hShow ? hscroll.height : 0);
            vscroll.scrollSize = Math.max(this._height * 0.033, 1);
            vscroll.thumbPercent = showHeight / contentH;
            vscroll.setScroll(0, contentH - showHeight, vscroll.value);
        }
        if (hscroll) {
            hscroll.x = 0;
            hscroll.y = this._height - hscroll.height;
            hscroll.width = this._width - (vShow ? vscroll.width : 0);
            hscroll.scrollSize = Math.max(this._width * 0.033, 1);
            hscroll.thumbPercent = showWidth / contentW;
            hscroll.setScroll(0, contentW - showWidth, hscroll.value);
        }
    }
    _sizeChanged() {
        super._sizeChanged();
        this.setContentSize(this._width, this._height);
    }
    get contentWidth() {
        var max = 0;
        for (var i = this._content.numChildren - 1; i > -1; i--) {
            var comp = this._content.getChildAt(i);
            max = Math.max(comp._x + comp.width * comp.scaleX - comp.pivotX, max);
        }
        return max;
    }
    get contentHeight() {
        var max = 0;
        for (var i = this._content.numChildren - 1; i > -1; i--) {
            var comp = this._content.getChildAt(i);
            max = Math.max(comp._y + comp.height * comp.scaleY - comp.pivotY, max);
        }
        return max;
    }
    setContentSize(width, height) {
        var content = this._content;
        content.width = width;
        content.height = height;
        content._style.scrollRect || (content.scrollRect = Rectangle.create());
        content._style.scrollRect.setTo(0, 0, width, height);
        content.scrollRect = content.scrollRect;
    }
    set width(value) {
        super.width = value;
        this._setScrollChanged();
    }
    get width() {
        return super.width;
    }
    set height(value) {
        super.height = value;
        this._setScrollChanged();
    }
    get height() {
        return super.height;
    }
    get vScrollBarSkin() {
        return this._vScrollBar ? this._vScrollBar.skin : null;
    }
    set vScrollBarSkin(value) {
        if (this._vScrollBar == null) {
            super.addChild(this._vScrollBar = new VScrollBar());
            this._vScrollBar.on(Event.CHANGE, this, this.onScrollBarChange, [this._vScrollBar]);
            this._vScrollBar.target = this._content;
            this._vScrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
            this._setScrollChanged();
        }
        this._vScrollBar.skin = value;
    }
    get hScrollBarSkin() {
        return this._hScrollBar ? this._hScrollBar.skin : null;
    }
    set hScrollBarSkin(value) {
        if (this._hScrollBar == null) {
            super.addChild(this._hScrollBar = new HScrollBar());
            this._hScrollBar.on(Event.CHANGE, this, this.onScrollBarChange, [this._hScrollBar]);
            this._hScrollBar.target = this._content;
            this._hScrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
            this._setScrollChanged();
        }
        this._hScrollBar.skin = value;
    }
    get vScrollBar() {
        return this._vScrollBar;
    }
    get hScrollBar() {
        return this._hScrollBar;
    }
    get content() {
        return this._content;
    }
    onScrollBarChange(scrollBar) {
        var rect = this._content._style.scrollRect;
        if (rect) {
            var start = Math.round(scrollBar.value);
            scrollBar.isVertical ? rect.y = start : rect.x = start;
            this._content.scrollRect = rect;
        }
    }
    scrollTo(x = 0, y = 0) {
        if (this.vScrollBar)
            this.vScrollBar.value = y;
        if (this.hScrollBar)
            this.hScrollBar.value = x;
    }
    refresh() {
        this.changeScroll();
    }
    set cacheAs(value) {
        super.cacheAs = value;
        this._usedCache = null;
        if (value !== "none") {
            this._hScrollBar && this._hScrollBar.on(Event.START, this, this.onScrollStart);
            this._vScrollBar && this._vScrollBar.on(Event.START, this, this.onScrollStart);
        }
        else {
            this._hScrollBar && this._hScrollBar.off(Event.START, this, this.onScrollStart);
            this._vScrollBar && this._vScrollBar.off(Event.START, this, this.onScrollStart);
        }
    }
    get cacheAs() {
        return super.cacheAs;
    }
    get elasticEnabled() {
        return this._elasticEnabled;
    }
    set elasticEnabled(value) {
        this._elasticEnabled = value;
        if (this._vScrollBar) {
            this._vScrollBar.elasticDistance = value ? 200 : 0;
        }
        if (this._hScrollBar) {
            this._hScrollBar.elasticDistance = value ? 200 : 0;
        }
    }
    onScrollStart() {
        this._usedCache || (this._usedCache = super.cacheAs);
        super.cacheAs = "none";
        this._hScrollBar && this._hScrollBar.once(Event.END, this, this.onScrollEnd);
        this._vScrollBar && this._vScrollBar.once(Event.END, this, this.onScrollEnd);
    }
    onScrollEnd() {
        super.cacheAs = this._usedCache;
    }
    _setScrollChanged() {
        if (!this._scrollChanged) {
            this._scrollChanged = true;
            this.callLater(this.changeScroll);
        }
    }
}
ILaya.regClass(Panel);
ClassUtils.regClass("laya.ui.Panel", Panel);
ClassUtils.regClass("Laya.Panel", Panel);
