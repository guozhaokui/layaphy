import { Component } from "../../components/Component";
import { Physics } from "../Physics";
import { ClassUtils } from "../../utils/ClassUtils";
export class JointBase extends Component {
    get joint() {
        if (!this._joint)
            this._createJoint();
        return this._joint;
    }
    _onEnable() {
        this._createJoint();
    }
    _onAwake() {
        this._createJoint();
    }
    _createJoint() {
    }
    _onDisable() {
        if (this._joint) {
            Physics.I._removeJoint(this._joint);
            this._joint = null;
        }
    }
}
ClassUtils.regClass("laya.physics.JointBase", JointBase);
ClassUtils.regClass("Laya.JointBase", JointBase);
