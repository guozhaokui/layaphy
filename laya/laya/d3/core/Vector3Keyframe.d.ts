import { Keyframe } from "./Keyframe";
import { Vector3 } from "../math/Vector3";
export declare class Vector3Keyframe extends Keyframe {
    inTangent: Vector3;
    outTangent: Vector3;
    value: Vector3;
    constructor();
    cloneTo(dest: any): void;
}
