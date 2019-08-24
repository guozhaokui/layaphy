import { Mesh2D } from "./Mesh2D";
export declare class MeshQuadTexture extends Mesh2D {
    static const_stride: number;
    private static _fixib;
    private static _maxIB;
    private static _fixattriInfo;
    private static _POOL;
    static __int__(): void;
    constructor();
    static getAMesh(mainctx: boolean): MeshQuadTexture;
    releaseMesh(): void;
    destroy(): void;
    addQuad(pos: any[], uv: ArrayLike<number>, color: number, useTex: boolean): void;
}
