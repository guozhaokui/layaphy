import { Point } from "../maths/Point";
import { ILaya } from "../../ILaya";
export class Event {
    setTo(type, currentTarget, target) {
        this.type = type;
        this.currentTarget = currentTarget;
        this.target = target;
        return this;
    }
    stopPropagation() {
        this._stoped = true;
    }
    get touches() {
        if (!this.nativeEvent)
            return null;
        var arr = this.nativeEvent.touches;
        if (arr) {
            var stage = ILaya.stage;
            for (var i = 0, n = arr.length; i < n; i++) {
                var e = arr[i];
                var point = Point.TEMP;
                point.setTo(e.clientX, e.clientY);
                stage._canvasTransform.invertTransformPoint(point);
                stage.transform.invertTransformPoint(point);
                e.stageX = point.x;
                e.stageY = point.y;
            }
        }
        return arr;
    }
    get altKey() {
        return this.nativeEvent.altKey;
    }
    get ctrlKey() {
        return this.nativeEvent.ctrlKey;
    }
    get shiftKey() {
        return this.nativeEvent.shiftKey;
    }
    get charCode() {
        return this.nativeEvent.charCode;
    }
    get keyLocation() {
        return this.nativeEvent.location || this.nativeEvent.keyLocation;
    }
    get stageX() {
        return ILaya.stage.mouseX;
    }
    get stageY() {
        return ILaya.stage.mouseY;
    }
}
Event.EMPTY = new Event();
Event.MOUSE_DOWN = "mousedown";
Event.MOUSE_UP = "mouseup";
Event.CLICK = "click";
Event.RIGHT_MOUSE_DOWN = "rightmousedown";
Event.RIGHT_MOUSE_UP = "rightmouseup";
Event.RIGHT_CLICK = "rightclick";
Event.MOUSE_MOVE = "mousemove";
Event.MOUSE_OVER = "mouseover";
Event.MOUSE_OUT = "mouseout";
Event.MOUSE_WHEEL = "mousewheel";
Event.ROLL_OVER = "mouseover";
Event.ROLL_OUT = "mouseout";
Event.DOUBLE_CLICK = "doubleclick";
Event.CHANGE = "change";
Event.CHANGED = "changed";
Event.RESIZE = "resize";
Event.ADDED = "added";
Event.REMOVED = "removed";
Event.DISPLAY = "display";
Event.UNDISPLAY = "undisplay";
Event.ERROR = "error";
Event.COMPLETE = "complete";
Event.LOADED = "loaded";
Event.READY = "ready";
Event.PROGRESS = "progress";
Event.INPUT = "input";
Event.RENDER = "render";
Event.OPEN = "open";
Event.MESSAGE = "message";
Event.CLOSE = "close";
Event.KEY_DOWN = "keydown";
Event.KEY_PRESS = "keypress";
Event.KEY_UP = "keyup";
Event.FRAME = "enterframe";
Event.DRAG_START = "dragstart";
Event.DRAG_MOVE = "dragmove";
Event.DRAG_END = "dragend";
Event.ENTER = "enter";
Event.SELECT = "select";
Event.BLUR = "blur";
Event.FOCUS = "focus";
Event.VISIBILITY_CHANGE = "visibilitychange";
Event.FOCUS_CHANGE = "focuschange";
Event.PLAYED = "played";
Event.PAUSED = "paused";
Event.STOPPED = "stopped";
Event.START = "start";
Event.END = "end";
Event.COMPONENT_ADDED = "componentadded";
Event.COMPONENT_REMOVED = "componentremoved";
Event.RELEASED = "released";
Event.LINK = "link";
Event.LABEL = "label";
Event.FULL_SCREEN_CHANGE = "fullscreenchange";
Event.DEVICE_LOST = "devicelost";
Event.TRANSFORM_CHANGED = "transformchanged";
Event.ANIMATION_CHANGED = "animationchanged";
Event.TRAIL_FILTER_CHANGE = "trailfilterchange";
Event.TRIGGER_ENTER = "triggerenter";
Event.TRIGGER_STAY = "triggerstay";
Event.TRIGGER_EXIT = "triggerexit";
