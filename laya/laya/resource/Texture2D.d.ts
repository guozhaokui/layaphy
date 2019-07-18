import { BaseTexture } from "./BaseTexture";
import { Handler } from "../utils/Handler";
export declare class Texture2D extends BaseTexture {
    static TEXTURE2D: string;
    static grayTexture: Texture2D;
    static whiteTexture: Texture2D;
    static blackTexture: Texture2D;
    static load(url: string, complete: Handler): void;
    private _canRead;
    private _pixels;
    readonly defaulteTexture: BaseTexture;
    constructor(width?: number, height?: number, format?: number, mipmap?: boolean, canRead?: boolean);
    private _setPixels;
    private _calcualatesCompressedDataSize;
    private _pharseDDS;
    private _pharseKTX;
    private _pharsePVR;
    loadImageSource(source: any, premultiplyAlpha?: boolean): void;
    setPixels(pixels: Uint8Array, miplevel?: number): void;
    setSubPixels(x: number, y: number, width: number, height: number, pixels: Uint8Array, miplevel?: number): void;
    setCompressData(data: ArrayBuffer): void;
    protected _recoverResource(): void;
    getPixels(): Uint8Array;
}
