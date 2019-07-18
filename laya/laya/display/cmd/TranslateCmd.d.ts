import { Context } from "../../resource/Context";
export declare class TranslateCmd {
    static ID: string;
    tx: number;
    ty: number;
    static create(tx: number, ty: number): TranslateCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
