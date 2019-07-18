import { Vector2 } from "../math/Vector2";
import { Mesh } from "../resource/models/Mesh";
import { Texture2D } from "../../resource/Texture2D";
export declare class HeightMap {
    private static _tempRay;
    static creatFromMesh(mesh: Mesh, width: number, height: number, outCellSize: Vector2): HeightMap;
    static createFromImage(texture: Texture2D, minHeight: number, maxHeight: number): HeightMap;
    private static _getPosition;
    private _datas;
    private _w;
    private _h;
    private _minHeight;
    private _maxHeight;
    readonly width: number;
    readonly height: number;
    readonly maxHeight: number;
    readonly minHeight: number;
    constructor(width: number, height: number, minHeight: number, maxHeight: number);
    getHeight(row: number, col: number): number;
}
