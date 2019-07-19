import { VoxFileChunkChild } from "./VoxFileChunkChild";
import { Color } from "laya/d3/math/Color";
import { CubeInfoArray } from "../worldMaker/CubeInfoArray";
import { Handler } from "laya/utils/Handler";
export declare class VoxFileData {
    header: string;
    version: number;
    name: string;
    chunkContent: number;
    chunkNums: number;
    Packname: string;
    PackchunkContent: number;
    PackchunkNums: number;
    PackmodelNums: number;
    RGBAname: string;
    RGBAchunkContent: number;
    RGBAchunkNums: number;
    RGBAvalues: Uint32Array;
    ChunkChild: VoxFileChunkChild[];
    ArrayColor: Color[];
    cubeInfoArray: CubeInfoArray;
    static _paletteDefault: Uint32Array;
    static turecolor: Uint16Array;
    static TextureColor: Uint16Array;
    constructor();
    static getIndexByColor(r: number, g: number, b: number, a: number): number;
    LoadVoxFile(Path: string, ColorPlane?: number, ReturnCubeInfoArray?: Handler): void;
    CalColorFromUint32(Uint32array: Uint32Array): Color[];
    LoadVoxFilebyarraybuffer(arraybuffer: ArrayBuffer): CubeInfoArray;
}