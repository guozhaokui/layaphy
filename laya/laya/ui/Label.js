import { Styles } from "./Styles";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { UIComponent } from "./UIComponent";
import { UIUtils } from "./UIUtils";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Label extends UIComponent {
    constructor(text = "") {
        super();
        this.text = text;
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._tf = null;
    }
    createChildren() {
        this.addChild(this._tf = new Text());
    }
    get text() {
        return this._tf.text;
    }
    set text(value) {
        if (this._tf.text != value) {
            if (value)
                value = UIUtils.adptString(value + "");
            this._tf.text = value;
            this.event(Event.CHANGE);
            if (!this._width || !this._height)
                this.onCompResize();
        }
    }
    changeText(text) {
        this._tf.changeText(text);
    }
    get wordWrap() {
        return this._tf.wordWrap;
    }
    set wordWrap(value) {
        this._tf.wordWrap = value;
    }
    get color() {
        return this._tf.color;
    }
    set color(value) {
        this._tf.color = value;
    }
    get font() {
        return this._tf.font;
    }
    set font(value) {
        this._tf.font = value;
    }
    get align() {
        return this._tf.align;
    }
    set align(value) {
        this._tf.align = value;
    }
    get valign() {
        return this._tf.valign;
    }
    set valign(value) {
        this._tf.valign = value;
    }
    get bold() {
        return this._tf.bold;
    }
    set bold(value) {
        this._tf.bold = value;
    }
    get italic() {
        return this._tf.italic;
    }
    set italic(value) {
        this._tf.italic = value;
    }
    get leading() {
        return this._tf.leading;
    }
    set leading(value) {
        this._tf.leading = value;
    }
    get fontSize() {
        return this._tf.fontSize;
    }
    set fontSize(value) {
        this._tf.fontSize = value;
    }
    get padding() {
        return this._tf.padding.join(",");
    }
    set padding(value) {
        this._tf.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
    }
    get bgColor() {
        return this._tf.bgColor;
    }
    set bgColor(value) {
        this._tf.bgColor = value;
    }
    get borderColor() {
        return this._tf.borderColor;
    }
    set borderColor(value) {
        this._tf.borderColor = value;
    }
    get stroke() {
        return this._tf.stroke;
    }
    set stroke(value) {
        this._tf.stroke = value;
    }
    get strokeColor() {
        return this._tf.strokeColor;
    }
    set strokeColor(value) {
        this._tf.strokeColor = value;
    }
    get textField() {
        return this._tf;
    }
    measureWidth() {
        return this._tf.width;
    }
    measureHeight() {
        return this._tf.height;
    }
    get width() {
        if (this._width || this._tf.text)
            return super.width;
        return 0;
    }
    set width(value) {
        super.width = value;
        this._tf.width = value;
    }
    get height() {
        if (this._height || this._tf.text)
            return super.height;
        return 0;
    }
    set height(value) {
        super.height = value;
        this._tf.height = value;
    }
    set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.text = value + "";
        else
            super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
    get overflow() {
        return this._tf.overflow;
    }
    set overflow(value) {
        this._tf.overflow = value;
    }
    get underline() {
        return this._tf.underline;
    }
    set underline(value) {
        this._tf.underline = value;
    }
    get underlineColor() {
        return this._tf.underlineColor;
    }
    set underlineColor(value) {
        this._tf.underlineColor = value;
    }
}
ILaya.regClass(Label);
ClassUtils.regClass("laya.ui.Label", Label);
ClassUtils.regClass("Laya.Label", Label);
