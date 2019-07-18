import { JointBase } from "./JointBase";
import { Physics } from "../Physics";
import { RigidBody } from "../RigidBody";
import { ClassUtils } from "../../utils/ClassUtils";
export class GearJoint extends JointBase {
    constructor() {
        super(...arguments);
        this.collideConnected = false;
        this._ratio = 1;
    }
    _createJoint() {
        if (!this._joint) {
            if (!this.joint1)
                throw "Joint1 can not be empty";
            if (!this.joint2)
                throw "Joint2 can not be empty";
            var box2d = window.box2d;
            var def = GearJoint._temp || (GearJoint._temp = new box2d.b2GearJointDef());
            def.bodyA = this.joint1.owner.getComponent(RigidBody).getBody();
            def.bodyB = this.joint2.owner.getComponent(RigidBody).getBody();
            def.joint1 = this.joint1.joint;
            def.joint2 = this.joint2.joint;
            def.ratio = this._ratio;
            def.collideConnected = this.collideConnected;
            this._joint = Physics.I._createJoint(def);
        }
    }
    get ratio() {
        return this._ratio;
    }
    set ratio(value) {
        this._ratio = value;
        if (this._joint)
            this._joint.SetRatio(value);
    }
}
ClassUtils.regClass("laya.physics.GearJoint", GearJoint);
ClassUtils.regClass("Laya.GearJoint", GearJoint);
