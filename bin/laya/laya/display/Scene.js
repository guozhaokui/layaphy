import { Node } from "./Node";
import { Const } from "../Const";
import { Sprite } from "./Sprite";
import { Event } from "../events/Event";
import { SceneLoader } from "../net/SceneLoader";
import { Resource } from "../resource/Resource";
import { Handler } from "../utils/Handler";
import { SceneUtils } from "../utils/SceneUtils";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Scene extends Sprite {
    constructor() {
        super();
        this.autoDestroyAtClosed = false;
        this.url = null;
        this._viewCreated = false;
        this._$componentType = "Scene";
        this._setBit(Const.NOT_READY, true);
        Scene.unDestroyedScenes.push(this);
        this._scene = this;
        this.createChildren();
    }
    createChildren() {
    }
    loadScene(path) {
        var url = path.indexOf(".") > -1 ? path : path + ".scene";
        var view = ILaya.loader.getRes(url);
        if (view) {
            this.createView(view);
        }
        else {
            ILaya.loader.resetProgress();
            var loader = new SceneLoader();
            loader.on(Event.COMPLETE, this, this._onSceneLoaded, [url]);
            loader.load(url);
        }
    }
    _onSceneLoaded(url) {
        this.createView(ILaya.Loader.getRes(url));
    }
    createView(view) {
        if (view && !this._viewCreated) {
            this._viewCreated = true;
            SceneUtils.createByData(this, view);
        }
    }
    getNodeByID(id) {
        if (this._idMap)
            return this._idMap[id];
        return null;
    }
    open(closeOther = true, param = null) {
        if (closeOther)
            Scene.closeAll();
        Scene.root.addChild(this);
        this.onOpened(param);
    }
    onOpened(param) {
    }
    close(type = null) {
        this.onClosed(type);
        if (this.autoDestroyAtClosed)
            this.destroy();
        else
            this.removeSelf();
    }
    onClosed(type = null) {
    }
    destroy(destroyChild = true) {
        this._idMap = null;
        super.destroy(destroyChild);
        var list = Scene.unDestroyedScenes;
        for (var i = list.length - 1; i > -1; i--) {
            if (list[i] === this) {
                list.splice(i, 1);
                return;
            }
        }
    }
    set scaleX(value) {
        if (super.get_scaleX() == value)
            return;
        super.set_scaleX(value);
        this.event(Event.RESIZE);
    }
    get scaleX() {
        return super.scaleX;
    }
    set scaleY(value) {
        if (super.get_scaleY() == value)
            return;
        super.set_scaleY(value);
        this.event(Event.RESIZE);
    }
    get scaleY() {
        return super.scaleY;
    }
    get width() {
        if (this._width)
            return this._width;
        var max = 0;
        for (var i = this.numChildren - 1; i > -1; i--) {
            var comp = this.getChildAt(i);
            if (comp._visible) {
                max = Math.max(comp._x + comp.width * comp.scaleX, max);
            }
        }
        return max;
    }
    set width(value) {
        if (super.get_width() == value)
            return;
        super.set_width(value);
        this.callLater(this._sizeChanged);
    }
    get height() {
        if (this._height)
            return this._height;
        var max = 0;
        for (var i = this.numChildren - 1; i > -1; i--) {
            var comp = this.getChildAt(i);
            if (comp._visible) {
                max = Math.max(comp._y + comp.height * comp.scaleY, max);
            }
        }
        return max;
    }
    set height(value) {
        if (super.get_height() == value)
            return;
        super.set_height(value);
        this.callLater(this._sizeChanged);
    }
    _sizeChanged() {
        this.event(Event.RESIZE);
    }
    static get root() {
        if (!Scene._root) {
            Scene._root = ILaya.stage.addChild(new Sprite());
            Scene._root.name = "root";
            ILaya.stage.on("resize", null, () => {
                Scene._root.size(ILaya.stage.width, ILaya.stage.height);
                Scene._root.event(Event.RESIZE);
            });
            Scene._root.size(ILaya.stage.width, ILaya.stage.height);
            Scene._root.event(Event.RESIZE);
        }
        return Scene._root;
    }
    get timer() {
        return this._timer || ILaya.timer;
    }
    set timer(value) {
        this._timer = value;
    }
    static load(url, complete = null, progress = null) {
        ILaya.loader.resetProgress();
        var loader = new SceneLoader();
        loader.on(Event.PROGRESS, null, onProgress);
        loader.once(Event.COMPLETE, null, create);
        loader.load(url);
        function onProgress(value) {
            if (Scene._loadPage)
                Scene._loadPage.event("progress", value);
            progress && progress.runWith(value);
        }
        function create() {
            loader.off(Event.PROGRESS, null, onProgress);
            var obj = ILaya.Loader.getRes(url);
            if (!obj)
                throw "Can not find scene:" + url;
            if (!obj.props)
                throw "Scene data is error:" + url;
            var runtime = obj.props.runtime ? obj.props.runtime : obj.type;
            var clas = ILaya.ClassUtils.getClass(runtime);
            if (obj.props.renderType == "instance") {
                var scene = clas.instance || (clas.instance = new clas());
            }
            else {
                scene = new clas();
            }
            if (scene && scene instanceof Node) {
                scene.url = url;
                if (!scene._getBit(Const.NOT_READY)) {
                    complete && complete.runWith(scene);
                }
                else {
                    scene.on("onViewCreated", null, function () {
                        complete && complete.runWith(scene);
                    });
                    scene.createView(obj);
                }
                Scene.hideLoadingPage();
            }
            else {
                throw "Can not find scene:" + runtime;
            }
        }
    }
    static open(url, closeOther = true, param = null, complete = null, progress = null) {
        if (param instanceof Handler) {
            var temp = complete;
            complete = param;
            param = temp;
        }
        Scene.showLoadingPage();
        Scene.load(url, Handler.create(null, this._onSceneLoaded, [closeOther, complete, param]), progress);
    }
    static _onSceneLoaded(closeOther, complete, param, scene) {
        scene.open(closeOther, param);
        if (complete)
            complete.runWith(scene);
    }
    static close(url, name = "") {
        var flag = false;
        var list = Scene.unDestroyedScenes;
        for (var i = 0, n = list.length; i < n; i++) {
            var scene = list[i];
            if (scene && scene.parent && scene.url === url && scene.name == name) {
                scene.close();
                flag = true;
            }
        }
        return flag;
    }
    static closeAll() {
        var root = Scene.root;
        for (var i = 0, n = root.numChildren; i < n; i++) {
            var scene = root.getChildAt(0);
            if (scene instanceof Scene)
                scene.close();
            else
                scene.removeSelf();
        }
    }
    static destroy(url, name = "") {
        var flag = false;
        var list = Scene.unDestroyedScenes;
        for (var i = 0, n = list.length; i < n; i++) {
            var scene = list[i];
            if (scene.url === url && scene.name == name) {
                scene.destroy();
                flag = true;
            }
        }
        return flag;
    }
    static gc() {
        Resource.destroyUnusedResources();
    }
    static setLoadingPage(loadPage) {
        if (Scene._loadPage != loadPage) {
            Scene._loadPage = loadPage;
        }
    }
    static showLoadingPage(param = null, delay = 500) {
        if (Scene._loadPage) {
            ILaya.systemTimer.clear(null, Scene._showLoading);
            ILaya.systemTimer.clear(null, Scene._hideLoading);
            ILaya.systemTimer.once(delay, null, Scene._showLoading, [param], false);
        }
    }
    static _showLoading(param) {
        ILaya.stage.addChild(Scene._loadPage);
        Scene._loadPage.onOpened(param);
    }
    static _hideLoading() {
        Scene._loadPage.close();
    }
    static hideLoadingPage(delay = 500) {
        if (Scene._loadPage) {
            ILaya.systemTimer.clear(null, Scene._showLoading);
            ILaya.systemTimer.clear(null, Scene._hideLoading);
            ILaya.systemTimer.once(delay, null, Scene._hideLoading);
        }
    }
}
Scene.unDestroyedScenes = [];
ILaya.regClass(Scene);
ClassUtils.regClass("laya.display.Scene", Scene);
ClassUtils.regClass("Laya.Scene", Scene);
