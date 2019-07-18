import { UIComponent } from "./UIComponent";
import { Styles } from "./Styles";
import { Const } from "../Const";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { AutoBitmap } from "./AutoBitmap";
import { UIUtils } from "./UIUtils";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
import { WeakObject } from "../utils/WeakObject";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Button extends UIComponent {
    constructor(skin = null, label = "") {
        super();
        this._labelColors = Styles.buttonLabelColors;
        this._state = 0;
        this._autoSize = true;
        this._stateNum = Styles.buttonStateNum;
        this._stateChanged = false;
        this.skin = skin;
        this.label = label;
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._bitmap && this._bitmap.destroy();
        this._text && this._text.destroy(destroyChild);
        this._bitmap = null;
        this._text = null;
        this._clickHandler = null;
        this._labelColors = this._sources = this._strokeColors = null;
    }
    createChildren() {
        this.graphics = this._bitmap = new AutoBitmap();
    }
    createText() {
        if (!this._text) {
            this._text = new Text();
            this._text.overflow = Text.HIDDEN;
            this._text.align = "center";
            this._text.valign = "middle";
            this._text.width = this._width;
            this._text.height = this._height;
        }
    }
    initialize() {
        if (this._mouseState !== 1) {
            this.mouseEnabled = true;
            this._setBit(Const.HAS_MOUSE, true);
        }
        this._createListener(Event.MOUSE_OVER, this, this.onMouse, null, false, false);
        this._createListener(Event.MOUSE_OUT, this, this.onMouse, null, false, false);
        this._createListener(Event.MOUSE_DOWN, this, this.onMouse, null, false, false);
        this._createListener(Event.MOUSE_UP, this, this.onMouse, null, false, false);
        this._createListener(Event.CLICK, this, this.onMouse, null, false, false);
    }
    onMouse(e) {
        if (this.toggle === false && this._selected)
            return;
        if (e.type === Event.CLICK) {
            this.toggle && (this.selected = !this._selected);
            this._clickHandler && this._clickHandler.run();
            return;
        }
        !this._selected && (this.state = Button.stateMap[e.type]);
    }
    get skin() {
        return this._skin;
    }
    set skin(value) {
        if (this._skin != value) {
            this._skin = value;
            if (value) {
                if (!Loader.getRes(value)) {
                    window.Laya.loader.load(this._skin, Handler.create(this, this._skinLoaded), null, Loader.IMAGE, 1);
                }
                else {
                    this._skinLoaded();
                }
            }
            else {
                this._skinLoaded();
            }
        }
    }
    _skinLoaded() {
        this.callLater(this.changeClips);
        this._setStateChanged();
        this._sizeChanged();
        this.event(Event.LOADED);
    }
    get stateNum() {
        return this._stateNum;
    }
    set stateNum(value) {
        if (typeof value == 'string') {
            value = parseInt(value);
        }
        if (this._stateNum != value) {
            this._stateNum = value < 1 ? 1 : value > 3 ? 3 : value;
            this.callLater(this.changeClips);
        }
    }
    changeClips() {
        var img = Loader.getRes(this._skin);
        if (!img) {
            console.log("lose skin", this._skin);
            return;
        }
        var width = img.sourceWidth;
        var height = img.sourceHeight / this._stateNum;
        img.$_GID || (img.$_GID = Utils.getGID());
        var key = img.$_GID + "-" + this._stateNum;
        var clips = WeakObject.I.get(key);
        if (!Utils.isOkTextureList(clips)) {
            clips = null;
        }
        if (clips)
            this._sources = clips;
        else {
            this._sources = [];
            if (this._stateNum === 1) {
                this._sources.push(img);
            }
            else {
                for (var i = 0; i < this._stateNum; i++) {
                    this._sources.push(Texture.createFromTexture(img, 0, height * i, width, height));
                }
            }
            WeakObject.I.set(key, this._sources);
        }
        if (this._autoSize) {
            this._bitmap.width = this._width || width;
            this._bitmap.height = this._height || height;
            if (this._text) {
                this._text.width = this._bitmap.width;
                this._text.height = this._bitmap.height;
            }
        }
        else {
            this._text && (this._text.x = width);
        }
    }
    measureWidth() {
        this.runCallLater(this.changeClips);
        if (this._autoSize)
            return this._bitmap.width;
        this.runCallLater(this.changeState);
        return this._bitmap.width + (this._text ? this._text.width : 0);
    }
    measureHeight() {
        this.runCallLater(this.changeClips);
        return this._text ? Math.max(this._bitmap.height, this._text.height) : this._bitmap.height;
    }
    get label() {
        return this._text ? this._text.text : null;
    }
    set label(value) {
        if (!this._text && !value)
            return;
        this.createText();
        if (this._text.text != value) {
            value && !this._text.parent && this.addChild(this._text);
            this._text.text = (value + "").replace(/\\n/g, "\n");
            this._setStateChanged();
        }
    }
    get selected() {
        return this._selected;
    }
    set selected(value) {
        if (this._selected != value) {
            this._selected = value;
            this.state = this._selected ? 2 : 0;
            this.event(Event.CHANGE);
        }
    }
    get state() {
        return this._state;
    }
    set state(value) {
        if (this._state != value) {
            this._state = value;
            this._setStateChanged();
        }
    }
    changeState() {
        this._stateChanged = false;
        this.runCallLater(this.changeClips);
        var index = this._state < this._stateNum ? this._state : this._stateNum - 1;
        this._sources && (this._bitmap.source = this._sources[index]);
        if (this.label) {
            this._text.color = this._labelColors[index];
            if (this._strokeColors)
                this._text.strokeColor = this._strokeColors[index];
        }
    }
    get labelColors() {
        return this._labelColors.join(",");
    }
    set labelColors(value) {
        this._labelColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
        this._setStateChanged();
    }
    get strokeColors() {
        return this._strokeColors ? this._strokeColors.join(",") : "";
    }
    set strokeColors(value) {
        this._strokeColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
        this._setStateChanged();
    }
    get labelPadding() {
        this.createText();
        return this._text.padding.join(",");
    }
    set labelPadding(value) {
        this.createText();
        this._text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
    }
    get labelSize() {
        this.createText();
        return this._text.fontSize;
    }
    set labelSize(value) {
        this.createText();
        this._text.fontSize = value;
    }
    get labelStroke() {
        this.createText();
        return this._text.stroke;
    }
    set labelStroke(value) {
        this.createText();
        this._text.stroke = value;
    }
    get labelStrokeColor() {
        this.createText();
        return this._text.strokeColor;
    }
    set labelStrokeColor(value) {
        this.createText();
        this._text.strokeColor = value;
    }
    get labelBold() {
        this.createText();
        return this._text.bold;
    }
    set labelBold(value) {
        this.createText();
        this._text.bold = value;
    }
    get labelFont() {
        this.createText();
        return this._text.font;
    }
    set labelFont(value) {
        this.createText();
        this._text.font = value;
    }
    get labelAlign() {
        this.createText();
        return this._text.align;
    }
    set labelAlign(value) {
        this.createText();
        this._text.align = value;
    }
    get clickHandler() {
        return this._clickHandler;
    }
    set clickHandler(value) {
        this._clickHandler = value;
    }
    get text() {
        this.createText();
        return this._text;
    }
    get sizeGrid() {
        if (this._bitmap.sizeGrid)
            return this._bitmap.sizeGrid.join(",");
        return null;
    }
    set sizeGrid(value) {
        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
    }
    set width(value) {
        super.set_width(value);
        if (this._autoSize) {
            this._bitmap.width = value;
            this._text && (this._text.width = value);
        }
    }
    get width() {
        return super.get_width();
    }
    set height(value) {
        super.set_height(value);
        if (this._autoSize) {
            this._bitmap.height = value;
            this._text && (this._text.height = value);
        }
    }
    get height() {
        return super.get_height();
    }
    set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.label = value + "";
        else
            super.set_dataSource(value);
    }
    get dataSource() {
        return super.get_dataSource();
    }
    get iconOffset() {
        return this._bitmap._offset ? this._bitmap._offset.join(",") : null;
    }
    set iconOffset(value) {
        if (value)
            this._bitmap._offset = UIUtils.fillArray([1, 1], value, Number);
        else
            this._bitmap._offset = [];
    }
    _setStateChanged() {
        if (!this._stateChanged) {
            this._stateChanged = true;
            this.callLater(this.changeState);
        }
    }
}
Button.stateMap = { "mouseup": 0, "mouseover": 1, "mousedown": 2, "mouseout": 0 };
ILaya.regClass(Button);
ClassUtils.regClass("laya.ui.Button", Button);
ClassUtils.regClass("Laya.Button", Button);
