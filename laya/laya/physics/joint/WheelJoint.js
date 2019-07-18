import { JointBase } from "./JointBase";
import { Point } from "../../maths/Point";
import { Physics } from "../Physics";
import { RigidBody } from "../RigidBody";
import { ClassUtils } from "../../utils/ClassUtils";
export class WheelJoint extends JointBase {
    constructor() {
        super(...arguments);
        this.anchor = [0, 0];
        this.collideConnected = false;
        this.axis = [1, 0];
        this._frequency = 5;
        this._damping = 0.7;
        this._enableMotor = false;
        this._motorSpeed = 0;
        this._maxMotorTorque = 10000;
    }
    _createJoint() {
        if (!this._joint) {
            if (!this.otherBody)
                throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody)
                throw "selfBody can not be empty";
            var box2d = window.box2d;
            var def = WheelJoint._temp || (WheelJoint._temp = new box2d.b2WheelJointDef());
            var anchorPos = this.selfBody.owner.localToGlobal(Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
            var anchorVec = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
            def.Initialize(this.otherBody.getBody(), this.selfBody.getBody(), anchorVec, new box2d.b2Vec2(this.axis[0], this.axis[1]));
            def.enableMotor = this._enableMotor;
            def.motorSpeed = this._motorSpeed;
            def.maxMotorTorque = this._maxMotorTorque;
            def.frequencyHz = this._frequency;
            def.dampingRatio = this._damping;
            def.collideConnected = this.collideConnected;
            this._joint = Physics.I._createJoint(def);
        }
    }
    get frequency() {
        return this._frequency;
    }
    set frequency(value) {
        this._frequency = value;
        if (this._joint)
            this._joint.SetSpringFrequencyHz(value);
    }
    get damping() {
        return this._damping;
    }
    set damping(value) {
        this._damping = value;
        if (this._joint)
            this._joint.SetSpringDampingRatio(value);
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
}
ClassUtils.regClass("laya.physics.WheelJoint", WheelJoint);
ClassUtils.regClass("Laya.WheelJoint", WheelJoint);
