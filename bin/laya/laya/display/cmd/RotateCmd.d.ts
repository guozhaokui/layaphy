import { Context } from "../../resource/Context";
export declare class RotateCmd {
    static ID: string;
    angle: number;
    pivotX: number;
    pivotY: number;
    static create(angle: number, pivotX: number, pivotY: number): RotateCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
