import { AnimationBase } from "./AnimationBase";
import { Graphics } from "./Graphics";
import { Loader } from "../net/Loader";
import { GraphicAnimation } from "../utils/GraphicAnimation";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Animation extends AnimationBase {
    constructor() {
        super();
        this._setControlNode(this);
    }
    destroy(destroyChild = true) {
        this.stop();
        super.destroy(destroyChild);
        this._frames = null;
        this._labels = null;
    }
    play(start = 0, loop = true, name = "") {
        if (name)
            this._setFramesFromCache(name, true);
        super.play(start, loop, name);
    }
    _setFramesFromCache(name, showWarn = false) {
        if (this._url)
            name = this._url + "#" + name;
        if (name && Animation.framesMap[name]) {
            var tAniO = Animation.framesMap[name];
            if (tAniO instanceof Array) {
                this._frames = Animation.framesMap[name];
                this._count = this._frames.length;
            }
            else {
                if (tAniO.nodeRoot) {
                    Animation.framesMap[name] = GraphicAnimation.parseAnimationByData(tAniO);
                    tAniO = Animation.framesMap[name];
                }
                this._frames = tAniO.frames;
                this._count = this._frames.length;
                if (!this._frameRateChanged)
                    this._interval = tAniO.interval;
                this._labels = this._copyLabels(tAniO.labels);
            }
            return true;
        }
        else {
            if (showWarn)
                console.log("ani not found:", name);
        }
        return false;
    }
    _copyLabels(labels) {
        if (!labels)
            return null;
        var rst;
        rst = {};
        var key;
        for (key in labels) {
            rst[key] = Utils.copyArray([], labels[key]);
        }
        return rst;
    }
    _frameLoop() {
        if (this._visible && this._style.alpha > 0.01 && this._frames) {
            super._frameLoop();
        }
    }
    _displayToIndex(value) {
        if (this._frames)
            this.graphics = this._frames[value];
    }
    get frames() {
        return this._frames;
    }
    set frames(value) {
        this._frames = value;
        if (value) {
            this._count = value.length;
            if (this._actionName)
                this._setFramesFromCache(this._actionName, true);
            this.index = this._index;
        }
    }
    set source(value) {
        if (value.indexOf(".ani") > -1)
            this.loadAnimation(value);
        else if (value.indexOf(".json") > -1 || value.indexOf("als") > -1 || value.indexOf("atlas") > -1)
            this.loadAtlas(value);
        else
            this.loadImages(value.split(","));
    }
    set autoAnimation(value) {
        this.play(0, true, value);
    }
    set autoPlay(value) {
        if (value)
            this.play();
        else
            this.stop();
    }
    clear() {
        super.clear();
        this.stop();
        this.graphics = null;
        this._frames = null;
        this._labels = null;
        return this;
    }
    loadImages(urls, cacheName = "") {
        this._url = "";
        if (!this._setFramesFromCache(cacheName)) {
            this.frames = Animation.framesMap[cacheName] ? Animation.framesMap[cacheName] : Animation.createFrames(urls, cacheName);
        }
        return this;
    }
    loadAtlas(url, loaded = null, cacheName = "") {
        this._url = "";
        var _this = this;
        if (!_this._setFramesFromCache(cacheName)) {
            function onLoaded(loadUrl) {
                if (url === loadUrl) {
                    _this.frames = Animation.framesMap[cacheName] ? Animation.framesMap[cacheName] : Animation.createFrames(url, cacheName);
                    if (loaded)
                        loaded.run();
                }
            }
            if (Loader.getAtlas(url))
                onLoaded(url);
            else
                ILaya.loader.load(url, Handler.create(null, onLoaded, [url]), null, Loader.ATLAS);
        }
        return this;
    }
    loadAnimation(url, loaded = null, atlas = null) {
        this._url = url;
        var _this = this;
        if (!this._actionName)
            this._actionName = "";
        if (!_this._setFramesFromCache(this._actionName)) {
            if (!atlas || Loader.getAtlas(atlas)) {
                this._loadAnimationData(url, loaded, atlas);
            }
            else {
                ILaya.loader.load(atlas, Handler.create(this, this._loadAnimationData, [url, loaded, atlas]), null, Loader.ATLAS);
            }
        }
        else {
            _this._setFramesFromCache(this._actionName, true);
            this.index = 0;
            if (loaded)
                loaded.run();
        }
        return this;
    }
    _loadAnimationData(url, loaded = null, atlas = null) {
        if (atlas && !Loader.getAtlas(atlas)) {
            console.warn("atlas load fail:" + atlas);
            return;
        }
        var _this = this;
        function onLoaded(loadUrl) {
            if (!Loader.getRes(loadUrl)) {
                if (Animation.framesMap[url + "#"]) {
                    _this._setFramesFromCache(this._actionName, true);
                    _this.index = 0;
                    _this._resumePlay();
                    if (loaded)
                        loaded.run();
                }
                return;
            }
            if (url === loadUrl) {
                var tAniO;
                if (!Animation.framesMap[url + "#"]) {
                    var aniData = GraphicAnimation.parseAnimationData(Loader.getRes(url));
                    if (!aniData)
                        return;
                    var aniList = aniData.animationList;
                    var i, len = aniList.length;
                    var defaultO;
                    for (i = 0; i < len; i++) {
                        tAniO = aniList[i];
                        Animation.framesMap[url + "#" + tAniO.name] = tAniO;
                        if (!defaultO)
                            defaultO = tAniO;
                    }
                    if (defaultO) {
                        Animation.framesMap[url + "#"] = defaultO;
                        _this._setFramesFromCache(_this._actionName, true);
                        _this.index = 0;
                    }
                    _this._resumePlay();
                }
                else {
                    _this._setFramesFromCache(_this._actionName, true);
                    _this.index = 0;
                    _this._resumePlay();
                }
                if (loaded)
                    loaded.run();
            }
            Loader.clearRes(url);
        }
        if (Loader.getRes(url))
            onLoaded(url);
        else
            ILaya.loader.load(url, Handler.create(null, onLoaded, [url]), null, Loader.JSON);
    }
    static createFrames(url, name) {
        var arr;
        if (typeof (url) == 'string') {
            var atlas = Loader.getAtlas(url);
            if (atlas && atlas.length) {
                arr = [];
                for (var i = 0, n = atlas.length; i < n; i++) {
                    var g = new Graphics();
                    g.drawImage(Loader.getRes(atlas[i]), 0, 0);
                    arr.push(g);
                }
            }
        }
        else if (url instanceof Array) {
            arr = [];
            for (i = 0, n = url.length; i < n; i++) {
                g = new Graphics();
                g.loadImage(url[i], 0, 0);
                arr.push(g);
            }
        }
        if (name)
            Animation.framesMap[name] = arr;
        return arr;
    }
    static clearCache(key) {
        var cache = Animation.framesMap;
        var val;
        var key2 = key + "#";
        for (val in cache) {
            if (val === key || val.indexOf(key2) === 0) {
                delete Animation.framesMap[val];
            }
        }
    }
}
Animation.framesMap = {};
ILaya.regClass(Animation);
ClassUtils.regClass("laya.display.Animation", Animation);
ClassUtils.regClass("Laya.Animation", Animation);
