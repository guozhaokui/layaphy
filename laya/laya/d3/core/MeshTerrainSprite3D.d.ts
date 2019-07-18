import { MeshSprite3D } from "./MeshSprite3D";
import { HeightMap } from "./HeightMap";
import { Mesh } from "../resource/models/Mesh";
import { Texture2D } from "../../resource/Texture2D";
export declare class MeshTerrainSprite3D extends MeshSprite3D {
    private static _tempVector3;
    private static _tempMatrix4x4;
    static createFromMesh(mesh: Mesh, heightMapWidth: number, heightMapHeight: number, name?: string): MeshTerrainSprite3D;
    static createFromMeshAndHeightMap(mesh: Mesh, texture: Texture2D, minHeight: number, maxHeight: number, name?: string): MeshTerrainSprite3D;
    private _minX;
    private _minZ;
    private _cellSize;
    private _heightMap;
    readonly minX: number;
    readonly minZ: number;
    readonly width: number;
    readonly depth: number;
    constructor(mesh: Mesh, heightMap: HeightMap, name?: string);
    private _disableRotation;
    private _getScaleX;
    private _getScaleZ;
    private _initCreateFromMesh;
    private _initCreateFromMeshHeightMap;
    private _computeCellSize;
    getHeight(x: number, z: number): number;
}
