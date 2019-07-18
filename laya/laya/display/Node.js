import { Const } from "../Const";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { Pool } from "../utils/Pool";
import { Stat } from "../utils/Stat";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Node extends EventDispatcher {
    constructor() {
        super();
        this._bits = 0;
        this._children = Node.ARRAY_EMPTY;
        this._extUIChild = Node.ARRAY_EMPTY;
        this._parent = null;
        this.name = "";
        this.destroyed = false;
        this.createGLBuffer();
    }
    createGLBuffer() {
    }
    _setBit(type, value) {
        if (type === Const.DISPLAY) {
            var preValue = this._getBit(type);
            if (preValue != value)
                this._updateDisplayedInstage();
        }
        if (value)
            this._bits |= type;
        else
            this._bits &= ~type;
    }
    _getBit(type) {
        return (this._bits & type) != 0;
    }
    _setUpNoticeChain() {
        if (this._getBit(Const.DISPLAY))
            this._setBitUp(Const.DISPLAY);
    }
    _setBitUp(type) {
        var ele = this;
        ele._setBit(type, true);
        ele = ele._parent;
        while (ele) {
            if (ele._getBit(type))
                return;
            ele._setBit(type, true);
            ele = ele._parent;
        }
    }
    on(type, caller, listener, args = null) {
        if (type === Event.DISPLAY || type === Event.UNDISPLAY) {
            if (!this._getBit(Const.DISPLAY))
                this._setBitUp(Const.DISPLAY);
        }
        return this._createListener(type, caller, listener, args, false);
    }
    once(type, caller, listener, args = null) {
        if (type === Event.DISPLAY || type === Event.UNDISPLAY) {
            if (!this._getBit(Const.DISPLAY))
                this._setBitUp(Const.DISPLAY);
        }
        return this._createListener(type, caller, listener, args, true);
    }
    destroy(destroyChild = true) {
        this.destroyed = true;
        this._destroyAllComponent();
        this._parent && this._parent.removeChild(this);
        if (this._children) {
            if (destroyChild)
                this.destroyChildren();
            else
                this.removeChildren();
        }
        this.onDestroy();
        this._children = null;
        this.offAll();
    }
    onDestroy() {
    }
    destroyChildren() {
        if (this._children) {
            for (var i = 0, n = this._children.length; i < n; i++) {
                this._children[0].destroy(true);
            }
        }
    }
    addChild(node) {
        if (!node || this.destroyed || node === this)
            return node;
        if (node._zOrder)
            this._setBit(Const.HAS_ZORDER, true);
        if (node._parent === this) {
            var index = this.getChildIndex(node);
            if (index !== this._children.length - 1) {
                this._children.splice(index, 1);
                this._children.push(node);
                this._childChanged();
            }
        }
        else {
            node._parent && node._parent.removeChild(node);
            this._children === Node.ARRAY_EMPTY && (this._children = []);
            this._children.push(node);
            node._setParent(this);
            this._childChanged();
        }
        return node;
    }
    addInputChild(node) {
        if (this._extUIChild == Node.ARRAY_EMPTY) {
            this._extUIChild = [node];
        }
        else {
            if (this._extUIChild.indexOf(node) >= 0) {
                return null;
            }
            this._extUIChild.push(node);
        }
        return null;
    }
    removeInputChild(node) {
        var idx = this._extUIChild.indexOf(node);
        if (idx >= 0) {
            this._extUIChild.splice(idx, 1);
        }
    }
    addChildren(...args) {
        var i = 0, n = args.length;
        while (i < n) {
            this.addChild(args[i++]);
        }
    }
    addChildAt(node, index) {
        if (!node || this.destroyed || node === this)
            return node;
        if (node._zOrder)
            this._setBit(Const.HAS_ZORDER, true);
        if (index >= 0 && index <= this._children.length) {
            if (node._parent === this) {
                var oldIndex = this.getChildIndex(node);
                this._children.splice(oldIndex, 1);
                this._children.splice(index, 0, node);
                this._childChanged();
            }
            else {
                node._parent && node._parent.removeChild(node);
                this._children === Node.ARRAY_EMPTY && (this._children = []);
                this._children.splice(index, 0, node);
                node._setParent(this);
            }
            return node;
        }
        else {
            throw new Error("appendChildAt:The index is out of bounds");
        }
    }
    getChildIndex(node) {
        return this._children.indexOf(node);
    }
    getChildByName(name) {
        var nodes = this._children;
        if (nodes) {
            for (var i = 0, n = nodes.length; i < n; i++) {
                var node = nodes[i];
                if (node.name === name)
                    return node;
            }
        }
        return null;
    }
    getChildAt(index) {
        return this._children[index] || null;
    }
    setChildIndex(node, index) {
        var childs = this._children;
        if (index < 0 || index >= childs.length) {
            throw new Error("setChildIndex:The index is out of bounds.");
        }
        var oldIndex = this.getChildIndex(node);
        if (oldIndex < 0)
            throw new Error("setChildIndex:node is must child of this object.");
        childs.splice(oldIndex, 1);
        childs.splice(index, 0, node);
        this._childChanged();
        return node;
    }
    _childChanged(child = null) {
    }
    removeChild(node) {
        if (!this._children)
            return node;
        var index = this._children.indexOf(node);
        return this.removeChildAt(index);
    }
    removeSelf() {
        this._parent && this._parent.removeChild(this);
        return this;
    }
    removeChildByName(name) {
        var node = this.getChildByName(name);
        node && this.removeChild(node);
        return node;
    }
    removeChildAt(index) {
        var node = this.getChildAt(index);
        if (node) {
            this._children.splice(index, 1);
            node._setParent(null);
        }
        return node;
    }
    removeChildren(beginIndex = 0, endIndex = 0x7fffffff) {
        if (this._children && this._children.length > 0) {
            var childs = this._children;
            if (beginIndex === 0 && endIndex >= childs.length - 1) {
                var arr = childs;
                this._children = Node.ARRAY_EMPTY;
            }
            else {
                arr = childs.splice(beginIndex, endIndex - beginIndex);
            }
            for (var i = 0, n = arr.length; i < n; i++) {
                arr[i]._setParent(null);
            }
        }
        return this;
    }
    replaceChild(newNode, oldNode) {
        var index = this._children.indexOf(oldNode);
        if (index > -1) {
            this._children.splice(index, 1, newNode);
            oldNode._setParent(null);
            newNode._setParent(this);
            return newNode;
        }
        return null;
    }
    get numChildren() {
        return this._children.length;
    }
    get parent() {
        return this._parent;
    }
    _setParent(value) {
        if (this._parent !== value) {
            if (value) {
                this._parent = value;
                this._onAdded();
                this.event(Event.ADDED);
                if (this._getBit(Const.DISPLAY)) {
                    this._setUpNoticeChain();
                    value.displayedInStage && this._displayChild(this, true);
                }
                value._childChanged(this);
            }
            else {
                this._onRemoved();
                this.event(Event.REMOVED);
                this._parent._childChanged();
                if (this._getBit(Const.DISPLAY))
                    this._displayChild(this, false);
                this._parent = value;
            }
        }
    }
    get displayedInStage() {
        if (this._getBit(Const.DISPLAY))
            return this._getBit(Const.DISPLAYED_INSTAGE);
        this._setBitUp(Const.DISPLAY);
        return this._getBit(Const.DISPLAYED_INSTAGE);
    }
    _updateDisplayedInstage() {
        var ele;
        ele = this;
        var stage = ILaya.stage;
        var displayedInStage = false;
        while (ele) {
            if (ele._getBit(Const.DISPLAY)) {
                displayedInStage = ele._getBit(Const.DISPLAYED_INSTAGE);
                break;
            }
            if (ele === stage || ele._getBit(Const.DISPLAYED_INSTAGE)) {
                displayedInStage = true;
                break;
            }
            ele = ele._parent;
        }
        this._setBit(Const.DISPLAYED_INSTAGE, displayedInStage);
    }
    _setDisplay(value) {
        if (this._getBit(Const.DISPLAYED_INSTAGE) !== value) {
            this._setBit(Const.DISPLAYED_INSTAGE, value);
            if (value)
                this.event(Event.DISPLAY);
            else
                this.event(Event.UNDISPLAY);
        }
    }
    _displayChild(node, display) {
        var childs = node._children;
        if (childs) {
            for (var i = 0, n = childs.length; i < n; i++) {
                var child = childs[i];
                if (!child._getBit(Const.DISPLAY))
                    continue;
                if (child._children.length > 0) {
                    this._displayChild(child, display);
                }
                else {
                    child._setDisplay(display);
                }
            }
        }
        node._setDisplay(display);
    }
    contains(node) {
        if (node === this)
            return true;
        while (node) {
            if (node._parent === this)
                return true;
            node = node._parent;
        }
        return false;
    }
    timerLoop(delay, caller, method, args = null, coverBefore = true, jumpFrame = false) {
        var timer = this.scene ? this.scene.timer : ILaya.timer;
        timer.loop(delay, caller, method, args, coverBefore, jumpFrame);
    }
    timerOnce(delay, caller, method, args = null, coverBefore = true) {
        var timer = this.scene ? this.scene.timer : ILaya.timer;
        timer._create(false, false, delay, caller, method, args, coverBefore);
    }
    frameLoop(delay, caller, method, args = null, coverBefore = true) {
        var timer = this.scene ? this.scene.timer : ILaya.timer;
        timer._create(true, true, delay, caller, method, args, coverBefore);
    }
    frameOnce(delay, caller, method, args = null, coverBefore = true) {
        var timer = this.scene ? this.scene.timer : ILaya.timer;
        timer._create(true, false, delay, caller, method, args, coverBefore);
    }
    clearTimer(caller, method) {
        var timer = this.scene ? this.scene.timer : ILaya.timer;
        timer.clear(caller, method);
    }
    callLater(method, args = null) {
        var timer = this.scene ? this.scene.timer : ILaya.timer;
        timer.callLater(this, method, args);
    }
    runCallLater(method) {
        var timer = this.scene ? this.scene.timer : ILaya.timer;
        timer.runCallLater(this, method);
    }
    get scene() {
        return this._scene;
    }
    get active() {
        return !this._getBit(Const.NOT_READY) && !this._getBit(Const.NOT_ACTIVE);
    }
    set active(value) {
        value = !!value;
        if (!this._getBit(Const.NOT_ACTIVE) !== value) {
            if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
                if (value)
                    throw "Node: can't set the main inActive node active in hierarchy,if the operate is in main inActive node or it's children script's onDisable Event.";
                else
                    throw "Node: can't set the main active node inActive in hierarchy,if the operate is in main active node or it's children script's onEnable Event.";
            }
            else {
                this._setBit(Const.NOT_ACTIVE, !value);
                if (this._parent) {
                    if (this._parent.activeInHierarchy) {
                        if (value)
                            this._processActive();
                        else
                            this._processInActive();
                    }
                }
            }
        }
    }
    get activeInHierarchy() {
        return this._getBit(Const.ACTIVE_INHIERARCHY);
    }
    _onActive() {
        Stat.spriteCount++;
    }
    _onInActive() {
        Stat.spriteCount--;
    }
    _onActiveInScene() {
    }
    _onInActiveInScene() {
    }
    _parse(data, spriteMap) {
    }
    _setBelongScene(scene) {
        if (!this._scene) {
            this._scene = scene;
            this._onActiveInScene();
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._setBelongScene(scene);
        }
    }
    _setUnBelongScene() {
        if (this._scene !== this) {
            this._onInActiveInScene();
            this._scene = null;
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._setUnBelongScene();
        }
    }
    onAwake() {
    }
    onEnable() {
    }
    _processActive() {
        (this._activeChangeScripts) || (this._activeChangeScripts = []);
        this._activeHierarchy(this._activeChangeScripts);
        this._activeScripts();
    }
    _activeHierarchy(activeChangeScripts) {
        this._setBit(Const.ACTIVE_INHIERARCHY, true);
        if (this._components) {
            for (var i = 0, n = this._components.length; i < n; i++) {
                var comp = this._components[i];
                comp._setActive(true);
                (comp._isScript() && comp._enabled) && (activeChangeScripts.push(comp));
            }
        }
        this._onActive();
        for (i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            (!child._getBit(Const.NOT_ACTIVE)) && (child._activeHierarchy(activeChangeScripts));
        }
        if (!this._getBit(Const.AWAKED)) {
            this._setBit(Const.AWAKED, true);
            this.onAwake();
        }
        this.onEnable();
    }
    _activeScripts() {
        for (var i = 0, n = this._activeChangeScripts.length; i < n; i++)
            this._activeChangeScripts[i].onEnable();
        this._activeChangeScripts.length = 0;
    }
    _processInActive() {
        (this._activeChangeScripts) || (this._activeChangeScripts = []);
        this._inActiveHierarchy(this._activeChangeScripts);
        this._inActiveScripts();
    }
    _inActiveHierarchy(activeChangeScripts) {
        this._onInActive();
        if (this._components) {
            for (var i = 0, n = this._components.length; i < n; i++) {
                var comp = this._components[i];
                comp._setActive(false);
                (comp._isScript() && comp._enabled) && (activeChangeScripts.push(comp));
            }
        }
        this._setBit(Const.ACTIVE_INHIERARCHY, false);
        for (i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            (child && !child._getBit(Const.NOT_ACTIVE)) && (child._inActiveHierarchy(activeChangeScripts));
        }
        this.onDisable();
    }
    _inActiveScripts() {
        for (var i = 0, n = this._activeChangeScripts.length; i < n; i++)
            this._activeChangeScripts[i].onDisable();
        this._activeChangeScripts.length = 0;
    }
    onDisable() {
    }
    _onAdded() {
        if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
            throw "Node: can't set the main inActive node active in hierarchy,if the operate is in main inActive node or it's children script's onDisable Event.";
        }
        else {
            var parentScene = this._parent.scene;
            parentScene && this._setBelongScene(parentScene);
            (this._parent.activeInHierarchy && this.active) && this._processActive();
        }
    }
    _onRemoved() {
        if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
            throw "Node: can't set the main active node inActive in hierarchy,if the operate is in main active node or it's children script's onEnable Event.";
        }
        else {
            (this._parent.activeInHierarchy && this.active) && this._processInActive();
            this._parent.scene && this._setUnBelongScene();
        }
    }
    _addComponentInstance(comp) {
        this._components = this._components || [];
        this._components.push(comp);
        comp.owner = this;
        comp._onAdded();
        if (this.activeInHierarchy) {
            comp._setActive(true);
            (comp._isScript() && comp._enabled) && (comp.onEnable());
        }
    }
    _destroyComponent(comp) {
        if (this._components) {
            for (var i = 0, n = this._components.length; i < n; i++) {
                var item = this._components[i];
                if (item === comp) {
                    item._destroy();
                    this._components.splice(i, 1);
                    break;
                }
            }
        }
    }
    _destroyAllComponent() {
        if (this._components) {
            for (var i = 0, n = this._components.length; i < n; i++) {
                var item = this._components[i];
                item._destroy();
            }
            this._components.length = 0;
        }
    }
    _cloneTo(destObject, srcRoot, dstRoot) {
        var destNode = destObject;
        if (this._components) {
            for (var i = 0, n = this._components.length; i < n; i++) {
                var destComponent = destNode.addComponent(this._components[i].constructor);
                this._components[i]._cloneTo(destComponent);
            }
        }
    }
    addComponentIntance(comp) {
        if (comp.owner)
            throw "Node:the component has belong to other node.";
        if (comp.isSingleton && this.getComponent(comp.constructor))
            throw "Node:the component is singleton,can't add the second one.";
        this._addComponentInstance(comp);
        return comp;
    }
    addComponent(type) {
        var comp = Pool.createByClass(type);
        comp._destroyed = false;
        if (comp.isSingleton && this.getComponent(type))
            throw "无法实例" + type + "组件" + "，" + type + "组件已存在！";
        this._addComponentInstance(comp);
        return comp;
    }
    getComponent(clas) {
        if (this._components) {
            for (var i = 0, n = this._components.length; i < n; i++) {
                var comp = this._components[i];
                if (comp instanceof clas)
                    return comp;
            }
        }
        return null;
    }
    getComponents(clas) {
        var arr;
        if (this._components) {
            for (var i = 0, n = this._components.length; i < n; i++) {
                var comp = this._components[i];
                if (comp instanceof clas) {
                    arr = arr || [];
                    arr.push(comp);
                }
            }
        }
        return arr;
    }
    get timer() {
        return this.scene ? this.scene.timer : ILaya.timer;
    }
}
Node.ARRAY_EMPTY = [];
ClassUtils.regClass("laya.display.Node", Node);
ClassUtils.regClass("Laya.Node", Node);
