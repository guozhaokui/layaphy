import { JointBase } from "./JointBase";
import { Physics } from "../Physics";
import { RigidBody } from "../RigidBody";
import { ClassUtils } from "../../utils/ClassUtils";
export class RopeJoint extends JointBase {
    constructor() {
        super(...arguments);
        this.selfAnchor = [0, 0];
        this.otherAnchor = [0, 0];
        this.collideConnected = false;
        this._maxLength = 1;
    }
    _createJoint() {
        if (!this._joint) {
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody)
                throw "selfBody can not be empty";
            var box2d = window.box2d;
            var def = RopeJoint._temp || (RopeJoint._temp = new box2d.b2RopeJointDef());
            def.bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
            def.bodyB = this.selfBody.getBody();
            def.localAnchorA.Set(this.otherAnchor[0] / Physics.PIXEL_RATIO, this.otherAnchor[1] / Physics.PIXEL_RATIO);
            def.localAnchorB.Set(this.selfAnchor[0] / Physics.PIXEL_RATIO, this.selfAnchor[1] / Physics.PIXEL_RATIO);
            def.maxLength = this._maxLength / Physics.PIXEL_RATIO;
            def.collideConnected = this.collideConnected;
            this._joint = Physics.I._createJoint(def);
        }
    }
    get maxLength() {
        return this._maxLength;
    }
    set maxLength(value) {
        this._maxLength = value;
        if (this._joint)
            this._joint.SetMaxLength(value / Physics.PIXEL_RATIO);
    }
}
ClassUtils.regClass("laya.physics.RopeJoint", RopeJoint);
ClassUtils.regClass("Laya.RopeJoint", RopeJoint);
