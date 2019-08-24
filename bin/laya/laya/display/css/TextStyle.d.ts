import { SpriteStyle } from "./SpriteStyle";
import { BitmapFont } from "../BitmapFont";
import { Sprite } from "../Sprite";
import { Context } from "../../resource/Context";
export declare class TextStyle extends SpriteStyle {
    static EMPTY: TextStyle;
    italic: boolean;
    align: string;
    wordWrap: boolean;
    leading: number;
    padding: any[];
    bgColor: string;
    borderColor: string;
    asPassword: boolean;
    stroke: number;
    strokeColor: string;
    bold: boolean;
    underline: boolean;
    underlineColor: string;
    currBitmapFont: BitmapFont;
    reset(): SpriteStyle;
    recover(): void;
    static create(): TextStyle;
    render(sprite: Sprite, context: Context, x: number, y: number): void;
}
