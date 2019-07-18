import { GradientAngularVelocity } from "./GradientAngularVelocity";
import { IClone } from "../../IClone";
export declare class RotationOverLifetime implements IClone {
    private _angularVelocity;
    enbale: boolean;
    readonly angularVelocity: GradientAngularVelocity;
    constructor(angularVelocity: GradientAngularVelocity);
    cloneTo(destObject: any): void;
    clone(): any;
}
