import { Context } from "../../resource/Context";
export declare class DrawPathCmd {
    static ID: string;
    x: number;
    y: number;
    paths: any[];
    brush: any;
    pen: any;
    static create(x: number, y: number, paths: any[], brush: any, pen: any): DrawPathCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
