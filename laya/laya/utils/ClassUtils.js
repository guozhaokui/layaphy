import { Matrix } from "../maths/Matrix";
import { Graphics } from "../display/Graphics";
import { ILaya } from "../../ILaya";
import { HitArea } from "../utils/HitArea";
export class ClassUtils {
    static regClass(className, classDef) {
        ClassUtils._classMap[className] = classDef;
    }
    static regShortClassName(classes) {
        for (var i = 0; i < classes.length; i++) {
            var classDef = classes[i];
            var className = classDef.name;
            ClassUtils._classMap[className] = classDef;
        }
    }
    static getRegClass(className) {
        return ClassUtils._classMap[className];
    }
    static getClass(className) {
        var classObject = ClassUtils._classMap[className] || className;
        var glaya = ILaya.Laya;
        if (typeof (classObject) == 'string')
            return (ILaya.__classMap[classObject] || glaya[className]);
        return classObject;
    }
    static getInstance(className) {
        var compClass = ClassUtils.getClass(className);
        if (compClass)
            return new compClass();
        else
            console.warn("[error] Undefined class:", className);
        return null;
    }
    static createByJson(json, node = null, root = null, customHandler = null, instanceHandler = null) {
        if (typeof (json) == 'string')
            json = JSON.parse(json);
        var props = json.props;
        if (!node) {
            node = instanceHandler ? instanceHandler.runWith(json) : ClassUtils.getInstance(props.runtime || json.type);
            if (!node)
                return null;
        }
        var child = json.child;
        if (child) {
            for (var i = 0, n = child.length; i < n; i++) {
                var data = child[i];
                if ((data.props.name === "render" || data.props.renderType === "render") && node["_$set_itemRender"])
                    node.itemRender = data;
                else {
                    if (data.type == "Graphic") {
                        ClassUtils._addGraphicsToSprite(data, node);
                    }
                    else if (ClassUtils._isDrawType(data.type)) {
                        ClassUtils._addGraphicToSprite(data, node, true);
                    }
                    else {
                        var tChild = ClassUtils.createByJson(data, null, root, customHandler, instanceHandler);
                        if (data.type === "Script") {
                            if ("owner" in tChild) {
                                tChild["owner"] = node;
                            }
                            else if ("target" in tChild) {
                                tChild["target"] = node;
                            }
                        }
                        else if (data.props.renderType == "mask") {
                            node.mask = tChild;
                        }
                        else {
                            node.addChild(tChild);
                        }
                    }
                }
            }
        }
        if (props) {
            for (var prop in props) {
                var value = props[prop];
                if (prop === "var" && root) {
                    root[value] = node;
                }
                else if (value instanceof Array && node[prop] instanceof Function) {
                    node[prop].apply(node, value);
                }
                else {
                    node[prop] = value;
                }
            }
        }
        if (customHandler && json.customProps) {
            customHandler.runWith([node, json]);
        }
        if (node["created"])
            node.created();
        return node;
    }
    static _addGraphicsToSprite(graphicO, sprite) {
        var graphics = graphicO.child;
        if (!graphics || graphics.length < 1)
            return;
        var g = ClassUtils._getGraphicsFromSprite(graphicO, sprite);
        var ox = 0;
        var oy = 0;
        if (graphicO.props) {
            ox = ClassUtils._getObjVar(graphicO.props, "x", 0);
            oy = ClassUtils._getObjVar(graphicO.props, "y", 0);
        }
        if (ox != 0 && oy != 0) {
            g.translate(ox, oy);
        }
        var i, len;
        len = graphics.length;
        for (i = 0; i < len; i++) {
            ClassUtils._addGraphicToGraphics(graphics[i], g);
        }
        if (ox != 0 && oy != 0) {
            g.translate(-ox, -oy);
        }
    }
    static _addGraphicToSprite(graphicO, sprite, isChild = false) {
        var g = isChild ? ClassUtils._getGraphicsFromSprite(graphicO, sprite) : sprite.graphics;
        ClassUtils._addGraphicToGraphics(graphicO, g);
    }
    static _getGraphicsFromSprite(dataO, sprite) {
        if (!dataO || !dataO.props)
            return sprite.graphics;
        var propsName = dataO.props.renderType;
        if (propsName === "hit" || propsName === "unHit") {
            var hitArea = sprite._style.hitArea || (sprite.hitArea = new HitArea());
            if (!hitArea[propsName]) {
                hitArea[propsName] = new Graphics();
            }
            var g = hitArea[propsName];
        }
        if (!g)
            g = sprite.graphics;
        return g;
    }
    static _getTransformData(propsO) {
        var m;
        if ("pivotX" in propsO || "pivotY" in propsO) {
            m = m || new Matrix();
            m.translate(-ClassUtils._getObjVar(propsO, "pivotX", 0), -ClassUtils._getObjVar(propsO, "pivotY", 0));
        }
        var sx = ClassUtils._getObjVar(propsO, "scaleX", 1), sy = ClassUtils._getObjVar(propsO, "scaleY", 1);
        var rotate = ClassUtils._getObjVar(propsO, "rotation", 0);
        var skewX = ClassUtils._getObjVar(propsO, "skewX", 0);
        var skewY = ClassUtils._getObjVar(propsO, "skewY", 0);
        if (sx != 1 || sy != 1 || rotate != 0) {
            m = m || new Matrix();
            m.scale(sx, sy);
            m.rotate(rotate * 0.0174532922222222);
        }
        return m;
    }
    static _addGraphicToGraphics(graphicO, graphic) {
        var propsO;
        propsO = graphicO.props;
        if (!propsO)
            return;
        var drawConfig;
        drawConfig = ClassUtils.DrawTypeDic[graphicO.type];
        if (!drawConfig)
            return;
        var g = graphic;
        var params = ClassUtils._getParams(propsO, drawConfig[1], drawConfig[2], drawConfig[3]);
        var m = ClassUtils._tM;
        if (m || ClassUtils._alpha != 1) {
            g.save();
            if (m)
                g.transform(m);
            if (ClassUtils._alpha != 1)
                g.alpha(ClassUtils._alpha);
        }
        g[drawConfig[0]].apply(g, params);
        if (m || ClassUtils._alpha != 1) {
            g.restore();
        }
    }
    static _adptLineData(params) {
        params[2] = parseFloat(params[0]) + parseFloat(params[2]);
        params[3] = parseFloat(params[1]) + parseFloat(params[3]);
        return params;
    }
    static _adptTextureData(params) {
        params[0] = ILaya.Loader.getRes(params[0]);
        return params;
    }
    static _adptLinesData(params) {
        params[2] = ClassUtils._getPointListByStr(params[2]);
        return params;
    }
    static _isDrawType(type) {
        if (type === "Image")
            return false;
        return type in ClassUtils.DrawTypeDic;
    }
    static _getParams(obj, params, xPos = 0, adptFun = null) {
        var rst = ClassUtils._temParam;
        rst.length = params.length;
        var i, len;
        len = params.length;
        for (i = 0; i < len; i++) {
            rst[i] = ClassUtils._getObjVar(obj, params[i][0], params[i][1]);
        }
        ClassUtils._alpha = ClassUtils._getObjVar(obj, "alpha", 1);
        var m;
        m = ClassUtils._getTransformData(obj);
        if (m) {
            if (!xPos)
                xPos = 0;
            m.translate(rst[xPos], rst[xPos + 1]);
            rst[xPos] = rst[xPos + 1] = 0;
            ClassUtils._tM = m;
        }
        else {
            ClassUtils._tM = null;
        }
        if (adptFun && ClassUtils[adptFun]) {
            rst = ClassUtils[adptFun](rst);
        }
        return rst;
    }
    static _getPointListByStr(str) {
        var pointArr = str.split(",");
        var i, len;
        len = pointArr.length;
        for (i = 0; i < len; i++) {
            pointArr[i] = parseFloat(pointArr[i]);
        }
        return pointArr;
    }
    static _getObjVar(obj, key, noValue) {
        if (key in obj) {
            return obj[key];
        }
        return noValue;
    }
}
ClassUtils.DrawTypeDic = { "Rect": ["drawRect", [["x", 0], ["y", 0], ["width", 0], ["height", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Circle": ["drawCircle", [["x", 0], ["y", 0], ["radius", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Pie": ["drawPie", [["x", 0], ["y", 0], ["radius", 0], ["startAngle", 0], ["endAngle", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Image": ["drawTexture", [["x", 0], ["y", 0], ["width", 0], ["height", 0]]], "Texture": ["drawTexture", [["skin", null], ["x", 0], ["y", 0], ["width", 0], ["height", 0]], 1, "_adptTextureData"], "FillTexture": ["fillTexture", [["skin", null], ["x", 0], ["y", 0], ["width", 0], ["height", 0], ["repeat", null]], 1, "_adptTextureData"], "FillText": ["fillText", [["text", ""], ["x", 0], ["y", 0], ["font", null], ["color", null], ["textAlign", null]], 1], "Line": ["drawLine", [["x", 0], ["y", 0], ["toX", 0], ["toY", 0], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLineData"], "Lines": ["drawLines", [["x", 0], ["y", 0], ["points", ""], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLinesData"], "Curves": ["drawCurves", [["x", 0], ["y", 0], ["points", ""], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLinesData"], "Poly": ["drawPoly", [["x", 0], ["y", 0], ["points", ""], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]], 0, "_adptLinesData"] };
ClassUtils._temParam = [];
ClassUtils._classMap = {};
