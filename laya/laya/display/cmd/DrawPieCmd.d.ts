import { Context } from "../../resource/Context";
export declare class DrawPieCmd {
    static ID: string;
    x: number;
    y: number;
    radius: number;
    private _startAngle;
    private _endAngle;
    fillColor: any;
    lineColor: any;
    lineWidth: number;
    vid: number;
    static create(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): DrawPieCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
    startAngle: number;
    endAngle: number;
}
