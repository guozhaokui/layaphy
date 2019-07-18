import { Styles } from "./Styles";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { AutoBitmap } from "./AutoBitmap";
import { UIComponent } from "./UIComponent";
import { UIUtils } from "./UIUtils";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Image extends UIComponent {
    constructor(skin = null) {
        super();
        this.skin = skin;
    }
    destroy(destroyChild = true) {
        super.destroy(true);
        this._bitmap && this._bitmap.destroy();
        this._bitmap = null;
    }
    dispose() {
        this.destroy(true);
        window.Laya.loader.clearRes(this._skin);
    }
    createChildren() {
        this.graphics = this._bitmap = new AutoBitmap();
        this._bitmap.autoCacheCmd = false;
    }
    get skin() {
        return this._skin;
    }
    set skin(value) {
        if (this._skin != value) {
            this._skin = value;
            if (value) {
                var source = Loader.getRes(value);
                if (source) {
                    this.source = source;
                    this.onCompResize();
                }
                else
                    window.Laya.loader.load(this._skin, Handler.create(this, this.setSource, [this._skin]), null, Loader.IMAGE, 1, true, this._group);
            }
            else {
                this.source = null;
            }
        }
    }
    get source() {
        return this._bitmap.source;
    }
    set source(value) {
        if (!this._bitmap)
            return;
        this._bitmap.source = value;
        this.event(Event.LOADED);
        this.repaint();
    }
    get group() {
        return this._group;
    }
    set group(value) {
        if (value && this._skin)
            Loader.setGroup(this._skin, value);
        this._group = value;
    }
    setSource(url, img = null) {
        if (url === this._skin && img) {
            this.source = img;
            this.onCompResize();
        }
    }
    measureWidth() {
        return this._bitmap.width;
    }
    measureHeight() {
        return this._bitmap.height;
    }
    set width(value) {
        super.width = value;
        this._bitmap.width = value == 0 ? 0.0000001 : value;
    }
    get width() {
        return super.width;
    }
    set height(value) {
        super.height = value;
        this._bitmap.height = value == 0 ? 0.0000001 : value;
    }
    get height() {
        return super.height;
    }
    get sizeGrid() {
        if (this._bitmap.sizeGrid)
            return this._bitmap.sizeGrid.join(",");
        return null;
    }
    set sizeGrid(value) {
        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
    }
    set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'string')
            this.skin = value;
        else
            super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
}
ILaya.regClass(Image);
ClassUtils.regClass("laya.ui.Image", Image);
ClassUtils.regClass("Laya.Image", Image);
