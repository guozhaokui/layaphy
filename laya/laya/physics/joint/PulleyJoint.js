import { JointBase } from "./JointBase";
import { Point } from "../../maths/Point";
import { Physics } from "../Physics";
import { RigidBody } from "../RigidBody";
import { ClassUtils } from "../../utils/ClassUtils";
export class PulleyJoint extends JointBase {
    constructor() {
        super(...arguments);
        this.selfAnchor = [0, 0];
        this.otherAnchor = [0, 0];
        this.selfGroundPoint = [0, 0];
        this.otherGroundPoint = [0, 0];
        this.ratio = 1.5;
        this.collideConnected = false;
    }
    _createJoint() {
        if (!this._joint) {
            if (!this.otherBody)
                throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody)
                throw "selfBody can not be empty";
            var box2d = window.box2d;
            var def = PulleyJoint._temp || (PulleyJoint._temp = new box2d.b2PulleyJointDef());
            var posA = this.otherBody.owner.localToGlobal(Point.TEMP.setTo(this.otherAnchor[0], this.otherAnchor[1]), false, Physics.I.worldRoot);
            var anchorVecA = new box2d.b2Vec2(posA.x / Physics.PIXEL_RATIO, posA.y / Physics.PIXEL_RATIO);
            var posB = this.selfBody.owner.localToGlobal(Point.TEMP.setTo(this.selfAnchor[0], this.selfAnchor[1]), false, Physics.I.worldRoot);
            var anchorVecB = new box2d.b2Vec2(posB.x / Physics.PIXEL_RATIO, posB.y / Physics.PIXEL_RATIO);
            var groundA = this.otherBody.owner.localToGlobal(Point.TEMP.setTo(this.otherGroundPoint[0], this.otherGroundPoint[1]), false, Physics.I.worldRoot);
            var groundVecA = new box2d.b2Vec2(groundA.x / Physics.PIXEL_RATIO, groundA.y / Physics.PIXEL_RATIO);
            var groundB = this.selfBody.owner.localToGlobal(Point.TEMP.setTo(this.selfGroundPoint[0], this.selfGroundPoint[1]), false, Physics.I.worldRoot);
            var groundVecB = new box2d.b2Vec2(groundB.x / Physics.PIXEL_RATIO, groundB.y / Physics.PIXEL_RATIO);
            def.Initialize(this.otherBody.getBody(), this.selfBody.getBody(), groundVecA, groundVecB, anchorVecA, anchorVecB, this.ratio);
            def.collideConnected = this.collideConnected;
            this._joint = Physics.I._createJoint(def);
        }
    }
}
ClassUtils.regClass("laya.physics.PulleyJoint", PulleyJoint);
ClassUtils.regClass("Laya.PulleyJoint", PulleyJoint);
