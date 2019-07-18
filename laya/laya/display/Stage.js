import { Sprite } from "./Sprite";
import { Config } from "./../../Config";
import { Input } from "./Input";
import { SpriteConst } from "./SpriteConst";
import { Const } from "../Const";
import { Event } from "../events/Event";
import { MouseManager } from "../events/MouseManager";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Render } from "../renders/Render";
import { RenderInfo } from "../renders/RenderInfo";
import { Context } from "../resource/Context";
import { Browser } from "../utils/Browser";
import { CallLater } from "../utils/CallLater";
import { ColorUtils } from "../utils/ColorUtils";
import { RunDriver } from "../utils/RunDriver";
import { VectorGraphManager } from "../utils/VectorGraphManager";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { Stat } from "../utils/Stat";
import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";
import { ClassUtils } from "../utils/ClassUtils";
export class Stage extends Sprite {
    constructor() {
        super();
        this.offset = new Point();
        this._frameRate = "fast";
        this.designWidth = 0;
        this.designHeight = 0;
        this.canvasRotation = false;
        this.canvasDegree = 0;
        this.renderingEnabled = true;
        this.screenAdaptationEnabled = true;
        this._canvasTransform = new Matrix();
        this._screenMode = "none";
        this._scaleMode = "noscale";
        this._alignV = "top";
        this._alignH = "left";
        this._bgColor = "black";
        this._mouseMoveTime = 0;
        this._renderCount = 0;
        this._safariOffsetY = 0;
        this._frameStartTime = 0;
        this._previousOrientation = Browser.window.orientation;
        this._wgColor = [0, 0, 0, 1];
        this._scene3Ds = [];
        this._globalRepaintSet = false;
        this._globalRepaintGet = false;
        this._3dUI = [];
        this._curUIBase = null;
        this.useRetinalCanvas = false;
        super.set_transform(this._createTransform());
        this.mouseEnabled = true;
        this.hitTestPrior = true;
        this.autoSize = false;
        this._setBit(Const.DISPLAYED_INSTAGE, true);
        this._setBit(Const.ACTIVE_INHIERARCHY, true);
        this._isFocused = true;
        this._isVisibility = true;
        this.useRetinalCanvas = Config.useRetinalCanvas;
        var window = Browser.window;
        var _me = this;
        window.addEventListener("focus", function () {
            this._isFocused = true;
            _me.event(Event.FOCUS);
            _me.event(Event.FOCUS_CHANGE);
        });
        window.addEventListener("blur", function () {
            this._isFocused = false;
            _me.event(Event.BLUR);
            _me.event(Event.FOCUS_CHANGE);
            if (_me._isInputting())
                Input["inputElement"].target.focus = false;
        });
        var hidden = "hidden", state = "visibilityState", visibilityChange = "visibilitychange";
        var document = window.document;
        if (typeof document.hidden !== "undefined") {
            visibilityChange = "visibilitychange";
            state = "visibilityState";
        }
        else if (typeof document.mozHidden !== "undefined") {
            visibilityChange = "mozvisibilitychange";
            state = "mozVisibilityState";
        }
        else if (typeof document.msHidden !== "undefined") {
            visibilityChange = "msvisibilitychange";
            state = "msVisibilityState";
        }
        else if (typeof document.webkitHidden !== "undefined") {
            visibilityChange = "webkitvisibilitychange";
            state = "webkitVisibilityState";
        }
        window.document.addEventListener(visibilityChange, visibleChangeFun);
        function visibleChangeFun() {
            if (Browser.document[state] == "hidden") {
                this._isVisibility = false;
                if (_me._isInputting())
                    Input["inputElement"].target.focus = false;
            }
            else {
                this._isVisibility = true;
            }
            this.renderingEnabled = this._isVisibility;
            _me.event(Event.VISIBILITY_CHANGE);
        }
        window.addEventListener("resize", function () {
            var orientation = Browser.window.orientation;
            if (orientation != null && orientation != this._previousOrientation && _me._isInputting()) {
                Input["inputElement"].target.focus = false;
            }
            this._previousOrientation = orientation;
            if (_me._isInputting())
                return;
            if (Browser.onSafari)
                _me._safariOffsetY = (Browser.window.__innerHeight || Browser.document.body.clientHeight || Browser.document.documentElement.clientHeight) - Browser.window.innerHeight;
            _me._resetCanvas();
        });
        window.addEventListener("orientationchange", function (e) {
            _me._resetCanvas();
        });
        this.on(Event.MOUSE_MOVE, this, this._onmouseMove);
        if (Browser.onMobile)
            this.on(Event.MOUSE_DOWN, this, this._onmouseMove);
    }
    _isInputting() {
        return (Browser.onMobile && Input.isInputting);
    }
    set width(value) {
        this.designWidth = value;
        super.set_width(value);
        ILaya.systemTimer.callLater(this, this._changeCanvasSize);
    }
    get width() {
        return super.get_width();
    }
    set height(value) {
        this.designHeight = value;
        super.set_height(value);
        ILaya.systemTimer.callLater(this, this._changeCanvasSize);
    }
    get height() {
        return super.get_height();
    }
    set transform(value) {
        super.set_transform(value);
    }
    get transform() {
        if (this._tfChanged)
            this._adjustTransform();
        return (this._transform = this._transform || this._createTransform());
    }
    get isFocused() {
        return this._isFocused;
    }
    get isVisibility() {
        return this._isVisibility;
    }
    _changeCanvasSize() {
        this.setScreenSize(Browser.clientWidth * Browser.pixelRatio, Browser.clientHeight * Browser.pixelRatio);
    }
    _resetCanvas() {
        if (!this.screenAdaptationEnabled)
            return;
        this._changeCanvasSize();
    }
    setScreenSize(screenWidth, screenHeight) {
        var rotation = false;
        if (this._screenMode !== Stage.SCREEN_NONE) {
            var screenType = screenWidth / screenHeight < 1 ? Stage.SCREEN_VERTICAL : Stage.SCREEN_HORIZONTAL;
            rotation = screenType !== this._screenMode;
            if (rotation) {
                var temp = screenHeight;
                screenHeight = screenWidth;
                screenWidth = temp;
            }
        }
        this.canvasRotation = rotation;
        var canvas = Render._mainCanvas;
        var canvasStyle = canvas.source.style;
        var mat = this._canvasTransform.identity();
        var scaleMode = this._scaleMode;
        var scaleX = screenWidth / this.designWidth;
        var scaleY = screenHeight / this.designHeight;
        var canvasWidth = this.useRetinalCanvas ? screenWidth : this.designWidth;
        var canvasHeight = this.useRetinalCanvas ? screenHeight : this.designHeight;
        var realWidth = screenWidth;
        var realHeight = screenHeight;
        var pixelRatio = Browser.pixelRatio;
        this._width = this.designWidth;
        this._height = this.designHeight;
        switch (scaleMode) {
            case Stage.SCALE_NOSCALE:
                scaleX = scaleY = 1;
                realWidth = this.designWidth;
                realHeight = this.designHeight;
                break;
            case Stage.SCALE_SHOWALL:
                scaleX = scaleY = Math.min(scaleX, scaleY);
                canvasWidth = realWidth = Math.round(this.designWidth * scaleX);
                canvasHeight = realHeight = Math.round(this.designHeight * scaleY);
                break;
            case Stage.SCALE_NOBORDER:
                scaleX = scaleY = Math.max(scaleX, scaleY);
                realWidth = Math.round(this.designWidth * scaleX);
                realHeight = Math.round(this.designHeight * scaleY);
                break;
            case Stage.SCALE_FULL:
                scaleX = scaleY = 1;
                this._width = canvasWidth = screenWidth;
                this._height = canvasHeight = screenHeight;
                break;
            case Stage.SCALE_FIXED_WIDTH:
                scaleY = scaleX;
                this._height = canvasHeight = Math.round(screenHeight / scaleX);
                break;
            case Stage.SCALE_FIXED_HEIGHT:
                scaleX = scaleY;
                this._width = canvasWidth = Math.round(screenWidth / scaleY);
                break;
            case Stage.SCALE_FIXED_AUTO:
                if ((screenWidth / screenHeight) < (this.designWidth / this.designHeight)) {
                    scaleY = scaleX;
                    this._height = canvasHeight = Math.round(screenHeight / scaleX);
                }
                else {
                    scaleX = scaleY;
                    this._width = canvasWidth = Math.round(screenWidth / scaleY);
                }
                break;
        }
        if (this.useRetinalCanvas) {
            canvasWidth = screenWidth;
            canvasHeight = screenHeight;
        }
        scaleX *= this.scaleX;
        scaleY *= this.scaleY;
        if (scaleX === 1 && scaleY === 1) {
            this.transform.identity();
        }
        else {
            this.transform.a = this._formatData(scaleX / (realWidth / canvasWidth));
            this.transform.d = this._formatData(scaleY / (realHeight / canvasHeight));
        }
        canvas.size(canvasWidth, canvasHeight);
        RunDriver.changeWebGLSize(canvasWidth, canvasHeight);
        mat.scale(realWidth / canvasWidth / pixelRatio, realHeight / canvasHeight / pixelRatio);
        if (this._alignH === Stage.ALIGN_LEFT)
            this.offset.x = 0;
        else if (this._alignH === Stage.ALIGN_RIGHT)
            this.offset.x = screenWidth - realWidth;
        else
            this.offset.x = (screenWidth - realWidth) * 0.5 / pixelRatio;
        if (this._alignV === Stage.ALIGN_TOP)
            this.offset.y = 0;
        else if (this._alignV === Stage.ALIGN_BOTTOM)
            this.offset.y = screenHeight - realHeight;
        else
            this.offset.y = (screenHeight - realHeight) * 0.5 / pixelRatio;
        this.offset.x = Math.round(this.offset.x);
        this.offset.y = Math.round(this.offset.y);
        mat.translate(this.offset.x, this.offset.y);
        if (this._safariOffsetY)
            mat.translate(0, this._safariOffsetY);
        this.canvasDegree = 0;
        if (rotation) {
            if (this._screenMode === Stage.SCREEN_HORIZONTAL) {
                mat.rotate(Math.PI / 2);
                mat.translate(screenHeight / pixelRatio, 0);
                this.canvasDegree = 90;
            }
            else {
                mat.rotate(-Math.PI / 2);
                mat.translate(0, screenWidth / pixelRatio);
                this.canvasDegree = -90;
            }
        }
        mat.a = this._formatData(mat.a);
        mat.d = this._formatData(mat.d);
        mat.tx = this._formatData(mat.tx);
        mat.ty = this._formatData(mat.ty);
        super.set_transform(this.transform);
        canvasStyle.transformOrigin = canvasStyle.webkitTransformOrigin = canvasStyle.msTransformOrigin = canvasStyle.mozTransformOrigin = canvasStyle.oTransformOrigin = "0px 0px 0px";
        canvasStyle.transform = canvasStyle.webkitTransform = canvasStyle.msTransform = canvasStyle.mozTransform = canvasStyle.oTransform = "matrix(" + mat.toString() + ")";
        if (this._safariOffsetY)
            mat.translate(0, -this._safariOffsetY);
        mat.translate(parseInt(canvasStyle.left) || 0, parseInt(canvasStyle.top) || 0);
        this.visible = true;
        this._repaint |= SpriteConst.REPAINT_CACHE;
        this.event(Event.RESIZE);
    }
    _formatData(value) {
        if (Math.abs(value) < 0.000001)
            return 0;
        if (Math.abs(1 - value) < 0.001)
            return value > 0 ? 1 : -1;
        return value;
    }
    get scaleMode() {
        return this._scaleMode;
    }
    set scaleMode(value) {
        this._scaleMode = value;
        ILaya.systemTimer.callLater(this, this._changeCanvasSize);
    }
    get alignH() {
        return this._alignH;
    }
    set alignH(value) {
        this._alignH = value;
        ILaya.systemTimer.callLater(this, this._changeCanvasSize);
    }
    get alignV() {
        return this._alignV;
    }
    set alignV(value) {
        this._alignV = value;
        ILaya.systemTimer.callLater(this, this._changeCanvasSize);
    }
    get bgColor() {
        return this._bgColor;
    }
    set bgColor(value) {
        this._bgColor = value;
        if (value)
            this._wgColor = ColorUtils.create(value).arrColor;
        else
            this._wgColor = null;
        if (value) {
            Render.canvas.style.background = value;
        }
        else {
            Render.canvas.style.background = "none";
        }
    }
    get mouseX() {
        return Math.round(MouseManager.instance.mouseX / this.clientScaleX);
    }
    get mouseY() {
        return Math.round(MouseManager.instance.mouseY / this.clientScaleY);
    }
    getMousePoint() {
        return Point.TEMP.setTo(this.mouseX, this.mouseY);
    }
    get clientScaleX() {
        return this._transform ? this._transform.getScaleX() : 1;
    }
    get clientScaleY() {
        return this._transform ? this._transform.getScaleY() : 1;
    }
    get screenMode() {
        return this._screenMode;
    }
    set screenMode(value) {
        this._screenMode = value;
    }
    repaint(type = SpriteConst.REPAINT_CACHE) {
        this._repaint |= type;
    }
    parentRepaint(type = SpriteConst.REPAINT_CACHE) {
    }
    _loop() {
        this._globalRepaintGet = this._globalRepaintSet;
        this._globalRepaintSet = false;
        this.render(Render._context, 0, 0);
        return true;
    }
    getFrameTm() {
        return this._frameStartTime;
    }
    _onmouseMove(e) {
        this._mouseMoveTime = Browser.now();
    }
    getTimeFromFrameStart() {
        return Browser.now() - this._frameStartTime;
    }
    set visible(value) {
        if (this.visible !== value) {
            super.set_visible(value);
            var style = Render._mainCanvas.source.style;
            style.visibility = value ? "visible" : "hidden";
        }
    }
    get visible() {
        return super.visible;
    }
    render(context, x, y) {
        if (window.conch) {
            this.renderToNative(context, x, y);
            return;
        }
        Stage._dbgSprite.graphics.clear();
        if (this._frameRate === Stage.FRAME_SLEEP) {
            var now = Browser.now();
            if (now - this._frameStartTime >= 1000)
                this._frameStartTime = now;
            else
                return;
        }
        else {
            if (!this._visible) {
                this._renderCount++;
                if (this._renderCount % 5 === 0) {
                    CallLater.I._update();
                    Stat.loopCount++;
                    RenderInfo.loopCount = Stat.loopCount;
                    this._updateTimers();
                }
                return;
            }
            this._frameStartTime = Browser.now();
            RenderInfo.loopStTm = this._frameStartTime;
        }
        this._renderCount++;
        var frameMode = this._frameRate === Stage.FRAME_MOUSE ? (((this._frameStartTime - this._mouseMoveTime) < 2000) ? Stage.FRAME_FAST : Stage.FRAME_SLOW) : this._frameRate;
        var isFastMode = (frameMode !== Stage.FRAME_SLOW);
        var isDoubleLoop = (this._renderCount % 2 === 0);
        Stat.renderSlow = !isFastMode;
        if (isFastMode || isDoubleLoop) {
            CallLater.I._update();
            Stat.loopCount++;
            RenderInfo.loopCount = Stat.loopCount;
            if (this.renderingEnabled) {
                for (var i = 0, n = this._scene3Ds.length; i < n; i++)
                    this._scene3Ds[i]._update();
                context.clear();
                super.render(context, x, y);
                Stat._StatRender.renderNotCanvas(context, x, y);
            }
        }
        Stage._dbgSprite.render(context, 0, 0);
        if (isFastMode || !isDoubleLoop) {
            if (this.renderingEnabled) {
                Stage.clear(this._bgColor);
                context.flush();
                VectorGraphManager.instance && VectorGraphManager.getInstance().endDispose();
            }
            this._updateTimers();
        }
    }
    renderToNative(context, x, y) {
        this._renderCount++;
        if (!this._visible) {
            if (this._renderCount % 5 === 0) {
                CallLater.I._update();
                Stat.loopCount++;
                RenderInfo.loopCount = Stat.loopCount;
                this._updateTimers();
            }
            return;
        }
        CallLater.I._update();
        Stat.loopCount++;
        RenderInfo.loopCount = Stat.loopCount;
        if (this.renderingEnabled) {
            for (var i = 0, n = this._scene3Ds.length; i < n; i++)
                this._scene3Ds[i]._update();
            context.clear();
            super.render(context, x, y);
            Stat._StatRender.renderNotCanvas(context, x, y);
        }
        if (this.renderingEnabled) {
            Stage.clear(this._bgColor);
            context.flush();
            VectorGraphManager.instance && VectorGraphManager.getInstance().endDispose();
        }
        this._updateTimers();
    }
    _updateTimers() {
        ILaya.systemTimer._update();
        ILaya.startTimer._update();
        ILaya.physicsTimer._update();
        ILaya.updateTimer._update();
        ILaya.lateTimer._update();
        ILaya.timer._update();
    }
    set fullScreenEnabled(value) {
        var document = Browser.document;
        var canvas = Render.canvas;
        if (value) {
            canvas.addEventListener('mousedown', this._requestFullscreen);
            canvas.addEventListener('touchstart', this._requestFullscreen);
            document.addEventListener("fullscreenchange", this._fullScreenChanged);
            document.addEventListener("mozfullscreenchange", this._fullScreenChanged);
            document.addEventListener("webkitfullscreenchange", this._fullScreenChanged);
            document.addEventListener("msfullscreenchange", this._fullScreenChanged);
        }
        else {
            canvas.removeEventListener('mousedown', this._requestFullscreen);
            canvas.removeEventListener('touchstart', this._requestFullscreen);
            document.removeEventListener("fullscreenchange", this._fullScreenChanged);
            document.removeEventListener("mozfullscreenchange", this._fullScreenChanged);
            document.removeEventListener("webkitfullscreenchange", this._fullScreenChanged);
            document.removeEventListener("msfullscreenchange", this._fullScreenChanged);
        }
    }
    get frameRate() {
        if (!ILaya.Render.isConchApp) {
            return this._frameRate;
        }
        else {
            return this._frameRateNative;
        }
    }
    set frameRate(value) {
        if (!ILaya.Render.isConchApp) {
            this._frameRate = value;
        }
        else {
            var c = window.conch;
            switch (value) {
                case Stage.FRAME_FAST:
                    c.config.setLimitFPS(60);
                    break;
                case Stage.FRAME_MOUSE:
                    c.config.setMouseFrame(2000);
                    break;
                case Stage.FRAME_SLOW:
                    c.config.setSlowFrame(true);
                    break;
                case Stage.FRAME_SLEEP:
                    c.config.setLimitFPS(1);
                    break;
            }
            this._frameRateNative = value;
        }
    }
    _requestFullscreen() {
        var element = Browser.document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    _fullScreenChanged() {
        ILaya.stage.event(Event.FULL_SCREEN_CHANGE);
    }
    exitFullscreen() {
        var document = Browser.document;
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
    isGlobalRepaint() {
        return this._globalRepaintGet;
    }
    setGlobalRepaint() {
        this._globalRepaintSet = true;
    }
    add3DUI(uibase) {
        var uiroot = uibase.rootView;
        if (this._3dUI.indexOf(uiroot) >= 0)
            return;
        this._3dUI.push(uiroot);
    }
    remove3DUI(uibase) {
        var uiroot = uibase.rootView;
        var p = this._3dUI.indexOf(uiroot);
        if (p >= 0) {
            this._3dUI.splice(p, 1);
            return true;
        }
        return false;
    }
}
Stage.SCALE_NOSCALE = "noscale";
Stage.SCALE_EXACTFIT = "exactfit";
Stage.SCALE_SHOWALL = "showall";
Stage.SCALE_NOBORDER = "noborder";
Stage.SCALE_FULL = "full";
Stage.SCALE_FIXED_WIDTH = "fixedwidth";
Stage.SCALE_FIXED_HEIGHT = "fixedheight";
Stage.SCALE_FIXED_AUTO = "fixedauto";
Stage.ALIGN_LEFT = "left";
Stage.ALIGN_RIGHT = "right";
Stage.ALIGN_CENTER = "center";
Stage.ALIGN_TOP = "top";
Stage.ALIGN_MIDDLE = "middle";
Stage.ALIGN_BOTTOM = "bottom";
Stage.SCREEN_NONE = "none";
Stage.SCREEN_HORIZONTAL = "horizontal";
Stage.SCREEN_VERTICAL = "vertical";
Stage.FRAME_FAST = "fast";
Stage.FRAME_SLOW = "slow";
Stage.FRAME_MOUSE = "mouse";
Stage.FRAME_SLEEP = "sleep";
Stage._dbgSprite = new Sprite();
Stage.clear = function (value) {
    Context.set2DRenderConfig();
    var gl = LayaGL.instance;
    RenderState2D.worldScissorTest && gl.disable(gl.SCISSOR_TEST);
    var ctx = Render.context;
    var c = (ctx._submits._length == 0 || Config.preserveDrawingBuffer) ? ColorUtils.create(value).arrColor : window.Laya.stage._wgColor;
    if (c)
        ctx.clearBG(c[0], c[1], c[2], c[3]);
    else
        ctx.clearBG(0, 0, 0, 0);
    RenderState2D.clear();
};
ClassUtils.regClass("laya.display.Stage", Stage);
ClassUtils.regClass("Laya.Stage", Stage);
