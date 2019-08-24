import { ColorFilter } from "../../filters/ColorFilter";
import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
export declare class DrawTextureCmd {
    static ID: string;
    texture: Texture;
    x: number;
    y: number;
    width: number;
    height: number;
    matrix: Matrix;
    alpha: number;
    color: string;
    colorFlt: ColorFilter;
    blendMode: string;
    uv: number[];
    static create(texture: Texture, x: number, y: number, width: number, height: number, matrix: Matrix, alpha: number, color: string, blendMode: string, uv?: number[]): DrawTextureCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
