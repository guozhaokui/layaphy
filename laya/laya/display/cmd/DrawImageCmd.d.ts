import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
export declare class DrawImageCmd {
    static ID: string;
    texture: Texture;
    x: number;
    y: number;
    width: number;
    height: number;
    static create(texture: Texture, x: number, y: number, width: number, height: number): DrawImageCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
