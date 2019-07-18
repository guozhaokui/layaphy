import { Context } from "../../resource/Context";
export declare class DrawLineCmd {
    static ID: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    lineColor: string;
    lineWidth: number;
    vid: number;
    static create(fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth: number, vid: number): DrawLineCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
