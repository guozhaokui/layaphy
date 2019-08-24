import { CharRenderInfo } from "./CharRenderInfo";
import { ICharRender } from "./ICharRender";
export declare class CharRender_Native extends ICharRender {
    private lastFont;
    constructor();
    getWidth(font: string, str: string): number;
    scale(sx: number, sy: number): void;
    getCharBmp(char: string, font: string, lineWidth: number, colStr: string, strokeColStr: string, size: CharRenderInfo, margin_left: number, margin_top: number, margin_right: number, margin_bottom: number, rect?: any[]): ImageData;
}
