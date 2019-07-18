import { TrailFilter } from "./TrailFilter";
import { TrailRenderer } from "./TrailRenderer";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { Node } from "../../../display/Node";
export declare class TrailSprite3D extends RenderableSprite3D {
    readonly trailFilter: TrailFilter;
    readonly trailRenderer: TrailRenderer;
    constructor(name?: string);
    _parse(data: any, spriteMap: any): void;
    protected _onActive(): void;
    _cloneTo(destObject: any, srcSprite: Node, dstSprite: Node): void;
    destroy(destroyChild?: boolean): void;
}
