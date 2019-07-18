import { Context } from "../../resource/Context";
export declare class RestoreCmd {
    static ID: string;
    static create(): RestoreCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
