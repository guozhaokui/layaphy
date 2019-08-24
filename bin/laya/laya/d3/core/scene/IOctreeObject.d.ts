import { BoundsOctreeNode } from "./BoundsOctreeNode";
import { Bounds } from "../Bounds";
export interface IOctreeObject {
    _getOctreeNode(): BoundsOctreeNode;
    _setOctreeNode(value: BoundsOctreeNode): void;
    _getIndexInMotionList(): number;
    _setIndexInMotionList(value: number): void;
    bounds: Bounds;
}
