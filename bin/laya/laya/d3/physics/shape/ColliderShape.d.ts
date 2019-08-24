import { IClone } from "../../core/IClone";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
export declare class ColliderShape implements IClone {
    needsCustomCollisionCallback: boolean;
    readonly type: number;
    localOffset: Vector3;
    localRotation: Quaternion;
    constructor();
    updateLocalTransformations(): void;
    cloneTo(destObject: any): void;
    clone(): any;
}
