import { ColliderShape } from "./ColliderShape";
import { Vector3 } from "../../math/Vector3";
export declare class StaticPlaneColliderShape extends ColliderShape {
    private static _nativeNormal;
    constructor(normal: Vector3, offset: number);
    clone(): any;
}
