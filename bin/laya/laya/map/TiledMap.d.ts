import { MapLayer } from "./MapLayer";
import { Rectangle } from "laya/maths/Rectangle";
import { Sprite } from "laya/display/Sprite";
import { Handler } from "laya/utils/Handler";
import { Point } from "laya/maths/Point";
import { TileTexSet } from "./TileTexSet";
import { GridSprite } from "./GridSprite";
export declare class TiledMap {
    static ORIENTATION_ORTHOGONAL: string;
    static ORIENTATION_ISOMETRIC: string;
    static ORIENTATION_STAGGERED: string;
    static ORIENTATION_HEXAGONAL: string;
    static RENDERORDER_RIGHTDOWN: string;
    static RENDERORDER_RIGHTUP: string;
    static RENDERORDER_LEFTDOWN: string;
    static RENDERORDER_LEFTUP: string;
    private _jsonData;
    private _tileTexSetArr;
    private _texArray;
    private _x;
    private _y;
    private _width;
    private _height;
    private _mapW;
    private _mapH;
    private _mapTileW;
    private _mapTileH;
    private _rect;
    private _paddingRect;
    private _mapSprite;
    private _layerArray;
    private _renderLayerArray;
    private _gridArray;
    private _showGridKey;
    private _totalGridNum;
    private _gridW;
    private _gridH;
    private _gridWidth;
    private _gridHeight;
    private _jsonLoader;
    private _loader;
    private _tileSetArray;
    private _currTileSet;
    private _completeHandler;
    private _mapRect;
    private _mapLastRect;
    private _index;
    private _animationDic;
    private _properties;
    private _tileProperties;
    private _tileProperties2;
    private _orientation;
    private _renderOrder;
    private _colorArray;
    private _scale;
    private _pivotScaleX;
    private _pivotScaleY;
    private _centerX;
    private _centerY;
    private _viewPortWidth;
    private _viewPortHeight;
    private _enableLinear;
    private _resPath;
    private _pathArray;
    private _limitRange;
    autoCache: boolean;
    autoCacheType: string;
    enableMergeLayer: boolean;
    removeCoveredTile: boolean;
    showGridTextureCount: boolean;
    antiCrack: boolean;
    cacheAllAfterInit: boolean;
    constructor();
    createMap(mapName: string, viewRect: Rectangle, completeHandler: Handler, viewRectPadding?: Rectangle, gridSize?: Point, enableLinear?: boolean, limitRange?: boolean): void;
    private onJsonComplete;
    private mergePath;
    private _texutreStartDic;
    private onTextureComplete;
    private adptTexture;
    private initMap;
    private addTileProperties;
    getTileUserData(id: number, sign: string, defaultV?: any): any;
    private adptTiledMapData;
    private removeCoverd;
    private collectCovers;
    getTexture(index: number): TileTexSet;
    getMapProperties(name: string): any;
    getTileProperties(index: number, id: number, name: string): any;
    getSprite(index: number, width: number, height: number): GridSprite;
    setViewPortPivotByScale(scaleX: number, scaleY: number): void;
    scale: number;
    moveViewPort(moveX: number, moveY: number): void;
    changeViewPort(moveX: number, moveY: number, width: number, height: number): void;
    changeViewPortBySize(width: number, height: number, rect?: Rectangle): Rectangle;
    private updateViewPort;
    private clipViewPort;
    private showGrid;
    private cacheAllGrid;
    private static _tempCanvas;
    private cacheGridsArray;
    private getGridArray;
    private hideGrid;
    getLayerObject(layerName: string, objectName: string): GridSprite;
    destroy(): void;
    readonly tileWidth: number;
    readonly tileHeight: number;
    readonly width: number;
    readonly height: number;
    readonly numColumnsTile: number;
    readonly numRowsTile: number;
    readonly viewPortX: number;
    readonly viewPortY: number;
    readonly viewPortWidth: number;
    readonly viewPortHeight: number;
    readonly x: number;
    readonly y: number;
    readonly gridWidth: number;
    readonly gridHeight: number;
    readonly numColumnsGrid: number;
    readonly numRowsGrid: number;
    readonly orientation: string;
    readonly renderOrder: string;
    mapSprite(): Sprite;
    getLayerByName(layerName: string): MapLayer;
    getLayerByIndex(index: number): MapLayer;
}
