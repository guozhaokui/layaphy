import { Image } from "./Image";
import { Event } from "../events/Event";
import { LocalStorage } from "../net/LocalStorage";
import { Browser } from "../utils/Browser";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class AdvImage extends Image {
    constructor(skin = null) {
        super();
        this.advsListArr = [];
        this.resUrl = "https://unioncdn.layabox.com/config/iconlist.json";
        this._http = new Browser.window.XMLHttpRequest();
        this._data = [];
        this._resquestTime = 360000;
        this._playIndex = 0;
        this._lunboTime = 5000;
        this.skin = skin;
        this.setLoadUrl();
        this.init();
        this.size(120, 120);
    }
    setLoadUrl() {
    }
    init() {
        if (this.isSupportJump()) {
            if (Browser.onMiniGame || Browser.onBDMiniGame) {
                ILaya.timer.loop(this._resquestTime, this, this.onGetAdvsListData);
            }
            this.onGetAdvsListData();
            this.initEvent();
        }
        else
            this.visible = false;
    }
    initEvent() {
        this.on(Event.CLICK, this, this.onAdvsImgClick);
    }
    onAdvsImgClick() {
        var currentJumpUrl = this.getCurrentAppidObj();
        if (currentJumpUrl)
            this.jumptoGame();
    }
    revertAdvsData() {
        if (this.advsListArr[this._playIndex]) {
            this.visible = true;
            this.skin = this.advsListArr[this._playIndex];
        }
    }
    isSupportJump() {
        if (Browser.onMiniGame) {
            var isSupperJump = window.wx.navigateToMiniProgram instanceof Function;
            return isSupperJump;
        }
        else if (Browser.onBDMiniGame)
            return true;
        return false;
    }
    jumptoGame() {
        var advsObj = this.advsListArr[this._playIndex];
        var desGameId = parseInt(advsObj.gameid);
        var extendInfo = advsObj.extendInfo;
        var path = advsObj.path;
        if (Browser.onMiniGame) {
            if (this.isSupportJump()) {
                window.wx.navigateToMiniProgram({
                    appId: this._appid,
                    path: "",
                    extraData: "",
                    envVersion: "release",
                    success: function success() {
                        console.log("-------------跳转成功--------------");
                    },
                    fail: function fail() {
                        console.log("-------------跳转失败--------------");
                    },
                    complete: function complete() {
                        console.log("-------------跳转接口调用成功--------------");
                        this.updateAdvsInfo();
                    }.bind(this)
                });
            }
        }
        else if (Browser.onBDMiniGame) {
        }
        else {
            this.visible = false;
        }
    }
    updateAdvsInfo() {
        this.visible = false;
        this.onLunbo();
        ILaya.timer.loop(this._lunboTime, this, this.onLunbo);
    }
    onLunbo() {
        if (this._playIndex >= this.advsListArr.length - 1)
            this._playIndex = 0;
        else
            this._playIndex += 1;
        this.visible = true;
        this.revertAdvsData();
    }
    getCurrentAppidObj() {
        return this.advsListArr[this._playIndex];
    }
    onGetAdvsListData() {
        var _this = this;
        var random = AdvImage.randRange(10000, 1000000);
        var url = this.resUrl + "?" + random;
        this._http.open("get", url, true);
        this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        this._http.responseType = "text";
        this._http.onerror = function (e) {
            _this._onError(e);
        };
        this._http.onload = function (e) {
            _this._onLoad(e);
        };
        this._http.send(null);
    }
    static randRange(minNum, maxNum) {
        return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
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
        this.event(Event.ERROR, message);
    }
    complete() {
        var flag = true;
        try {
            this._data = this._http.response || this._http.responseText;
            this._data = JSON.parse(this._data);
            this.advsListArr = this._data.list;
            this._appid = this._data.appid;
            this.updateAdvsInfo();
            this.revertAdvsData();
        }
        catch (e) {
            flag = false;
            this.error(e.message);
        }
    }
    getAdvsQArr(data) {
        var tempArr = [];
        var gameAdvsObj = LocalStorage.getJSON("gameObj");
        for (var key in data) {
            var tempObj = data[key];
            if (gameAdvsObj && gameAdvsObj[tempObj.gameid] && !tempObj.isQiangZhi)
                continue;
            tempArr.push(tempObj);
        }
        return tempArr;
    }
    clear() {
        var http = this._http;
        http.onerror = http.onabort = http.onprogress = http.onload = null;
    }
    destroy(destroyChild = true) {
        ILaya.timer.clear(this, this.onLunbo);
        super.destroy(true);
        this.clear();
        ILaya.timer.clear(this, this.onGetAdvsListData);
    }
}
ClassUtils.regClass("laya.ui.AdvImage", AdvImage);
ClassUtils.regClass("Laya.AdvImage", AdvImage);
