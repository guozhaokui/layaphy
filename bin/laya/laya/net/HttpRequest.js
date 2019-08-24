import { URL } from "./URL";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { Utils } from "../utils/Utils";
export class HttpRequest extends EventDispatcher {
    constructor() {
        super(...arguments);
        this._http = new XMLHttpRequest();
    }
    send(url, data = null, method = "get", responseType = "text", headers = null) {
        this._responseType = responseType;
        this._data = null;
        this._url = url;
        var _this = this;
        var http = this._http;
        url = URL.getAdptedFilePath(url);
        http.open(method, url, true);
        if (headers) {
            for (var i = 0; i < headers.length; i++) {
                http.setRequestHeader(headers[i++], headers[i]);
            }
        }
        else if (!(window.conch)) {
            if (!data || typeof (data) == 'string')
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            else
                http.setRequestHeader("Content-Type", "application/json");
        }
        http.responseType = responseType !== "arraybuffer" ? "text" : "arraybuffer";
        http.onerror = function (e) {
            _this._onError(e);
        };
        http.onabort = function (e) {
            _this._onAbort(e);
        };
        http.onprogress = function (e) {
            _this._onProgress(e);
        };
        http.onload = function (e) {
            _this._onLoad(e);
        };
        http.send(data);
    }
    _onProgress(e) {
        if (e && e.lengthComputable)
            this.event(Event.PROGRESS, e.loaded / e.total);
    }
    _onAbort(e) {
        this.error("Request was aborted by user");
    }
    _onError(e) {
        this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
    }
    _onLoad(e) {
        var http = this._http;
        var status = http.status !== undefined ? http.status : 200;
        if (status === 200 || status === 204 || status === 0) {
            this.complete();
        }
        else {
            this.error("[" + http.status + "]" + http.statusText + ":" + http.responseURL);
        }
    }
    error(message) {
        this.clear();
        console.warn(this.url, message);
        this.event(Event.ERROR, message);
    }
    complete() {
        this.clear();
        var flag = true;
        try {
            if (this._responseType === "json") {
                this._data = JSON.parse(this._http.responseText);
            }
            else if (this._responseType === "xml") {
                this._data = Utils.parseXMLFromString(this._http.responseText);
            }
            else {
                this._data = this._http.response || this._http.responseText;
            }
        }
        catch (e) {
            flag = false;
            this.error(e.message);
        }
        flag && this.event(Event.COMPLETE, this._data instanceof Array ? [this._data] : this._data);
    }
    clear() {
        var http = this._http;
        http.onerror = http.onabort = http.onprogress = http.onload = null;
    }
    get url() {
        return this._url;
    }
    get data() {
        return this._data;
    }
    get http() {
        return this._http;
    }
}
