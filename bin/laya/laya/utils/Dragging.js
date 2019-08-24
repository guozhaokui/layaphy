import { Event } from "../events/Event";
import { MouseManager } from "../events/MouseManager";
import { ILaya } from "./../../ILaya";
import { Ease } from "./Ease";
import { Handler } from "./Handler";
import { Tween } from "./Tween";
export class Dragging {
    constructor() {
        this.ratio = 0.92;
        this.maxOffset = 60;
        this._dragging = false;
        this._clickOnly = true;
    }
    start(target, area, hasInertia, elasticDistance, elasticBackTime, data, disableMouseEvent, ratio = 0.92) {
        this.clearTimer();
        this.target = target;
        this.area = area;
        this.hasInertia = hasInertia;
        this.elasticDistance = area ? elasticDistance : 0;
        this.elasticBackTime = elasticBackTime;
        this.data = data;
        this._disableMouseEvent = disableMouseEvent;
        this.ratio = ratio;
        this._parent = target.parent;
        this._clickOnly = true;
        this._dragging = true;
        this._elasticRateX = this._elasticRateY = 1;
        this._lastX = this._parent.mouseX;
        this._lastY = this._parent.mouseY;
        ILaya.stage.on(Event.MOUSE_UP, this, this.onStageMouseUp);
        ILaya.stage.on(Event.MOUSE_OUT, this, this.onStageMouseUp);
        ILaya.systemTimer.frameLoop(1, this, this.loop);
    }
    clearTimer() {
        ILaya.systemTimer.clear(this, this.loop);
        ILaya.systemTimer.clear(this, this.tweenMove);
        if (this._tween) {
            this._tween.recover();
            this._tween = null;
        }
    }
    stop() {
        if (this._dragging) {
            MouseManager.instance.disableMouseEvent = false;
            ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp);
            ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp);
            this._dragging = false;
            this.target && this.area && this.backToArea();
            this.clear();
        }
    }
    loop() {
        var point = this._parent.getMousePoint();
        var mouseX = point.x;
        var mouseY = point.y;
        var offsetX = mouseX - this._lastX;
        var offsetY = mouseY - this._lastY;
        if (this._clickOnly) {
            if (Math.abs(offsetX * ILaya.stage._canvasTransform.getScaleX()) > 1 || Math.abs(offsetY * ILaya.stage._canvasTransform.getScaleY()) > 1) {
                this._clickOnly = false;
                this._offsets || (this._offsets = []);
                this._offsets.length = 0;
                this.target.event(Event.DRAG_START, this.data);
                MouseManager.instance.disableMouseEvent = this._disableMouseEvent;
            }
            else
                return;
        }
        else {
            this._offsets.push(offsetX, offsetY);
        }
        if (offsetX === 0 && offsetY === 0)
            return;
        this._lastX = mouseX;
        this._lastY = mouseY;
        this.target.x += offsetX * this._elasticRateX;
        this.target.y += offsetY * this._elasticRateY;
        this.area && this.checkArea();
        this.target.event(Event.DRAG_MOVE, this.data);
    }
    checkArea() {
        if (this.elasticDistance <= 0) {
            this.backToArea();
        }
        else {
            if (this.target._x < this.area.x) {
                var offsetX = this.area.x - this.target._x;
            }
            else if (this.target._x > this.area.x + this.area.width) {
                offsetX = this.target._x - this.area.x - this.area.width;
            }
            else {
                offsetX = 0;
            }
            this._elasticRateX = Math.max(0, 1 - (offsetX / this.elasticDistance));
            if (this.target._y < this.area.y) {
                var offsetY = this.area.y - this.target.y;
            }
            else if (this.target._y > this.area.y + this.area.height) {
                offsetY = this.target._y - this.area.y - this.area.height;
            }
            else {
                offsetY = 0;
            }
            this._elasticRateY = Math.max(0, 1 - (offsetY / this.elasticDistance));
        }
    }
    backToArea() {
        this.target.x = Math.min(Math.max(this.target._x, this.area.x), this.area.x + this.area.width);
        this.target.y = Math.min(Math.max(this.target._y, this.area.y), this.area.y + this.area.height);
    }
    onStageMouseUp(e) {
        MouseManager.instance.disableMouseEvent = false;
        ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp);
        ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp);
        ILaya.systemTimer.clear(this, this.loop);
        if (this._clickOnly || !this.target)
            return;
        if (this.hasInertia) {
            if (this._offsets.length < 1) {
                this._offsets.push(this._parent.mouseX - this._lastX, this._parent.mouseY - this._lastY);
            }
            this._offsetX = this._offsetY = 0;
            var len = this._offsets.length;
            var n = Math.min(len, 6);
            var m = this._offsets.length - n;
            for (var i = len - 1; i > m; i--) {
                this._offsetY += this._offsets[i--];
                this._offsetX += this._offsets[i];
            }
            this._offsetX = this._offsetX / n * 2;
            this._offsetY = this._offsetY / n * 2;
            if (Math.abs(this._offsetX) > this.maxOffset)
                this._offsetX = this._offsetX > 0 ? this.maxOffset : -this.maxOffset;
            if (Math.abs(this._offsetY) > this.maxOffset)
                this._offsetY = this._offsetY > 0 ? this.maxOffset : -this.maxOffset;
            ILaya.systemTimer.frameLoop(1, this, this.tweenMove);
        }
        else if (this.elasticDistance > 0) {
            this.checkElastic();
        }
        else {
            this.clear();
        }
    }
    checkElastic() {
        var tx = NaN;
        var ty = NaN;
        if (this.target.x < this.area.x)
            tx = this.area.x;
        else if (this.target._x > this.area.x + this.area.width)
            tx = this.area.x + this.area.width;
        if (this.target.y < this.area.y)
            ty = this.area.y;
        else if (this.target._y > this.area.y + this.area.height)
            ty = this.area.y + this.area.height;
        if (!isNaN(tx) || !isNaN(ty)) {
            var obj = {};
            if (!isNaN(tx))
                obj.x = tx;
            if (!isNaN(ty))
                obj.y = ty;
            this._tween = Tween.to(this.target, obj, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.clear), 0, false, false);
        }
        else {
            this.clear();
        }
    }
    tweenMove() {
        this._offsetX *= this.ratio * this._elasticRateX;
        this._offsetY *= this.ratio * this._elasticRateY;
        this.target.x += this._offsetX;
        this.target.y += this._offsetY;
        this.area && this.checkArea();
        this.target.event(Event.DRAG_MOVE, this.data);
        if ((Math.abs(this._offsetX) < 1 && Math.abs(this._offsetY) < 1) || this._elasticRateX < 0.5 || this._elasticRateY < 0.5) {
            ILaya.systemTimer.clear(this, this.tweenMove);
            if (this.elasticDistance > 0)
                this.checkElastic();
            else
                this.clear();
        }
    }
    clear() {
        if (this.target) {
            this.clearTimer();
            var sp = this.target;
            this.target = null;
            this._parent = null;
            sp.event(Event.DRAG_END, this.data);
        }
    }
}
