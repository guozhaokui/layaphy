import { Gradient } from "../../Gradient";
import { IClone } from "../../IClone";
import { Vector4 } from "../../../math/Vector4";
export declare class GradientColor implements IClone {
    static createByConstant(constant: Vector4): GradientColor;
    static createByGradient(gradient: Gradient): GradientColor;
    static createByRandomTwoConstant(minConstant: Vector4, maxConstant: Vector4): GradientColor;
    static createByRandomTwoGradient(minGradient: Gradient, maxGradient: Gradient): GradientColor;
    private _type;
    private _constant;
    private _constantMin;
    private _constantMax;
    private _gradient;
    private _gradientMin;
    private _gradientMax;
    readonly type: number;
    readonly constant: Vector4;
    readonly constantMin: Vector4;
    readonly constantMax: Vector4;
    readonly gradient: Gradient;
    readonly gradientMin: Gradient;
    readonly gradientMax: Gradient;
    constructor();
    cloneTo(destObject: any): void;
    clone(): any;
}
