import { LightSprite } from "./LightSprite";
export declare class PointLight extends LightSprite {
    private static _tempMatrix0;
    private _range;
    private _lightMatrix;
    constructor();
    range: number;
    protected _onActive(): void;
    protected _onInActive(): void;
    _prepareToScene(): boolean;
    _parse(data: any, spriteMap: any): void;
}
