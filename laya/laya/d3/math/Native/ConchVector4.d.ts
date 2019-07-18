import { IClone } from "../../core/IClone";
export declare class ConchVector4 implements IClone {
    static ZERO: ConchVector4;
    static ONE: ConchVector4;
    static UnitX: ConchVector4;
    static UnitY: ConchVector4;
    static UnitZ: ConchVector4;
    static UnitW: ConchVector4;
    elements: Float32Array;
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    fromArray(array: any[], offset?: number): void;
    cloneTo(destObject: any): void;
    clone(): any;
    static lerp(a: ConchVector4, b: ConchVector4, t: number, out: ConchVector4): void;
    static transformByM4x4(vector4: ConchVector4, m4x4: any, out: ConchVector4): void;
    static equals(a: ConchVector4, b: ConchVector4): boolean;
    length(): number;
    lengthSquared(): number;
    static normalize(s: ConchVector4, out: ConchVector4): void;
    static add(a: ConchVector4, b: ConchVector4, out: ConchVector4): void;
    static subtract(a: ConchVector4, b: ConchVector4, out: ConchVector4): void;
    static multiply(a: ConchVector4, b: ConchVector4, out: ConchVector4): void;
    static scale(a: ConchVector4, b: number, out: ConchVector4): void;
    static Clamp(value: ConchVector4, min: ConchVector4, max: ConchVector4, out: ConchVector4): void;
    static distanceSquared(value1: ConchVector4, value2: ConchVector4): number;
    static distance(value1: ConchVector4, value2: ConchVector4): number;
    static dot(a: ConchVector4, b: ConchVector4): number;
    static min(a: ConchVector4, b: ConchVector4, out: ConchVector4): void;
    static max(a: ConchVector4, b: ConchVector4, out: ConchVector4): void;
}
