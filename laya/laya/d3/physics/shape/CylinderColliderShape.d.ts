import { ColliderShape } from "./ColliderShape";
export declare class CylinderColliderShape extends ColliderShape {
    private static _nativeSize;
    private _orientation;
    private _radius;
    private _height;
    readonly radius: number;
    readonly height: number;
    readonly orientation: number;
    constructor(radius?: number, height?: number, orientation?: number);
    clone(): any;
}
