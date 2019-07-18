import { AtlasInfoManager } from "./AtlasInfoManager";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { Loader } from "./Loader";
import { Resource } from "../resource/Resource";
import { Texture } from "../resource/Texture";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
import { ILaya } from "../../ILaya";
export class LoaderManager extends EventDispatcher {
    constructor() {
        super();
        this.retryNum = 1;
        this.retryDelay = 0;
        this.maxLoader = 5;
        this._loaders = [];
        this._loaderCount = 0;
        this._resInfos = [];
        this._infoPool = [];
        this._maxPriority = 5;
        this._failRes = {};
        this._statInfo = { count: 1, loaded: 1 };
        for (var i = 0; i < this._maxPriority; i++)
            this._resInfos[i] = [];
    }
    getProgress() {
        return this._statInfo.loaded / this._statInfo.count;
    }
    resetProgress() {
        this._statInfo.count = this._statInfo.loaded = 1;
    }
    create(url, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
        this._create(url, true, complete, progress, type, constructParams, propertyParams, priority, cache);
    }
    _create(url, mainResou, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
        if (url instanceof Array) {
            var allScuess = true;
            var items = url;
            var itemCount = items.length;
            var loadedCount = 0;
            if (progress) {
                var progress2 = Handler.create(progress.caller, progress.method, progress.args, false);
            }
            for (var i = 0; i < itemCount; i++) {
                var item = items[i];
                if (typeof (item) == 'string')
                    item = items[i] = { url: item };
                item.progress = 0;
            }
            for (i = 0; i < itemCount; i++) {
                item = items[i];
                var progressHandler = progress ? Handler.create(null, function (item, value) {
                    item.progress = value;
                    var num = 0;
                    for (var j = 0; j < itemCount; j++) {
                        var item1 = items[j];
                        num += item1.progress;
                    }
                    var v = num / itemCount;
                    progress2.runWith(v);
                }, [item], false) : null;
                var completeHandler = (progress || complete) ? Handler.create(null, function (item, content = null) {
                    loadedCount++;
                    item.progress = 1;
                    content || (allScuess = false);
                    if (loadedCount === itemCount && complete) {
                        complete.runWith(allScuess);
                    }
                }, [item]) : null;
                this._createOne(item.url, mainResou, completeHandler, progressHandler, item.type || type, item.constructParams || constructParams, item.propertyParams || propertyParams, item.priority || priority, cache);
            }
        }
        else {
            this._createOne(url, mainResou, complete, progress, type, constructParams, propertyParams, priority, cache);
        }
    }
    _createOne(url, mainResou, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
        var item = this.getRes(url);
        if (!item) {
            var extension = Utils.getFileExtension(url);
            (type) || (type = LoaderManager.createMap[extension] ? LoaderManager.createMap[extension][0] : null);
            if (!type) {
                this.load(url, complete, progress, type, priority, cache);
                return;
            }
            var parserMap = Loader.parserMap;
            if (!parserMap[type]) {
                this.load(url, complete, progress, type, priority, cache);
                return;
            }
            this._createLoad(url, Handler.create(null, function (createRes) {
                if (createRes) {
                    if (!mainResou && createRes instanceof Resource)
                        createRes._addReference();
                    createRes._setCreateURL(url);
                }
                complete && complete.runWith(createRes);
                ILaya.loader.event(url);
            }), progress, type, constructParams, propertyParams, priority, cache, true);
        }
        else {
            if (!mainResou && item instanceof Resource)
                item._addReference();
            progress && progress.runWith(1);
            complete && complete.runWith(item);
        }
    }
    load(url, complete = null, progress = null, type = null, priority = 1, cache = true, group = null, ignoreCache = false, useWorkerLoader = ILaya.WorkerLoader.enable) {
        if (url instanceof Array)
            return this._loadAssets(url, complete, progress, type, priority, cache, group);
        var content = Loader.getRes(url);
        if (!ignoreCache && content != null) {
            ILaya.systemTimer.frameOnce(1, this, function () {
                progress && progress.runWith(1);
                complete && complete.runWith(content instanceof Array ? [content] : content);
                this._loaderCount || this.event(Event.COMPLETE);
            });
        }
        else {
            var original;
            original = url;
            url = AtlasInfoManager.getFileLoadPath(url);
            if (url != original && type !== "nativeimage") {
                type = Loader.ATLAS;
            }
            else {
                original = null;
            }
            var info = LoaderManager._resMap[url];
            if (!info) {
                info = this._infoPool.length ? this._infoPool.pop() : new ResInfo();
                info.url = url;
                info.type = type;
                info.cache = cache;
                info.group = group;
                info.ignoreCache = ignoreCache;
                info.useWorkerLoader = useWorkerLoader;
                info.originalUrl = original;
                complete && info.on(Event.COMPLETE, complete.caller, complete.method, complete.args);
                progress && info.on(Event.PROGRESS, progress.caller, progress.method, progress.args);
                LoaderManager._resMap[url] = info;
                priority = priority < this._maxPriority ? priority : this._maxPriority - 1;
                this._resInfos[priority].push(info);
                this._statInfo.count++;
                this.event(Event.PROGRESS, this.getProgress());
                this._next();
            }
            else {
                if (complete) {
                    if (original) {
                        complete && info._createListener(Event.COMPLETE, this, this._resInfoLoaded, [original, complete], false, false);
                    }
                    else {
                        complete && info._createListener(Event.COMPLETE, complete.caller, complete.method, complete.args, false, false);
                    }
                }
                progress && info._createListener(Event.PROGRESS, progress.caller, progress.method, progress.args, false, false);
            }
        }
        return this;
    }
    _resInfoLoaded(original, complete) {
        complete.runWith(Loader.getRes(original));
    }
    _createLoad(url, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true, ignoreCache = false) {
        if (url instanceof Array)
            return this._loadAssets(url, complete, progress, type, priority, cache);
        var content = Loader.getRes(url);
        if (content != null) {
            ILaya.systemTimer.frameOnce(1, this, function () {
                progress && progress.runWith(1);
                complete && complete.runWith(content);
                this._loaderCount || this.event(Event.COMPLETE);
            });
        }
        else {
            var info = LoaderManager._resMap[url];
            if (!info) {
                info = this._infoPool.length ? this._infoPool.pop() : new ResInfo();
                info.url = url;
                info.type = type;
                info.cache = false;
                info.ignoreCache = ignoreCache;
                info.originalUrl = null;
                info.group = null;
                info.createCache = cache;
                info.createConstructParams = constructParams;
                info.createPropertyParams = propertyParams;
                complete && info.on(Event.COMPLETE, complete.caller, complete.method, complete.args);
                progress && info.on(Event.PROGRESS, progress.caller, progress.method, progress.args);
                LoaderManager._resMap[url] = info;
                priority = priority < this._maxPriority ? priority : this._maxPriority - 1;
                this._resInfos[priority].push(info);
                this._statInfo.count++;
                this.event(Event.PROGRESS, this.getProgress());
                this._next();
            }
            else {
                complete && info._createListener(Event.COMPLETE, complete.caller, complete.method, complete.args, false, false);
                progress && info._createListener(Event.PROGRESS, progress.caller, progress.method, progress.args, false, false);
            }
        }
        return this;
    }
    _next() {
        if (this._loaderCount >= this.maxLoader)
            return;
        for (var i = 0; i < this._maxPriority; i++) {
            var infos = this._resInfos[i];
            while (infos.length > 0) {
                var info = infos.shift();
                if (info)
                    return this._doLoad(info);
            }
        }
        this._loaderCount || this.event(Event.COMPLETE);
    }
    _doLoad(resInfo) {
        this._loaderCount++;
        var loader = this._loaders.length ? this._loaders.pop() : new Loader();
        loader.on(Event.COMPLETE, null, onLoaded);
        loader.on(Event.PROGRESS, null, function (num) {
            resInfo.event(Event.PROGRESS, num);
        });
        loader.on(Event.ERROR, null, function (msg) {
            onLoaded(null);
        });
        var _me = this;
        function onLoaded(data = null) {
            loader.offAll();
            loader._data = null;
            loader._customParse = false;
            _me._loaders.push(loader);
            _me._endLoad(resInfo, data instanceof Array ? [data] : data);
            _me._loaderCount--;
            _me._next();
        }
        loader._constructParams = resInfo.createConstructParams;
        loader._propertyParams = resInfo.createPropertyParams;
        loader._createCache = resInfo.createCache;
        loader.load(resInfo.url, resInfo.type, resInfo.cache, resInfo.group, resInfo.ignoreCache, resInfo.useWorkerLoader);
    }
    _endLoad(resInfo, content) {
        var url = resInfo.url;
        if (content == null) {
            var errorCount = this._failRes[url] || 0;
            if (errorCount < this.retryNum) {
                console.warn("[warn]Retry to load:", url);
                this._failRes[url] = errorCount + 1;
                ILaya.systemTimer.once(this.retryDelay, this, this._addReTry, [resInfo], false);
                return;
            }
            else {
                Loader.clearRes(url);
                console.warn("[error]Failed to load:", url);
                this.event(Event.ERROR, url);
            }
        }
        if (this._failRes[url])
            this._failRes[url] = 0;
        delete LoaderManager._resMap[url];
        if (resInfo.originalUrl) {
            content = Loader.getRes(resInfo.originalUrl);
        }
        resInfo.event(Event.COMPLETE, content);
        resInfo.offAll();
        this._infoPool.push(resInfo);
        this._statInfo.loaded++;
        this.event(Event.PROGRESS, this.getProgress());
    }
    _addReTry(resInfo) {
        this._resInfos[this._maxPriority - 1].push(resInfo);
        this._next();
    }
    clearRes(url) {
        Loader.clearRes(url);
    }
    clearTextureRes(url) {
        Loader.clearTextureRes(url);
    }
    getRes(url) {
        return Loader.getRes(url);
    }
    cacheRes(url, data) {
        Loader.cacheRes(url, data);
    }
    setGroup(url, group) {
        Loader.setGroup(url, group);
    }
    clearResByGroup(group) {
        Loader.clearResByGroup(group);
    }
    static cacheRes(url, data) {
        Loader.cacheRes(url, data);
    }
    clearUnLoaded() {
        for (var i = 0; i < this._maxPriority; i++) {
            var infos = this._resInfos[i];
            for (var j = infos.length - 1; j > -1; j--) {
                var info = infos[j];
                if (info) {
                    info.offAll();
                    this._infoPool.push(info);
                }
            }
            infos.length = 0;
        }
        this._loaderCount = 0;
        LoaderManager._resMap = {};
    }
    cancelLoadByUrls(urls) {
        if (!urls)
            return;
        for (var i = 0, n = urls.length; i < n; i++) {
            this.cancelLoadByUrl(urls[i]);
        }
    }
    cancelLoadByUrl(url) {
        for (var i = 0; i < this._maxPriority; i++) {
            var infos = this._resInfos[i];
            for (var j = infos.length - 1; j > -1; j--) {
                var info = infos[j];
                if (info && info.url === url) {
                    infos[j] = null;
                    info.offAll();
                    this._infoPool.push(info);
                }
            }
        }
        if (LoaderManager._resMap[url])
            delete LoaderManager._resMap[url];
    }
    _loadAssets(arr, complete = null, progress = null, type = null, priority = 1, cache = true, group = null) {
        var itemCount = arr.length;
        var loadedCount = 0;
        var totalSize = 0;
        var items = [];
        var success = true;
        for (var i = 0; i < itemCount; i++) {
            var item = arr[i];
            if (typeof (item) == 'string')
                item = { url: item, type: type, size: 1, priority: priority };
            if (!item.size)
                item.size = 1;
            item.progress = 0;
            totalSize += item.size;
            items.push(item);
            var progressHandler = progress ? Handler.create(null, loadProgress, [item], false) : null;
            var completeHandler = (complete || progress) ? Handler.create(null, loadComplete, [item]) : null;
            this.load(item.url, completeHandler, progressHandler, item.type, item.priority || 1, cache, item.group || group, false, item.useWorkerLoader);
        }
        function loadComplete(item, content = null) {
            loadedCount++;
            item.progress = 1;
            if (!content)
                success = false;
            if (loadedCount === itemCount && complete) {
                complete.runWith(success);
            }
        }
        function loadProgress(item, value) {
            if (progress != null) {
                item.progress = value;
                var num = 0;
                for (var j = 0; j < items.length; j++) {
                    var item1 = items[j];
                    num += item1.size * item1.progress;
                }
                var v = num / totalSize;
                progress.runWith(v);
            }
        }
        return this;
    }
    decodeBitmaps(urls) {
        var i, len = urls.length;
        var ctx;
        ctx = ILaya.Render._context;
        for (i = 0; i < len; i++) {
            var atlas;
            atlas = Loader.getAtlas(urls[i]);
            if (atlas) {
                this._decodeTexture(atlas[0], ctx);
            }
            else {
                var tex;
                tex = this.getRes(urls[i]);
                if (tex && tex instanceof Texture) {
                    this._decodeTexture(tex, ctx);
                }
            }
        }
    }
    _decodeTexture(tex, ctx) {
        var bitmap = tex.bitmap;
        if (!tex || !bitmap)
            return;
        var tImg = bitmap.source || bitmap.image;
        if (!tImg)
            return;
        if (tImg instanceof HTMLImageElement) {
            ctx.drawImage(tImg, 0, 0, 1, 1);
            var info = ctx.getImageData(0, 0, 1, 1);
        }
    }
}
LoaderManager._resMap = {};
LoaderManager.createMap = { atlas: [null, Loader.ATLAS] };
class ResInfo extends EventDispatcher {
}
