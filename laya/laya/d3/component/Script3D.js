import { Component } from "../../components/Component";
import { Event } from "../../events/Event";
import { Laya } from "../../../Laya";
export class Script3D extends Component {
    constructor() {
        super(...arguments);
        this._indexInPool = -1;
    }
    get isSingleton() {
        return false;
    }
    _checkProcessTriggers() {
        var prototype = Script3D.prototype;
        if (this.onTriggerEnter !== prototype.onTriggerEnter)
            return true;
        if (this.onTriggerStay !== prototype.onTriggerStay)
            return true;
        if (this.onTriggerExit !== prototype.onTriggerExit)
            return true;
        return false;
    }
    _checkProcessCollisions() {
        var prototype = Script3D.prototype;
        if (this.onCollisionEnter !== prototype.onCollisionEnter)
            return true;
        if (this.onCollisionStay !== prototype.onCollisionStay)
            return true;
        if (this.onCollisionExit !== prototype.onCollisionExit)
            return true;
        return false;
    }
    _onAwake() {
        this.onAwake();
        if (this.onStart !== Script3D.prototype.onStart)
            Laya.startTimer.callLater(this, this.onStart);
    }
    _onEnable() {
        this.owner._scene._addScript(this);
        var proto = Script3D.prototype;
        if (this.onKeyDown !== proto.onKeyDown) {
            Laya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
        }
        if (this.onKeyPress !== proto.onKeyPress) {
            Laya.stage.on(Event.KEY_PRESS, this, this.onKeyUp);
        }
        if (this.onKeyUp !== proto.onKeyUp) {
            Laya.stage.on(Event.KEY_UP, this, this.onKeyUp);
        }
    }
    _onDisable() {
        this.owner._scene._removeScript(this);
        this.owner.offAllCaller(this);
        Laya.stage.offAllCaller(this);
    }
    _isScript() {
        return true;
    }
    _onAdded() {
        var sprite = this.owner;
        var scripts = sprite._scripts;
        scripts || (sprite._scripts = scripts = []);
        scripts.push(this);
        if (!sprite._needProcessCollisions)
            sprite._needProcessCollisions = this._checkProcessCollisions();
        if (!sprite._needProcessTriggers)
            sprite._needProcessTriggers = this._checkProcessTriggers();
    }
    _onDestroy() {
        var scripts = this.owner._scripts;
        scripts.splice(scripts.indexOf(this), 1);
        var sprite = this.owner;
        sprite._needProcessTriggers = false;
        for (var i = 0, n = scripts.length; i < n; i++) {
            if (scripts[i]._checkProcessTriggers()) {
                sprite._needProcessTriggers = true;
                break;
            }
        }
        sprite._needProcessCollisions = false;
        for (i = 0, n = scripts.length; i < n; i++) {
            if (scripts[i]._checkProcessCollisions()) {
                sprite._needProcessCollisions = true;
                break;
            }
        }
        this.onDestroy();
    }
    onAwake() {
    }
    onEnable() {
    }
    onStart() {
    }
    onTriggerEnter(other) {
    }
    onTriggerStay(other) {
    }
    onTriggerExit(other) {
    }
    onCollisionEnter(collision) {
    }
    onCollisionStay(collision) {
    }
    onCollisionExit(collision) {
    }
    onMouseDown() {
    }
    onMouseDrag() {
    }
    onMouseClick() {
    }
    onMouseUp() {
    }
    onMouseEnter() {
    }
    onMouseOver() {
    }
    onMouseOut() {
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
