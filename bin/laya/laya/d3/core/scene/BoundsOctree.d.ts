import { IOctreeObject } from "./IOctreeObject";
import { RenderContext3D } from "../render/RenderContext3D";
import { BoundBox } from "../../math/BoundBox";
import { Ray } from "../../math/Ray";
import { Vector3 } from "../../math/Vector3";
import { Shader3D } from "../../shader/Shader3D";
export declare class BoundsOctree {
    constructor(initialWorldSize: number, initialWorldPos: Vector3, minNodeSize: number, looseness: number);
    add(object: IOctreeObject): void;
    remove(object: IOctreeObject): boolean;
    update(object: IOctreeObject): boolean;
    shrinkRootIfPossible(): void;
    addMotionObject(object: IOctreeObject): void;
    removeMotionObject(object: IOctreeObject): void;
    updateMotionObjects(): void;
    isCollidingWithBoundBox(checkBounds: BoundBox): boolean;
    isCollidingWithRay(ray: Ray, maxDistance?: number): boolean;
    getCollidingWithBoundBox(checkBound: BoundBox, result: any[]): void;
    getCollidingWithRay(ray: Ray, result: any[], maxDistance?: number): void;
    getCollidingWithFrustum(context: RenderContext3D, shader: Shader3D, replacementTag: string): void;
    getMaxBounds(): BoundBox;
}
