import { Point } from "../maths/Point";
import { Stat } from "../utils/Stat";
import { MouseTouch } from "./MouseTouch";
import { Touch } from "./Touch";
import { SimpleSingletonList } from "./component/SimpleSingletonList";
import { BaseCamera } from "./core/BaseCamera";
import { Ray } from "./math/Ray";
import { Vector2 } from "./math/Vector2";
import { Vector3 } from "./math/Vector3";
import { HitResult } from "./physics/HitResult";
import { PhysicsSimulation } from "./physics/PhysicsSimulation";
import { Physics3D } from "./physics/Physics3D";
import { ILaya } from "../../ILaya";
export class Input3D {
    constructor() {
        this._eventList = [];
        this._mouseTouch = new MouseTouch();
        this._touchPool = [];
        this._touches = new SimpleSingletonList();
        this._multiTouchEnabled = true;
        this._pushEventList = ((e) => {
            e.preventDefault();
            this._eventList.push(e);
        }).bind(this);
    }
    __init__(canvas, scene) {
        this._scene = scene;
        canvas.oncontextmenu = function (e) {
            return false;
        };
    }
    _onCanvasEvent(canvas) {
        canvas.addEventListener('mousedown', this._pushEventList);
        canvas.addEventListener('mouseup', this._pushEventList, true);
        canvas.addEventListener('mousemove', this._pushEventList, true);
        canvas.addEventListener("touchstart", this._pushEventList);
        canvas.addEventListener("touchend", this._pushEventList, true);
        canvas.addEventListener("touchmove", this._pushEventList, true);
        canvas.addEventListener("touchcancel", this._pushEventList, true);
    }
    _offCanvasEvent(canvas) {
        canvas.removeEventListener('mousedown', this._pushEventList);
        canvas.removeEventListener('mouseup', this._pushEventList, true);
        canvas.removeEventListener('mousemove', this._pushEventList, true);
        canvas.removeEventListener("touchstart", this._pushEventList);
        canvas.removeEventListener("touchend", this._pushEventList, true);
        canvas.removeEventListener("touchmove", this._pushEventList, true);
        canvas.removeEventListener("touchcancel", this._pushEventList, true);
        this._eventList.length = 0;
        this._touches.length = 0;
    }
    touchCount() {
        return this._touches.length;
    }
    get multiTouchEnabled() {
        return this._multiTouchEnabled;
    }
    set multiTouchEnabled(value) {
        this._multiTouchEnabled = value;
    }
    _getTouch(touchID) {
        var touch = this._touchPool[touchID];
        if (!touch) {
            touch = new Touch();
            this._touchPool[touchID] = touch;
            touch._identifier = touchID;
        }
        return touch;
    }
    _mouseTouchDown() {
        var touch = this._mouseTouch;
        var sprite = touch.sprite;
        touch._pressedSprite = sprite;
        touch._pressedLoopCount = Stat.loopCount;
        if (sprite) {
            var scripts = sprite._scripts;
            if (scripts) {
                for (var i = 0, n = scripts.length; i < n; i++)
                    scripts[i].onMouseDown();
            }
        }
    }
    _mouseTouchUp() {
        var i, n;
        var touch = this._mouseTouch;
        var lastPressedSprite = touch._pressedSprite;
        touch._pressedSprite = null;
        touch._pressedLoopCount = -1;
        var sprite = touch.sprite;
        if (sprite) {
            if (sprite === lastPressedSprite) {
                var scripts = sprite._scripts;
                if (scripts) {
                    for (i = 0, n = scripts.length; i < n; i++)
                        scripts[i].onMouseClick();
                }
            }
        }
        if (lastPressedSprite) {
            var lastScripts = lastPressedSprite._scripts;
            if (lastScripts) {
                for (i = 0, n = lastScripts.length; i < n; i++)
                    lastScripts[i].onMouseUp();
            }
        }
    }
    _mouseTouchRayCast(cameras) {
        var touchHitResult = Input3D._tempHitResult0;
        var touchPos = Input3D._tempVector20;
        var touchRay = Input3D._tempRay0;
        touchHitResult.succeeded = false;
        var x = this._mouseTouch.mousePositionX;
        var y = this._mouseTouch.mousePositionY;
        touchPos.x = x;
        touchPos.y = y;
        for (var i = cameras.length - 1; i >= 0; i--) {
            var camera = cameras[i];
            var viewport = camera.viewport;
            if (touchPos.x >= viewport.x && touchPos.y >= viewport.y && touchPos.x <= viewport.width && touchPos.y <= viewport.height) {
                camera.viewportPointToRay(touchPos, touchRay);
                var sucess = this._scene._physicsSimulation.rayCast(touchRay, touchHitResult);
                if (sucess || (camera.clearFlag === BaseCamera.CLEARFLAG_SOLIDCOLOR || camera.clearFlag === BaseCamera.CLEARFLAG_SKY))
                    break;
            }
        }
        var touch = this._mouseTouch;
        var lastSprite = touch.sprite;
        if (touchHitResult.succeeded) {
            var touchSprite = touchHitResult.collider.owner;
            touch.sprite = touchSprite;
            var scripts = touchSprite._scripts;
            if (lastSprite !== touchSprite) {
                if (scripts) {
                    for (var j = 0, m = scripts.length; j < m; j++)
                        scripts[j].onMouseEnter();
                }
            }
        }
        else {
            touch.sprite = null;
        }
        if (lastSprite && (lastSprite !== touchSprite)) {
            var outScripts = lastSprite._scripts;
            if (outScripts) {
                for (j = 0, m = outScripts.length; j < m; j++)
                    outScripts[j].onMouseOut();
            }
        }
    }
    _changeTouches(changedTouches, flag) {
        var offsetX = 0, offsetY = 0;
        var lastCount = this._touches.length;
        for (var j = 0, m = changedTouches.length; j < m; j++) {
            var nativeTouch = changedTouches[j];
            var identifier = nativeTouch.identifier;
            if (!this._multiTouchEnabled && identifier !== 0)
                continue;
            var touch = this._getTouch(identifier);
            var pos = touch._position;
            var mousePoint = Input3D._tempPoint;
            mousePoint.setTo(nativeTouch.pageX, nativeTouch.pageY);
            ILaya.stage._canvasTransform.invertTransformPoint(mousePoint);
            var posX = mousePoint.x;
            var posY = mousePoint.y;
            switch (flag) {
                case 0:
                    this._touches.add(touch);
                    offsetX += posX;
                    offsetY += posY;
                    break;
                case 1:
                    this._touches.remove(touch);
                    offsetX -= posX;
                    offsetY -= posY;
                    break;
                case 2:
                    offsetX = posX - pos.x;
                    offsetY = posY - pos.y;
                    break;
            }
            pos.x = posX;
            pos.y = posY;
        }
        var touchCount = this._touches.length;
        if (touchCount === 0) {
            this._mouseTouch.mousePositionX = 0;
            this._mouseTouch.mousePositionY = 0;
        }
        else {
            this._mouseTouch.mousePositionX = (this._mouseTouch.mousePositionX * lastCount + offsetX) / touchCount;
            this._mouseTouch.mousePositionY = (this._mouseTouch.mousePositionY * lastCount + offsetY) / touchCount;
        }
    }
    _update() {
        var enablePhysics = Physics3D._enbalePhysics && !PhysicsSimulation.disableSimulation;
        var i, n, j, m;
        n = this._eventList.length;
        var cameras = this._scene._cameraPool;
        if (n > 0) {
            var rayCast = false;
            for (i = 0; i < n; i++) {
                var e = this._eventList[i];
                switch (e.type) {
                    case "mousedown":
                        (enablePhysics) && (this._mouseTouchDown());
                        break;
                    case "mouseup":
                        (enablePhysics) && (this._mouseTouchUp());
                        break;
                    case "mousemove":
                        var mousePoint = Input3D._tempPoint;
                        mousePoint.setTo(e.pageX, e.pageY);
                        ILaya.stage._canvasTransform.invertTransformPoint(mousePoint);
                        this._mouseTouch.mousePositionX = mousePoint.x;
                        this._mouseTouch.mousePositionY = mousePoint.y;
                        (enablePhysics) && (rayCast = true);
                        break;
                    case "touchstart":
                        var lastLength = this._touches.length;
                        this._changeTouches(e.changedTouches, 0);
                        if (enablePhysics) {
                            rayCast = true;
                            (lastLength === 0) && (this._mouseTouchDown());
                        }
                        break;
                    case "touchend":
                    case "touchcancel":
                        this._changeTouches(e.changedTouches, 1);
                        (enablePhysics && this._touches.length === 0) && (this._mouseTouchUp());
                        break;
                    case "touchmove":
                        this._changeTouches(e.changedTouches, 2);
                        (enablePhysics) && (rayCast = true);
                        break;
                    default:
                        throw "Input3D:unkonwn event type.";
                }
            }
            (rayCast) && (this._mouseTouchRayCast(cameras));
            this._eventList.length = 0;
        }
        if (enablePhysics) {
            var mouseTouch = this._mouseTouch;
            var pressedSprite = mouseTouch._pressedSprite;
            if (pressedSprite && (Stat.loopCount > mouseTouch._pressedLoopCount)) {
                var pressedScripts = pressedSprite._scripts;
                if (pressedScripts) {
                    for (j = 0, m = pressedScripts.length; j < m; j++)
                        pressedScripts[j].onMouseDrag();
                }
            }
            var touchSprite = mouseTouch.sprite;
            if (touchSprite) {
                var scripts = touchSprite._scripts;
                if (scripts) {
                    for (j = 0, m = scripts.length; j < m; j++)
                        scripts[j].onMouseOver();
                }
            }
        }
    }
    getTouch(index) {
        if (index < this._touches.length) {
            return this._touches.elements[index];
        }
        else {
            return null;
        }
    }
}
Input3D._tempPoint = new Point();
Input3D._tempVector20 = new Vector2();
Input3D._tempRay0 = new Ray(new Vector3(), new Vector3());
Input3D._tempHitResult0 = new HitResult();
