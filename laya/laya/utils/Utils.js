import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { ILaya } from "../../ILaya";
export class Utils {
    static toRadian(angle) {
        return angle * Utils._pi2;
    }
    static toAngle(radian) {
        return radian * Utils._pi;
    }
    static toHexColor(color) {
        if (color < 0 || isNaN(color))
            return null;
        var str = color.toString(16);
        while (str.length < 6)
            str = "0" + str;
        return "#" + str;
    }
    static getGID() {
        return Utils._gid++;
    }
    static concatArray(source, array) {
        if (!array)
            return source;
        if (!source)
            return array;
        var i, len = array.length;
        for (i = 0; i < len; i++) {
            source.push(array[i]);
        }
        return source;
    }
    static clearArray(array) {
        if (!array)
            return array;
        array.length = 0;
        return array;
    }
    static copyArray(source, array) {
        source || (source = []);
        if (!array)
            return source;
        source.length = array.length;
        var i, len = array.length;
        for (i = 0; i < len; i++) {
            source[i] = array[i];
        }
        return source;
    }
    static getGlobalRecByPoints(sprite, x0, y0, x1, y1) {
        var newLTPoint;
        newLTPoint = Point.create().setTo(x0, y0);
        newLTPoint = sprite.localToGlobal(newLTPoint);
        var newRBPoint;
        newRBPoint = Point.create().setTo(x1, y1);
        newRBPoint = sprite.localToGlobal(newRBPoint);
        var rst = Rectangle._getWrapRec([newLTPoint.x, newLTPoint.y, newRBPoint.x, newRBPoint.y]);
        newLTPoint.recover();
        newRBPoint.recover();
        return rst;
    }
    static getGlobalPosAndScale(sprite) {
        return Utils.getGlobalRecByPoints(sprite, 0, 0, 1, 1);
    }
    static bind(fun, scope) {
        var rst = fun;
        rst = fun.bind(scope);
        ;
        return rst;
    }
    static updateOrder(array) {
        if (!array || array.length < 2)
            return false;
        var i = 1, j, len = array.length, key, c;
        while (i < len) {
            j = i;
            c = array[j];
            key = array[j]._zOrder;
            while (--j > -1) {
                if (array[j]._zOrder > key)
                    array[j + 1] = array[j];
                else
                    break;
            }
            array[j + 1] = c;
            i++;
        }
        return true;
    }
    static transPointList(points, x, y) {
        var i, len = points.length;
        for (i = 0; i < len; i += 2) {
            points[i] += x;
            points[i + 1] += y;
        }
    }
    static parseInt(str, radix = 0) {
        var result = parseInt(str, radix);
        if (isNaN(result))
            return 0;
        return result;
    }
    static getFileExtension(path) {
        Utils._extReg.lastIndex = path.lastIndexOf(".");
        var result = Utils._extReg.exec(path);
        if (result && result.length > 1) {
            return result[1].toLowerCase();
        }
        return null;
    }
    static getTransformRelativeToWindow(coordinateSpace, x, y) {
        var stage = Utils.gStage;
        var globalTransform = Utils.getGlobalPosAndScale(coordinateSpace);
        var canvasMatrix = stage._canvasTransform.clone();
        var canvasLeft = canvasMatrix.tx;
        var canvasTop = canvasMatrix.ty;
        canvasMatrix.rotate(-Math.PI / 180 * stage.canvasDegree);
        canvasMatrix.scale(stage.clientScaleX, stage.clientScaleY);
        var perpendicular = (stage.canvasDegree % 180 != 0);
        var tx, ty;
        if (perpendicular) {
            tx = y + globalTransform.y;
            ty = x + globalTransform.x;
            tx *= canvasMatrix.d;
            ty *= canvasMatrix.a;
            if (stage.canvasDegree == 90) {
                tx = canvasLeft - tx;
                ty += canvasTop;
            }
            else {
                tx += canvasLeft;
                ty = canvasTop - ty;
            }
        }
        else {
            tx = x + globalTransform.x;
            ty = y + globalTransform.y;
            tx *= canvasMatrix.a;
            ty *= canvasMatrix.d;
            tx += canvasLeft;
            ty += canvasTop;
        }
        ty += stage['_safariOffsetY'];
        var domScaleX, domScaleY;
        if (perpendicular) {
            domScaleX = canvasMatrix.d * globalTransform.height;
            domScaleY = canvasMatrix.a * globalTransform.width;
        }
        else {
            domScaleX = canvasMatrix.a * globalTransform.width;
            domScaleY = canvasMatrix.d * globalTransform.height;
        }
        return { x: tx, y: ty, scaleX: domScaleX, scaleY: domScaleY };
    }
    static fitDOMElementInArea(dom, coordinateSpace, x, y, width, height) {
        if (!dom._fitLayaAirInitialized) {
            dom._fitLayaAirInitialized = true;
            dom.style.transformOrigin = dom.style.webKittransformOrigin = "left top";
            dom.style.position = "absolute";
        }
        var transform = Utils.getTransformRelativeToWindow(coordinateSpace, x, y);
        dom.style.transform = dom.style.webkitTransform = "scale(" + transform.scaleX + "," + transform.scaleY + ") rotate(" + (Utils.gStage.canvasDegree) + "deg)";
        dom.style.width = width + 'px';
        dom.style.height = height + 'px';
        dom.style.left = transform.x + 'px';
        dom.style.top = transform.y + 'px';
    }
    static isOkTextureList(textureList) {
        if (!textureList)
            return false;
        var i, len = textureList.length;
        var tTexture;
        for (i = 0; i < len; i++) {
            tTexture = textureList[i];
            if (!tTexture || !tTexture._getSource())
                return false;
        }
        return true;
    }
    static isOKCmdList(cmds) {
        if (!cmds)
            return false;
        var i, len = cmds.length;
        var cmd;
        var tex;
        for (i = 0; i < len; i++) {
            cmd = cmds[i];
        }
        return true;
    }
    static getQueryString(name) {
        if (ILaya.Browser.onMiniGame)
            return null;
        if (!window.location || !window.location.search)
            return null;
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)
            return unescape(r[2]);
        return null;
    }
}
Utils.gStage = null;
Utils._gid = 1;
Utils._pi = 180 / Math.PI;
Utils._pi2 = Math.PI / 180;
Utils._extReg = /\.(\w+)\??/g;
Utils.parseXMLFromString = function (value) {
    var rst;
    value = value.replace(/>\s+</g, '><');
    rst = (new DOMParser()).parseFromString(value, 'text/xml');
    if (rst.firstChild.textContent.indexOf("This page contains the following errors") > -1) {
        throw new Error(rst.firstChild.firstChild.textContent);
    }
    return rst;
};
