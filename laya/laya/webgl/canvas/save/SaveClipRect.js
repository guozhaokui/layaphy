import { SaveBase } from "./SaveBase";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";
export class SaveClipRect {
    constructor() {
        this._globalClipMatrix = new Matrix();
        this._clipInfoID = -1;
        this._clipRect = new Rectangle();
        this.incache = false;
    }
    isSaveMark() { return false; }
    restore(context) {
        this._globalClipMatrix.copyTo(context._globalClipMatrix);
        this._clipRect.clone(context._clipRect);
        context._clipInfoID = this._clipInfoID;
        SaveClipRect.POOL[SaveClipRect.POOL._length++] = this;
        context._clipInCache = this.incache;
    }
    static save(context) {
        if ((context._saveMark._saveuse & SaveBase.TYPE_CLIPRECT) == SaveBase.TYPE_CLIPRECT)
            return;
        context._saveMark._saveuse |= SaveBase.TYPE_CLIPRECT;
        var cache = SaveClipRect.POOL;
        var o = cache._length > 0 ? cache[--cache._length] : (new SaveClipRect());
        context._globalClipMatrix.copyTo(o._globalClipMatrix);
        context._clipRect.clone(o._clipRect);
        o._clipInfoID = context._clipInfoID;
        o.incache = context._clipInCache;
        var _save = context._save;
        _save[_save._length++] = o;
    }
}
SaveClipRect.POOL = SaveBase._createArray();
