import { ColorFilter } from "../../filters/ColorFilter";
import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
export declare class DrawTrianglesCmd {
    static ID: string;
    texture: Texture;
    x: number;
    y: number;
    vertices: Float32Array;
    uvs: Float32Array;
    indices: Uint16Array;
    matrix: Matrix;
    alpha: number;
    blendMode: string;
    color: ColorFilter;
    static create(texture: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array, matrix: Matrix, alpha: number, color: string, blendMode: string): DrawTrianglesCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
