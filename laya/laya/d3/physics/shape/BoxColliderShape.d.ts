import { ColliderShape } from "./ColliderShape";
export declare class BoxColliderShape extends ColliderShape {
    readonly sizeX: number;
    readonly sizeY: number;
    readonly sizeZ: number;
    constructor(sizeX?: number, sizeY?: number, sizeZ?: number);
    clone(): any;
}
