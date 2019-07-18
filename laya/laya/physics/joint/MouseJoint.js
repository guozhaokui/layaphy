import { JointBase } from "./JointBase";
import { Laya } from "../../../Laya";
import { Event } from "../../events/Event";
import { Point } from "../../maths/Point";
import { Physics } from "../Physics";
import { RigidBody } from "../RigidBody";
import { ClassUtils } from "../../utils/ClassUtils";
export class MouseJoint extends JointBase {
    constructor() {
        super(...arguments);
        this._maxForce = 10000;
        this._frequency = 5;
        this._damping = 0.7;
    }
    _onEnable() {
        this.owner.on(Event.MOUSE_DOWN, this, this.onMouseDown);
    }
    _onAwake() {
    }
    onMouseDown() {
        this._createJoint();
        Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
        Laya.stage.once(Event.MOUSE_UP, this, this.onStageMouseUp);
    }
    _createJoint() {
        if (!this._joint) {
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody)
                throw "selfBody can not be empty";
            var box2d = window.box2d;
            var def = MouseJoint._temp || (MouseJoint._temp = new box2d.b2MouseJointDef());
            if (this.anchor) {
                var anchorPos = this.selfBody.owner.localToGlobal(Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
            }
            else {
                anchorPos = Physics.I.worldRoot.globalToLocal(Point.TEMP.setTo(Laya.stage.mouseX, Laya.stage.mouseY));
            }
            var anchorVec = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
            def.bodyA = Physics.I._emptyBody;
            def.bodyB = this.selfBody.getBody();
            def.target = anchorVec;
            def.frequencyHz = this._frequency;
            def.damping = this._damping;
            def.maxForce = this._maxForce;
            this._joint = Physics.I._createJoint(def);
        }
    }
    onStageMouseUp() {
        Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
        super._onDisable();
    }
    onMouseMove() {
        this._joint.SetTarget(new window.box2d.b2Vec2(Physics.I.worldRoot.mouseX / Physics.PIXEL_RATIO, Physics.I.worldRoot.mouseY / Physics.PIXEL_RATIO));
    }
    _onDisable() {
        this.owner.off(Event.MOUSE_DOWN, this, this.onMouseDown);
        super._onDisable();
    }
    get maxForce() {
        return this._maxForce;
    }
    set maxForce(value) {
        this._maxForce = value;
        if (this._joint)
            this._joint.SetMaxForce(value);
    }
    get frequency() {
        return this._frequency;
    }
    set frequency(value) {
        this._frequency = value;
        if (this._joint)
            this._joint.SetFrequency(value);
    }
    get damping() {
        return this._damping;
    }
    set damping(value) {
        this._damping = value;
        if (this._joint)
            this._joint.SetDampingRatio(value);
    }
}
ClassUtils.regClass("laya.physics.MouseJoint", MouseJoint);
ClassUtils.regClass("Laya.MouseJoint", MouseJoint);
