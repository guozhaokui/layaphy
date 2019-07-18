import { GradientVelocity } from "./GradientVelocity";
import { IClone } from "../../IClone";
export declare class VelocityOverLifetime implements IClone {
    enbale: boolean;
    space: number;
    readonly velocity: GradientVelocity;
    constructor(velocity: GradientVelocity);
    cloneTo(destObject: any): void;
    clone(): any;
}
