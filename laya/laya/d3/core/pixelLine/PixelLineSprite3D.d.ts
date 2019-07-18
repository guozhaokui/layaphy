import { PixelLineRenderer } from "./PixelLineRenderer";
import { PixelLineData } from "./PixelLineData";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { BaseMaterial } from "../material/BaseMaterial";
import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
export declare class PixelLineSprite3D extends RenderableSprite3D {
    maxLineCount: number;
    lineCount: number;
    readonly pixelLineRenderer: PixelLineRenderer;
    constructor(maxCount?: number, name?: string);
    _changeRenderObjects(sender: PixelLineRenderer, index: number, material: BaseMaterial): void;
    addLine(startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void;
    addLines(lines: PixelLineData[]): void;
    removeLine(index: number): void;
    setLine(index: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void;
    getLine(index: number, out: PixelLineData): void;
    clear(): void;
}
