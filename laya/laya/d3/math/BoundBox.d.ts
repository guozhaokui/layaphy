import { Vector3 } from "./Vector3";
import { IClone } from "../core/IClone";
export declare class BoundBox implements IClone {
    min: Vector3;
    max: Vector3;
    constructor(min: Vector3, max: Vector3);
    getCorners(corners: Vector3[]): void;
    getCenter(out: Vector3): void;
    getExtent(out: Vector3): void;
    setCenterAndExtent(center: Vector3, extent: Vector3): void;
    toDefault(): void;
    static createfromPoints(points: Vector3[], out: BoundBox): void;
    static merge(box1: BoundBox, box2: BoundBox, out: BoundBox): void;
    cloneTo(destObject: any): void;
    clone(): any;
}
