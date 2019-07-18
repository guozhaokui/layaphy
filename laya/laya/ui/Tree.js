import { Box } from "./Box";
import { List } from "./List";
import { Event } from "../events/Event";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Tree extends Box {
    constructor() {
        super();
        this._spaceLeft = 10;
        this._spaceBottom = 0;
        this._keepStatus = true;
        this.width = this.height = 200;
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._list && this._list.destroy(destroyChild);
        this._list = null;
        this._source = null;
        this._renderHandler = null;
    }
    createChildren() {
        this.addChild(this._list = new List());
        this._list.renderHandler = Handler.create(this, this.renderItem, null, false);
        this._list.repeatX = 1;
        this._list.on(Event.CHANGE, this, this.onListChange);
    }
    onListChange(e = null) {
        this.event(Event.CHANGE);
    }
    get keepStatus() {
        return this._keepStatus;
    }
    set keepStatus(value) {
        this._keepStatus = value;
    }
    get array() {
        return this._list.array;
    }
    set array(value) {
        if (this._keepStatus && this._list.array && value) {
            this.parseOpenStatus(this._list.array, value);
        }
        this._source = value;
        this._list.array = this.getArray();
    }
    get source() {
        return this._source;
    }
    get list() {
        return this._list;
    }
    get itemRender() {
        return this._list.itemRender;
    }
    set itemRender(value) {
        this._list.itemRender = value;
    }
    get scrollBarSkin() {
        return this._list.vScrollBarSkin;
    }
    set scrollBarSkin(value) {
        this._list.vScrollBarSkin = value;
    }
    get scrollBar() {
        return this._list.scrollBar;
    }
    get mouseHandler() {
        return this._list.mouseHandler;
    }
    set mouseHandler(value) {
        this._list.mouseHandler = value;
    }
    get renderHandler() {
        return this._renderHandler;
    }
    set renderHandler(value) {
        this._renderHandler = value;
    }
    get spaceLeft() {
        return this._spaceLeft;
    }
    set spaceLeft(value) {
        this._spaceLeft = value;
    }
    get spaceBottom() {
        return this._list.spaceY;
    }
    set spaceBottom(value) {
        this._list.spaceY = value;
    }
    get selectedIndex() {
        return this._list.selectedIndex;
    }
    set selectedIndex(value) {
        this._list.selectedIndex = value;
    }
    get selectedItem() {
        return this._list.selectedItem;
    }
    set selectedItem(value) {
        this._list.selectedItem = value;
    }
    set width(value) {
        super.width = value;
        this._list.width = value;
    }
    get width() {
        return super.width;
    }
    set height(value) {
        super.height = value;
        this._list.height = value;
    }
    get height() {
        return super.height;
    }
    getArray() {
        var arr = [];
        for (let item of this._source) {
            if (this.getParentOpenStatus(item)) {
                item.x = this._spaceLeft * this.getDepth(item);
                arr.push(item);
            }
        }
        return arr;
    }
    getDepth(item, num = 0) {
        if (item.nodeParent == null)
            return num;
        else
            return this.getDepth(item.nodeParent, num + 1);
    }
    getParentOpenStatus(item) {
        var parent = item.nodeParent;
        if (parent == null) {
            return true;
        }
        else {
            if (parent.isOpen) {
                if (parent.nodeParent != null)
                    return this.getParentOpenStatus(parent);
                else
                    return true;
            }
            else {
                return false;
            }
        }
    }
    renderItem(cell, index) {
        var item = cell.dataSource;
        if (item) {
            cell.left = item.x;
            var arrow = cell.getChildByName("arrow");
            if (arrow) {
                if (item.hasChild) {
                    arrow.visible = true;
                    arrow.index = item.isOpen ? 1 : 0;
                    arrow.tag = index;
                    arrow.off(Event.CLICK, this, this.onArrowClick);
                    arrow.on(Event.CLICK, this, this.onArrowClick);
                }
                else {
                    arrow.visible = false;
                }
            }
            var folder = cell.getChildByName("folder");
            if (folder) {
                if (folder.clipY == 2) {
                    folder.index = item.isDirectory ? 0 : 1;
                }
                else {
                    folder.index = item.isDirectory ? item.isOpen ? 1 : 0 : 2;
                }
            }
            this._renderHandler && this._renderHandler.runWith([cell, index]);
        }
    }
    onArrowClick(e) {
        var arrow = e.currentTarget;
        var index = arrow.tag;
        this._list.array[index].isOpen = !this._list.array[index].isOpen;
        this.event(Event.OPEN);
        this._list.array = this.getArray();
    }
    setItemState(index, isOpen) {
        if (!this._list.array[index])
            return;
        this._list.array[index].isOpen = isOpen;
        this._list.array = this.getArray();
    }
    fresh() {
        this._list.array = this.getArray();
        this.repaint();
    }
    set dataSource(value) {
        this._dataSource = value;
        super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
    set xml(value) {
        var arr = [];
        this.parseXml(value.childNodes[0], arr, null, true);
        this.array = arr;
    }
    parseXml(xml, source, nodeParent, isRoot) {
        var obj;
        var list = xml.childNodes;
        var childCount = list.length;
        if (!isRoot) {
            obj = {};
            var list2 = xml.attributes;
            for (let attrs of list2) {
                var prop = attrs.nodeName;
                var value = attrs.nodeValue;
                obj[prop] = value == "true" ? true : value == "false" ? false : value;
            }
            obj.nodeParent = nodeParent;
            if (childCount > 0)
                obj.isDirectory = true;
            obj.hasChild = childCount > 0;
            source.push(obj);
        }
        for (var i = 0; i < childCount; i++) {
            var node = list[i];
            this.parseXml(node, source, obj, false);
        }
    }
    parseOpenStatus(oldSource, newSource) {
        for (var i = 0, n = newSource.length; i < n; i++) {
            var newItem = newSource[i];
            if (newItem.isDirectory) {
                for (var j = 0, m = oldSource.length; j < m; j++) {
                    var oldItem = oldSource[j];
                    if (oldItem.isDirectory && this.isSameParent(oldItem, newItem) && newItem.label == oldItem.label) {
                        newItem.isOpen = oldItem.isOpen;
                        break;
                    }
                }
            }
        }
    }
    isSameParent(item1, item2) {
        if (item1.nodeParent == null && item2.nodeParent == null)
            return true;
        else if (item1.nodeParent == null || item2.nodeParent == null)
            return false;
        else {
            if (item1.nodeParent.label == item2.nodeParent.label)
                return this.isSameParent(item1.nodeParent, item2.nodeParent);
            else
                return false;
        }
    }
    get selectedPath() {
        if (this._list.selectedItem) {
            return this._list.selectedItem.path;
        }
        return null;
    }
    filter(key) {
        if (Boolean(key)) {
            var result = [];
            this.getFilterSource(this._source, result, key);
            this._list.array = result;
        }
        else {
            this._list.array = this.getArray();
        }
    }
    getFilterSource(array, result, key) {
        key = key.toLocaleLowerCase();
        for (let item of array) {
            if (!item.isDirectory && String(item.label).toLowerCase().indexOf(key) > -1) {
                item.x = 0;
                result.push(item);
            }
            if (item.child && item.child.length > 0) {
                this.getFilterSource(item.child, result, key);
            }
        }
    }
}
ILaya.regClass(Tree);
ClassUtils.regClass("laya.ui.Tree", Tree);
ClassUtils.regClass("Laya.Tree", Tree);
