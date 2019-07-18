import { Vector3 } from "./Vector3";
import { Vector2 } from "./Vector2";
import { Matrix4x4 } from "./Matrix4x4";
import { IClone } from "../core/IClone";
export declare class Matrix3x3 implements IClone {
    static DEFAULT: Matrix3x3;
    static createFromTranslation(trans: Vector2, out: Matrix3x3): void;
    static createFromRotation(rad: number, out: Matrix3x3): void;
    static createFromScaling(scale: Vector2, out: Matrix3x3): void;
    static createFromMatrix4x4(sou: Matrix4x4, out: Matrix3x3): void;
    static multiply(left: Matrix3x3, right: Matrix3x3, out: Matrix3x3): void;
    elements: Float32Array;
    constructor();
    determinant(): number;
    translate(trans: Vector2, out: Matrix3x3): void;
    rotate(rad: number, out: Matrix3x3): void;
    scale(scale: Vector2, out: Matrix3x3): void;
    invert(out: Matrix3x3): void;
    transpose(out: Matrix3x3): void;
    identity(): void;
    cloneTo(destObject: any): void;
    clone(): any;
    static lookAt(eye: Vector3, target: Vector3, up: Vector3, out: Matrix3x3): void;
}
