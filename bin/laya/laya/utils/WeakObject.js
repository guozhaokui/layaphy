import { Browser } from "./Browser";
import { Utils } from "./Utils";
var supportWeakMap = !!WeakMap;
export class WeakObject {
    constructor() {
        this._obj = WeakObject.supportWeakMap ? new Browser.window.WeakMap() : {};
        if (!WeakObject.supportWeakMap)
            WeakObject._maps.push(this);
    }
    static __init__() {
        WeakObject.I = new WeakObject();
        if (!WeakObject.supportWeakMap)
            window.Laya.systemTimer.loop(WeakObject.delInterval, null, WeakObject.clearCache);
    }
    static clearCache() {
        for (var i = 0, n = WeakObject._maps.length; i < n; i++) {
            var obj = WeakObject._maps[i];
            obj._obj = {};
        }
    }
    set(key, value) {
        if (key == null)
            return;
        if (WeakObject.supportWeakMap) {
            var objKey = key;
            if (typeof (key) == 'string' || typeof (key) == 'number') {
                objKey = WeakObject._keys[key];
                if (!objKey)
                    objKey = WeakObject._keys[key] = { k: key };
            }
            this._obj.set(objKey, value);
        }
        else {
            if (typeof (key) == 'string' || typeof (key) == 'number') {
                this._obj[key] = value;
            }
            else {
                key.$_GID || (key.$_GID = Utils.getGID());
                this._obj[key.$_GID] = value;
            }
        }
    }
    get(key) {
        if (key == null)
            return null;
        if (WeakObject.supportWeakMap) {
            var objKey = (typeof (key) == 'string' || typeof (key) == 'number') ? WeakObject._keys[key] : key;
            if (!objKey)
                return null;
            return this._obj.get(objKey);
        }
        else {
            if (typeof (key) == 'string' || typeof (key) == 'number')
                return this._obj[key];
            return this._obj[key.$_GID];
        }
    }
    del(key) {
        if (key == null)
            return;
        if (WeakObject.supportWeakMap) {
            var objKey = (typeof (key) == 'string' || typeof (key) == 'number') ? WeakObject._keys[key] : key;
            if (!objKey)
                return;
            this._obj.delete(objKey);
        }
        else {
            if (typeof (key) == 'string' || typeof (key) == 'number')
                delete this._obj[key];
            else
                delete this._obj[this._obj.$_GID];
        }
    }
    has(key) {
        if (key == null)
            return false;
        if (WeakObject.supportWeakMap) {
            var objKey = (typeof (key) == 'string' || typeof (key) == 'number') ? WeakObject._keys[key] : key;
            return this._obj.has(objKey);
        }
        else {
            if (typeof (key) == 'string' || typeof (key) == 'number')
                return this._obj[key] != null;
            return this._obj[this._obj.$_GID] != null;
        }
    }
}
WeakObject.supportWeakMap = supportWeakMap;
WeakObject.delInterval = 10 * 60 * 1000;
WeakObject._keys = {};
WeakObject._maps = [];
