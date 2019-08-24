import { TextAtlas } from "./TextAtlas";
import { Sprite } from "../../display/Sprite";
import { Context } from "../../resource/Context";
import { FontInfo } from "../../utils/FontInfo";
import { HTMLChar } from "../../utils/HTMLChar";
import { WordText } from "../../utils/WordText";
import { CharRenderInfo } from "./CharRenderInfo";
export declare class TextRender {
    static useOldCharBook: boolean;
    static atlasWidth: number;
    static noAtlas: boolean;
    static forceSplitRender: boolean;
    static forceWholeRender: boolean;
    static scaleFontWithCtx: boolean;
    static standardFontSize: number;
    static destroyAtlasDt: number;
    static checkCleanTextureDt: number;
    static destroyUnusedTextureDt: number;
    static cleanMem: number;
    static isWan1Wan: boolean;
    static showLog: boolean;
    static debugUV: boolean;
    private fontSizeInfo;
    static atlasWidth2: number;
    private charRender;
    private static tmpRI;
    private static pixelBBX;
    private mapFont;
    private fontID;
    private mapColor;
    private colorID;
    private fontScaleX;
    private fontScaleY;
    private _curStrPos;
    static textRenderInst: TextRender;
    textAtlases: TextAtlas[];
    private isoTextures;
    private bmpData32;
    private static imgdtRect;
    private lastFont;
    private fontSizeW;
    private fontSizeH;
    private fontSizeOffX;
    private fontSizeOffY;
    private renderPerChar;
    private tmpAtlasPos;
    private textureMem;
    private fontStr;
    static simClean: boolean;
    constructor();
    setFont(font: FontInfo): void;
    getNextChar(str: string): string;
    filltext(ctx: Context, data: string | WordText, x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number, textAlign: string, underLine?: number): void;
    fillWords(ctx: Context, data: HTMLChar[], x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number): void;
    _fast_filltext(ctx: Context, data: string | WordText, htmlchars: HTMLChar[], x: number, y: number, font: FontInfo, color: string, strokeColor: string, lineWidth: number, textAlign: number, underLine?: number): void;
    protected _drawResortedWords(ctx: Context, startx: number, starty: number, samePagesData: any[]): void;
    hasFreedText(txts: any[]): boolean;
    getCharRenderInfo(str: string, font: FontInfo, color: string, strokeColor: string, lineWidth: number, isoTexture?: boolean): CharRenderInfo;
    addBmpData(data: ImageData, ri: CharRenderInfo): TextAtlas;
    GC(): void;
    cleanAtlases(): void;
    getCharBmp(c: string): any;
    private checkBmpLine;
    private updateBbx;
    getFontSizeInfo(font: string): number;
    printDbgInfo(): void;
    showAtlas(n: number, bgcolor: string, x: number, y: number, w: number, h: number): Sprite;
    filltext_native(ctx: Context, data: string | WordText, htmlchars: HTMLChar[], x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number, textAlign: string, underLine?: number): void;
}