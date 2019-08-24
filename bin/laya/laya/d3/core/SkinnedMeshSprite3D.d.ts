import { Node } from "../../display/Node";
import { Animator } from "../component/Animator";
import { Mesh } from "../resource/models/Mesh";
import { Avatar } from "./Avatar";
import { MeshFilter } from "./MeshFilter";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer";
export declare class SkinnedMeshSprite3D extends RenderableSprite3D {
    static BONES: number;
    readonly meshFilter: MeshFilter;
    readonly skinnedMeshRenderer: SkinnedMeshRenderer;
    constructor(mesh?: Mesh, name?: string);
    _parse(data: any, spriteMap: any): void;
    protected _changeHierarchyAnimator(animator: Animator): void;
    protected _changeAnimatorAvatar(avatar: Avatar): void;
    _cloneTo(destObject: any, srcRoot: Node, dstRoot: Node): void;
    destroy(destroyChild?: boolean): void;
}
