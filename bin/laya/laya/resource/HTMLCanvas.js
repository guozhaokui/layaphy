import { Bitmap } from "./Bitmap";
import { Texture } from "./Texture";
import { Texture2D } from "./Texture2D";
import { ILaya } from "../../ILaya";
import { Browser } from "../utils/Browser";
export class HTMLCanvas extends Bitmap {
    get source() {
        return this._source;
    }
    _getSource() {
        return this._source;
    }
    constructor(createCanvas = false) {
        super();
        if (createCanvas)
            this._source = Browser.createElement("canvas");
        else {
            this._source = this;
        }
        this.lock = true;
    }
    clear() {
        this._ctx && this._ctx.clear && this._ctx.clear();
        if (this._texture) {
            this._texture.destroy();
            this._texture = null;
        }
    }
    destroy() {
        super.destroy();
        this._setCPUMemory(0);
        this._ctx && this._ctx.destroy && this._ctx.destroy();
        this._ctx = null;
    }
    release() {
    }
    get context() {
        if (this._ctx)
            return this._ctx;
        if (this._source == this) {
            this._ctx = new ILaya.Context();
        }
        else {
            this._ctx = this._source.getContext(ILaya.Render.isConchApp ? 'layagl' : '2d');
        }
        this._ctx._canvas = this;
        return this._ctx;
    }
    _setContext(context) {
        this._ctx = context;
    }
    getContext(contextID, other = null) {
        return this.context;
    }
    getMemSize() {
        return 0;
    }
    size(w, h) {
        if (this._width != w || this._height != h || (this._source && (this._source.width != w || this._source.height != h))) {
            this._width = w;
            this._height = h;
            this._setCPUMemory(w * h * 4);
            this._ctx && this._ctx.size && this._ctx.size(w, h);
            if (this._source) {
                this._source.height = h, this._source.width = w;
            }
            if (this._texture) {
                this._texture.destroy();
                this._texture = null;
            }
        }
    }
    getTexture() {
        if (!this._texture) {
            var bitmap = new Texture2D();
            bitmap.loadImageSource(this.source);
            this._texture = new Texture(bitmap);
        }
        return this._texture;
    }
    toBase64(type, encoderOptions) {
        if (this._source) {
            if (ILaya.Render.isConchApp) {
                var win = window;
                if (win.conchConfig.threadMode == 2) {
                    throw "native 2 thread mode use toBase64Async";
                }
                var width = this._ctx._targets.sourceWidth;
                var height = this._ctx._targets.sourceHeight;
                var data = this._ctx._targets.getData(0, 0, width, height);
                return win.conchToBase64FlipY ? win.conchToBase64FlipY(type, encoderOptions, data.buffer, width, height) : win.conchToBase64(type, encoderOptions, data.buffer, width, height);
            }
            else {
                return this._source.toDataURL(type, encoderOptions);
            }
        }
        return null;
    }
    toBase64Async(type, encoderOptions, callBack) {
        var width = this._ctx._targets.sourceWidth;
        var height = this._ctx._targets.sourceHeight;
        this._ctx._targets.getDataAsync(0, 0, width, height, function (data) {
            let win = window;
            var base64 = win.conchToBase64FlipY ? win.conchToBase64FlipY(type, encoderOptions, data.buffer, width, height) : win.conchToBase64(type, encoderOptions, data.buffer, width, height);
            callBack(base64);
        });
    }
}
