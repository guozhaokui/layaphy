import { GradientDataInt } from "./GradientDataInt";
import { IClone } from "../../IClone";
export declare class FrameOverTime implements IClone {
    static createByConstant(constant: number): FrameOverTime;
    static createByOverTime(overTime: GradientDataInt): FrameOverTime;
    static createByRandomTwoConstant(constantMin: number, constantMax: number): FrameOverTime;
    static createByRandomTwoOverTime(gradientFrameMin: GradientDataInt, gradientFrameMax: GradientDataInt): FrameOverTime;
    private _type;
    private _constant;
    private _overTime;
    private _constantMin;
    private _constantMax;
    private _overTimeMin;
    private _overTimeMax;
    readonly type: number;
    readonly constant: number;
    readonly frameOverTimeData: GradientDataInt;
    readonly constantMin: number;
    readonly constantMax: number;
    readonly frameOverTimeDataMin: GradientDataInt;
    readonly frameOverTimeDataMax: GradientDataInt;
    constructor();
    cloneTo(destObject: any): void;
    clone(): any;
}
