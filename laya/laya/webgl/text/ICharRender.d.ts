import { CharRenderInfo } from "./CharRenderInfo";
export declare class ICharRender {
    fontsz: number;
    getWidth(font: string, str: string): number;
    scale(sx: number, sy: number): void;
    canvasWidth: number;
    getCharBmp(char: string, font: string, lineWidth: number, colStr: string, strokeColStr: string, size: CharRenderInfo, margin_left: number, margin_top: number, margin_right: number, margin_bottom: number, rect?: any[]): ImageData;
}
