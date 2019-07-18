import { Matrix4x4 } from "./Matrix4x4";
import { Vector3 } from "./Vector3";
export declare class Viewport {
    private static _tempMatrix4x4;
    x: number;
    y: number;
    width: number;
    height: number;
    minDepth: number;
    maxDepth: number;
    constructor(x: number, y: number, width: number, height: number);
    project(source: Vector3, matrix: Matrix4x4, out: Vector3): void;
    unprojectFromMat(source: Vector3, matrix: Matrix4x4, out: Vector3): void;
    unprojectFromWVP(source: Vector3, projection: Matrix4x4, view: Matrix4x4, world: Matrix4x4, out: Vector3): void;
    cloneTo(out: Viewport): void;
}
