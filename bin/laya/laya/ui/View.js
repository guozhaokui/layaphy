import { Widget } from "./Widget";
import { Animation } from "../display/Animation";
import { Scene } from "../display/Scene";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { Box } from "./Box";
import { Button } from "./Button";
import { CheckBox } from "./CheckBox";
import { Image } from "./Image";
import { Label } from "./Label";
import { ProgressBar } from "./ProgressBar";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";
import { Tab } from "./Tab";
import { UIComponent } from "./UIComponent";
import { ViewStack } from "./ViewStack";
import { TextArea } from "./TextArea";
import { ColorPicker } from "./ColorPicker";
import { ScaleBox } from "./ScaleBox";
import { Clip } from "./Clip";
import { ComboBox } from "./ComboBox";
import { HScrollBar } from "./HScrollBar";
import { HSlider } from "./HSlider";
import { List } from "./List";
import { Panel } from "./Panel";
import { ScrollBar } from "./ScrollBar";
import { Slider } from "./Slider";
import { TextInput } from "./TextInput";
import { VScrollBar } from "./VScrollBar";
import { VSlider } from "./VSlider";
import { Tree } from "./Tree";
import { HBox } from "./HBox";
import { VBox } from "./VBox";
import { FontClip } from "./FontClip";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class View extends Scene {
    constructor() {
        super();
        this._watchMap = {};
        this._anchorX = NaN;
        this._anchorY = NaN;
        this._widget = Widget.EMPTY;
    }
    static __init__() {
        ILaya.ClassUtils.regShortClassName([ViewStack, Button, TextArea, ColorPicker, Box, ScaleBox, CheckBox, Clip, ComboBox, UIComponent,
            HScrollBar, HSlider, Image, Label, List, Panel, ProgressBar, Radio, RadioGroup, ScrollBar, Slider, Tab, TextInput, View,
            VScrollBar, VSlider, Tree, HBox, VBox, Animation, Text, FontClip]);
    }
    static regComponent(key, compClass) {
        ILaya.ClassUtils.regClass(key, compClass);
    }
    static regViewRuntime(key, compClass) {
        ILaya.ClassUtils.regClass(key, compClass);
    }
    static regUI(url, json) {
        window.Laya.loader.cacheRes(url, json);
    }
    destroy(destroyChild = true) {
        this._watchMap = null;
        super.destroy(destroyChild);
    }
    changeData(key) {
        var arr = this._watchMap[key];
        if (!arr)
            return;
        for (var i = 0, n = arr.length; i < n; i++) {
            var watcher = arr[i];
            watcher.exe(this);
        }
    }
    get top() {
        return this._widget.top;
    }
    set top(value) {
        if (value != this._widget.top) {
            this._getWidget().top = value;
        }
    }
    get bottom() {
        return this._widget.bottom;
    }
    set bottom(value) {
        if (value != this._widget.bottom) {
            this._getWidget().bottom = value;
        }
    }
    get left() {
        return this._widget.left;
    }
    set left(value) {
        if (value != this._widget.left) {
            this._getWidget().left = value;
        }
    }
    get right() {
        return this._widget.right;
    }
    set right(value) {
        if (value != this._widget.right) {
            this._getWidget().right = value;
        }
    }
    get centerX() {
        return this._widget.centerX;
    }
    set centerX(value) {
        if (value != this._widget.centerX) {
            this._getWidget().centerX = value;
        }
    }
    get centerY() {
        return this._widget.centerY;
    }
    set centerY(value) {
        if (value != this._widget.centerY) {
            this._getWidget().centerY = value;
        }
    }
    get anchorX() {
        return this._anchorX;
    }
    set anchorX(value) {
        if (this._anchorX != value) {
            this._anchorX = value;
            this.callLater(this._sizeChanged);
        }
    }
    get anchorY() {
        return this._anchorY;
    }
    set anchorY(value) {
        if (this._anchorY != value) {
            this._anchorY = value;
            this.callLater(this._sizeChanged);
        }
    }
    _sizeChanged() {
        if (!isNaN(this._anchorX))
            this.pivotX = this.anchorX * this.width;
        if (!isNaN(this._anchorY))
            this.pivotY = this.anchorY * this.height;
        this.event(Event.RESIZE);
    }
    _getWidget() {
        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
        return this._widget;
    }
    loadUI(path) {
        var uiView = View.uiMap[path];
        View.uiMap && this.createView(uiView);
    }
    get dataSource() {
        return this._dataSource;
    }
    set dataSource(value) {
        this._dataSource = value;
        for (var name in value) {
            var comp = this.getChildByName(name);
            if (comp instanceof UIComponent)
                comp.dataSource = value[name];
            else if (name in this && !(this[name] instanceof Function))
                this[name] = value[name];
        }
    }
}
View.uiMap = {};
ILaya.regClass(View);
ClassUtils.regClass("laya.ui.View", View);
ClassUtils.regClass("Laya.View", View);
