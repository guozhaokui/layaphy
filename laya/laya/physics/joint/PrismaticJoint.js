import { JointBase } from "./JointBase";
import { Point } from "../../maths/Point";
import { Physics } from "../Physics";
import { RigidBody } from "../RigidBody";
import { ClassUtils } from "../../utils/ClassUtils";
export class PrismaticJoint extends JointBase {
    constructor() {
        super(...arguments);
        this.anchor = [0, 0];
        this.axis = [1, 0];
        this.collideConnected = false;
        this._enableMotor = false;
        this._motorSpeed = 0;
        this._maxMotorForce = 10000;
        this._enableLimit = false;
        this._lowerTranslation = 0;
        this._upperTranslation = 0;
    }
    _createJoint() {
        if (!this._joint) {
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody)
                throw "selfBody can not be empty";
            var box2d = window.box2d;
            var def = PrismaticJoint._temp || (PrismaticJoint._temp = new box2d.b2PrismaticJointDef());
            var anchorPos = this.selfBody.owner.localToGlobal(Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
            var anchorVec = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
            def.Initialize(this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody, this.selfBody.getBody(), anchorVec, new box2d.b2Vec2(this.axis[0], this.axis[1]));
            def.enableMotor = this._enableMotor;
            def.motorSpeed = this._motorSpeed;
            def.maxMotorForce = this._maxMotorForce;
            def.enableLimit = this._enableLimit;
            def.lowerTranslation = this._lowerTranslation / Physics.PIXEL_RATIO;
            def.upperTranslation = this._upperTranslation / Physics.PIXEL_RATIO;
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
    get maxMotorForce() {
        return this._maxMotorForce;
    }
    set maxMotorForce(value) {
        this._maxMotorForce = value;
        if (this._joint)
            this._joint.SetMaxMotorForce(value);
    }
    get enableLimit() {
        return this._enableLimit;
    }
    set enableLimit(value) {
        this._enableLimit = value;
        if (this._joint)
            this._joint.EnableLimit(value);
    }
    get lowerTranslation() {
        return this._lowerTranslation;
    }
    set lowerTranslation(value) {
        this._lowerTranslation = value;
        if (this._joint)
            this._joint.SetLimits(value, this._upperTranslation);
    }
    get upperTranslation() {
        return this._upperTranslation;
    }
    set upperTranslation(value) {
        this._upperTranslation = value;
        if (this._joint)
            this._joint.SetLimits(this._lowerTranslation, value);
    }
}
ClassUtils.regClass("laya.physics.PrismaticJoint", PrismaticJoint);
ClassUtils.regClass("Laya.PrismaticJoint", PrismaticJoint);
