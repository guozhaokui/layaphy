import { Label } from "./Label";
import { Input } from "../display/Input";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { AutoBitmap } from "./AutoBitmap";
import { Styles } from "./Styles";
import { UIUtils } from "./UIUtils";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class TextInput extends Label {
    constructor(text = "") {
        super();
        this.text = text;
        this.skin = this.skin;
    }
    preinitialize() {
        this.mouseEnabled = true;
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._bg && this._bg.destroy();
        this._bg = null;
    }
    createChildren() {
        this.addChild(this._tf = new Input());
        this._tf.padding = Styles.inputLabelPadding;
        this._tf.on(Event.INPUT, this, this._onInput);
        this._tf.on(Event.ENTER, this, this._onEnter);
        this._tf.on(Event.BLUR, this, this._onBlur);
        this._tf.on(Event.FOCUS, this, this._onFocus);
    }
    _onFocus() {
        this.event(Event.FOCUS, this);
    }
    _onBlur() {
        this.event(Event.BLUR, this);
    }
    _onInput() {
        this.event(Event.INPUT, this);
    }
    _onEnter() {
        this.event(Event.ENTER, this);
    }
    initialize() {
        this.width = 128;
        this.height = 22;
    }
    get bg() {
        return this._bg;
    }
    set bg(value) {
        this.graphics = this._bg = value;
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
        this._bg || (this.graphics = this._bg = new AutoBitmap());
        this._bg.source = Loader.getRes(this._skin);
        this._width && (this._bg.width = this._width);
        this._height && (this._bg.height = this._height);
        this._sizeChanged();
        this.event(Event.LOADED);
    }
    get sizeGrid() {
        return this._bg && this._bg.sizeGrid ? this._bg.sizeGrid.join(",") : null;
    }
    set sizeGrid(value) {
        this._bg || (this.graphics = this._bg = new AutoBitmap());
        this._bg.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
    }
    set text(value) {
        if (this._tf.text != value) {
            value = value + "";
            this._tf.text = value;
            this.event(Event.CHANGE);
        }
    }
    get text() {
        return super.text;
    }
    set width(value) {
        super.width = value;
        this._bg && (this._bg.width = value);
    }
    get width() {
        return super.width;
    }
    set height(value) {
        super.height = value;
        this._bg && (this._bg.height = value);
    }
    get height() {
        return super.height;
    }
    get multiline() {
        return this._tf.multiline;
    }
    set multiline(value) {
        this._tf.multiline = value;
    }
    set editable(value) {
        this._tf.editable = value;
    }
    get editable() {
        return this._tf.editable;
    }
    select() {
        this._tf.select();
    }
    get restrict() {
        return this._tf.restrict;
    }
    set restrict(pattern) {
        this._tf.restrict = pattern;
    }
    get prompt() {
        return this._tf.prompt;
    }
    set prompt(value) {
        this._tf.prompt = value;
    }
    get promptColor() {
        return this._tf.promptColor;
    }
    set promptColor(value) {
        this._tf.promptColor = value;
    }
    get maxChars() {
        return this._tf.maxChars;
    }
    set maxChars(value) {
        this._tf.maxChars = value;
    }
    get focus() {
        return this._tf.focus;
    }
    set focus(value) {
        this._tf.focus = value;
    }
    get type() {
        return this._tf.type;
    }
    set type(value) {
        this._tf.type = value;
    }
    setSelection(startIndex, endIndex) {
        this._tf.setSelection(startIndex, endIndex);
    }
}
ILaya.regClass(TextInput);
ClassUtils.regClass("laya.ui.TextInput", TextInput);
ClassUtils.regClass("Laya.TextInput", TextInput);
