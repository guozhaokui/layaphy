import { Component } from "../../../components/Component";
import { Physics3D } from "../Physics3D";
export class ConstraintComponent extends Component {
    constructor() {
        super();
        this._feedbackEnabled = false;
    }
    get enabled() {
        return super.enabled;
    }
    set enabled(value) {
        this._nativeConstraint.IsEnabled = value;
        super.enabled = value;
    }
    get breakingImpulseThreshold() {
        return this._breakingImpulseThreshold;
    }
    set breakingImpulseThreshold(value) {
        this._nativeConstraint.BreakingImpulseThreshold = value;
        this._breakingImpulseThreshold = value;
    }
    get appliedImpulse() {
        if (!this._feedbackEnabled) {
            this._nativeConstraint.EnableFeedback(true);
            this._feedbackEnabled = true;
        }
        return this._nativeConstraint.AppliedImpulse;
    }
    get connectedBody() {
        return this._connectedBody;
    }
    set connectedBody(value) {
        this._connectedBody = value;
    }
    _onDestroy() {
        var physics3D = Physics3D._physics3D;
        physics3D.destroy(this._nativeConstraint);
        this._nativeConstraint = null;
    }
}
