import { Keyframe } from "./Keyframe";
import { Quaternion } from "../math/Quaternion";
import { Vector4 } from "../math/Vector4";
export declare class QuaternionKeyframe extends Keyframe {
    inTangent: Vector4;
    outTangent: Vector4;
    value: Quaternion;
    constructor();
    cloneTo(dest: any): void;
}
