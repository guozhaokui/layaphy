import { Vector3 } from "./Vector3";
import { Ray } from "./Ray";
import { IClone } from "../core/IClone";
export declare class BoundSphere implements IClone {
    private static _tempVector3;
    center: Vector3;
    radius: number;
    constructor(center: Vector3, radius: number);
    toDefault(): void;
    static createFromSubPoints(points: Vector3[], start: number, count: number, out: BoundSphere): void;
    static createfromPoints(points: Vector3[], out: BoundSphere): void;
    intersectsRayDistance(ray: Ray): number;
    intersectsRayPoint(ray: Ray, outPoint: Vector3): number;
    cloneTo(destObject: any): void;
    clone(): any;
}
