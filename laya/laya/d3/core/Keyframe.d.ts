import { IClone } from "./IClone";
export declare class Keyframe implements IClone {
    time: number;
    constructor();
    cloneTo(destObject: any): void;
    clone(): any;
}
