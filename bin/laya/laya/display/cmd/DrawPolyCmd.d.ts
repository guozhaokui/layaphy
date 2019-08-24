import { Context } from "../../resource/Context";
export declare class DrawPolyCmd {
    static ID: string;
    x: number;
    y: number;
    points: any[];
    fillColor: any;
    lineColor: any;
    lineWidth: number;
    isConvexPolygon: boolean;
    vid: number;
    static create(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number, isConvexPolygon: boolean, vid: number): DrawPolyCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
