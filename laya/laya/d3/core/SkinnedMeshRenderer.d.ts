import { Mesh } from "../resource/models/Mesh";
import { Bounds } from "./Bounds";
import { MeshRenderer } from "./MeshRenderer";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { Sprite3D } from "./Sprite3D";
import { Transform3D } from "./Transform3D";
import { RenderContext3D } from "./render/RenderContext3D";
import { RenderElement } from "./render/RenderElement";
export declare class SkinnedMeshRenderer extends MeshRenderer {
    localBounds: Bounds;
    rootBone: Sprite3D;
    readonly bones: Sprite3D[];
    constructor(owner: RenderableSprite3D);
    private _computeSkinnedData;
    _createRenderElement(): RenderElement;
    _onMeshChange(value: Mesh): void;
    protected _calculateBoundingBox(): void;
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void;
    _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void;
    _destroy(): void;
    readonly bounds: Bounds;
}
