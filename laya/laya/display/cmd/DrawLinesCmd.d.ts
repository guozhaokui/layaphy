import { Context } from "../../resource/Context";
export declare class DrawLinesCmd {
    static ID: string;
    x: number;
    y: number;
    points: any[];
    lineColor: any;
    lineWidth: number;
    vid: number;
    static create(x: number, y: number, points: any[], lineColor: any, lineWidth: number, vid: number): DrawLinesCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
