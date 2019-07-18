import { Context } from "../../resource/Context";
export declare class FillWordsCmd {
    static ID: string;
    words: any[];
    x: number;
    y: number;
    font: string;
    color: string;
    static create(words: any[], x: number, y: number, font: string, color: string): FillWordsCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
