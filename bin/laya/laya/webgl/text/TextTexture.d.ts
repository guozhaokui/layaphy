import { Resource } from "../../resource/Resource";
import { CharRenderInfo } from "./CharRenderInfo";
interface ITextRender {
    atlasWidth: number;
    checkCleanTextureDt: number;
    debugUV: boolean;
    isWan1Wan: boolean;
    destroyUnusedTextureDt: number;
}
export declare class TextTexture extends Resource {
    static gTextRender: ITextRender;
    private static pool;
    private static poolLen;
    private static cleanTm;
    genID: number;
    bitmap: any;
    curUsedCovRate: number;
    curUsedCovRateAtlas: number;
    lastTouchTm: number;
    ri: CharRenderInfo;
    constructor(textureW: number, textureH: number);
    recreateResource(): void;
    addChar(data: ImageData, x: number, y: number, uv?: any[]): any[];
    addCharCanvas(canv: any, x: number, y: number, uv?: any[]): any[];
    fillWhite(): void;
    discard(): void;
    static getTextTexture(w: number, h: number): TextTexture;
    destroy(): void;
    static clean(): void;
    touchRect(ri: CharRenderInfo, curloop: number): void;
    readonly texture: any;
    drawOnScreen(x: number, y: number): void;
}
export {};
