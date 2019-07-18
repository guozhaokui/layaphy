import { UIComponent } from "./UIComponent";
import { AutoBitmap } from "./AutoBitmap";
import { UIUtils } from "./UIUtils";
import { Styles } from "./Styles";
import { Const } from "../Const";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
import { WeakObject } from "../utils/WeakObject";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Clip extends UIComponent {
    constructor(url = null, clipX = 1, clipY = 1) {
        super();
        this._clipX = 1;
        this._clipY = 1;
        this._clipWidth = 0;
        this._clipHeight = 0;
        this._interval = 50;
        this._index = 0;
        this._toIndex = -1;
        this._clipX = clipX;
        this._clipY = clipY;
        this.skin = url;
    }
    destroy(destroyChild = true) {
        super.destroy(true);
        this._bitmap && this._bitmap.destroy();
        this._bitmap = null;
        this._sources = null;
    }
    dispose() {
        this.destroy(true);
        window.Laya.loader.clearRes(this._skin);
    }
    createChildren() {
        this.graphics = this._bitmap = new AutoBitmap();
    }
    _onDisplay(e) {
        if (this._isPlaying) {
            if (this._getBit(Const.DISPLAYED_INSTAGE))
                this.play();
            else
                this.stop();
        }
        else if (this._autoPlay) {
            this.play();
        }
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
                this._bitmap.source = null;
            }
        }
    }
    _skinLoaded() {
        this._setClipChanged();
        this._sizeChanged();
        this.event(Event.LOADED);
    }
    get clipX() {
        return this._clipX;
    }
    set clipX(value) {
        this._clipX = value || 1;
        this._setClipChanged();
    }
    get clipY() {
        return this._clipY;
    }
    set clipY(value) {
        this._clipY = value || 1;
        this._setClipChanged();
    }
    get clipWidth() {
        return this._clipWidth;
    }
    set clipWidth(value) {
        this._clipWidth = value;
        this._setClipChanged();
    }
    get clipHeight() {
        return this._clipHeight;
    }
    set clipHeight(value) {
        this._clipHeight = value;
        this._setClipChanged();
    }
    changeClip() {
        this._clipChanged = false;
        if (!this._skin)
            return;
        var img = Loader.getRes(this._skin);
        if (img) {
            this.loadComplete(this._skin, img);
        }
        else {
            window.Laya.loader.load(this._skin, Handler.create(this, this.loadComplete, [this._skin]));
        }
    }
    loadComplete(url, img) {
        if (url === this._skin && img) {
            var w = this._clipWidth || Math.ceil(img.sourceWidth / this._clipX);
            var h = this._clipHeight || Math.ceil(img.sourceHeight / this._clipY);
            var key = this._skin + w + h;
            var clips = WeakObject.I.get(key);
            if (!Utils.isOkTextureList(clips)) {
                clips = null;
            }
            if (clips)
                this._sources = clips;
            else {
                this._sources = [];
                for (var i = 0; i < this._clipY; i++) {
                    for (var j = 0; j < this._clipX; j++) {
                        this._sources.push(Texture.createFromTexture(img, w * j, h * i, w, h));
                    }
                }
                WeakObject.I.set(key, this._sources);
            }
            this.index = this._index;
            this.event(Event.LOADED);
            this.onCompResize();
        }
    }
    get sources() {
        return this._sources;
    }
    set sources(value) {
        this._sources = value;
        this.index = this._index;
        this.event(Event.LOADED);
    }
    get group() {
        return this._group;
    }
    set group(value) {
        if (value && this._skin)
            Loader.setGroup(this._skin, value);
        this._group = value;
    }
    set width(value) {
        super.width = value;
        this._bitmap.width = value;
    }
    get width() {
        return super.width;
    }
    set height(value) {
        super.height = value;
        this._bitmap.height = value;
    }
    get height() {
        return super.height;
    }
    measureWidth() {
        this.runCallLater(this.changeClip);
        return this._bitmap.width;
    }
    measureHeight() {
        this.runCallLater(this.changeClip);
        return this._bitmap.height;
    }
    get sizeGrid() {
        if (this._bitmap.sizeGrid)
            return this._bitmap.sizeGrid.join(",");
        return null;
    }
    set sizeGrid(value) {
        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
    }
    get index() {
        return this._index;
    }
    set index(value) {
        this._index = value;
        this._bitmap && this._sources && (this._bitmap.source = this._sources[value]);
        this.event(Event.CHANGE);
    }
    get total() {
        this.runCallLater(this.changeClip);
        return this._sources ? this._sources.length : 0;
    }
    get autoPlay() {
        return this._autoPlay;
    }
    set autoPlay(value) {
        if (this._autoPlay != value) {
            this._autoPlay = value;
            value ? this.play() : this.stop();
        }
    }
    get interval() {
        return this._interval;
    }
    set interval(value) {
        if (this._interval != value) {
            this._interval = value;
            if (this._isPlaying)
                this.play();
        }
    }
    get isPlaying() {
        return this._isPlaying;
    }
    set isPlaying(value) {
        this._isPlaying = value;
    }
    play(from = 0, to = -1) {
        this._isPlaying = true;
        this.index = from;
        this._toIndex = to;
        this._index++;
        window.Laya.timer.loop(this.interval, this, this._loop);
        this.on(Event.DISPLAY, this, this._onDisplay);
        this.on(Event.UNDISPLAY, this, this._onDisplay);
    }
    _loop() {
        if (this._visible && this._sources) {
            this._index++;
            if (this._toIndex > -1 && this._index >= this._toIndex)
                this.stop();
            else if (this._index >= this._sources.length)
                this._index = 0;
            this.index = this._index;
        }
    }
    stop() {
        this._isPlaying = false;
        window.Laya.timer.clear(this, this._loop);
        this.event(Event.COMPLETE);
    }
    set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.index = parseInt(value);
        else
            super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
    get bitmap() {
        return this._bitmap;
    }
    _setClipChanged() {
        if (!this._clipChanged) {
            this._clipChanged = true;
            this.callLater(this.changeClip);
        }
    }
}
ILaya.regClass(Clip);
ClassUtils.regClass("laya.ui.Clip", Clip);
ClassUtils.regClass("Laya.Clip", Clip);
