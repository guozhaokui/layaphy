import { TileTexSet } from "./TileTexSet";
import { Sprite } from "../display/Sprite";
export declare class TileAniSprite extends Sprite {
    private _tileTextureSet;
    private _aniName;
    setTileTextureSet(aniName: string, tileTextureSet: TileTexSet): void;
    show(): void;
    hide(): void;
    clearAll(): void;
}
