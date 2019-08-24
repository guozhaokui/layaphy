import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../IClone";
import { Vector3 } from "../../../math/Vector3";
export declare class GradientVelocity implements IClone {
    static createByConstant(constant: Vector3): GradientVelocity;
    static createByGradient(gradientX: GradientDataNumber, gradientY: GradientDataNumber, gradientZ: GradientDataNumber): GradientVelocity;
    static createByRandomTwoConstant(constantMin: Vector3, constantMax: Vector3): GradientVelocity;
    static createByRandomTwoGradient(gradientXMin: GradientDataNumber, gradientXMax: GradientDataNumber, gradientYMin: GradientDataNumber, gradientYMax: GradientDataNumber, gradientZMin: GradientDataNumber, gradientZMax: GradientDataNumber): GradientVelocity;
    private _type;
    private _constant;
    private _gradientX;
    private _gradientY;
    private _gradientZ;
    private _constantMin;
    private _constantMax;
    private _gradientXMin;
    private _gradientXMax;
    private _gradientYMin;
    private _gradientYMax;
    private _gradientZMin;
    private _gradientZMax;
    readonly type: number;
    readonly constant: Vector3;
    readonly gradientX: GradientDataNumber;
    readonly gradientY: GradientDataNumber;
    readonly gradientZ: GradientDataNumber;
    readonly constantMin: Vector3;
    readonly constantMax: Vector3;
    readonly gradientXMin: GradientDataNumber;
    readonly gradientXMax: GradientDataNumber;
    readonly gradientYMin: GradientDataNumber;
    readonly gradientYMax: GradientDataNumber;
    readonly gradientZMin: GradientDataNumber;
    readonly gradientZMax: GradientDataNumber;
    constructor();
    cloneTo(destObject: any): void;
    clone(): any;
}
