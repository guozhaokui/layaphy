import { PixelLineSprite3D } from "./PixelLineSprite3D";
import { PixelLineData } from "./PixelLineData";
import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
export declare class PixelLineFilter extends GeometryElement {
    constructor(owner: PixelLineSprite3D, maxLineCount: number);
    _getType(): number;
    _getLineData(index: number, out: PixelLineData): void;
    _prepareRender(state: RenderContext3D): boolean;
    _render(state: RenderContext3D): void;
    destroy(): void;
}
