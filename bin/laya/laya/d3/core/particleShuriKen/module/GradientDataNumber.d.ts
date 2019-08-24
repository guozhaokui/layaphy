import { IClone } from "../../IClone";
export declare class GradientDataNumber implements IClone {
    private _currentLength;
    readonly gradientCount: number;
    constructor();
    add(key: number, value: number): void;
    getKeyByIndex(index: number): number;
    getValueByIndex(index: number): number;
    getAverageValue(): number;
    cloneTo(destObject: any): void;
    clone(): any;
}
