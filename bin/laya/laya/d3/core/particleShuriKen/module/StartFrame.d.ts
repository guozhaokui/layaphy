import { IClone } from "../../IClone";
export declare class StartFrame implements IClone {
    static createByConstant(constant: number): StartFrame;
    static createByRandomTwoConstant(constantMin: number, constantMax: number): StartFrame;
    private _type;
    private _constant;
    private _constantMin;
    private _constantMax;
    readonly type: number;
    readonly constant: number;
    readonly constantMin: number;
    readonly constantMax: number;
    constructor();
    cloneTo(destObject: any): void;
    clone(): any;
}
