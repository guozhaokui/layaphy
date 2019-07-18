import { Box } from "./Box";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class UIGroup extends Box {
    constructor(labels = null, skin = null) {
        super();
        this._selectedIndex = -1;
        this._direction = "horizontal";
        this._space = 0;
        this.skin = skin;
        this.labels = labels;
    }
    preinitialize() {
        this.mouseEnabled = true;
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._items && (this._items.length = 0);
        this._items = null;
        this.selectHandler = null;
    }
    addItem(item, autoLayOut = true) {
        var display = item;
        var index = this._items.length;
        display.name = "item" + index;
        this.addChild(display);
        this.initItems();
        if (autoLayOut && index > 0) {
            var preItem = this._items[index - 1];
            if (this._direction == "horizontal") {
                display.x = preItem._x + preItem.width + this._space;
            }
            else {
                display.y = preItem._y + preItem.height + this._space;
            }
        }
        else {
            if (autoLayOut) {
                display.x = 0;
                display.y = 0;
            }
        }
        return index;
    }
    delItem(item, autoLayOut = true) {
        var index = this._items.indexOf(item);
        if (index != -1) {
            var display = item;
            this.removeChild(display);
            for (var i = index + 1, n = this._items.length; i < n; i++) {
                var child = this._items[i];
                child.name = "item" + (i - 1);
                if (autoLayOut) {
                    if (this._direction == "horizontal") {
                        child.x -= display.width + this._space;
                    }
                    else {
                        child.y -= display.height + this._space;
                    }
                }
            }
            this.initItems();
            if (this._selectedIndex > -1) {
                var newIndex;
                newIndex = this._selectedIndex < this._items.length ? this._selectedIndex : (this._selectedIndex - 1);
                this._selectedIndex = -1;
                this.selectedIndex = newIndex;
            }
        }
    }
    _afterInited() {
        this.initItems();
    }
    initItems() {
        this._items || (this._items = []);
        this._items.length = 0;
        for (var i = 0; i < 10000; i++) {
            var item = this.getChildByName("item" + i);
            if (item == null)
                break;
            this._items.push(item);
            item.selected = (i === this._selectedIndex);
            item.clickHandler = Handler.create(this, this.itemClick, [i], false);
        }
    }
    itemClick(index) {
        this.selectedIndex = index;
    }
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(value) {
        if (this._selectedIndex != value) {
            this.setSelect(this._selectedIndex, false);
            this._selectedIndex = value;
            this.setSelect(value, true);
            this.event(Event.CHANGE);
            this.selectHandler && this.selectHandler.runWith(this._selectedIndex);
        }
    }
    setSelect(index, selected) {
        if (this._items && index > -1 && index < this._items.length)
            this._items[index].selected = selected;
    }
    get skin() {
        return this._skin;
    }
    set skin(value) {
        if (this._skin != value) {
            this._skin = value;
            if (this._skin && !Loader.getRes(this._skin)) {
                window.Laya.loader.load(this._skin, Handler.create(this, this._skinLoaded), null, Loader.IMAGE, 1);
            }
            else {
                this._skinLoaded();
            }
        }
    }
    _skinLoaded() {
        this._setLabelChanged();
        this.event(Event.LOADED);
    }
    get labels() {
        return this._labels;
    }
    set labels(value) {
        if (this._labels != value) {
            this._labels = value;
            this.removeChildren();
            this._setLabelChanged();
            if (this._labels) {
                var a = this._labels.split(",");
                for (var i = 0, n = a.length; i < n; i++) {
                    var item = this.createItem(this._skin, a[i]);
                    item.name = "item" + i;
                    this.addChild(item);
                }
            }
            this.initItems();
        }
    }
    createItem(skin, label) {
        return null;
    }
    get labelColors() {
        return this._labelColors;
    }
    set labelColors(value) {
        if (this._labelColors != value) {
            this._labelColors = value;
            this._setLabelChanged();
        }
    }
    get labelStroke() {
        return this._labelStroke;
    }
    set labelStroke(value) {
        if (this._labelStroke != value) {
            this._labelStroke = value;
            this._setLabelChanged();
        }
    }
    get labelStrokeColor() {
        return this._labelStrokeColor;
    }
    set labelStrokeColor(value) {
        if (this._labelStrokeColor != value) {
            this._labelStrokeColor = value;
            this._setLabelChanged();
        }
    }
    get strokeColors() {
        return this._strokeColors;
    }
    set strokeColors(value) {
        if (this._strokeColors != value) {
            this._strokeColors = value;
            this._setLabelChanged();
        }
    }
    get labelSize() {
        return this._labelSize;
    }
    set labelSize(value) {
        if (this._labelSize != value) {
            this._labelSize = value;
            this._setLabelChanged();
        }
    }
    get stateNum() {
        return this._stateNum;
    }
    set stateNum(value) {
        if (this._stateNum != value) {
            this._stateNum = value;
            this._setLabelChanged();
        }
    }
    get labelBold() {
        return this._labelBold;
    }
    set labelBold(value) {
        if (this._labelBold != value) {
            this._labelBold = value;
            this._setLabelChanged();
        }
    }
    get labelFont() {
        return this._labelFont;
    }
    set labelFont(value) {
        if (this._labelFont != value) {
            this._labelFont = value;
            this._setLabelChanged();
        }
    }
    get labelPadding() {
        return this._labelPadding;
    }
    set labelPadding(value) {
        if (this._labelPadding != value) {
            this._labelPadding = value;
            this._setLabelChanged();
        }
    }
    get direction() {
        return this._direction;
    }
    set direction(value) {
        this._direction = value;
        this._setLabelChanged();
    }
    get space() {
        return this._space;
    }
    set space(value) {
        this._space = value;
        this._setLabelChanged();
    }
    changeLabels() {
        this._labelChanged = false;
        if (this._items) {
            var left = 0;
            for (var i = 0, n = this._items.length; i < n; i++) {
                var btn = this._items[i];
                this._skin && (btn.skin = this._skin);
                this._labelColors && (btn.labelColors = this._labelColors);
                this._labelSize && (btn.labelSize = this._labelSize);
                this._labelStroke && (btn.labelStroke = this._labelStroke);
                this._labelStrokeColor && (btn.labelStrokeColor = this._labelStrokeColor);
                this._strokeColors && (btn.strokeColors = this._strokeColors);
                this._labelBold && (btn.labelBold = this._labelBold);
                this._labelPadding && (btn.labelPadding = this._labelPadding);
                this._labelAlign && (btn.labelAlign = this._labelAlign);
                this._stateNum && (btn.stateNum = this._stateNum);
                this._labelFont && (btn.labelFont = this._labelFont);
                if (this._direction === "horizontal") {
                    btn.y = 0;
                    btn.x = left;
                    left += btn.width + this._space;
                }
                else {
                    btn.x = 0;
                    btn.y = left;
                    left += btn.height + this._space;
                }
            }
        }
        this._sizeChanged();
    }
    commitMeasure() {
        this.runCallLater(this.changeLabels);
    }
    get items() {
        return this._items;
    }
    get selection() {
        return this._selectedIndex > -1 && this._selectedIndex < this._items.length ? this._items[this._selectedIndex] : null;
    }
    set selection(value) {
        this.selectedIndex = this._items.indexOf(value);
    }
    set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.selectedIndex = parseInt(value);
        else if (value instanceof Array)
            this.labels = value.join(",");
        else
            super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
    _setLabelChanged() {
        if (!this._labelChanged) {
            this._labelChanged = true;
            this.callLater(this.changeLabels);
        }
    }
}
ILaya.regClass(UIGroup);
ClassUtils.regClass("laya.ui.UIGroup", UIGroup);
ClassUtils.regClass("Laya.UIGroup", UIGroup);
