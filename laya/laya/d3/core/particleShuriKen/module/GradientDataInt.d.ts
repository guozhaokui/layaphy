import { IClone } from "../../IClone";
export declare class GradientDataInt implements IClone {
    private _currentLength;
    readonly gradientCount: number;
    constructor();
    add(key: number, value: number): void;
    cloneTo(destObject: any): void;
    clone(): any;
}
