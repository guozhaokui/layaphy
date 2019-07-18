import { GradientSize } from "./GradientSize";
import { IClone } from "../../IClone";
export declare class SizeOverLifetime implements IClone {
    private _size;
    enbale: boolean;
    readonly size: GradientSize;
    constructor(size: GradientSize);
    cloneTo(destObject: any): void;
    clone(): any;
}
