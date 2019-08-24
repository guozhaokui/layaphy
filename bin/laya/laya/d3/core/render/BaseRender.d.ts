import { Bounds } from "../Bounds";
import { BaseMaterial } from "../material/BaseMaterial";
import { BoundsOctreeNode } from "../scene/BoundsOctreeNode";
import { IOctreeObject } from "../scene/IOctreeObject";
import { Vector4 } from "../../math/Vector4";
import { EventDispatcher } from "../../../events/EventDispatcher";
import { ISingletonElement } from "../../../resource/ISingletonElement";
export declare class BaseRender extends EventDispatcher implements ISingletonElement, IOctreeObject {
    _supportOctree: boolean;
    sortingFudge: number;
    readonly id: number;
    lightmapIndex: number;
    lightmapScaleOffset: Vector4;
    enable: boolean;
    material: BaseMaterial;
    materials: BaseMaterial[];
    sharedMaterial: BaseMaterial;
    sharedMaterials: BaseMaterial[];
    readonly bounds: Bounds;
    receiveShadow: boolean;
    castShadow: boolean;
    readonly isPartOfStaticBatch: boolean;
    _getOctreeNode(): BoundsOctreeNode;
    _setOctreeNode(value: BoundsOctreeNode): void;
    _getIndexInMotionList(): number;
    _setIndexInMotionList(value: number): void;
    _getIndexInList(): number;
    _setIndexInList(index: number): void;
}
