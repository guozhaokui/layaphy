import { Component } from "./Component";
import { Event } from "../events/Event";
import { ILaya } from "../../ILaya";
export class Script extends Component {
    get isSingleton() {
        return false;
    }
    _onAwake() {
        this.onAwake();
        if (this.onStart !== Script.prototype.onStart) {
            ILaya.startTimer.callLater(this, this.onStart);
        }
    }
    _onEnable() {
        var proto = Script.prototype;
        if (this.onTriggerEnter !== proto.onTriggerEnter) {
            this.owner.on(Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        }
        if (this.onTriggerStay !== proto.onTriggerStay) {
            this.owner.on(Event.TRIGGER_STAY, this, this.onTriggerStay);
        }
        if (this.onTriggerExit !== proto.onTriggerExit) {
            this.owner.on(Event.TRIGGER_EXIT, this, this.onTriggerExit);
        }
        if (this.onMouseDown !== proto.onMouseDown) {
            this.owner.on(Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        if (this.onMouseUp !== proto.onMouseUp) {
            this.owner.on(Event.MOUSE_UP, this, this.onMouseUp);
        }
        if (this.onClick !== proto.onClick) {
            this.owner.on(Event.CLICK, this, this.onClick);
        }
        if (this.onStageMouseDown !== proto.onStageMouseDown) {
            ILaya.stage.on(Event.MOUSE_DOWN, this, this.onStageMouseDown);
        }
        if (this.onStageMouseUp !== proto.onStageMouseUp) {
            ILaya.stage.on(Event.MOUSE_UP, this, this.onStageMouseUp);
        }
        if (this.onStageClick !== proto.onStageClick) {
            ILaya.stage.on(Event.CLICK, this, this.onStageClick);
        }
        if (this.onStageMouseMove !== proto.onStageMouseMove) {
            ILaya.stage.on(Event.MOUSE_MOVE, this, this.onStageMouseMove);
        }
        if (this.onDoubleClick !== proto.onDoubleClick) {
            this.owner.on(Event.DOUBLE_CLICK, this, this.onDoubleClick);
        }
        if (this.onRightClick !== proto.onRightClick) {
            this.owner.on(Event.RIGHT_CLICK, this, this.onRightClick);
        }
        if (this.onMouseMove !== proto.onMouseMove) {
            this.owner.on(Event.MOUSE_MOVE, this, this.onMouseMove);
        }
        if (this.onMouseOver !== proto.onMouseOver) {
            this.owner.on(Event.MOUSE_OVER, this, this.onMouseOver);
        }
        if (this.onMouseOut !== proto.onMouseOut) {
            this.owner.on(Event.MOUSE_OUT, this, this.onMouseOut);
        }
        if (this.onKeyDown !== proto.onKeyDown) {
            ILaya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
        }
        if (this.onKeyPress !== proto.onKeyPress) {
            ILaya.stage.on(Event.KEY_PRESS, this, this.onKeyPress);
        }
        if (this.onKeyUp !== proto.onKeyUp) {
            ILaya.stage.on(Event.KEY_UP, this, this.onKeyUp);
        }
        if (this.onUpdate !== proto.onUpdate) {
            ILaya.updateTimer.frameLoop(1, this, this.onUpdate);
        }
        if (this.onLateUpdate !== proto.onLateUpdate) {
            ILaya.lateTimer.frameLoop(1, this, this.onLateUpdate);
        }
        if (this.onPreRender !== proto.onPreRender) {
            ILaya.lateTimer.frameLoop(1, this, this.onPreRender);
        }
    }
    _onDisable() {
        this.owner.offAllCaller(this);
        ILaya.stage.offAllCaller(this);
        ILaya.startTimer.clearAll(this);
        ILaya.updateTimer.clearAll(this);
        ILaya.lateTimer.clearAll(this);
    }
    _isScript() {
        return true;
    }
    _onDestroy() {
        this.onDestroy();
    }
    onAwake() {
    }
    onEnable() {
    }
    onStart() {
    }
    onTriggerEnter(other, self, contact) {
    }
    onTriggerStay(other, self, contact) {
    }
    onTriggerExit(other, self, contact) {
    }
    onMouseDown(e) {
    }
    onMouseUp(e) {
    }
    onClick(e) {
    }
    onStageMouseDown(e) {
    }
    onStageMouseUp(e) {
    }
    onStageClick(e) {
    }
    onStageMouseMove(e) {
    }
    onDoubleClick(e) {
    }
    onRightClick(e) {
    }
    onMouseMove(e) {
    }
    onMouseOver(e) {
    }
    onMouseOut(e) {
    }
    onKeyDown(e) {
    }
    onKeyPress(e) {
    }
    onKeyUp(e) {
    }
    onUpdate() {
    }
    onLateUpdate() {
    }
    onPreRender() {
    }
    onPostRender() {
    }
    onDisable() {
    }
    onDestroy() {
    }
}
