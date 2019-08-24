import { Label } from "./Label";
import { AutoBitmap } from "./AutoBitmap";
export declare class TextInput extends Label {
    protected _bg: AutoBitmap;
    protected _skin: string;
    constructor(text?: string);
    protected preinitialize(): void;
    destroy(destroyChild?: boolean): void;
    protected createChildren(): void;
    private _onFocus;
    private _onBlur;
    private _onInput;
    private _onEnter;
    protected initialize(): void;
    bg: AutoBitmap;
    skin: string;
    protected _skinLoaded(): void;
    sizeGrid: string;
    text: string;
    width: number;
    height: number;
    multiline: boolean;
    editable: boolean;
    select(): void;
    restrict: string;
    prompt: string;
    promptColor: string;
    maxChars: number;
    focus: boolean;
    type: string;
    setSelection(startIndex: number, endIndex: number): void;
}