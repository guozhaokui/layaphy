import { Context } from "../../resource/Context";
export declare class DrawParticleCmd {
    static ID: string;
    private _templ;
    static create(_temp: any): DrawParticleCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
