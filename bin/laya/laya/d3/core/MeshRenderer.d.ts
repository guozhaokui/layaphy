import { BoundFrustum } from "../math/BoundFrustum";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { Transform3D } from "./Transform3D";
import { BaseRender } from "./render/BaseRender";
import { RenderContext3D } from "./render/RenderContext3D";
export declare class MeshRenderer extends BaseRender {
    constructor(owner: RenderableSprite3D);
    protected _calculateBoundingBox(): void;
    _needRender(boundFrustum: BoundFrustum): boolean;
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void;
    _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void;
    _renderUpdateWithCameraForNative(context: RenderContext3D, transform: Transform3D): void;
    _destroy(): void;
}
