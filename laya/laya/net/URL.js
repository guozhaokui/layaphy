import { ILaya } from "../../ILaya";
export class URL {
    constructor(url) {
        this._url = URL.formatURL(url);
        this._path = URL.getPath(url);
    }
    get url() {
        return this._url;
    }
    get path() {
        return this._path;
    }
    static set basePath(value) {
        URL._basePath = ILaya.Laya._getUrlPath();
        URL._basePath = URL.formatURL(value);
    }
    static get basePath() {
        return URL._basePath;
    }
    static formatURL(url) {
        if (!url)
            return "null path";
        if (url.indexOf(":") > 0)
            return url;
        if (URL.customFormat != null)
            url = URL.customFormat(url);
        if (url.indexOf(":") > 0)
            return url;
        var char1 = url.charAt(0);
        if (char1 === ".") {
            return URL._formatRelativePath(URL._basePath + url);
        }
        else if (char1 === '~') {
            return URL.rootPath + url.substring(1);
        }
        else if (char1 === "d") {
            if (url.indexOf("data:image") === 0)
                return url;
        }
        else if (char1 === "/") {
            return url;
        }
        return URL._basePath + url;
    }
    static _formatRelativePath(value) {
        var parts = value.split("/");
        for (var i = 0, len = parts.length; i < len; i++) {
            if (parts[i] == '..') {
                parts.splice(i - 1, 2);
                i -= 2;
            }
        }
        return parts.join('/');
    }
    static getPath(url) {
        var ofs = url.lastIndexOf('/');
        return ofs > 0 ? url.substr(0, ofs + 1) : "";
    }
    static getFileName(url) {
        var ofs = url.lastIndexOf('/');
        return ofs > 0 ? url.substr(ofs + 1) : url;
    }
    static getAdptedFilePath(url) {
        if (!URL.exportSceneToJson || !url)
            return url;
        var i, len;
        len = URL._adpteTypeList.length;
        var tArr;
        for (i = 0; i < len; i++) {
            tArr = URL._adpteTypeList[i];
            url = url.replace(tArr[0], tArr[1]);
        }
        return url;
    }
}
URL.version = {};
URL.exportSceneToJson = false;
URL._basePath = "";
URL.rootPath = "";
URL.customFormat = function (url) {
    var newUrl = URL.version[url];
    if (!window.conch && newUrl)
        url += "?v=" + newUrl;
    return url;
};
URL._adpteTypeList = [[".scene3d", ".json"], [".scene", ".json"], [".taa", ".json"], [".prefab", ".json"]];
