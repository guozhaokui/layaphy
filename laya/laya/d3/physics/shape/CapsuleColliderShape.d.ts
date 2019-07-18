import { Vector3 } from "../../math/Vector3";
import { ColliderShape } from "./ColliderShape";
export declare class CapsuleColliderShape extends ColliderShape {
    readonly radius: number;
    readonly length: number;
    readonly orientation: number;
    constructor(radius?: number, length?: number, orientation?: number);
    _setScale(value: Vector3): void;
    clone(): any;
}
