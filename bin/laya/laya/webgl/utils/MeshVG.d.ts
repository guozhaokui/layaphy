import { Mesh2D } from "./Mesh2D";
import { Context } from "../../resource/Context";
export declare class MeshVG extends Mesh2D {
    static const_stride: number;
    private static _fixattriInfo;
    private static _POOL;
    static __init__(): void;
    constructor();
    static getAMesh(mainctx: boolean): MeshVG;
    addVertAndIBToMesh(ctx: Context, points: any[], rgba: number, ib: any[]): void;
    releaseMesh(): void;
    destroy(): void;
}
