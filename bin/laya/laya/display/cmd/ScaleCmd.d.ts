import { Context } from "../../resource/Context";
export declare class ScaleCmd {
    static ID: string;
    scaleX: number;
    scaleY: number;
    pivotX: number;
    pivotY: number;
    static create(scaleX: number, scaleY: number, pivotX: number, pivotY: number): ScaleCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
