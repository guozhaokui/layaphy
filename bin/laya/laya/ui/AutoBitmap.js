import { Graphics } from "../display/Graphics";
import { Texture } from "../resource/Texture";
import { Utils } from "../utils/Utils";
import { ClassUtils } from "../utils/ClassUtils";
export class AutoBitmap extends Graphics {
    constructor() {
        super(...arguments);
        this.autoCacheCmd = true;
        this._width = 0;
        this._height = 0;
        this.uv = null;
    }
    destroy() {
        super.destroy();
        this._source = null;
        this._sizeGrid = null;
        this._offset = null;
    }
    get sizeGrid() {
        return this._sizeGrid;
    }
    set sizeGrid(value) {
        this._sizeGrid = value.map((v) => { return +v; });
        this._setChanged();
    }
    get width() {
        if (this._width)
            return this._width;
        if (this._source)
            return this._source.sourceWidth;
        return 0;
    }
    set width(value) {
        if (this._width != value) {
            this._width = value;
            this._setChanged();
        }
    }
    get height() {
        if (this._height)
            return this._height;
        if (this._source)
            return this._source.sourceHeight;
        return 0;
    }
    set height(value) {
        if (this._height != value) {
            this._height = value;
            this._setChanged();
        }
    }
    get source() {
        return this._source;
    }
    set source(value) {
        if (value) {
            this._source = value;
            this._setChanged();
        }
        else {
            this._source = null;
            this.clear();
        }
    }
    _setChanged() {
        if (!this._isChanged) {
            this._isChanged = true;
            window.Laya.timer.callLater(this, this.changeSource);
        }
    }
    changeSource() {
        this._isChanged = false;
        var source = this._source;
        if (!source || !source.bitmap)
            return;
        var width = this.width;
        var height = this.height;
        var sizeGrid = this._sizeGrid;
        var sw = source.sourceWidth;
        var sh = source.sourceHeight;
        if (!sizeGrid || (sw === width && sh === height)) {
            this.clear();
            this.drawTexture(source, this._offset ? this._offset[0] : 0, this._offset ? this._offset[1] : 0, width, height, null, 1, null, null, this.uv);
        }
        else {
            this.clear();
            this.draw9Grid(source, 0, 0, width, height, sizeGrid);
            this._repaint();
            return;
        }
        this._repaint();
    }
    drawBitmap(repeat, tex, x, y, width = 0, height = 0) {
        if (width < 0.1 || height < 0.1)
            return;
        if (repeat && (tex.width != width || tex.height != height))
            this.fillTexture(tex, x, y, width, height);
        else
            this.drawImage(tex, x, y, width, height);
    }
    static getTexture(tex, x, y, width, height) {
        if (width <= 0)
            width = 1;
        if (height <= 0)
            height = 1;
        tex.$_GID || (tex.$_GID = Utils.getGID());
        var texture;
        if (!texture || !texture._getSource()) {
            texture = Texture.createFromTexture(tex, x, y, width, height);
        }
        return texture;
    }
}
ClassUtils.regClass("laya.ui.AutoBitmap", AutoBitmap);
ClassUtils.regClass("Laya.AutoBitmap", AutoBitmap);
