import { JointBase } from "./JointBase";
import { Physics } from "../Physics";
import { RigidBody } from "../RigidBody";
import { ClassUtils } from "../../utils/ClassUtils";
export class DistanceJoint extends JointBase {
    constructor() {
        super(...arguments);
        this.selfAnchor = [0, 0];
        this.otherAnchor = [0, 0];
        this.collideConnected = false;
        this._length = 0;
        this._frequency = 0;
        this._damping = 0;
    }
    _createJoint() {
        if (!this._joint) {
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody)
                throw "selfBody can not be empty";
            var box2d = window.box2d;
            var def = DistanceJoint._temp || (DistanceJoint._temp = new box2d.b2DistanceJointDef());
            def.bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
            def.bodyB = this.selfBody.getBody();
            def.localAnchorA.Set(this.otherAnchor[0] / Physics.PIXEL_RATIO, this.otherAnchor[1] / Physics.PIXEL_RATIO);
            def.localAnchorB.Set(this.selfAnchor[0] / Physics.PIXEL_RATIO, this.selfAnchor[1] / Physics.PIXEL_RATIO);
            def.frequencyHz = this._frequency;
            def.dampingRatio = this._damping;
            def.collideConnected = this.collideConnected;
            var p1 = def.bodyA.GetWorldPoint(def.localAnchorA, new box2d.b2Vec2());
            var p2 = def.bodyB.GetWorldPoint(def.localAnchorB, new box2d.b2Vec2());
            def.length = this._length / Physics.PIXEL_RATIO || box2d.b2Vec2.SubVV(p2, p1, new box2d.b2Vec2()).Length();
            this._joint = Physics.I._createJoint(def);
        }
    }
    get length() {
        return this._length;
    }
    set length(value) {
        this._length = value;
        if (this._joint)
            this._joint.SetLength(value / Physics.PIXEL_RATIO);
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
ClassUtils.regClass("laya.physics.DistanceJoint", DistanceJoint);
ClassUtils.regClass("Laya.DistanceJoint", DistanceJoint);
