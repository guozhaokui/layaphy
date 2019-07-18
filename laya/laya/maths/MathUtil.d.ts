export declare class MathUtil {
    static subtractVector3(l: Float32Array, r: Float32Array, o: Float32Array): void;
    static lerp(left: number, right: number, amount: number): number;
    static scaleVector3(f: Float32Array, b: number, e: Float32Array): void;
    static lerpVector3(l: Float32Array, r: Float32Array, t: number, o: Float32Array): void;
    static lerpVector4(l: Float32Array, r: Float32Array, t: number, o: Float32Array): void;
    static slerpQuaternionArray(a: Float32Array, Offset1: number, b: Float32Array, Offset2: number, t: number, out: Float32Array, Offset3: number): Float32Array;
    static getRotation(x0: number, y0: number, x1: number, y1: number): number;
    static sortBigFirst(a: number, b: number): number;
    static sortSmallFirst(a: number, b: number): number;
    static sortNumBigFirst(a: any, b: any): number;
    static sortNumSmallFirst(a: any, b: any): number;
    static sortByKey(key: string, bigFirst?: boolean, forceNum?: boolean): (a: any, b: any) => number;
}
