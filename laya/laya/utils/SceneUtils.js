import { Pool } from "./Pool";
import { Const } from "../Const";
import { Component } from "../components/Component";
import { FrameAnimation } from "../display/FrameAnimation";
import { Node } from "../display/Node";
import { WeakObject } from './WeakObject';
export class SceneUtils {
    static __init() {
        SceneUtils._funMap = new WeakObject();
    }
    static getBindFun(value) {
        var fun = SceneUtils._funMap.get(value);
        if (fun == null) {
            var temp = "\"" + value + "\"";
            temp = temp.replace(/^"\${|}"$/g, "").replace(/\${/g, "\"+").replace(/}/g, "+\"");
            var str = "(function(data){if(data==null)return;with(data){try{\nreturn " + temp + "\n}catch(e){}}})";
            fun = window.Laya._runScript(str);
            SceneUtils._funMap.set(value, fun);
        }
        return fun;
    }
    static createByData(root, uiView) {
        var tInitTool = InitTool.create();
        root = SceneUtils.createComp(uiView, root, root, null, tInitTool);
        root._setBit(Const.NOT_READY, true);
        if ("_idMap" in root) {
            root["_idMap"] = tInitTool._idMap;
        }
        if (uiView.animations) {
            var anilist = [];
            var animations = uiView.animations;
            var i, len = animations.length;
            var tAni;
            var tAniO;
            for (i = 0; i < len; i++) {
                tAni = new FrameAnimation();
                tAniO = animations[i];
                tAni._setUp(tInitTool._idMap, tAniO);
                root[tAniO.name] = tAni;
                tAni._setControlNode(root);
                switch (tAniO.action) {
                    case 1:
                        tAni.play(0, false);
                        break;
                    case 2:
                        tAni.play(0, true);
                        break;
                }
                anilist.push(tAni);
            }
            root._aniList = anilist;
        }
        if (root._$componentType === "Scene" && root._width > 0 && uiView.props.hitTestPrior == null && !root.mouseThrough)
            root.hitTestPrior = true;
        tInitTool.beginLoad(root);
        return root;
    }
    static createInitTool() {
        return InitTool.create();
    }
    static createComp(uiView, comp = null, view = null, dataMap = null, initTool = null) {
        if (uiView.type == "Scene3D" || uiView.type == "Sprite3D") {
            var outBatchSprits = [];
            var scene3D = ILaya.Laya["Utils3D"]._createSceneByJsonForMaker(uiView, outBatchSprits, initTool);
            if (uiView.type == "Sprite3D")
                ILaya.Laya["StaticBatchManager"].combine(scene3D, outBatchSprits);
            else
                ILaya.Laya["StaticBatchManager"].combine(null, outBatchSprits);
            return scene3D;
        }
        comp = comp || SceneUtils.getCompInstance(uiView);
        if (!comp) {
            if (uiView.props && uiView.props.runtime)
                console.warn("runtime not found:" + uiView.props.runtime);
            else
                console.warn("can not create:" + uiView.type);
            return null;
        }
        var child = uiView.child;
        if (child) {
            var isList = comp["_$componentType"] == "List";
            for (var i = 0, n = child.length; i < n; i++) {
                var node = child[i];
                if ('itemRender' in comp && (node.props.name == "render" || node.props.renderType === "render")) {
                    comp["itemRender"] = node;
                }
                else if (node.type == "Graphic") {
                    ILaya.ClassUtils._addGraphicsToSprite(node, comp);
                }
                else if (ILaya.ClassUtils._isDrawType(node.type)) {
                    ILaya.ClassUtils._addGraphicToSprite(node, comp, true);
                }
                else {
                    if (isList) {
                        var arr = [];
                        var tChild = SceneUtils.createComp(node, null, view, arr, initTool);
                        if (arr.length)
                            tChild["_$bindData"] = arr;
                    }
                    else {
                        tChild = SceneUtils.createComp(node, null, view, dataMap, initTool);
                    }
                    if (node.type == "Script") {
                        if (tChild instanceof Component) {
                            comp._addComponentInstance(tChild);
                        }
                        else {
                            if ("owner" in tChild) {
                                tChild["owner"] = comp;
                            }
                            else if ("target" in tChild) {
                                tChild["target"] = comp;
                            }
                        }
                    }
                    else if (node.props.renderType == "mask" || node.props.name == "mask") {
                        comp.mask = tChild;
                    }
                    else {
                        tChild instanceof Node && comp.addChild(tChild);
                    }
                }
            }
        }
        var props = uiView.props;
        for (var prop in props) {
            var value = props[prop];
            if (typeof (value) == 'string' && (value.indexOf("@node:") >= 0 || value.indexOf("@Prefab:") >= 0)) {
                if (initTool) {
                    initTool.addNodeRef(comp, prop, value);
                }
            }
            else
                SceneUtils.setCompValue(comp, prop, value, view, dataMap);
        }
        if (comp._afterInited) {
            comp._afterInited();
        }
        if (uiView.compId && initTool && initTool._idMap) {
            initTool._idMap[uiView.compId] = comp;
        }
        return comp;
    }
    static setCompValue(comp, prop, value, view = null, dataMap = null) {
        if (typeof (value) == 'string' && value.indexOf("${") > -1) {
            SceneUtils._sheet || (SceneUtils._sheet = ILaya.ClassUtils.getClass("laya.data.Table"));
            if (!SceneUtils._sheet) {
                console.warn("Can not find class Sheet");
                return;
            }
            if (dataMap) {
                dataMap.push(comp, prop, value);
            }
            else if (view) {
                if (value.indexOf("].") == -1) {
                    value = value.replace(".", "[0].");
                }
                var watcher = new DataWatcher(comp, prop, value);
                watcher.exe(view);
                var one, temp;
                var str = value.replace(/\[.*?\]\./g, ".");
                while ((one = SceneUtils._parseWatchData.exec(str)) != null) {
                    var key1 = one[1];
                    while ((temp = SceneUtils._parseKeyWord.exec(key1)) != null) {
                        var key2 = temp[0];
                        var arr = (view._watchMap[key2] || (view._watchMap[key2] = []));
                        arr.push(watcher);
                        SceneUtils._sheet.I.notifer.on(key2, view, view.changeData, [key2]);
                    }
                    arr = (view._watchMap[key1] || (view._watchMap[key1] = []));
                    arr.push(watcher);
                    SceneUtils._sheet.I.notifer.on(key1, view, view.changeData, [key1]);
                }
            }
            return;
        }
        if (prop === "var" && view) {
            view[value] = comp;
        }
        else {
            comp[prop] = (value === "true" ? true : (value === "false" ? false : value));
        }
    }
    static getCompInstance(json) {
        if (json.type == "UIView") {
            if (json.props && json.props.pageData) {
                return SceneUtils.createByData(null, json.props.pageData);
            }
        }
        var runtime = (json.props && json.props.runtime) || json.type;
        var compClass = ILaya.ClassUtils.getClass(runtime);
        if (!compClass)
            throw "Can not find class " + runtime;
        if (json.type === "Script" && compClass.prototype._doAwake) {
            var comp = Pool.createByClass(compClass);
            comp._destroyed = false;
            return comp;
        }
        if (json.props && "renderType" in json.props && json.props["renderType"] == "instance") {
            if (!compClass["instance"])
                compClass["instance"] = new compClass();
            return compClass["instance"];
        }
        return new compClass();
    }
}
SceneUtils._parseWatchData = /\${(.*?)}/g;
SceneUtils._parseKeyWord = /[a-zA-Z_][a-zA-Z0-9_]*(?:(?:\.[a-zA-Z_][a-zA-Z0-9_]*)+)/g;
import { Loader } from "../net/Loader";
import { Handler } from "./Handler";
import { ILaya } from "../../ILaya";
class DataWatcher {
    constructor(comp, prop, value) {
        this.comp = comp;
        this.prop = prop;
        this.value = value;
    }
    exe(view) {
        var fun = SceneUtils.getBindFun(this.value);
        this.comp[this.prop] = fun.call(this, view);
    }
}
class InitTool {
    reset() {
        this._nodeRefList = null;
        this._initList = null;
        this._idMap = null;
        this._loadList = null;
        this._scene = null;
    }
    recover() {
        this.reset();
        Pool.recover("InitTool", this);
    }
    static create() {
        var tool = Pool.getItemByClass("InitTool", InitTool);
        tool._idMap = [];
        return tool;
    }
    addLoadRes(url, type = null) {
        if (!this._loadList)
            this._loadList = [];
        if (!type) {
            this._loadList.push(url);
        }
        else {
            this._loadList.push({ url: url, type: type });
        }
    }
    addNodeRef(node, prop, referStr) {
        if (!this._nodeRefList)
            this._nodeRefList = [];
        this._nodeRefList.push([node, prop, referStr]);
        if (referStr.indexOf("@Prefab:") >= 0) {
            this.addLoadRes(referStr.replace("@Prefab:", ""), Loader.PREFAB);
        }
    }
    setNodeRef() {
        if (!this._nodeRefList)
            return;
        if (!this._idMap) {
            this._nodeRefList = null;
            return;
        }
        var i, len;
        len = this._nodeRefList.length;
        var tRefInfo;
        for (i = 0; i < len; i++) {
            tRefInfo = this._nodeRefList[i];
            tRefInfo[0][tRefInfo[1]] = this.getReferData(tRefInfo[2]);
        }
        this._nodeRefList = null;
    }
    getReferData(referStr) {
        if (referStr.indexOf("@Prefab:") >= 0) {
            var prefab;
            prefab = Loader.getRes(referStr.replace("@Prefab:", ""));
            return prefab;
        }
        else if (referStr.indexOf("@arr:") >= 0) {
            referStr = referStr.replace("@arr:", "");
            var list;
            list = referStr.split(",");
            var i, len;
            var tStr;
            len = list.length;
            for (i = 0; i < len; i++) {
                tStr = list[i];
                if (tStr) {
                    list[i] = this._idMap[tStr.replace("@node:", "")];
                }
                else {
                    list[i] = null;
                }
            }
            return list;
        }
        else {
            return this._idMap[referStr.replace("@node:", "")];
        }
    }
    addInitItem(item) {
        if (!this._initList)
            this._initList = [];
        this._initList.push(item);
    }
    doInits() {
        if (!this._initList)
            return;
        this._initList = null;
    }
    finish() {
        this.setNodeRef();
        this.doInits();
        this._scene._setBit(Const.NOT_READY, false);
        if (this._scene.parent && this._scene.parent.activeInHierarchy && this._scene.active)
            this._scene._processActive();
        this._scene.event("onViewCreated");
        this.recover();
    }
    beginLoad(scene) {
        this._scene = scene;
        if (!this._loadList || this._loadList.length < 1) {
            this.finish();
        }
        else {
            ILaya.loader.load(this._loadList, Handler.create(this, this.finish));
        }
    }
}
