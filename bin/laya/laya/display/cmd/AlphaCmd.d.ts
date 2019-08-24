import { Context } from "../../resource/Context";
export declare class AlphaCmd {
    static ID: string;
    alpha: number;
    static create(alpha: number): AlphaCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
