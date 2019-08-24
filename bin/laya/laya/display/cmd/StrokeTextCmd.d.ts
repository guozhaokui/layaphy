import { Context } from "../../resource/Context";
export declare class StrokeTextCmd {
    static ID: string;
    text: string;
    x: number;
    y: number;
    font: string;
    color: string;
    lineWidth: number;
    textAlign: string;
    static create(text: string, x: number, y: number, font: string, color: string, lineWidth: number, textAlign: string): StrokeTextCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
