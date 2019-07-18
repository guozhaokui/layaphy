import { Context } from "../../resource/Context";
export declare class ClipRectCmd {
    static ID: string;
    x: number;
    y: number;
    width: number;
    height: number;
    static create(x: number, y: number, width: number, height: number): ClipRectCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
