import { Keyframe } from "./Keyframe";
export class FloatKeyframe extends Keyframe {
    constructor() {
        super();
    }
    cloneTo(destObject) {
        super.cloneTo(destObject);
        var destKeyFrame = destObject;
        destKeyFrame.inTangent = this.inTangent;
        destKeyFrame.outTangent = this.outTangent;
        destKeyFrame.value = this.value;
    }
}
