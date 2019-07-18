import { Texture } from "../resource/Texture";
import { Handler } from "../utils/Handler";
export declare class BitmapFont {
    private _texture;
    private _fontCharDic;
    private _fontWidthMap;
    private _complete;
    private _path;
    private _maxWidth;
    private _spaceWidth;
    private _padding;
    fontSize: number;
    autoScaleSize: boolean;
    letterSpacing: number;
    loadFont(path: string, complete: Handler): void;
    private _onLoaded;
    parseFont(xml: XMLDocument, texture: Texture): void;
    parseFont2(xml: XMLDocument, texture: Texture): void;
    getCharTexture(char: string): Texture;
    destroy(): void;
    setSpaceWidth(spaceWidth: number): void;
    getCharWidth(char: string): number;
    getTextWidth(text: string): number;
    getMaxWidth(): number;
    getMaxHeight(): number;
}
