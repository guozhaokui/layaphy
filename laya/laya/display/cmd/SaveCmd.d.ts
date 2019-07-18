import { Context } from "../../resource/Context";
export declare class SaveCmd {
    static ID: string;
    static create(): SaveCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
