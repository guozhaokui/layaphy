import { UIComponent } from "./UIComponent";
import { Label } from "./Label";
import { Image } from "./Image";
import { Button } from "./Button";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Loader } from "../net/Loader";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Slider extends UIComponent {
    constructor(skin = null) {
        super();
        this.isVertical = true;
        this.showLabel = true;
        this._max = 100;
        this._min = 0;
        this._tick = 1;
        this._value = 0;
        if (!Slider.label) {
            Slider.label = new Label();
        }
        this.skin = skin;
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._bg && this._bg.destroy(destroyChild);
        this._bar && this._bar.destroy(destroyChild);
        this._progress && this._progress.destroy(destroyChild);
        this._bg = null;
        this._bar = null;
        this._progress = null;
        this.changeHandler = null;
    }
    createChildren() {
        this.addChild(this._bg = new Image());
        this.addChild(this._bar = new Button());
    }
    initialize() {
        this._bar.on(Event.MOUSE_DOWN, this, this.onBarMouseDown);
        this._bg.sizeGrid = this._bar.sizeGrid = "4,4,4,4,0";
        if (this._progress)
            this._progress.sizeGrid = this._bar.sizeGrid;
        this.allowClickBack = true;
    }
    onBarMouseDown(e) {
        var Laya = window.Laya;
        this._globalSacle || (this._globalSacle = new Point());
        this._globalSacle.setTo(this.globalScaleX || 0.01, this.globalScaleY || 0.01);
        this._maxMove = this.isVertical ? (this.height - this._bar.height) : (this.width - this._bar.width);
        this._tx = Laya.stage.mouseX;
        this._ty = Laya.stage.mouseY;
        Laya.stage.on(Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.once(Event.MOUSE_UP, this, this.mouseUp);
        Laya.stage.once(Event.MOUSE_OUT, this, this.mouseUp);
        this.showValueText();
    }
    showValueText() {
        if (this.showLabel) {
            var label = Slider.label;
            this.addChild(label);
            label.textField.changeText(this._value + "");
            if (this.isVertical) {
                label.x = this._bar._x + 20;
                label.y = (this._bar.height - label.height) * 0.5 + this._bar._y;
            }
            else {
                label.y = this._bar._y - 20;
                label.x = (this._bar.width - label.width) * 0.5 + this._bar._x;
            }
        }
    }
    hideValueText() {
        Slider.label && Slider.label.removeSelf();
    }
    mouseUp(e) {
        var Laya = window.Laya;
        Laya.stage.off(Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.off(Event.MOUSE_UP, this, this.mouseUp);
        Laya.stage.off(Event.MOUSE_OUT, this, this.mouseUp);
        this.sendChangeEvent(Event.CHANGED);
        this.hideValueText();
    }
    mouseMove(e) {
        var Laya = window.Laya;
        var oldValue = this._value;
        if (this.isVertical) {
            this._bar.y += (Laya.stage.mouseY - this._ty) / this._globalSacle.y;
            if (this._bar._y > this._maxMove)
                this._bar.y = this._maxMove;
            else if (this._bar._y < 0)
                this._bar.y = 0;
            this._value = this._bar._y / this._maxMove * (this._max - this._min) + this._min;
            if (this._progress)
                this._progress.height = this._bar._y + 0.5 * this._bar.height;
        }
        else {
            this._bar.x += (Laya.stage.mouseX - this._tx) / this._globalSacle.x;
            if (this._bar._x > this._maxMove)
                this._bar.x = this._maxMove;
            else if (this._bar._x < 0)
                this._bar.x = 0;
            this._value = this._bar._x / this._maxMove * (this._max - this._min) + this._min;
            if (this._progress)
                this._progress.width = this._bar._x + 0.5 * this._bar.width;
        }
        this._tx = Laya.stage.mouseX;
        this._ty = Laya.stage.mouseY;
        if (this._tick != 0) {
            var pow = Math.pow(10, (this._tick + "").length - 1);
            this._value = Math.round(Math.round(this._value / this._tick) * this._tick * pow) / pow;
        }
        if (this._value != oldValue) {
            this.sendChangeEvent();
        }
        this.showValueText();
    }
    sendChangeEvent(type = Event.CHANGE) {
        this.event(type);
        this.changeHandler && this.changeHandler.runWith(this._value);
    }
    get skin() {
        return this._skin;
    }
    set skin(value) {
        if (this._skin != value) {
            this._skin = value;
            if (this._skin && !Loader.getRes(this._skin)) {
                window.Laya.loader.load([this._skin, this._skin.replace(".png", "$bar.png")], Handler.create(this, this._skinLoaded));
            }
            else {
                this._skinLoaded();
            }
        }
    }
    _skinLoaded() {
        this._bg.skin = this._skin;
        this._bar.skin = this._skin.replace(".png", "$bar.png");
        var progressSkin = this._skin.replace(".png", "$progress.png");
        if (Loader.getRes(progressSkin)) {
            if (!this._progress) {
                this.addChild(this._progress = new Image());
                this._progress.sizeGrid = this._bar.sizeGrid;
                this.setChildIndex(this._progress, 1);
            }
            this._progress.skin = progressSkin;
        }
        this.setBarPoint();
        this.callLater(this.changeValue);
        this._sizeChanged();
        this.event(Event.LOADED);
    }
    setBarPoint() {
        if (this.isVertical)
            this._bar.x = Math.round((this._bg.width - this._bar.width) * 0.5);
        else
            this._bar.y = Math.round((this._bg.height - this._bar.height) * 0.5);
    }
    measureWidth() {
        return Math.max(this._bg.width, this._bar.width);
    }
    measureHeight() {
        return Math.max(this._bg.height, this._bar.height);
    }
    _sizeChanged() {
        super._sizeChanged();
        if (this.isVertical)
            this._bg.height = this.height;
        else
            this._bg.width = this.width;
        this.setBarPoint();
        this.changeValue();
    }
    get sizeGrid() {
        return this._bg.sizeGrid;
    }
    set sizeGrid(value) {
        this._bg.sizeGrid = value;
        this._bar.sizeGrid = value;
        if (this._progress)
            this._progress.sizeGrid = this._bar.sizeGrid;
    }
    setSlider(min, max, value) {
        this._value = -1;
        this._min = min;
        this._max = max > min ? max : min;
        this.value = value < min ? min : value > max ? max : value;
    }
    get tick() {
        return this._tick;
    }
    set tick(value) {
        if (this._tick != value) {
            this._tick = value;
            this.callLater(this.changeValue);
        }
    }
    changeValue() {
        if (this.tick != 0) {
            var pow = Math.pow(10, (this._tick + "").length - 1);
            this._value = Math.round(Math.round(this._value / this._tick) * this._tick * pow) / pow;
        }
        this._value = this._value > this._max ? this._max : this._value < this._min ? this._min : this._value;
        var num = this._max - this._min;
        if (num === 0)
            num = 1;
        if (this.isVertical) {
            this._bar.y = (this._value - this._min) / num * (this.height - this._bar.height);
            if (this._progress)
                this._progress.height = this._bar._y + 0.5 * this._bar.height;
        }
        else {
            this._bar.x = (this._value - this._min) / num * (this.width - this._bar.width);
            if (this._progress)
                this._progress.width = this._bar._x + 0.5 * this._bar.width;
        }
    }
    get max() {
        return this._max;
    }
    set max(value) {
        if (this._max != value) {
            this._max = value;
            this.callLater(this.changeValue);
        }
    }
    get min() {
        return this._min;
    }
    set min(value) {
        if (this._min != value) {
            this._min = value;
            this.callLater(this.changeValue);
        }
    }
    get value() {
        return this._value;
    }
    set value(num) {
        if (this._value != num) {
            var oldValue = this._value;
            this._value = num;
            this.changeValue();
            if (this._value != oldValue) {
                this.sendChangeEvent();
            }
        }
    }
    get allowClickBack() {
        return this._allowClickBack;
    }
    set allowClickBack(value) {
        if (this._allowClickBack != value) {
            this._allowClickBack = value;
            if (value)
                this._bg.on(Event.MOUSE_DOWN, this, this.onBgMouseDown);
            else
                this._bg.off(Event.MOUSE_DOWN, this, this.onBgMouseDown);
        }
    }
    onBgMouseDown(e) {
        var point = this._bg.getMousePoint();
        if (this.isVertical)
            this.value = point.y / (this.height - this._bar.height) * (this._max - this._min) + this._min;
        else
            this.value = point.x / (this.width - this._bar.width) * (this._max - this._min) + this._min;
    }
    set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.value = Number(value);
        else
            super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
    get bar() {
        return this._bar;
    }
}
Slider.label = null;
ILaya.regClass(Slider);
ClassUtils.regClass("laya.ui.Slider", Slider);
ClassUtils.regClass("Laya.Slider", Slider);
