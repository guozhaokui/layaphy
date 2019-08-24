import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
export declare class DrawTexturesCmd {
    static ID: string;
    texture: Texture;
    pos: any[];
    static create(texture: Texture, pos: any[]): DrawTexturesCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
