import { Vector3 } from "../../math/Vector3";
import { Mesh } from "../../resource/models/Mesh";
import { ColliderShape } from "./ColliderShape";
export declare class MeshColliderShape extends ColliderShape {
    private _mesh;
    private _convex;
    mesh: Mesh;
    convex: boolean;
    constructor();
    _setScale(value: Vector3): void;
    cloneTo(destObject: any): void;
    clone(): any;
    destroy(): void;
}
