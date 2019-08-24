import { Vector3 } from "./Vector3";
import { Matrix4x4 } from "./Matrix4x4";
import { Plane } from "./Plane";
import { BoundBox } from "./BoundBox";
import { BoundSphere } from "./BoundSphere";
export declare class BoundFrustum {
    private _matrix;
    private _near;
    private _far;
    private _left;
    private _right;
    private _top;
    private _bottom;
    constructor(matrix: Matrix4x4);
    matrix: Matrix4x4;
    readonly near: Plane;
    readonly far: Plane;
    readonly left: Plane;
    readonly right: Plane;
    readonly top: Plane;
    readonly bottom: Plane;
    equalsBoundFrustum(other: BoundFrustum): boolean;
    equalsObj(obj: any): boolean;
    getPlane(index: number): Plane;
    private static _getPlanesFromMatrix;
    private static _get3PlaneInterPoint;
    getCorners(corners: Vector3[]): void;
    containsPoint(point: Vector3): number;
    intersects(box: BoundBox): boolean;
    containsBoundBox(box: BoundBox): number;
    containsBoundSphere(sphere: BoundSphere): number;
}