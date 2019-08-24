import { Context } from "../../resource/Context";
export declare class FillBorderWordsCmd {
    static ID: string;
    words: any[];
    x: number;
    y: number;
    font: string;
    fillColor: string;
    borderColor: string;
    lineWidth: number;
    static create(words: any[], x: number, y: number, font: string, fillColor: string, borderColor: string, lineWidth: number): FillBorderWordsCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
