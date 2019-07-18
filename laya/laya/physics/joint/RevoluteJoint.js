import { JointBase } from "./JointBase";
import { Point } from "../../maths/Point";
import { Physics } from "../Physics";
import { RigidBody } from "../RigidBody";
import { ClassUtils } from "../../utils/ClassUtils";
export class RevoluteJoint extends JointBase {
    constructor() {
        super(...arguments);
        this.anchor = [0, 0];
        this.collideConnected = false;
        this._enableMotor = false;
        this._motorSpeed = 0;
        this._maxMotorTorque = 10000;
        this._enableLimit = false;
        this._lowerAngle = 0;
        this._upperAngle = 0;
    }
    _createJoint() {
        if (!this._joint) {
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody)
                throw "selfBody can not be empty";
            var box2d = window.box2d;
            var def = RevoluteJoint._temp || (RevoluteJoint._temp = new box2d.b2RevoluteJointDef());
            var anchorPos = this.selfBody.owner.localToGlobal(Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
            var anchorVec = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
            def.Initialize(this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody, this.selfBody.getBody(), anchorVec);
            def.enableMotor = this._enableMotor;
            def.motorSpeed = this._motorSpeed;
            def.maxMotorTorque = this._maxMotorTorque;
            def.enableLimit = this._enableLimit;
            def.lowerAngle = this._lowerAngle;
            def.upperAngle = this._upperAngle;
            def.collideConnected = this.collideConnected;
            this._joint = Physics.I._createJoint(def);
        }
    }
    get enableMotor() {
        return this._enableMotor;
    }
    set enableMotor(value) {
        this._enableMotor = value;
        if (this._joint)
            this._joint.EnableMotor(value);
    }
    get motorSpeed() {
        return this._motorSpeed;
    }
    set motorSpeed(value) {
        this._motorSpeed = value;
        if (this._joint)
            this._joint.SetMotorSpeed(value);
    }
    get maxMotorTorque() {
        return this._maxMotorTorque;
    }
    set maxMotorTorque(value) {
        this._maxMotorTorque = value;
        if (this._joint)
            this._joint.SetMaxMotorTorque(value);
    }
    get enableLimit() {
        return this._enableLimit;
    }
    set enableLimit(value) {
        this._enableLimit = value;
        if (this._joint)
            this._joint.EnableLimit(value);
    }
    get lowerAngle() {
        return this._lowerAngle;
    }
    set lowerAngle(value) {
        this._lowerAngle = value;
        if (this._joint)
            this._joint.SetLimits(value, this._upperAngle);
    }
    get upperAngle() {
        return this._upperAngle;
    }
    set upperAngle(value) {
        this._upperAngle = value;
        if (this._joint)
            this._joint.SetLimits(this._lowerAngle, value);
    }
}
ClassUtils.regClass("laya.physics.RevoluteJoint", RevoluteJoint);
ClassUtils.regClass("Laya.RevoluteJoint", RevoluteJoint);
