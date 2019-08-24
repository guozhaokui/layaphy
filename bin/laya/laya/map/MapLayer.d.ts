import { Sprite } from "laya/display/Sprite";
import { Point } from "laya/maths/Point";
import { GridSprite } from "./GridSprite";
import { TiledMap } from "./TiledMap";
export declare class MapLayer extends Sprite {
    private _map;
    private _tileWidthHalf;
    private _tileHeightHalf;
    private _mapWidthHalf;
    private _mapHeightHalf;
    private _objDic;
    private _dataDic;
    private _tempMapPos;
    private _properties;
    tarLayer: MapLayer;
    layerName: string;
    init(layerData: any, map: TiledMap): void;
    getObjectByName(objName: string): GridSprite;
    getObjectDataByName(objName: string): GridSprite;
    getLayerProperties(name: string): any;
    getTileData(tileX: number, tileY: number): number;
    getScreenPositionByTilePos(tileX: number, tileY: number, screenPos?: Point): void;
    getTileDataByScreenPos(screenX: number, screenY: number): number;
    getTilePositionByScreenPos(screenX: number, screenY: number, result?: Point): boolean;
    getDrawSprite(gridX: number, gridY: number): GridSprite;
    updateGridPos(): void;
    drawTileTexture(gridSprite: GridSprite, tileX: number, tileY: number): boolean;
    clearAll(): void;
}
