import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { UIComponent } from "./UIComponent";
import { Image } from "./Image";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class ProgressBar extends UIComponent {
    constructor(skin = null) {
        super();
        this._value = 0.5;
        this.skin = skin;
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._bg && this._bg.destroy(destroyChild);
        this._bar && this._bar.destroy(destroyChild);
        this._bg = this._bar = null;
        this.changeHandler = null;
    }
    createChildren() {
        this.addChild(this._bg = new Image());
        this.addChild(this._bar = new Image());
        this._bar._bitmap.autoCacheCmd = false;
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
        this._bg.skin = this._skin;
        this._bar.skin = this._skin.replace(".png", "$bar.png");
        this.callLater(this.changeValue);
        this._sizeChanged();
        this.event(Event.LOADED);
    }
    measureWidth() {
        return this._bg.width;
    }
    measureHeight() {
        return this._bg.height;
    }
    get value() {
        return this._value;
    }
    set value(num) {
        if (this._value != num) {
            num = num > 1 ? 1 : num < 0 ? 0 : num;
            this._value = num;
            this.callLater(this.changeValue);
            this.event(Event.CHANGE);
            this.changeHandler && this.changeHandler.runWith(num);
        }
    }
    changeValue() {
        if (this.sizeGrid) {
            var grid = this.sizeGrid.split(",");
            var left = Number(grid[3]);
            var right = Number(grid[1]);
            var max = this.width - left - right;
            var sw = max * this._value;
            this._bar.width = left + right + sw;
            this._bar.visible = this._bar.width > left + right;
        }
        else {
            this._bar.width = this.width * this._value;
        }
    }
    get bar() {
        return this._bar;
    }
    get bg() {
        return this._bg;
    }
    get sizeGrid() {
        return this._bg.sizeGrid;
    }
    set sizeGrid(value) {
        this._bg.sizeGrid = this._bar.sizeGrid = value;
    }
    set width(value) {
        super.width = value;
        this._bg.width = this._width;
        this.callLater(this.changeValue);
    }
    get width() {
        return super.width;
    }
    set height(value) {
        super.height = value;
        this._bg.height = this._height;
        this._bar.height = this._height;
    }
    get height() {
        return super.height;
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
}
ILaya.regClass(ProgressBar);
ClassUtils.regClass("laya.ui.ProgressBar", ProgressBar);
ClassUtils.regClass("Laya.ProgressBar", ProgressBar);
