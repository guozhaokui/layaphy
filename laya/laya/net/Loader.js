import { HttpRequest } from "./HttpRequest";
import { URL } from "./URL";
import { BitmapFont } from "./../display/BitmapFont";
import { Prefab } from "../components/Prefab";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { SoundManager } from "../media/SoundManager";
import { BaseTexture } from "../resource/BaseTexture";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { Browser } from "../utils/Browser";
import { Byte } from "../utils/Byte";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
import { ILaya } from "../../ILaya";
export class Loader extends EventDispatcher {
    constructor() {
        super(...arguments);
        this._customParse = false;
    }
    static getTypeFromUrl(url) {
        var type = Utils.getFileExtension(url);
        if (type)
            return Loader.typeMap[type];
        console.warn("Not recognize the resources suffix", url);
        return "text";
    }
    load(url, type = null, cache = true, group = null, ignoreCache = false, useWorkerLoader = ILaya.WorkerLoader.enable) {
        if (!url) {
            this.onLoaded(null);
            return;
        }
        Loader.setGroup(url, "666");
        this._url = url;
        if (url.indexOf("data:image") === 0)
            type = Loader.IMAGE;
        else
            url = URL.formatURL(url);
        this._type = type || (type = Loader.getTypeFromUrl(this._url));
        this._cache = cache;
        this._useWorkerLoader = useWorkerLoader;
        this._data = null;
        if (useWorkerLoader)
            ILaya.WorkerLoader.enableWorkerLoader();
        if (!ignoreCache && Loader.loadedMap[url]) {
            this._data = Loader.loadedMap[url];
            this.event(Event.PROGRESS, 1);
            this.event(Event.COMPLETE, this._data);
            return;
        }
        if (group)
            Loader.setGroup(url, group);
        if (Loader.parserMap[type] != null) {
            this._customParse = true;
            if (Loader.parserMap[type] instanceof Handler)
                Loader.parserMap[type].runWith(this);
            else
                Loader.parserMap[type].call(null, this);
            return;
        }
        this._loadResourceFilter(type, url);
    }
    _loadResourceFilter(type, url) {
        this._loadResource(type, url);
    }
    _loadResource(type, url) {
        switch (type) {
            case Loader.IMAGE:
            case "htmlimage":
            case "nativeimage":
                this._loadImage(url);
                break;
            case Loader.SOUND:
                this._loadSound(url);
                break;
            case Loader.TTF:
                this._loadTTF(url);
                break;
            case Loader.ATLAS:
            case Loader.PREFAB:
            case Loader.PLF:
                this._loadHttpRequestWhat(url, Loader.JSON);
                break;
            case Loader.FONT:
                this._loadHttpRequestWhat(url, Loader.XML);
                break;
            case Loader.PLFB:
                this._loadHttpRequestWhat(url, Loader.BUFFER);
                break;
            default:
                this._loadHttpRequestWhat(url, type);
        }
    }
    _loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError) {
        if (Browser.onVVMiniGame) {
            this._http = new HttpRequest();
        }
        else {
            if (!this._http)
                this._http = new HttpRequest();
        }
        this._http.on(Event.PROGRESS, onProcessCaller, onProcess);
        this._http.on(Event.COMPLETE, onLoadCaller, onLoad);
        this._http.on(Event.ERROR, onErrorCaller, onError);
        this._http.send(url, null, "get", contentType);
    }
    _loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) {
        var image;
        function clear() {
            var img = image;
            img.onload = null;
            img.onerror = null;
            delete Loader._imgCache[url];
        }
        var onerror = function () {
            clear();
            onError.call(onErrorCaller);
        };
        var onload = function () {
            clear();
            onLoad.call(onLoadCaller, image);
        };
        image = new Browser.window.Image();
        image.crossOrigin = "";
        image.onload = onload;
        image.onerror = onerror;
        image.src = url;
        Loader._imgCache[url] = image;
    }
    _loadHttpRequestWhat(url, contentType) {
        if (Loader.preLoadedMap[url])
            this.onLoaded(Loader.preLoadedMap[url]);
        else
            this._loadHttpRequest(url, contentType, this, this.onLoaded, this, this.onProgress, this, this.onError);
    }
    _loadTTF(url) {
        url = URL.formatURL(url);
        var ttfLoader = new ILaya.TTFLoader();
        ttfLoader.complete = Handler.create(this, this.onLoaded);
        ttfLoader.load(url);
    }
    _loadImage(url) {
        var _this = this;
        url = URL.formatURL(url);
        var onLoaded;
        var onError = function () {
            _this.event(Event.ERROR, "Load image failed");
        };
        if (this._type === "nativeimage") {
            onLoaded = function (image) {
                _this.onLoaded(image);
            };
            this._loadHtmlImage(url, this, onLoaded, this, onError);
        }
        else {
            var ext = Utils.getFileExtension(url);
            if (ext === "ktx" || ext === "pvr") {
                onLoaded = function (imageData) {
                    var format;
                    switch (ext) {
                        case "ktx":
                            format = 5;
                            break;
                        case "pvr":
                            format = 12;
                            break;
                    }
                    var tex = new Texture2D(0, 0, format, false, false);
                    tex.wrapModeU = BaseTexture.WARPMODE_CLAMP;
                    tex.wrapModeV = BaseTexture.WARPMODE_CLAMP;
                    tex.setCompressData(imageData);
                    tex._setCreateURL(url);
                    _this.onLoaded(tex);
                };
                this._loadHttpRequest(url, Loader.BUFFER, this, onLoaded, null, null, this, onError);
            }
            else {
                onLoaded = function (image) {
                    var tex = new Texture2D(image.width, image.height, 1, false, false);
                    tex.wrapModeU = BaseTexture.WARPMODE_CLAMP;
                    tex.wrapModeV = BaseTexture.WARPMODE_CLAMP;
                    tex.loadImageSource(image, true);
                    tex._setCreateURL(url);
                    _this.onLoaded(tex);
                };
                this._loadHtmlImage(url, this, onLoaded, this, onError);
            }
        }
    }
    _loadSound(url) {
        var sound = (new SoundManager._soundClass());
        var _this = this;
        sound.on(Event.COMPLETE, this, soundOnload);
        sound.on(Event.ERROR, this, soundOnErr);
        sound.load(url);
        function soundOnload() {
            clear();
            _this.onLoaded(sound);
        }
        function soundOnErr() {
            clear();
            sound.dispose();
            _this.event(Event.ERROR, "Load sound failed");
        }
        function clear() {
            sound.offAll();
        }
    }
    onProgress(value) {
        if (this._type === Loader.ATLAS)
            this.event(Event.PROGRESS, value * 0.3);
        else
            this.event(Event.PROGRESS, value);
    }
    onError(message) {
        this.event(Event.ERROR, message);
    }
    onLoaded(data = null) {
        var type = this._type;
        if (type == Loader.PLFB) {
            this.parsePLFBData(data);
            this.complete(data);
        }
        else if (type == Loader.PLF) {
            this.parsePLFData(data);
            this.complete(data);
        }
        else if (type === Loader.IMAGE) {
            var tex = new Texture(data);
            tex.url = this._url;
            this.complete(tex);
        }
        else if (type === Loader.SOUND || type === "htmlimage" || type === "nativeimage") {
            this.complete(data);
        }
        else if (type === Loader.ATLAS) {
            if (!(data instanceof Texture2D)) {
                if (!this._data) {
                    this._data = data;
                    if (data.meta && data.meta.image) {
                        var toloadPics = data.meta.image.split(",");
                        var split = this._url.indexOf("/") >= 0 ? "/" : "\\";
                        var idx = this._url.lastIndexOf(split);
                        var folderPath = idx >= 0 ? this._url.substr(0, idx + 1) : "";
                        var changeType;
                        if (Browser.onAndroid && data.meta.compressTextureAndroid) {
                            changeType = ".ktx";
                        }
                        if (Browser.onIOS && data.meta.compressTextureIOS) {
                            changeType = ".pvr";
                        }
                        for (var i = 0, len = toloadPics.length; i < len; i++) {
                            if (changeType) {
                                toloadPics[i] = folderPath + toloadPics[i].replace(".png", changeType);
                            }
                            else {
                                toloadPics[i] = folderPath + toloadPics[i];
                            }
                        }
                    }
                    else {
                        toloadPics = [this._url.replace(".json", ".png")];
                    }
                    toloadPics.reverse();
                    data.toLoads = toloadPics;
                    data.pics = [];
                }
                this.event(Event.PROGRESS, 0.3 + 1 / toloadPics.length * 0.6);
                return this._loadImage(toloadPics.pop());
            }
            else {
                this._data.pics.push(data);
                if (this._data.toLoads.length > 0) {
                    this.event(Event.PROGRESS, 0.3 + 1 / this._data.toLoads.length * 0.6);
                    return this._loadImage(this._data.toLoads.pop());
                }
                var frames = this._data.frames;
                var cleanUrl = this._url.split("?")[0];
                var directory = (this._data.meta && this._data.meta.prefix) ? this._data.meta.prefix : cleanUrl.substring(0, cleanUrl.lastIndexOf(".")) + "/";
                var pics = this._data.pics;
                var atlasURL = URL.formatURL(this._url);
                var map = Loader.atlasMap[atlasURL] || (Loader.atlasMap[atlasURL] = []);
                map.dir = directory;
                var scaleRate = 1;
                if (this._data.meta && this._data.meta.scale && this._data.meta.scale != 1) {
                    scaleRate = parseFloat(this._data.meta.scale);
                    for (var name in frames) {
                        var obj = frames[name];
                        var tPic = pics[obj.frame.idx ? obj.frame.idx : 0];
                        var url = URL.formatURL(directory + name);
                        tPic.scaleRate = scaleRate;
                        var tTexture;
                        tTexture = Texture._create(tPic, obj.frame.x, obj.frame.y, obj.frame.w, obj.frame.h, obj.spriteSourceSize.x, obj.spriteSourceSize.y, obj.sourceSize.w, obj.sourceSize.h, Loader.getRes(url));
                        Loader.cacheRes(url, tTexture);
                        tTexture.url = url;
                        map.push(url);
                    }
                }
                else {
                    for (name in frames) {
                        obj = frames[name];
                        tPic = pics[obj.frame.idx ? obj.frame.idx : 0];
                        url = URL.formatURL(directory + name);
                        tTexture = Texture._create(tPic, obj.frame.x, obj.frame.y, obj.frame.w, obj.frame.h, obj.spriteSourceSize.x, obj.spriteSourceSize.y, obj.sourceSize.w, obj.sourceSize.h, Loader.getRes(url));
                        Loader.cacheRes(url, tTexture);
                        tTexture.url = url;
                        map.push(url);
                    }
                }
                delete this._data.pics;
                this.complete(this._data);
            }
        }
        else if (type === Loader.FONT) {
            if (!data._source) {
                this._data = data;
                this.event(Event.PROGRESS, 0.5);
                return this._loadImage(this._url.replace(".fnt", ".png"));
            }
            else {
                var bFont = new BitmapFont();
                bFont.parseFont(this._data, new Texture(data));
                var tArr = this._url.split(".fnt")[0].split("/");
                var fontName = tArr[tArr.length - 1];
                Text.registerBitmapFont(fontName, bFont);
                this._data = bFont;
                this.complete(this._data);
            }
        }
        else if (type === Loader.PREFAB) {
            var prefab = new Prefab();
            prefab.json = data;
            this.complete(prefab);
        }
        else {
            this.complete(data);
        }
    }
    parsePLFData(plfData) {
        var type;
        var filePath;
        var fileDic;
        for (type in plfData) {
            fileDic = plfData[type];
            switch (type) {
                case "json":
                case "text":
                    for (filePath in fileDic) {
                        Loader.preLoadedMap[URL.formatURL(filePath)] = fileDic[filePath];
                    }
                    break;
                default:
                    for (filePath in fileDic) {
                        Loader.preLoadedMap[URL.formatURL(filePath)] = fileDic[filePath];
                    }
            }
        }
    }
    parsePLFBData(plfData) {
        var byte;
        byte = new Byte(plfData);
        var i, len;
        len = byte.getInt32();
        for (i = 0; i < len; i++) {
            this.parseOnePLFBFile(byte);
        }
    }
    parseOnePLFBFile(byte) {
        var fileLen;
        var fileName;
        var fileData;
        fileName = byte.getUTFString();
        fileLen = byte.getInt32();
        fileData = byte.readArrayBuffer(fileLen);
        Loader.preLoadedMap[URL.formatURL(fileName)] = fileData;
    }
    complete(data) {
        this._data = data;
        if (this._customParse) {
            this.event(Event.LOADED, data instanceof Array ? [data] : data);
        }
        else {
            Loader._loaders.push(this);
            if (!Loader._isWorking)
                Loader.checkNext();
        }
    }
    static checkNext() {
        Loader._isWorking = true;
        var startTimer = Browser.now();
        var thisTimer = startTimer;
        while (Loader._startIndex < Loader._loaders.length) {
            thisTimer = Browser.now();
            Loader._loaders[Loader._startIndex].endLoad();
            Loader._startIndex++;
            if (Browser.now() - startTimer > Loader.maxTimeOut) {
                console.warn("loader callback cost a long time:" + (Browser.now() - startTimer) + " url=" + Loader._loaders[Loader._startIndex - 1].url);
                ILaya.systemTimer.frameOnce(1, null, Loader.checkNext);
                return;
            }
        }
        Loader._loaders.length = 0;
        Loader._startIndex = 0;
        Loader._isWorking = false;
    }
    endLoad(content = null) {
        content && (this._data = content);
        if (this._cache)
            Loader.cacheRes(this._url, this._data);
        this.event(Event.PROGRESS, 1);
        this.event(Event.COMPLETE, this.data instanceof Array ? [this.data] : this.data);
    }
    get url() {
        return this._url;
    }
    get type() {
        return this._type;
    }
    get cache() {
        return this._cache;
    }
    get data() {
        return this._data;
    }
    static clearRes(url) {
        url = URL.formatURL(url);
        var arr = Loader.getAtlas(url);
        if (arr) {
            for (var i = 0, n = arr.length; i < n; i++) {
                var resUrl = arr[i];
                var tex = Loader.getRes(resUrl);
                delete Loader.loadedMap[resUrl];
                if (tex)
                    tex.destroy();
            }
            arr.length = 0;
            delete Loader.atlasMap[url];
            delete Loader.loadedMap[url];
        }
        else {
            var res = Loader.loadedMap[url];
            if (res) {
                delete Loader.loadedMap[url];
                if (res instanceof Texture && res.bitmap)
                    res.destroy();
            }
        }
    }
    static clearTextureRes(url) {
        url = URL.formatURL(url);
        var arr = Loader.getAtlas(url);
        if (arr && arr.length > 0) {
            arr.forEach(function (t) {
                var tex = Loader.getRes(t);
                if (tex instanceof Texture) {
                    tex.disposeBitmap();
                }
            });
        }
        else {
            var t = Loader.getRes(url);
            if (t instanceof Texture) {
                t.disposeBitmap();
            }
        }
    }
    static getRes(url) {
        return Loader.loadedMap[URL.formatURL(url)];
    }
    static getAtlas(url) {
        return Loader.atlasMap[URL.formatURL(url)];
    }
    static cacheRes(url, data) {
        url = URL.formatURL(url);
        if (Loader.loadedMap[url] != null) {
            console.warn("Resources already exist,is repeated loading:", url);
        }
        else {
            Loader.loadedMap[url] = data;
        }
    }
    static setGroup(url, group) {
        if (!Loader.groupMap[group])
            Loader.groupMap[group] = [];
        Loader.groupMap[group].push(url);
    }
    static clearResByGroup(group) {
        if (!Loader.groupMap[group])
            return;
        var arr = Loader.groupMap[group], i, len = arr.length;
        for (i = 0; i < len; i++) {
            Loader.clearRes(arr[i]);
        }
        arr.length = 0;
    }
}
Loader.TEXT = "text";
Loader.JSON = "json";
Loader.PREFAB = "prefab";
Loader.XML = "xml";
Loader.BUFFER = "arraybuffer";
Loader.IMAGE = "image";
Loader.SOUND = "sound";
Loader.ATLAS = "atlas";
Loader.FONT = "font";
Loader.TTF = "ttf";
Loader.PLF = "plf";
Loader.PLFB = "plfb";
Loader.HIERARCHY = "HIERARCHY";
Loader.MESH = "MESH";
Loader.MATERIAL = "MATERIAL";
Loader.TEXTURE2D = "TEXTURE2D";
Loader.TEXTURECUBE = "TEXTURECUBE";
Loader.ANIMATIONCLIP = "ANIMATIONCLIP";
Loader.AVATAR = "AVATAR";
Loader.TERRAINHEIGHTDATA = "TERRAINHEIGHTDATA";
Loader.TERRAINRES = "TERRAIN";
Loader.typeMap = { "ttf": "ttf", "png": "image", "jpg": "image", "jpeg": "image", "ktx": "image", "pvr": "image", "txt": "text", "json": "json", "prefab": "prefab", "xml": "xml", "als": "atlas", "atlas": "atlas", "mp3": "sound", "ogg": "sound", "wav": "sound", "part": "json", "fnt": "font", "plf": "plf", "plfb": "plfb", "scene": "json", "ani": "json", "sk": "arraybuffer" };
Loader.parserMap = {};
Loader.maxTimeOut = 100;
Loader.groupMap = {};
Loader.loadedMap = {};
Loader.atlasMap = {};
Loader.preLoadedMap = {};
Loader._imgCache = {};
Loader._loaders = [];
Loader._isWorking = false;
Loader._startIndex = 0;
