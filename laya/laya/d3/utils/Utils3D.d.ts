import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
export declare class Utils3D {
    private static _tempVector3_0;
    private static _tempVector3_1;
    private static _tempVector3_2;
    private static _tempColor0;
    private static _tempArray16_0;
    private static _tempArray16_1;
    private static _tempArray16_2;
    private static _tempArray16_3;
    private static _rotationTransformScaleSkinAnimation;
    static transformVector3ArrayByQuat(sourceArray: Float32Array, sourceOffset: number, rotation: Quaternion, outArray: Float32Array, outOffset: number): void;
    static mulMatrixByArray(leftArray: Float32Array, leftOffset: number, rightArray: Float32Array, rightOffset: number, outArray: Float32Array, outOffset: number): void;
    static mulMatrixByArrayFast(leftArray: Float32Array, leftOffset: number, rightArray: Float32Array, rightOffset: number, outArray: Float32Array, outOffset: number): void;
    static mulMatrixByArrayAndMatrixFast(leftArray: Float32Array, leftOffset: number, rightMatrix: Matrix4x4, outArray: Float32Array, outOffset: number): void;
    static createAffineTransformationArray(tX: number, tY: number, tZ: number, rX: number, rY: number, rZ: number, rW: number, sX: number, sY: number, sZ: number, outArray: Float32Array, outOffset: number): void;
    static transformVector3ArrayToVector3ArrayCoordinate(source: Float32Array, sourceOffset: number, transform: Matrix4x4, result: Float32Array, resultOffset: number): void;
    static getURLVerion(url: string): string;
    private static arcTanAngle;
    private static angleTo;
    static transformQuat(source: Vector3, rotation: Float32Array, out: Vector3): void;
    static quaternionWeight(f: Quaternion, weight: number, e: Quaternion): void;
    static matrix4x4MultiplyFFF(a: Float32Array, b: Float32Array, e: Float32Array): void;
    static matrix4x4MultiplyFFFForNative(a: Float32Array, b: Float32Array, e: Float32Array): void;
    static matrix4x4MultiplyMFM(left: Matrix4x4, right: Float32Array, out: Matrix4x4): void;
}
