import { Handler } from "../../utils/Handler";
import { BaseTexture } from "../../resource/BaseTexture";
export declare class TextureCube extends BaseTexture {
    static TEXTURECUBE: string;
    static grayTexture: TextureCube;
    static _parse(data: any, propertyParams?: any, constructParams?: any[]): TextureCube;
    static load(url: string, complete: Handler): void;
    readonly defaulteTexture: BaseTexture;
    constructor(size: number, format?: number, mipmap?: boolean);
    private _setPixels;
    setSixSideImageSources(source: any[], premultiplyAlpha?: boolean): void;
    setSixSidePixels(pixels: any[], miplevel?: number): void;
    protected _recoverResource(): void;
}
