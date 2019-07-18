import { Keyframe } from "./Keyframe";
import { Quaternion } from "../math/Quaternion";
import { Vector4 } from "../math/Vector4";
export class QuaternionKeyframe extends Keyframe {
    constructor() {
        super();
        this.inTangent = new Vector4();
        this.outTangent = new Vector4();
        this.value = new Quaternion();
    }
    cloneTo(dest) {
        super.cloneTo(dest);
        var destKeyFarme = dest;
        this.inTangent.cloneTo(destKeyFarme.inTangent);
        this.outTangent.cloneTo(destKeyFarme.outTangent);
        this.value.cloneTo(destKeyFarme.value);
    }
}
