import { PixelLineSprite3D } from "./PixelLineSprite3D";
import { Transform3D } from "../Transform3D";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
export declare class PixelLineRenderer extends BaseRender {
    constructor(owner: PixelLineSprite3D);
    protected _calculateBoundingBox(): void;
    _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void;
}
