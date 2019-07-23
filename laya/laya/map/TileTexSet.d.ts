import { Texture } from "laya/resource/Texture";
import { TileAniSprite } from "./TileAniSprite";
export declare class TileTexSet {
    gid: number;
    texture: Texture;
    offX: number;
    offY: number;
    textureArray: any[];
    durationTimeArray: any[];
    animationTotalTime: number;
    isAnimation: boolean;
    private _spriteNum;
    private _aniDic;
    private _frameIndex;
    private _time;
    private _interval;
    private _preFrameTime;
    addAniSprite(aniName: string, sprite: TileAniSprite): void;
    private animate;
    private drawTexture;
    removeAniSprite(_name: string): void;
    showDebugInfo(): string;
    clearAll(): void;
}
