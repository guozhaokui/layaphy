import { RenderableSprite3D } from "./RenderableSprite3D";
import { MeshFilter } from "./MeshFilter";
import { MeshRenderer } from "./MeshRenderer";
import { Mesh } from "../resource/models/Mesh";
import { Node } from "../../display/Node";
export declare class MeshSprite3D extends RenderableSprite3D {
    private _meshFilter;
    readonly meshFilter: MeshFilter;
    readonly meshRenderer: MeshRenderer;
    constructor(mesh?: Mesh, name?: string);
    _parse(data: any, spriteMap: any): void;
    _addToInitStaticBatchManager(): void;
    _cloneTo(destObject: any, rootSprite: Node, dstSprite: Node): void;
    destroy(destroyChild?: boolean): void;
}
