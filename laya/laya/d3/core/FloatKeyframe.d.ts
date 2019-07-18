import { Keyframe } from "./Keyframe";
export declare class FloatKeyframe extends Keyframe {
    inTangent: number;
    outTangent: number;
    value: number;
    constructor();
    cloneTo(destObject: any): void;
}
