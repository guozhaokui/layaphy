import { RenderableSprite3D } from "./RenderableSprite3D";
import { Mesh } from "../resource/models/Mesh";
export declare class MeshFilter {
    private _owner;
    private _sharedMesh;
    sharedMesh: Mesh;
    constructor(owner: RenderableSprite3D);
    private _getMeshDefine;
    destroy(): void;
}
