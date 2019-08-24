import { ILaya } from "./../../ILaya";
export class CacheManger {
    constructor() {
    }
    static regCacheByFunction(disposeFunction, getCacheListFunction) {
        CacheManger.unRegCacheByFunction(disposeFunction, getCacheListFunction);
        var cache;
        cache = { tryDispose: disposeFunction, getCacheList: getCacheListFunction };
        CacheManger._cacheList.push(cache);
    }
    static unRegCacheByFunction(disposeFunction, getCacheListFunction) {
        var i, len;
        len = CacheManger._cacheList.length;
        for (i = 0; i < len; i++) {
            if (CacheManger._cacheList[i].tryDispose == disposeFunction && CacheManger._cacheList[i].getCacheList == getCacheListFunction) {
                CacheManger._cacheList.splice(i, 1);
                return;
            }
        }
    }
    static forceDispose() {
        var i, len = CacheManger._cacheList.length;
        for (i = 0; i < len; i++) {
            CacheManger._cacheList[i].tryDispose(true);
        }
    }
    static beginCheck(waitTime = 15000) {
        ILaya.systemTimer.loop(waitTime, null, CacheManger._checkLoop);
    }
    static stopCheck() {
        ILaya.systemTimer.clear(null, CacheManger._checkLoop);
    }
    static _checkLoop() {
        var cacheList = CacheManger._cacheList;
        if (cacheList.length < 1)
            return;
        var tTime = ILaya.Browser.now();
        var count;
        var len;
        len = count = cacheList.length;
        while (count > 0) {
            CacheManger._index++;
            CacheManger._index = CacheManger._index % len;
            cacheList[CacheManger._index].tryDispose(false);
            if (ILaya.Browser.now() - tTime > CacheManger.loopTimeLimit)
                break;
            count--;
        }
    }
}
CacheManger.loopTimeLimit = 2;
CacheManger._cacheList = [];
CacheManger._index = 0;
