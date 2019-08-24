import { BoundBox } from "../../math/BoundBox";
import { Ray } from "../../math/Ray";
import { Vector3 } from "../../math/Vector3";
import { RenderContext3D } from "../render/RenderContext3D";
import { IOctreeObject } from "./IOctreeObject";
import { BoundsOctree } from "./BoundsOctree";
import { Shader3D } from "../../shader/Shader3D";
export declare class BoundsOctreeNode {
    constructor(octree: BoundsOctree, parent: BoundsOctreeNode, baseLength: number, center: Vector3);
    add(object: IOctreeObject): boolean;
    remove(object: IOctreeObject): boolean;
    update(object: IOctreeObject): boolean;
    shrinkIfPossible(minLength: number): BoundsOctreeNode;
    hasAnyObjects(): boolean;
    getCollidingWithBoundBox(checkBound: BoundBox, result: any[]): void;
    getCollidingWithRay(ray: Ray, result: any[], maxDistance?: number): void;
    getCollidingWithFrustum(context: RenderContext3D, customShader: Shader3D, replacementTag: string): void;
    isCollidingWithBoundBox(checkBound: BoundBox): boolean;
    isCollidingWithRay(ray: Ray, maxDistance?: number): boolean;
    getBound(): BoundBox;
}
