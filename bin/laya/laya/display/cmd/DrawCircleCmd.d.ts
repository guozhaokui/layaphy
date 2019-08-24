import { Context } from "../../resource/Context";
export declare class DrawCircleCmd {
    static ID: string;
    x: number;
    y: number;
    radius: number;
    fillColor: any;
    lineColor: any;
    lineWidth: number;
    vid: number;
    static create(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): DrawCircleCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
