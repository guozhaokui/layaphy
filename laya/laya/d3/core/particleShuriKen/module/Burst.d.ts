import { IClone } from "../../IClone";
export declare class Burst implements IClone {
    private _time;
    private _minCount;
    private _maxCount;
    readonly time: number;
    readonly minCount: number;
    readonly maxCount: number;
    constructor(time: number, minCount: number, maxCount: number);
    cloneTo(destObject: any): void;
    clone(): any;
}
