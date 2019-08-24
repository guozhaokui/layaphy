import { Sprite3D } from "../Sprite3D";
import { Vector3 } from "../../math/Vector3";
export declare class LightSprite extends Sprite3D {
    static LIGHTMAPBAKEDTYPE_REALTIME: number;
    static LIGHTMAPBAKEDTYPE_MIXED: number;
    static LIGHTMAPBAKEDTYPE_BAKED: number;
    color: Vector3;
    intensity: number;
    shadow: boolean;
    shadowDistance: number;
    shadowResolution: number;
    shadowPSSMCount: number;
    shadowPCFType: number;
    lightmapBakedType: number;
    constructor();
    _parse(data: any, spriteMap: any): void;
    protected _onActive(): void;
    protected _onInActive(): void;
    _prepareToScene(): boolean;
    diffuseColor: Vector3;
}
