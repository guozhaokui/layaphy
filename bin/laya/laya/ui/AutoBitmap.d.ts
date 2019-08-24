import { Graphics } from "../display/Graphics";
import { Texture } from "../resource/Texture";
export declare class AutoBitmap extends Graphics {
    autoCacheCmd: boolean;
    private _width;
    private _height;
    private _source;
    private _sizeGrid;
    protected _isChanged: boolean;
    uv: number[];
    destroy(): void;
    sizeGrid: number[];
    width: number;
    height: number;
    source: Texture;
    protected _setChanged(): void;
    protected changeSource(): void;
    private drawBitmap;
    private static getTexture;
}
