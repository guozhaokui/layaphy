import { Sprite } from "../../display/Sprite";
import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
export declare class WebGLCacheAsNormalCanvas {
    submitStartPos: number;
    submitEndPos: number;
    context: Context;
    touches: any[];
    submits: any[];
    sprite: Sprite;
    private _pathMesh;
    private _triangleMesh;
    meshlist: any[];
    private _oldMesh;
    private _oldPathMesh;
    private _oldTriMesh;
    private _oldMeshList;
    private cachedClipInfo;
    private oldTx;
    private oldTy;
    private static matI;
    invMat: Matrix;
    constructor(ctx: Context, sp: Sprite);
    startRec(): void;
    endRec(): void;
    isCacheValid(): boolean;
    flushsubmit(): void;
    releaseMem(): void;
}
