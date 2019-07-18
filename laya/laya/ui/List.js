import { Box } from "./Box";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { UIUtils } from "./UIUtils";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { SceneUtils } from "../utils/SceneUtils";
import { Tween } from "../utils/Tween";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class List extends Box {
    constructor() {
        super(...arguments);
        this.selectEnable = false;
        this.totalPage = 0;
        this._$componentType = "List";
        this._repeatX = 0;
        this._repeatY = 0;
        this._repeatX2 = 0;
        this._repeatY2 = 0;
        this._spaceX = 0;
        this._spaceY = 0;
        this._cells = [];
        this._startIndex = 0;
        this._selectedIndex = -1;
        this._page = 0;
        this._isVertical = true;
        this._cellSize = 20;
        this._cellOffset = 0;
        this._createdLine = 0;
        this._offset = new Point();
        this._usedCache = null;
        this._elasticEnabled = false;
        this._preLen = 0;
    }
    destroy(destroyChild = true) {
        this._content && this._content.destroy(destroyChild);
        this._scrollBar && this._scrollBar.destroy(destroyChild);
        super.destroy(destroyChild);
        this._content = null;
        this._scrollBar = null;
        this._itemRender = null;
        this._cells = null;
        this._array = null;
        this.selectHandler = this.renderHandler = this.mouseHandler = null;
    }
    createChildren() {
        this.addChild(this._content = new Box());
    }
    set cacheAs(value) {
        super.cacheAs = value;
        if (this._scrollBar) {
            this._usedCache = null;
            if (value !== "none")
                this._scrollBar.on(Event.START, this, this.onScrollStart);
            else
                this._scrollBar.off(Event.START, this, this.onScrollStart);
        }
    }
    get cacheAs() {
        return super.cacheAs;
    }
    onScrollStart() {
        this._usedCache || (this._usedCache = super.cacheAs);
        super.cacheAs = "none";
        this._scrollBar.once(Event.END, this, this.onScrollEnd);
    }
    onScrollEnd() {
        super.cacheAs = this._usedCache;
    }
    get content() {
        return this._content;
    }
    get vScrollBarSkin() {
        return this._scrollBar ? this._scrollBar.skin : null;
    }
    set vScrollBarSkin(value) {
        this._removePreScrollBar();
        var scrollBar = new VScrollBar();
        scrollBar.name = "scrollBar";
        scrollBar.right = 0;
        scrollBar.skin = value;
        scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
        this.scrollBar = scrollBar;
        this.addChild(scrollBar);
        this._setCellChanged();
    }
    _removePreScrollBar() {
        var preNode = this.removeChildByName("scrollBar");
        if (preNode)
            preNode.destroy(true);
    }
    get hScrollBarSkin() {
        return this._scrollBar ? this._scrollBar.skin : null;
    }
    set hScrollBarSkin(value) {
        this._removePreScrollBar();
        var scrollBar = new HScrollBar();
        scrollBar.name = "scrollBar";
        scrollBar.bottom = 0;
        scrollBar.skin = value;
        scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
        this.scrollBar = scrollBar;
        this.addChild(scrollBar);
        this._setCellChanged();
    }
    get scrollBar() {
        return this._scrollBar;
    }
    set scrollBar(value) {
        if (this._scrollBar != value) {
            this._scrollBar = value;
            if (value) {
                this._isVertical = this._scrollBar.isVertical;
                this.addChild(this._scrollBar);
                this._scrollBar.on(Event.CHANGE, this, this.onScrollBarChange);
            }
        }
    }
    get itemRender() {
        return this._itemRender;
    }
    set itemRender(value) {
        if (this._itemRender != value) {
            this._itemRender = value;
            for (var i = this._cells.length - 1; i > -1; i--) {
                this._cells[i].destroy();
            }
            this._cells.length = 0;
            this._setCellChanged();
        }
    }
    set width(value) {
        if (value != this._width) {
            super.width = value;
            this._setCellChanged();
        }
    }
    get width() {
        return super.width;
    }
    set height(value) {
        if (value != this._height) {
            super.height = value;
            this._setCellChanged();
        }
    }
    get height() {
        return super.height;
    }
    get repeatX() {
        return this._repeatX > 0 ? this._repeatX : this._repeatX2 > 0 ? this._repeatX2 : 1;
    }
    set repeatX(value) {
        this._repeatX = value;
        this._setCellChanged();
    }
    get repeatY() {
        return this._repeatY > 0 ? this._repeatY : this._repeatY2 > 0 ? this._repeatY2 : 1;
    }
    set repeatY(value) {
        this._repeatY = value;
        this._setCellChanged();
    }
    get spaceX() {
        return this._spaceX;
    }
    set spaceX(value) {
        this._spaceX = value;
        this._setCellChanged();
    }
    get spaceY() {
        return this._spaceY;
    }
    set spaceY(value) {
        this._spaceY = value;
        this._setCellChanged();
    }
    changeCells() {
        this._cellChanged = false;
        if (this._itemRender) {
            this.scrollBar = this.getChildByName("scrollBar");
            var cell = this._getOneCell();
            var cellWidth = (cell.width + this._spaceX) || 1;
            var cellHeight = (cell.height + this._spaceY) || 1;
            if (this._width > 0)
                this._repeatX2 = this._isVertical ? Math.round(this._width / cellWidth) : Math.ceil(this._width / cellWidth);
            if (this._height > 0)
                this._repeatY2 = this._isVertical ? Math.ceil(this._height / cellHeight) : Math.round(this._height / cellHeight);
            var listWidth = this._width ? this._width : (cellWidth * this.repeatX - this._spaceX);
            var listHeight = this._height ? this._height : (cellHeight * this.repeatY - this._spaceY);
            this._cellSize = this._isVertical ? cellHeight : cellWidth;
            this._cellOffset = this._isVertical ? (cellHeight * Math.max(this._repeatY2, this._repeatY) - listHeight - this._spaceY) : (cellWidth * Math.max(this._repeatX2, this._repeatX) - listWidth - this._spaceX);
            if (this._isVertical && this.vScrollBarSkin)
                this._scrollBar.height = listHeight;
            else if (!this._isVertical && this.hScrollBarSkin)
                this._scrollBar.width = listWidth;
            this.setContentSize(listWidth, listHeight);
            var numX = this._isVertical ? this.repeatX : this.repeatY;
            var numY = (this._isVertical ? this.repeatY : this.repeatX) + (this._scrollBar ? 1 : 0);
            this._createItems(0, numX, numY);
            this._createdLine = numY;
            if (this._array) {
                this.array = this._array;
                this.runCallLater(this.renderItems);
            }
        }
    }
    _getOneCell() {
        if (this._cells.length === 0) {
            var item = this.createItem();
            this._offset.setTo(item._x, item._y);
            if (this.cacheContent)
                return item;
            this._cells.push(item);
        }
        return this._cells[0];
    }
    _createItems(startY, numX, numY) {
        var box = this._content;
        var cell = this._getOneCell();
        var cellWidth = cell.width + this._spaceX;
        var cellHeight = cell.height + this._spaceY;
        if (this.cacheContent) {
            var cacheBox = new Box();
            cacheBox.cacheAs = "normal";
            cacheBox.pos((this._isVertical ? 0 : startY) * cellWidth, (this._isVertical ? startY : 0) * cellHeight);
            this._content.addChild(cacheBox);
            box = cacheBox;
        }
        else {
            var arr = [];
            for (var i = this._cells.length - 1; i > -1; i--) {
                var item = this._cells[i];
                item.removeSelf();
                arr.push(item);
            }
            this._cells.length = 0;
        }
        for (var k = startY; k < numY; k++) {
            for (var l = 0; l < numX; l++) {
                if (arr && arr.length) {
                    cell = arr.pop();
                }
                else {
                    cell = this.createItem();
                }
                cell.x = (this._isVertical ? l : k) * cellWidth - box._x;
                cell.y = (this._isVertical ? k : l) * cellHeight - box._y;
                cell.name = "item" + (k * numX + l);
                box.addChild(cell);
                this.addCell(cell);
            }
        }
    }
    createItem() {
        var arr = [];
        if (this._itemRender instanceof Function) {
            var box = new this._itemRender();
        }
        else {
            box = SceneUtils.createComp(this._itemRender, null, null, arr);
        }
        if (arr.length == 0 && box["_watchMap"]) {
            var watchMap = box["_watchMap"];
            for (var name in watchMap) {
                var a = watchMap[name];
                for (var i = 0; i < a.length; i++) {
                    var watcher = a[i];
                    arr.push(watcher.comp, watcher.prop, watcher.value);
                }
            }
        }
        if (arr.length)
            box["_$bindData"] = arr;
        return box;
    }
    addCell(cell) {
        cell.on(Event.CLICK, this, this.onCellMouse);
        cell.on(Event.RIGHT_CLICK, this, this.onCellMouse);
        cell.on(Event.MOUSE_OVER, this, this.onCellMouse);
        cell.on(Event.MOUSE_OUT, this, this.onCellMouse);
        cell.on(Event.MOUSE_DOWN, this, this.onCellMouse);
        cell.on(Event.MOUSE_UP, this, this.onCellMouse);
        this._cells.push(cell);
    }
    _afterInited() {
        this.initItems();
    }
    initItems() {
        if (!this._itemRender && this.getChildByName("item0") != null) {
            this.repeatX = 1;
            var count;
            count = 0;
            for (var i = 0; i < 10000; i++) {
                var cell = this.getChildByName("item" + i);
                if (cell) {
                    this.addCell(cell);
                    count++;
                    continue;
                }
                break;
            }
            this.repeatY = count;
        }
    }
    setContentSize(width, height) {
        this._content.width = width;
        this._content.height = height;
        if (this._scrollBar || this._offset.x != 0 || this._offset.y != 0) {
            this._content._style.scrollRect || (this._content.scrollRect = Rectangle.create());
            this._content._style.scrollRect.setTo(-this._offset.x, -this._offset.y, width, height);
            this._content.scrollRect = this._content.scrollRect;
        }
        this.event(Event.RESIZE);
    }
    onCellMouse(e) {
        if (e.type === Event.MOUSE_DOWN)
            this._isMoved = false;
        var cell = e.currentTarget;
        var index = this._startIndex + this._cells.indexOf(cell);
        if (index < 0)
            return;
        if (e.type === Event.CLICK || e.type === Event.RIGHT_CLICK) {
            if (this.selectEnable && !this._isMoved)
                this.selectedIndex = index;
            else
                this.changeCellState(cell, true, 0);
        }
        else if ((e.type === Event.MOUSE_OVER || e.type === Event.MOUSE_OUT) && this._selectedIndex !== index) {
            this.changeCellState(cell, e.type === Event.MOUSE_OVER, 0);
        }
        this.mouseHandler && this.mouseHandler.runWith([e, index]);
    }
    changeCellState(cell, visible, index) {
        var selectBox = cell.getChildByName("selectBox");
        if (selectBox) {
            this.selectEnable = true;
            selectBox.visible = visible;
            selectBox.index = index;
        }
    }
    _sizeChanged() {
        super._sizeChanged();
        this.setContentSize(this.width, this.height);
        if (this._scrollBar)
            this.callLater(this.onScrollBarChange);
    }
    onScrollBarChange(e = null) {
        this.runCallLater(this.changeCells);
        var scrollValue = this._scrollBar.value;
        var lineX = (this._isVertical ? this.repeatX : this.repeatY);
        var lineY = (this._isVertical ? this.repeatY : this.repeatX);
        var scrollLine = Math.floor(scrollValue / this._cellSize);
        if (!this.cacheContent) {
            var index = scrollLine * lineX;
            var num = 0;
            if (index > this._startIndex) {
                num = index - this._startIndex;
                var down = true;
                var toIndex = this._startIndex + lineX * (lineY + 1);
                this._isMoved = true;
            }
            else if (index < this._startIndex) {
                num = this._startIndex - index;
                down = false;
                toIndex = this._startIndex - 1;
                this._isMoved = true;
            }
            for (var i = 0; i < num; i++) {
                if (down) {
                    var cell = this._cells.shift();
                    this._cells[this._cells.length] = cell;
                    var cellIndex = toIndex + i;
                }
                else {
                    cell = this._cells.pop();
                    this._cells.unshift(cell);
                    cellIndex = toIndex - i;
                }
                var pos = Math.floor(cellIndex / lineX) * this._cellSize;
                this._isVertical ? cell.y = pos : cell.x = pos;
                this.renderItem(cell, cellIndex);
            }
            this._startIndex = index;
            this.changeSelectStatus();
        }
        else {
            num = (lineY + 1);
            if (this._createdLine - scrollLine < num) {
                this._createItems(this._createdLine, lineX, this._createdLine + num);
                this.renderItems(this._createdLine * lineX, 0);
                this._createdLine += num;
            }
        }
        var r = this._content._style.scrollRect;
        if (this._isVertical) {
            r.y = scrollValue - this._offset.y;
            r.x = -this._offset.x;
        }
        else {
            r.y = -this._offset.y;
            r.x = scrollValue - this._offset.x;
        }
        this._content.scrollRect = r;
    }
    posCell(cell, cellIndex) {
        if (!this._scrollBar)
            return;
        var lineX = (this._isVertical ? this.repeatX : this.repeatY);
        var lineY = (this._isVertical ? this.repeatY : this.repeatX);
        var pos = Math.floor(cellIndex / lineX) * this._cellSize;
        this._isVertical ? cell._y = pos : cell.x = pos;
    }
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(value) {
        if (this._selectedIndex != value) {
            this._selectedIndex = value;
            this.changeSelectStatus();
            this.event(Event.CHANGE);
            this.selectHandler && this.selectHandler.runWith(value);
            this.startIndex = this._startIndex;
        }
    }
    changeSelectStatus() {
        for (var i = 0, n = this._cells.length; i < n; i++) {
            this.changeCellState(this._cells[i], this._selectedIndex === this._startIndex + i, 1);
        }
    }
    get selectedItem() {
        return this._selectedIndex != -1 ? this._array[this._selectedIndex] : null;
    }
    set selectedItem(value) {
        this.selectedIndex = this._array.indexOf(value);
    }
    get selection() {
        return this.getCell(this._selectedIndex);
    }
    set selection(value) {
        this.selectedIndex = this._startIndex + this._cells.indexOf(value);
    }
    get startIndex() {
        return this._startIndex;
    }
    set startIndex(value) {
        this._startIndex = value > 0 ? value : 0;
        this.callLater(this.renderItems);
    }
    renderItems(from = 0, to = 0) {
        for (var i = from, n = to || this._cells.length; i < n; i++) {
            this.renderItem(this._cells[i], this._startIndex + i);
        }
        this.changeSelectStatus();
    }
    renderItem(cell, index) {
        if (this._array && index >= 0 && index < this._array.length) {
            cell.visible = true;
            if (cell["_$bindData"]) {
                cell["_dataSource"] = this._array[index];
                this._bindData(cell, this._array[index]);
            }
            else
                cell.dataSource = this._array[index];
            if (!this.cacheContent) {
                this.posCell(cell, index);
            }
            if (this.hasListener(Event.RENDER))
                this.event(Event.RENDER, [cell, index]);
            if (this.renderHandler)
                this.renderHandler.runWith([cell, index]);
        }
        else {
            cell.visible = false;
            cell.dataSource = null;
        }
    }
    _bindData(cell, data) {
        var arr = cell._$bindData;
        for (var i = 0, n = arr.length; i < n; i++) {
            var ele = arr[i++];
            var prop = arr[i++];
            var value = arr[i];
            var fun = UIUtils.getBindFun(value);
            ele[prop] = fun.call(this, data);
        }
    }
    get array() {
        return this._array;
    }
    set array(value) {
        this.runCallLater(this.changeCells);
        this._array = value || [];
        this._preLen = this._array.length;
        var length = this._array.length;
        this.totalPage = Math.ceil(length / (this.repeatX * this.repeatY));
        this._selectedIndex = this._selectedIndex < length ? this._selectedIndex : length - 1;
        this.startIndex = this._startIndex;
        if (this._scrollBar) {
            this._scrollBar.stopScroll();
            var numX = this._isVertical ? this.repeatX : this.repeatY;
            var numY = this._isVertical ? this.repeatY : this.repeatX;
            var lineCount = Math.ceil(length / numX);
            var total = this._cellOffset > 0 ? this.totalPage + 1 : this.totalPage;
            if (total > 1 && lineCount >= numY) {
                this._scrollBar.scrollSize = this._cellSize;
                this._scrollBar.thumbPercent = numY / lineCount;
                this._scrollBar.setScroll(0, (lineCount - numY) * this._cellSize + this._cellOffset, this._scrollBar.value);
                this._scrollBar.target = this._content;
            }
            else {
                this._scrollBar.setScroll(0, 0, 0);
                this._scrollBar.target = this._content;
            }
        }
    }
    updateArray(array) {
        this._array = array;
        var freshStart;
        if (this._array) {
            freshStart = this._preLen - this._startIndex;
            if (freshStart >= 0)
                this.renderItems(freshStart);
            this._preLen = this._array.length;
        }
        if (this._scrollBar) {
            var length = array.length;
            var numX = this._isVertical ? this.repeatX : this.repeatY;
            var numY = this._isVertical ? this.repeatY : this.repeatX;
            var lineCount = Math.ceil(length / numX);
            if (lineCount >= numY) {
                this._scrollBar.thumbPercent = numY / lineCount;
                this._scrollBar.slider["_max"] = (lineCount - numY) * this._cellSize + this._cellOffset;
            }
        }
    }
    get page() {
        return this._page;
    }
    set page(value) {
        this._page = value;
        if (this._array) {
            this._page = value > 0 ? value : 0;
            this._page = this._page < this.totalPage ? this._page : this.totalPage - 1;
            this.startIndex = this._page * this.repeatX * this.repeatY;
        }
    }
    get length() {
        return this._array ? this._array.length : 0;
    }
    set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.selectedIndex = parseInt(value);
        else if (value instanceof Array)
            this.array = value;
        else
            super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
    get cells() {
        this.runCallLater(this.changeCells);
        return this._cells;
    }
    get elasticEnabled() {
        return this._elasticEnabled;
    }
    set elasticEnabled(value) {
        this._elasticEnabled = value;
        if (this._scrollBar) {
            this._scrollBar.elasticDistance = value ? 200 : 0;
        }
    }
    refresh() {
        this.array = this._array;
    }
    getItem(index) {
        if (index > -1 && index < this._array.length) {
            return this._array[index];
        }
        return null;
    }
    changeItem(index, source) {
        if (index > -1 && index < this._array.length) {
            this._array[index] = source;
            if (index >= this._startIndex && index < this._startIndex + this._cells.length) {
                this.renderItem(this.getCell(index), index);
            }
        }
    }
    setItem(index, source) {
        this.changeItem(index, source);
    }
    addItem(souce) {
        this._array.push(souce);
        this.array = this._array;
    }
    addItemAt(souce, index) {
        this._array.splice(index, 0, souce);
        this.array = this._array;
    }
    deleteItem(index) {
        this._array.splice(index, 1);
        this.array = this._array;
    }
    getCell(index) {
        this.runCallLater(this.changeCells);
        if (index > -1 && this._cells) {
            return this._cells[(index - this._startIndex) % this._cells.length];
        }
        return null;
    }
    scrollTo(index) {
        if (this._scrollBar) {
            var numX = this._isVertical ? this.repeatX : this.repeatY;
            this._scrollBar.value = Math.floor(index / numX) * this._cellSize;
        }
        else {
            this.startIndex = index;
        }
    }
    tweenTo(index, time = 200, complete = null) {
        if (this._scrollBar) {
            this._scrollBar.stopScroll();
            var numX = this._isVertical ? this.repeatX : this.repeatY;
            Tween.to(this._scrollBar, { value: Math.floor(index / numX) * this._cellSize }, time, null, complete, 0, true);
        }
        else {
            this.startIndex = index;
            if (complete)
                complete.run();
        }
    }
    _setCellChanged() {
        if (!this._cellChanged) {
            this._cellChanged = true;
            this.callLater(this.changeCells);
        }
    }
    commitMeasure() {
        this.runCallLater(this.changeCells);
    }
}
ILaya.regClass(List);
ClassUtils.regClass("laya.ui.List", List);
ClassUtils.regClass("Laya.List", List);
