import { IClone } from "./IClone";
import { BoundBox } from "../math/BoundBox";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector3 } from "../math/Vector3";
export declare class Bounds implements IClone {
    private _updateFlag;
    _boundBox: BoundBox;
    setMin(value: Vector3): void;
    getMin(): Vector3;
    setMax(value: Vector3): void;
    getMax(): Vector3;
    setCenter(value: Vector3): void;
    getCenter(): Vector3;
    setExtent(value: Vector3): void;
    getExtent(): Vector3;
    constructor(min: Vector3, max: Vector3);
    private _getUpdateFlag;
    private _setUpdateFlag;
    private _getCenter;
    private _getExtent;
    private _getMin;
    private _getMax;
    private _rotateExtents;
    _tranform(matrix: Matrix4x4, out: Bounds): void;
    cloneTo(destObject: any): void;
    clone(): any;
}
