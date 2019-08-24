import { ILaya } from "../../ILaya";
export class Browser {
    static __init__() {
        var Laya = window.Laya || ILaya.Laya;
        if (Browser._window)
            return Browser._window;
        var win = Browser._window = window;
        var doc = Browser._document = win.document;
        var u = Browser.userAgent = win.navigator.userAgent;
        if (u.indexOf('AlipayMiniGame') > -1 && "my" in Browser.window) {
            window.aliPayMiniGame(Laya, Laya);
            if (!Laya["ALIMiniAdapter"]) {
                console.error("请先添加阿里小游戏适配库");
            }
            else {
                Laya["ALIMiniAdapter"].enable();
            }
        }
        if (u.indexOf("MiniGame") > -1 && "wx" in Browser.window && !("my" in Browser.window)) {
            window.wxMiniGame(Laya, Laya);
            if (!Laya["MiniAdpter"]) {
                console.error("请先添加小游戏适配库,详细教程：https://ldc2.layabox.com/doc/?nav=zh-ts-5-0-0");
            }
            else {
                Laya["MiniAdpter"].enable();
            }
        }
        if (u.indexOf("SwanGame") > -1) {
            if (!Laya["BMiniAdapter"]) {
                console.error("请先添加百度小游戏适配库,详细教程：https://ldc2.layabox.com/doc/?nav=zh-ts-5-0-0");
            }
            else {
                Laya["BMiniAdapter"].enable();
            }
        }
        if (window.getApp instanceof Function) {
            if (!Laya["KGMiniAdapter"]) {
                console.error("请先添加小米小游戏适配库,详细教程：https://ldc2.layabox.com/doc/?nav=zh-ts-5-0-0");
            }
            else {
                Laya["KGMiniAdapter"].enable();
            }
        }
        if (u.indexOf('OPPO') > -1 && u.indexOf('MiniGame') > -1) {
            if (!Laya["QGMiniAdapter"]) {
                console.error("请先添加OPPO小游戏适配库");
            }
            else {
                Laya["QGMiniAdapter"].enable();
            }
        }
        if (u.indexOf('VVGame') > -1) {
            if (!Laya["VVMiniAdapter"]) {
                console.error("请先添加VIVO小游戏适配库");
            }
            else {
                Laya["VVMiniAdapter"].enable();
            }
        }
        win.trace = console.log;
        win.requestAnimationFrame = win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.oRequestAnimationFrame || win.msRequestAnimationFrame || function (fun) {
            return win.setTimeout(fun, 1000 / 60);
        };
        var bodyStyle = doc.body.style;
        bodyStyle.margin = 0;
        bodyStyle.overflow = 'hidden';
        bodyStyle['-webkit-user-select'] = 'none';
        bodyStyle['-webkit-tap-highlight-color'] = 'rgba(200,200,200,0)';
        var metas = doc.getElementsByTagName('meta');
        var i = 0, flag = false, content = 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no';
        while (i < metas.length) {
            var meta = metas[i];
            if (meta.name == 'viewport') {
                meta.content = content;
                flag = true;
                break;
            }
            i++;
        }
        if (!flag) {
            meta = doc.createElement('meta');
            meta.name = 'viewport', meta.content = content;
            doc.getElementsByTagName('head')[0].appendChild(meta);
        }
        Browser.onMobile = window.isConchApp ? true : u.indexOf("Mobile") > -1;
        Browser.onIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        Browser.onIPhone = u.indexOf("iPhone") > -1;
        Browser.onMac = u.indexOf("Mac OS X") > -1;
        Browser.onIPad = u.indexOf("iPad") > -1;
        Browser.onAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
        Browser.onWP = u.indexOf("Windows Phone") > -1;
        Browser.onQQBrowser = u.indexOf("QQBrowser") > -1;
        Browser.onMQQBrowser = u.indexOf("MQQBrowser") > -1 || (u.indexOf("Mobile") > -1 && u.indexOf("QQ") > -1);
        Browser.onIE = !!win.ActiveXObject || "ActiveXObject" in win;
        Browser.onWeiXin = u.indexOf('MicroMessenger') > -1;
        Browser.onSafari = u.indexOf("Safari") > -1;
        Browser.onPC = !Browser.onMobile;
        Browser.onMiniGame = u.indexOf('MiniGame') > -1;
        Browser.onBDMiniGame = u.indexOf('SwanGame') > -1;
        Browser.onLayaRuntime = !!Browser.window.conch;
        if (u.indexOf('OPPO') > -1 && u.indexOf('MiniGame') > -1) {
            Browser.onQGMiniGame = true;
            Browser.onMiniGame = false;
        }
        Browser.onVVMiniGame = u.indexOf('VVGame') > -1;
        Browser.onKGMiniGame = u.indexOf('QuickGame') > -1;
        if (u.indexOf('AlipayMiniGame') > -1) {
            Browser.onAlipayMiniGame = true;
            Browser.onMiniGame = false;
        }
        return win;
    }
    static createElement(type) {
        Browser.__init__();
        return Browser._document.createElement(type);
    }
    static getElementById(type) {
        Browser.__init__();
        return Browser._document.getElementById(type);
    }
    static removeElement(ele) {
        if (ele && ele.parentNode)
            ele.parentNode.removeChild(ele);
    }
    static now() {
        return Date.now();
        ;
    }
    static get clientWidth() {
        Browser.__init__();
        return Browser._window.innerWidth || Browser._document.body.clientWidth;
    }
    static get clientHeight() {
        Browser.__init__();
        return Browser._window.innerHeight || Browser._document.body.clientHeight || Browser._document.documentElement.clientHeight;
    }
    static get width() {
        Browser.__init__();
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientHeight : Browser.clientWidth) * Browser.pixelRatio;
    }
    static get height() {
        Browser.__init__();
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientWidth : Browser.clientHeight) * Browser.pixelRatio;
    }
    static get pixelRatio() {
        if (Browser._pixelRatio < 0) {
            Browser.__init__();
            if (Browser.userAgent.indexOf("Mozilla/6.0(Linux; Android 6.0; HUAWEI NXT-AL10 Build/HUAWEINXT-AL10)") > -1)
                Browser._pixelRatio = 2;
            else {
                var ctx = Browser.context;
                var backingStore = ctx.backingStorePixelRatio || ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
                Browser._pixelRatio = (Browser._window.devicePixelRatio || 1) / backingStore;
                if (Browser._pixelRatio < 1)
                    Browser._pixelRatio = 1;
            }
        }
        return Browser._pixelRatio;
    }
    static get container() {
        if (!Browser._container) {
            Browser.__init__();
            Browser._container = Browser.createElement("div");
            Browser._container.id = "layaContainer";
            Browser._document.body.appendChild(Browser._container);
        }
        return Browser._container;
    }
    static set container(value) {
        Browser._container = value;
    }
    static get window() {
        return Browser._window || Browser.__init__();
    }
    static get document() {
        Browser.__init__();
        return Browser._document;
    }
}
Browser._pixelRatio = -1;
Browser.mainCanvas = null;
Browser.hanzi = new RegExp("^[\u4E00-\u9FA5]$");
Browser.fontMap = [];
Browser.measureText = function (txt, font) {
    var isChinese = Browser.hanzi.test(txt);
    if (isChinese && Browser.fontMap[font]) {
        return Browser.fontMap[font];
    }
    var ctx = Browser.context;
    ctx.font = font;
    var r = ctx.measureText(txt);
    if (isChinese)
        Browser.fontMap[font] = r;
    return r;
};
