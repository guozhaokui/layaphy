import { Keyframe } from "./Keyframe";
import { Vector3 } from "../math/Vector3";
export class Vector3Keyframe extends Keyframe {
    constructor() {
        super();
        this.inTangent = new Vector3();
        this.outTangent = new Vector3();
        this.value = new Vector3();
    }
    cloneTo(dest) {
        super.cloneTo(dest);
        var destKeyFarme = dest;
        this.inTangent.cloneTo(destKeyFarme.inTangent);
        this.outTangent.cloneTo(destKeyFarme.outTangent);
        this.value.cloneTo(destKeyFarme.value);
    }
}
if (window.conch && window.conchFloatArrayKeyframe) {
    Vector3Keyframe = window.conchFloatArrayKeyframe;
}
