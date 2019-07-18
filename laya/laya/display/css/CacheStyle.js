import { Point } from "../../maths/Point";
import { Rectangle } from "../../maths/Rectangle";
import { HTMLCanvas } from "../../resource/HTMLCanvas";
import { Pool } from "../../utils/Pool";
export class CacheStyle {
    constructor() {
        this.reset();
    }
    needBitmapCache() {
        return this.cacheForFilters || !!this.mask;
    }
    needEnableCanvasRender() {
        return this.userSetCache != "none" || this.cacheForFilters || !!this.mask;
    }
    releaseContext() {
        if (this.canvas && this.canvas.size) {
            Pool.recover("CacheCanvas", this.canvas);
            this.canvas.size(0, 0);
            try {
                this.canvas.width = 0;
                this.canvas.height = 0;
            }
            catch (e) {
            }
        }
        this.canvas = null;
    }
    createContext() {
        if (!this.canvas) {
            this.canvas = Pool.getItem("CacheCanvas") || new HTMLCanvas(false);
            var tx = this.canvas.context;
            if (!tx) {
                tx = this.canvas.getContext('2d');
            }
        }
    }
    releaseFilterCache() {
        var fc = this.filterCache;
        if (fc) {
            fc.destroy();
            fc.recycle();
            this.filterCache = null;
        }
    }
    recover() {
        if (this === CacheStyle.EMPTY)
            return;
        Pool.recover("SpriteCache", this.reset());
    }
    reset() {
        this.releaseContext();
        this.releaseFilterCache();
        this.cacheAs = "none";
        this.enableCanvasRender = false;
        this.userSetCache = "none";
        this.cacheForFilters = false;
        this.staticCache = false;
        this.reCache = true;
        this.mask = null;
        this.maskParent = null;
        this.filterCache = null;
        this.filters = null;
        this.hasGlowFilter = false;
        if (this.cacheRect)
            this.cacheRect.recover();
        this.cacheRect = null;
        return this;
    }
    static create() {
        return Pool.getItemByClass("SpriteCache", CacheStyle);
    }
    _calculateCacheRect(sprite, tCacheType, x, y) {
        var _cacheStyle = sprite._cacheStyle;
        if (!_cacheStyle.cacheRect)
            _cacheStyle.cacheRect = Rectangle.create();
        var tRec;
        if (tCacheType === "bitmap") {
            tRec = sprite.getSelfBounds();
            tRec.width = tRec.width + CacheStyle.CANVAS_EXTEND_EDGE * 2;
            tRec.height = tRec.height + CacheStyle.CANVAS_EXTEND_EDGE * 2;
            tRec.x = tRec.x - sprite.pivotX;
            tRec.y = tRec.y - sprite.pivotY;
            tRec.x = tRec.x - CacheStyle.CANVAS_EXTEND_EDGE;
            tRec.y = tRec.y - CacheStyle.CANVAS_EXTEND_EDGE;
            tRec.x = Math.floor(tRec.x + x) - x;
            tRec.y = Math.floor(tRec.y + y) - y;
            tRec.width = Math.floor(tRec.width);
            tRec.height = Math.floor(tRec.height);
            _cacheStyle.cacheRect.copyFrom(tRec);
        }
        else {
            _cacheStyle.cacheRect.setTo(-sprite._style.pivotX, -sprite._style.pivotY, 1, 1);
        }
        tRec = _cacheStyle.cacheRect;
        if (sprite._style.scrollRect) {
            var scrollRect = sprite._style.scrollRect;
            tRec.x -= scrollRect.x;
            tRec.y -= scrollRect.y;
        }
        CacheStyle._scaleInfo.setTo(1, 1);
        return CacheStyle._scaleInfo;
    }
}
CacheStyle.EMPTY = new CacheStyle();
CacheStyle._scaleInfo = new Point();
CacheStyle.CANVAS_EXTEND_EDGE = 16;
