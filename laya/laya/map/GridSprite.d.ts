import { TiledMap } from "./TiledMap";
import { TileAniSprite } from "./TileAniSprite";
import { Sprite } from "../display/Sprite";
export declare class GridSprite extends Sprite {
    relativeX: number;
    relativeY: number;
    isAloneObject: boolean;
    isHaveAnimation: boolean;
    aniSpriteArray: any[];
    drawImageNum: number;
    private _map;
    initData(map: TiledMap, objectKey?: boolean): void;
    addAniSprite(sprite: TileAniSprite): void;
    show(): void;
    hide(): void;
    updatePos(): void;
    clearAll(): void;
}
