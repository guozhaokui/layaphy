import { IClone } from "../core/IClone";
export declare class Vector2 implements IClone {
    static ZERO: Vector2;
    static ONE: Vector2;
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    setValue(x: number, y: number): void;
    static scale(a: Vector2, b: number, out: Vector2): void;
    fromArray(array: any[], offset?: number): void;
    cloneTo(destObject: any): void;
    static dot(a: Vector2, b: Vector2): number;
    static normalize(s: Vector2, out: Vector2): void;
    static scalarLength(a: Vector2): number;
    clone(): any;
    forNativeElement(nativeElements?: Float32Array): void;
    static rewriteNumProperty(proto: any, name: string, index: number): void;
}
