import { TrailSprite3D } from "./TrailSprite3D";
import { Transform3D } from "../Transform3D";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { BoundFrustum } from "../../math/BoundFrustum";
import { Matrix4x4 } from "../../math/Matrix4x4";
export declare class TrailRenderer extends BaseRender {
    constructor(owner: TrailSprite3D);
    protected _calculateBoundingBox(): void;
    _needRender(boundFrustum: BoundFrustum): boolean;
    _renderUpdate(state: RenderContext3D, transform: Transform3D): void;
    protected _projectionViewWorldMatrix: Matrix4x4;
    _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void;
}
