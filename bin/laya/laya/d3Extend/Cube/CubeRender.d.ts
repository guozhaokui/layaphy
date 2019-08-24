import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { BaseRender } from "laya/d3/core/render/BaseRender";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
export declare class CubeRender extends BaseRender {
    private _projectionViewWorldMatrix;
    constructor(owner: RenderableSprite3D);
    protected _calculateBoundingSphere(): void;
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void;
    _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void;
    _destroy(): void;
}
