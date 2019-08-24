import { BaseTexture } from "./BaseTexture";
import { RenderTexture2D } from "./RenderTexture2D";
export class WebGLRTMgr {
    static getRT(w, h) {
        w = w | 0;
        h = h | 0;
        if (w >= 10000) {
            console.error('getRT error! w too big');
        }
        var ret;
        ret = new RenderTexture2D(w, h, BaseTexture.FORMAT_R8G8B8A8, -1);
        return ret;
    }
    static releaseRT(rt) {
        rt._disposeResource();
        return;
    }
}
WebGLRTMgr.dict = {};
