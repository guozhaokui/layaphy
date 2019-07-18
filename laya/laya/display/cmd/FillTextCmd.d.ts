import { Context } from "../../resource/Context";
import { WordText } from "../../utils/WordText";
export declare class FillTextCmd {
    static ID: string;
    private _text;
    x: number;
    y: number;
    private _font;
    private _color;
    private _textAlign;
    private _fontColor;
    private _strokeColor;
    private static _defFontObj;
    private _fontObj;
    private _nTexAlign;
    static create(text: string | WordText, x: number, y: number, font: string, color: string, textAlign: string): FillTextCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
    text: string | WordText;
    font: string;
    color: string;
    textAlign: string;
}
