import { ColorFilter } from "../filters/ColorFilter";
import { Utils } from "../utils/Utils";
import { WeakObject } from "../utils/WeakObject";
import { ClassUtils } from "../utils/ClassUtils";
export class UIUtils {
    static fillArray(arr, str, type = null) {
        var temp = arr.concat();
        if (str) {
            var a = str.split(",");
            for (var i = 0, n = Math.min(temp.length, a.length); i < n; i++) {
                var value = a[i];
                temp[i] = (value == "true" ? true : (value == "false" ? false : value));
                if (type != null)
                    temp[i] = type(value);
            }
        }
        return temp;
    }
    static toColor(color) {
        return Utils.toHexColor(color);
    }
    static gray(traget, isGray = true) {
        if (isGray) {
            UIUtils.addFilter(traget, UIUtils.grayFilter);
        }
        else {
            UIUtils.clearFilter(traget, ColorFilter);
        }
    }
    static addFilter(target, filter) {
        var filters = target.filters || [];
        filters.push(filter);
        target.filters = filters;
    }
    static clearFilter(target, filterType) {
        var filters = target.filters;
        if (filters != null && filters.length > 0) {
            for (var i = filters.length - 1; i > -1; i--) {
                var filter = filters[i];
                if (filter instanceof filterType)
                    filters.splice(i, 1);
            }
            target.filters = filters;
        }
    }
    static _getReplaceStr(word) {
        return UIUtils.escapeSequence[word];
    }
    static adptString(str) {
        return str.replace(/\\(\w)/g, UIUtils._getReplaceStr);
    }
    static getBindFun(value) {
        if (!UIUtils._funMap) {
            UIUtils._funMap = new WeakObject();
        }
        var fun = UIUtils._funMap.get(value);
        if (fun == null) {
            var temp = "\"" + value + "\"";
            temp = temp.replace(/^"\${|}"$/g, "").replace(/\${/g, "\"+").replace(/}/g, "+\"");
            var str = "(function(data){if(data==null)return;with(data){try{\nreturn " + temp + "\n}catch(e){}}})";
            fun = window.Laya._runScript(str);
            UIUtils._funMap.set(value, fun);
        }
        return fun;
    }
}
UIUtils.grayFilter = new ColorFilter([0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0]);
UIUtils.escapeSequence = { "\\n": "\n", "\\t": "\t" };
UIUtils._funMap = null;
ClassUtils.regClass("laya.ui.UIUtils", UIUtils);
ClassUtils.regClass("Laya.UIUtils", UIUtils);
