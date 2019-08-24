import { Clip } from "./Clip";
export declare class FontClip extends Clip {
    protected _valueArr: string;
    protected _indexMap: any;
    protected _sheet: string;
    protected _direction: string;
    protected _spaceX: number;
    protected _spaceY: number;
    private _align;
    private _wordsW;
    private _wordsH;
    constructor(skin?: string, sheet?: string);
    protected createChildren(): void;
    private _onClipLoaded;
    sheet: string;
    value: string;
    direction: string;
    spaceX: number;
    spaceY: number;
    align: string;
    protected changeValue(): void;
    width: number;
    height: number;
    protected measureWidth(): number;
    protected measureHeight(): number;
    destroy(destroyChild?: boolean): void;
}
