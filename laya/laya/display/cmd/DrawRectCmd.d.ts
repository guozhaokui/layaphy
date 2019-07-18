import { Context } from "../../resource/Context";
export declare class DrawRectCmd {
    static ID: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fillColor: any;
    lineColor: any;
    lineWidth: number;
    static create(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): DrawRectCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
