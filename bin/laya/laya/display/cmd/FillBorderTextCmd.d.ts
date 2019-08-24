import { Context } from "../../resource/Context";
export declare class FillBorderTextCmd {
    static ID: string;
    text: string;
    x: number;
    y: number;
    font: string;
    fillColor: string;
    borderColor: string;
    lineWidth: number;
    textAlign: string;
    static create(text: string, x: number, y: number, font: string, fillColor: string, borderColor: string, lineWidth: number, textAlign: string): FillBorderTextCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
