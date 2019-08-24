import { ColliderShape } from "./ColliderShape";
export declare class CompoundColliderShape extends ColliderShape {
    constructor();
    _addReference(): void;
    _removeReference(): void;
    addChildShape(shape: ColliderShape): void;
    removeChildShape(shape: ColliderShape): void;
    clearChildShape(): void;
    getChildShapeCount(): number;
    cloneTo(destObject: any): void;
    clone(): any;
    destroy(): void;
}
