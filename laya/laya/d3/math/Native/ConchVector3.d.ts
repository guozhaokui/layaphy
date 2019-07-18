import { ConchVector4 } from "./ConchVector4";
import { ConchQuaternion } from "./ConchQuaternion";
import { IClone } from "../../core/IClone";
export declare class ConchVector3 implements IClone {
    static ZERO: ConchVector3;
    static ONE: ConchVector3;
    static NegativeUnitX: ConchVector3;
    static UnitX: ConchVector3;
    static UnitY: ConchVector3;
    static UnitZ: ConchVector3;
    static ForwardRH: ConchVector3;
    static ForwardLH: ConchVector3;
    static Up: ConchVector3;
    static NAN: ConchVector3;
    elements: Float32Array;
    static distanceSquared(value1: ConchVector3, value2: ConchVector3): number;
    static distance(value1: ConchVector3, value2: ConchVector3): number;
    static min(a: ConchVector3, b: ConchVector3, out: ConchVector3): void;
    static max(a: ConchVector3, b: ConchVector3, out: ConchVector3): void;
    static transformQuat(source: ConchVector3, rotation: ConchQuaternion, out: ConchVector3): void;
    static scalarLength(a: ConchVector3): number;
    static scalarLengthSquared(a: ConchVector3): number;
    static normalize(s: ConchVector3, out: ConchVector3): void;
    static multiply(a: ConchVector3, b: ConchVector3, out: ConchVector3): void;
    static scale(a: ConchVector3, b: number, out: ConchVector3): void;
    static lerp(a: ConchVector3, b: ConchVector3, t: number, out: ConchVector3): void;
    static transformV3ToV3(vector: ConchVector3, transform: any, result: ConchVector3): void;
    static transformV3ToV4(vector: ConchVector3, transform: any, result: ConchVector4): void;
    static TransformNormal(normal: ConchVector3, transform: any, result: ConchVector3): void;
    static transformCoordinate(coordinate: ConchVector3, transform: any, result: ConchVector3): void;
    static Clamp(value: ConchVector3, min: ConchVector3, max: ConchVector3, out: ConchVector3): void;
    static add(a: ConchVector3, b: ConchVector3, out: ConchVector3): void;
    static subtract(a: ConchVector3, b: ConchVector3, o: ConchVector3): void;
    static cross(a: ConchVector3, b: ConchVector3, o: ConchVector3): void;
    static dot(a: ConchVector3, b: ConchVector3): number;
    static equals(a: ConchVector3, b: ConchVector3): boolean;
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number, nativeElements?: Float32Array);
    setValue(x: number, y: number, z: number): void;
    fromArray(array: any[], offset?: number): void;
    cloneTo(destObject: any): void;
    clone(): any;
    toDefault(): void;
}
