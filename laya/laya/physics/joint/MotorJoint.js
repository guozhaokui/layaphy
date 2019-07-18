import { JointBase } from "./JointBase";
import { Physics } from "../Physics";
import { RigidBody } from "../RigidBody";
import { ClassUtils } from "../../utils/ClassUtils";
export class MotorJoint extends JointBase {
    constructor() {
        super(...arguments);
        this.collideConnected = false;
        this._linearOffset = [0, 0];
        this._angularOffset = 0;
        this._maxForce = 1000;
        this._maxTorque = 1000;
        this._correctionFactor = 0.3;
    }
    _createJoint() {
        if (!this._joint) {
            if (!this.otherBody)
                throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody)
                throw "selfBody can not be empty";
            var box2d = window.box2d;
            var def = MotorJoint._temp || (MotorJoint._temp = new box2d.b2MotorJointDef());
            def.Initialize(this.otherBody.getBody(), this.selfBody.getBody());
            def.linearOffset = new box2d.b2Vec2(this._linearOffset[0] / Physics.PIXEL_RATIO, this._linearOffset[1] / Physics.PIXEL_RATIO);
            def.angularOffset = this._angularOffset;
            def.maxForce = this._maxForce;
            def.maxTorque = this._maxTorque;
            def.correctionFactor = this._correctionFactor;
            def.collideConnected = this.collideConnected;
            this._joint = Physics.I._createJoint(def);
        }
    }
    get linearOffset() {
        return this._linearOffset;
    }
    set linearOffset(value) {
        this._linearOffset = value;
        if (this._joint)
            this._joint.SetLinearOffset(new window.box2d.b2Vec2(value[0] / Physics.PIXEL_RATIO, value[1] / Physics.PIXEL_RATIO));
    }
    get angularOffset() {
        return this._angularOffset;
    }
    set angularOffset(value) {
        this._angularOffset = value;
        if (this._joint)
            this._joint.SetAngularOffset(value);
    }
    get maxForce() {
        return this._maxForce;
    }
    set maxForce(value) {
        this._maxForce = value;
        if (this._joint)
            this._joint.SetMaxForce(value);
    }
    get maxTorque() {
        return this._maxTorque;
    }
    set maxTorque(value) {
        this._maxTorque = value;
        if (this._joint)
            this._joint.SetMaxTorque(value);
    }
    get correctionFactor() {
        return this._correctionFactor;
    }
    set correctionFactor(value) {
        this._correctionFactor = value;
        if (this._joint)
            this._joint.SetCorrectionFactor(value);
    }
}
ClassUtils.regClass("laya.physics.MotorJoint", MotorJoint);
ClassUtils.regClass("Laya.MotorJoint", MotorJoint);
