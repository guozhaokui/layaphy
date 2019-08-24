import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../IClone";
import { Vector3 } from "../../../math/Vector3";
export declare class GradientAngularVelocity implements IClone {
    static createByConstant(constant: number): GradientAngularVelocity;
    static createByConstantSeparate(separateConstant: Vector3): GradientAngularVelocity;
    static createByGradient(gradient: GradientDataNumber): GradientAngularVelocity;
    static createByGradientSeparate(gradientX: GradientDataNumber, gradientY: GradientDataNumber, gradientZ: GradientDataNumber): GradientAngularVelocity;
    static createByRandomTwoConstant(constantMin: number, constantMax: number): GradientAngularVelocity;
    static createByRandomTwoConstantSeparate(separateConstantMin: Vector3, separateConstantMax: Vector3): GradientAngularVelocity;
    static createByRandomTwoGradient(gradientMin: GradientDataNumber, gradientMax: GradientDataNumber): GradientAngularVelocity;
    static createByRandomTwoGradientSeparate(gradientXMin: GradientDataNumber, gradientXMax: GradientDataNumber, gradientYMin: GradientDataNumber, gradientYMax: GradientDataNumber, gradientZMin: GradientDataNumber, gradientZMax: GradientDataNumber, gradientWMin: GradientDataNumber, gradientWMax: GradientDataNumber): GradientAngularVelocity;
    private _type;
    private _separateAxes;
    private _constant;
    private _constantSeparate;
    private _gradient;
    private _gradientX;
    private _gradientY;
    private _gradientZ;
    private _gradientW;
    private _constantMin;
    private _constantMax;
    private _constantMinSeparate;
    private _constantMaxSeparate;
    private _gradientMin;
    private _gradientMax;
    private _gradientXMin;
    private _gradientXMax;
    private _gradientYMin;
    private _gradientYMax;
    private _gradientZMin;
    private _gradientZMax;
    private _gradientWMin;
    private _gradientWMax;
    readonly type: number;
    readonly separateAxes: boolean;
    readonly constant: number;
    readonly constantSeparate: Vector3;
    readonly gradient: GradientDataNumber;
    readonly gradientX: GradientDataNumber;
    readonly gradientY: GradientDataNumber;
    readonly gradientZ: GradientDataNumber;
    readonly gradientW: GradientDataNumber;
    readonly constantMin: number;
    readonly constantMax: number;
    readonly constantMinSeparate: Vector3;
    readonly constantMaxSeparate: Vector3;
    readonly gradientMin: GradientDataNumber;
    readonly gradientMax: GradientDataNumber;
    readonly gradientXMin: GradientDataNumber;
    readonly gradientXMax: GradientDataNumber;
    readonly gradientYMin: GradientDataNumber;
    readonly gradientYMax: GradientDataNumber;
    readonly gradientZMin: GradientDataNumber;
    readonly gradientZMax: GradientDataNumber;
    readonly gradientWMin: GradientDataNumber;
    readonly gradientWMax: GradientDataNumber;
    constructor();
    cloneTo(destObject: any): void;
    clone(): any;
}
