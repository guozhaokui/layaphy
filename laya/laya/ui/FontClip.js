import { Event } from "../events/Event";
import { AutoBitmap } from "./AutoBitmap";
import { Clip } from "./Clip";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class FontClip extends Clip {
    constructor(skin = null, sheet = null) {
        super();
        this._direction = "horizontal";
        this._align = "left";
        this._wordsW = 0;
        this._wordsH = 0;
        if (skin)
            this.skin = skin;
        if (sheet)
            this.sheet = sheet;
    }
    createChildren() {
        this._bitmap = new AutoBitmap();
        this.on(Event.LOADED, this, this._onClipLoaded);
    }
    _onClipLoaded() {
        this.callLater(this.changeValue);
    }
    get sheet() {
        return this._sheet;
    }
    set sheet(value) {
        value += "";
        this._sheet = value;
        var arr = value.split(" ");
        this._clipX = String(arr[0]).length;
        this.clipY = arr.length;
        this._indexMap = {};
        for (var i = 0; i < this._clipY; i++) {
            var line = arr[i].split("");
            for (var j = 0, n = line.length; j < n; j++) {
                this._indexMap[line[j]] = i * this._clipX + j;
            }
        }
    }
    get value() {
        if (!this._valueArr)
            return "";
        return this._valueArr;
    }
    set value(value) {
        value += "";
        this._valueArr = value;
        this.callLater(this.changeValue);
    }
    get direction() {
        return this._direction;
    }
    set direction(value) {
        this._direction = value;
        this.callLater(this.changeValue);
    }
    get spaceX() {
        return this._spaceX;
    }
    set spaceX(value) {
        this._spaceX = value;
        if (this._direction === "horizontal")
            this.callLater(this.changeValue);
    }
    get spaceY() {
        return this._spaceY;
    }
    set spaceY(value) {
        this._spaceY = value;
        if (!(this._direction === "horizontal"))
            this.callLater(this.changeValue);
    }
    set align(v) {
        this._align = v;
        this.callLater(this.changeValue);
    }
    get align() {
        return this._align;
    }
    changeValue() {
        if (!this._sources)
            return;
        if (!this._valueArr)
            return;
        this.graphics.clear(true);
        var texture;
        texture = this._sources[0];
        if (!texture)
            return;
        var isHorizontal = (this._direction === "horizontal");
        if (isHorizontal) {
            this._wordsW = this._valueArr.length * (texture.sourceWidth + this.spaceX);
            this._wordsH = texture.sourceHeight;
        }
        else {
            this._wordsW = texture.sourceWidth;
            this._wordsH = (texture.sourceHeight + this.spaceY) * this._valueArr.length;
        }
        var dX = 0;
        if (this._width) {
            switch (this._align) {
                case "center":
                    dX = 0.5 * (this._width - this._wordsW);
                    break;
                case "right":
                    dX = this._width - this._wordsW;
                    break;
                default:
                    dX = 0;
            }
        }
        for (var i = 0, sz = this._valueArr.length; i < sz; i++) {
            var index = this._indexMap[this._valueArr.charAt(i)];
            if (!this.sources[index])
                continue;
            texture = this.sources[index];
            if (isHorizontal)
                this.graphics.drawImage(texture, dX + i * (texture.sourceWidth + this.spaceX), 0, texture.sourceWidth, texture.sourceHeight);
            else
                this.graphics.drawImage(texture, 0 + dX, i * (texture.sourceHeight + this.spaceY), texture.sourceWidth, texture.sourceHeight);
        }
        if (!this._width) {
            this._widget.resetLayoutX();
            this.callLater(this._sizeChanged);
        }
        if (!this._height) {
            this._widget.resetLayoutY();
            this.callLater(this._sizeChanged);
        }
    }
    set width(value) {
        super.width = value;
        this.callLater(this.changeValue);
    }
    get width() {
        return super.width;
    }
    set height(value) {
        super.height = value;
        this.callLater(this.changeValue);
    }
    get height() {
        return super.height;
    }
    measureWidth() {
        return this._wordsW;
    }
    measureHeight() {
        return this._wordsH;
    }
    destroy(destroyChild = true) {
        this._valueArr = null;
        this._indexMap = null;
        this.graphics.clear(true);
        this.removeSelf();
        this.off(Event.LOADED, this, this._onClipLoaded);
        super.destroy(destroyChild);
    }
}
ILaya.regClass(FontClip);
ClassUtils.regClass("laya.ui.FontClip", FontClip);
ClassUtils.regClass("Laya.FontClip", FontClip);
