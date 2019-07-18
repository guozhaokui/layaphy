import { HttpRequest } from "./HttpRequest";
import { Loader } from "./Loader";
import { Event } from "../events/Event";
import { Browser } from "../utils/Browser";
import { ILaya } from "../../ILaya";
export class TTFLoader {
    load(fontPath) {
        this._url = fontPath;
        var tArr = fontPath.split(".ttf")[0].split("/");
        this.fontName = tArr[tArr.length - 1];
        if (ILaya.Render.isConchApp) {
            this._loadConch();
        }
        else if (window.FontFace) {
            this._loadWithFontFace();
        }
        else {
            this._loadWithCSS();
        }
    }
    _loadConch() {
        this._http = new HttpRequest();
        this._http.on(Event.ERROR, this, this._onErr);
        this._http.on(Event.COMPLETE, this, this._onHttpLoaded);
        this._http.send(this._url, null, "get", Loader.BUFFER);
    }
    _onHttpLoaded(data = null) {
        window["conchTextCanvas"].setFontFaceFromBuffer(this.fontName, data);
        this._clearHttp();
        this._complete();
    }
    _clearHttp() {
        if (this._http) {
            this._http.off(Event.ERROR, this, this._onErr);
            this._http.off(Event.COMPLETE, this, this._onHttpLoaded);
            this._http = null;
        }
    }
    _onErr() {
        this._clearHttp();
        if (this.err) {
            this.err.runWith("fail:" + this._url);
            this.err = null;
        }
    }
    _complete() {
        ILaya.systemTimer.clear(this, this._complete);
        ILaya.systemTimer.clear(this, this._checkComplete);
        if (this._div && this._div.parentNode) {
            this._div.parentNode.removeChild(this._div);
            this._div = null;
        }
        if (this.complete) {
            this.complete.runWith(this);
            this.complete = null;
        }
    }
    _checkComplete() {
        if (ILaya.Browser.measureText(TTFLoader._testString, this._fontTxt).width != this._txtWidth) {
            this._complete();
        }
    }
    _loadWithFontFace() {
        var fontFace = new window.FontFace(this.fontName, "url('" + this._url + "')");
        document.fonts.add(fontFace);
        var self = this;
        fontFace.loaded.then((function () {
            self._complete();
        }));
        fontFace.load();
    }
    _createDiv() {
        this._div = Browser.createElement("div");
        this._div.innerHTML = "laya";
        var _style = this._div.style;
        _style.fontFamily = this.fontName;
        _style.position = "absolute";
        _style.left = "-100px";
        _style.top = "-100px";
        document.body.appendChild(this._div);
    }
    _loadWithCSS() {
        var fontStyle = Browser.createElement("style");
        fontStyle.type = "text/css";
        document.body.appendChild(fontStyle);
        fontStyle.textContent = "@font-face { font-family:'" + this.fontName + "'; src:url('" + this._url + "');}";
        this._fontTxt = "40px " + this.fontName;
        this._txtWidth = Browser.measureText(TTFLoader._testString, this._fontTxt).width;
        var self = this;
        fontStyle.onload = function () {
            ILaya.systemTimer.once(10000, self, this._complete);
        };
        ILaya.systemTimer.loop(20, this, this._checkComplete);
        this._createDiv();
    }
}
TTFLoader._testString = "LayaTTFFont";
