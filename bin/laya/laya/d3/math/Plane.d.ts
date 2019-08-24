import { Vector3 } from "./Vector3";
export declare class Plane {
    normal: Vector3;
    distance: number;
    static PlaneIntersectionType_Back: number;
    static PlaneIntersectionType_Front: number;
    static PlaneIntersectionType_Intersecting: number;
    constructor(normal: Vector3, d?: number);
    static createPlaneBy3P(point1: Vector3, point2: Vector3, point3: Vector3): Plane;
    normalize(): void;
}
