import { Event } from "./Event";
import { TouchManager } from "./TouchManager";
import { Input } from "../display/Input";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Browser } from "../utils/Browser";
import { ILaya } from "../../ILaya";
export class MouseManager {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.disableMouseEvent = false;
        this.mouseDownTime = 0;
        this.mouseMoveAccuracy = 2;
        this._event = new Event();
        this._captureSp = null;
        this._captureChain = [];
        this._captureExlusiveMode = false;
        this._hitCaputreSp = false;
        this._point = new Point();
        this._rect = new Rectangle();
        this._lastMoveTimer = 0;
        this._prePoint = new Point();
        this._touchIDs = {};
        this._curTouchID = NaN;
        this._id = 1;
    }
    __init__(stage, canvas) {
        this._stage = stage;
        var _this = this;
        canvas.oncontextmenu = function (e) {
            if (MouseManager.enabled)
                return false;
        };
        canvas.addEventListener('mousedown', function (e) {
            if (MouseManager.enabled) {
                if (!Browser.onIE)
                    e.preventDefault();
                _this.mouseDownTime = Browser.now();
                _this.runEvent(e);
            }
        });
        canvas.addEventListener('mouseup', function (e) {
            if (MouseManager.enabled) {
                e.preventDefault();
                _this.mouseDownTime = -Browser.now();
                _this.runEvent(e);
            }
        }, true);
        canvas.addEventListener('mousemove', function (e) {
            if (MouseManager.enabled) {
                e.preventDefault();
                var now = Browser.now();
                if (now - _this._lastMoveTimer < 10)
                    return;
                _this._lastMoveTimer = now;
                _this.runEvent(e);
            }
        }, true);
        canvas.addEventListener("mouseout", function (e) {
            if (MouseManager.enabled)
                _this.runEvent(e);
        });
        canvas.addEventListener("mouseover", function (e) {
            if (MouseManager.enabled)
                _this.runEvent(e);
        });
        canvas.addEventListener("touchstart", function (e) {
            if (MouseManager.enabled) {
                if (!MouseManager._isFirstTouch && !Input.isInputting)
                    e.preventDefault();
                _this.mouseDownTime = Browser.now();
                _this.runEvent(e);
            }
        });
        canvas.addEventListener("touchend", function (e) {
            if (MouseManager.enabled) {
                if (!MouseManager._isFirstTouch && !Input.isInputting)
                    e.preventDefault();
                MouseManager._isFirstTouch = false;
                _this.mouseDownTime = -Browser.now();
                _this.runEvent(e);
            }
            else {
                _this._curTouchID = NaN;
            }
        }, true);
        canvas.addEventListener("touchmove", function (e) {
            if (MouseManager.enabled) {
                e.preventDefault();
                _this.runEvent(e);
            }
        }, true);
        canvas.addEventListener("touchcancel", function (e) {
            if (MouseManager.enabled) {
                e.preventDefault();
                _this.runEvent(e);
            }
            else {
                _this._curTouchID = NaN;
            }
        }, true);
        canvas.addEventListener('mousewheel', function (e) {
            if (MouseManager.enabled)
                _this.runEvent(e);
        });
        canvas.addEventListener('DOMMouseScroll', function (e) {
            if (MouseManager.enabled)
                _this.runEvent(e);
        });
    }
    initEvent(e, nativeEvent = null) {
        var _this = this;
        _this._event._stoped = false;
        _this._event.nativeEvent = nativeEvent || e;
        _this._target = null;
        this._point.setTo(e.pageX || e.clientX, e.pageY || e.clientY);
        if (this._stage._canvasTransform) {
            this._stage._canvasTransform.invertTransformPoint(this._point);
            _this.mouseX = this._point.x;
            _this.mouseY = this._point.y;
        }
        _this._event.touchId = e.identifier || 0;
        this._tTouchID = _this._event.touchId;
        var evt;
        evt = TouchManager.I._event;
        evt._stoped = false;
        evt.nativeEvent = _this._event.nativeEvent;
        evt.touchId = _this._event.touchId;
    }
    checkMouseWheel(e) {
        this._event.delta = e.wheelDelta ? e.wheelDelta * 0.025 : -e.detail;
        var _lastOvers = TouchManager.I.getLastOvers();
        for (var i = 0, n = _lastOvers.length; i < n; i++) {
            var ele = _lastOvers[i];
            ele.event(Event.MOUSE_WHEEL, this._event.setTo(Event.MOUSE_WHEEL, ele, this._target));
        }
    }
    onMouseMove(ele) {
        TouchManager.I.onMouseMove(ele, this._tTouchID);
    }
    onMouseDown(ele) {
        if (Input.isInputting && ILaya.stage.focus && ILaya.stage.focus["focus"] && !ILaya.stage.focus.contains(this._target)) {
            var pre_input = ILaya.stage.focus['_tf'] || ILaya.stage.focus;
            var new_input = ele['_tf'] || ele;
            if (new_input instanceof Input && new_input.multiline == pre_input.multiline)
                pre_input['_focusOut']();
            else
                pre_input.focus = false;
        }
        TouchManager.I.onMouseDown(ele, this._tTouchID, this._isLeftMouse);
    }
    onMouseUp(ele) {
        TouchManager.I.onMouseUp(ele, this._tTouchID, this._isLeftMouse);
    }
    check(sp, mouseX, mouseY, callBack) {
        this._point.setTo(mouseX, mouseY);
        sp.fromParentPoint(this._point);
        mouseX = this._point.x;
        mouseY = this._point.y;
        var scrollRect = sp._style.scrollRect;
        if (scrollRect) {
            this._rect.setTo(scrollRect.x, scrollRect.y, scrollRect.width, scrollRect.height);
            if (!this._rect.contains(mouseX, mouseY))
                return false;
        }
        if (!this.disableMouseEvent) {
            if (sp.hitTestPrior && !sp.mouseThrough && !this.hitTest(sp, mouseX, mouseY)) {
                return false;
            }
            for (var i = sp._children.length - 1; i > -1; i--) {
                var child = sp._children[i];
                if (!child.destroyed && child._mouseState > 1 && child._visible) {
                    if (this.check(child, mouseX, mouseY, callBack))
                        return true;
                }
            }
            for (i = sp._extUIChild.length - 1; i >= 0; i--) {
                var c = sp._extUIChild[i];
                if (!c.destroyed && c._mouseState > 1 && c._visible) {
                    if (this.check(c, mouseX, mouseY, callBack))
                        return true;
                }
            }
        }
        var isHit = (sp.hitTestPrior && !sp.mouseThrough && !this.disableMouseEvent) ? true : this.hitTest(sp, mouseX, mouseY);
        if (isHit) {
            this._target = sp;
            callBack.call(this, sp);
            if (this._target == this._hitCaputreSp) {
                this._hitCaputreSp = true;
            }
        }
        else if (callBack === this.onMouseUp && sp === this._stage) {
            this._target = this._stage;
            callBack.call(this, this._target);
        }
        return isHit;
    }
    hitTest(sp, mouseX, mouseY) {
        var isHit = false;
        if (sp.scrollRect) {
            mouseX -= sp._style.scrollRect.x;
            mouseY -= sp._style.scrollRect.y;
        }
        var hitArea = sp._style.hitArea;
        if (hitArea && hitArea._hit) {
            return hitArea.contains(mouseX, mouseY);
        }
        if (sp.width > 0 && sp.height > 0 || sp.mouseThrough || hitArea) {
            if (!sp.mouseThrough) {
                isHit = (hitArea ? hitArea : this._rect.setTo(0, 0, sp.width, sp.height)).contains(mouseX, mouseY);
            }
            else {
                isHit = sp.getGraphicBounds().contains(mouseX, mouseY);
            }
        }
        return isHit;
    }
    _checkAllBaseUI(mousex, mousey, callback) {
        var ret = this.handleExclusiveCapture(this.mouseX, this.mouseY, callback);
        if (ret)
            return true;
        ret = this.check(this._stage, this.mouseX, this.mouseY, callback);
        return this.handleCapture(this.mouseX, this.mouseY, callback) || ret;
    }
    check3DUI(mousex, mousey, callback) {
        var uis = this._stage._3dUI;
        var i = 0;
        var ret = false;
        for (; i < uis.length; i++) {
            var curui = uis[i];
            this._stage._curUIBase = curui;
            if (!curui.destroyed && curui._mouseState > 1 && curui._visible) {
                ret = ret || this.check(curui, this.mouseX, this.mouseY, callback);
            }
        }
        this._stage._curUIBase = this._stage;
        return ret;
    }
    handleExclusiveCapture(mousex, mousey, callback) {
        if (this._captureExlusiveMode && this._captureSp && this._captureChain.length > 0) {
            var cursp;
            this._point.setTo(mousex, mousey);
            for (var i = 0; i < this._captureChain.length; i++) {
                cursp = this._captureChain[i];
                cursp.fromParentPoint(this._point);
            }
            this._target = cursp;
            callback.call(this, cursp);
            return true;
        }
        return false;
    }
    handleCapture(mousex, mousey, callback) {
        if (!this._hitCaputreSp && this._captureSp && this._captureChain.length > 0) {
            var cursp;
            this._point.setTo(mousex, mousey);
            for (var i = 0; i < this._captureChain.length; i++) {
                cursp = this._captureChain[i];
                cursp.fromParentPoint(this._point);
            }
            this._target = cursp;
            callback.call(this, cursp);
            return true;
        }
        return false;
    }
    runEvent(evt) {
        var _this = this;
        var i, n, touch;
        if (evt.type !== 'mousemove')
            this._prePoint.x = this._prePoint.y = -1000000;
        switch (evt.type) {
            case 'mousedown':
                this._touchIDs[0] = this._id++;
                if (!MouseManager._isTouchRespond) {
                    this._isLeftMouse = evt.button === 0;
                    this.initEvent(evt);
                    this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseDown);
                }
                else
                    MouseManager._isTouchRespond = false;
                break;
            case 'mouseup':
                this._isLeftMouse = evt.button === 0;
                this.initEvent(evt);
                this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseUp);
                break;
            case 'mousemove':
                if ((Math.abs(this._prePoint.x - evt.clientX) + Math.abs(this._prePoint.y - evt.clientY)) >= this.mouseMoveAccuracy) {
                    this._prePoint.x = evt.clientX;
                    this._prePoint.y = evt.clientY;
                    this.initEvent(evt);
                    this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseMove);
                }
                break;
            case "touchstart":
                MouseManager._isTouchRespond = true;
                this._isLeftMouse = true;
                var touches = evt.changedTouches;
                for (i = 0, n = touches.length; i < n; i++) {
                    touch = touches[i];
                    if (MouseManager.multiTouchEnabled || isNaN(this._curTouchID)) {
                        this._curTouchID = touch.identifier;
                        if (this._id % 200 === 0)
                            this._touchIDs = {};
                        this._touchIDs[touch.identifier] = this._id++;
                        this.initEvent(touch, evt);
                        this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseDown);
                    }
                }
                break;
            case "touchend":
            case "touchcancel":
                MouseManager._isTouchRespond = true;
                this._isLeftMouse = true;
                var touchends = evt.changedTouches;
                for (i = 0, n = touchends.length; i < n; i++) {
                    touch = touchends[i];
                    if (MouseManager.multiTouchEnabled || touch.identifier == this._curTouchID) {
                        this._curTouchID = NaN;
                        this.initEvent(touch, evt);
                        var isChecked;
                        isChecked = this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseUp);
                        if (!isChecked) {
                            this.onMouseUp(null);
                        }
                    }
                }
                break;
            case "touchmove":
                var touchemoves = evt.changedTouches;
                for (i = 0, n = touchemoves.length; i < n; i++) {
                    touch = touchemoves[i];
                    if (MouseManager.multiTouchEnabled || touch.identifier == this._curTouchID) {
                        this.initEvent(touch, evt);
                        this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseMove);
                    }
                }
                break;
            case "wheel":
            case "mousewheel":
            case "DOMMouseScroll":
                this.checkMouseWheel(evt);
                break;
            case "mouseout":
                TouchManager.I.stageMouseOut();
                break;
            case "mouseover":
                this._stage.event(Event.MOUSE_OVER, this._event.setTo(Event.MOUSE_OVER, this._stage, this._stage));
                break;
        }
    }
    setCapture(sp, exclusive = false) {
        this._captureSp = sp;
        this._captureExlusiveMode = exclusive;
        this._captureChain.length = 0;
        this._captureChain.push(sp);
        var cursp = sp;
        while (true) {
            if (cursp == ILaya.stage)
                break;
            if (cursp == ILaya.stage._curUIBase)
                break;
            cursp = cursp.parent;
            if (!cursp)
                break;
            this._captureChain.splice(0, 0, cursp);
        }
    }
    releaseCapture() {
        console.log('release capture');
        this._captureSp = null;
    }
}
MouseManager.instance = new MouseManager();
MouseManager.enabled = true;
MouseManager.multiTouchEnabled = true;
MouseManager._isFirstTouch = true;
