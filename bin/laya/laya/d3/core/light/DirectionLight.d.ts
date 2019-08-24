import { LightSprite } from "./LightSprite";
export declare class DirectionLight extends LightSprite {
    private _direction;
    shadow: boolean;
    constructor();
    private _initShadow;
    protected _onActive(): void;
    protected _onInActive(): void;
    _prepareToScene(): boolean;
}
