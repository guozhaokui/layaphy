import { Context } from "../../resource/Context";
export declare class DrawCurvesCmd {
    static ID: string;
    x: number;
    y: number;
    points: any[];
    lineColor: any;
    lineWidth: number;
    static create(x: number, y: number, points: any[], lineColor: any, lineWidth: number): DrawCurvesCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
