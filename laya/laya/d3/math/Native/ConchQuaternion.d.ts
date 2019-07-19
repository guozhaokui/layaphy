import { ConchVector3 } from "./ConchVector3";
import { IClone } from "../../core/IClone";
import { Matrix3x3 } from "../Matrix3x3";
import { Matrix4x4 } from "../Matrix4x4";
export declare class ConchQuaternion implements IClone {
    static DEFAULT: ConchQuaternion;
    static NAN: ConchQuaternion;
    static createFromYawPitchRoll(yaw: number, pitch: number, roll: number, out: ConchQuaternion): void;
    static multiply(left: ConchQuaternion, right: ConchQuaternion, out: ConchQuaternion): void;
    private static arcTanAngle;
    private static angleTo;
    static createFromAxisAngle(axis: ConchVector3, rad: number, out: ConchQuaternion): void;
    static createFromMatrix3x3(sou: Matrix3x3, out: ConchQuaternion): void;
    static createFromMatrix4x4(mat: Matrix4x4, out: ConchQuaternion): void;
    static slerp(left: ConchQuaternion, right: ConchQuaternion, t: number, out: ConchQuaternion): Float32Array;
    static lerp(left: ConchQuaternion, right: ConchQuaternion, amount: number, out: ConchQuaternion): void;
    static add(left: any, right: ConchQuaternion, out: ConchQuaternion): void;
    static dot(left: any, right: ConchQuaternion): number;
    elements: Float32Array;
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number, nativeElements?: Float32Array);
    scaling(scaling: number, out: ConchQuaternion): void;
    normalize(out: ConchQuaternion): void;
    length(): number;
    rotateX(rad: number, out: ConchQuaternion): void;
    rotateY(rad: number, out: ConchQuaternion): void;
    rotateZ(rad: number, out: ConchQuaternion): void;
    getYawPitchRoll(out: ConchVector3): void;
    invert(out: ConchQuaternion): void;
    identity(): void;
    fromArray(array: any[], offset?: number): void;
    cloneTo(destObject: any): void;
    clone(): any;
    equals(b: ConchQuaternion): boolean;
    static rotationLookAt(forward: ConchVector3, up: ConchVector3, out: ConchQuaternion): void;
    static lookAt(eye: any, target: any, up: any, out: ConchQuaternion): void;
    lengthSquared(): number;
    static invert(value: ConchQuaternion, out: ConchQuaternion): void;
    static rotationMatrix(matrix3x3: Matrix3x3, out: ConchQuaternion): void;
}