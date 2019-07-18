import { LightSprite } from "./LightSprite";
export declare class SpotLight extends LightSprite {
    private static _tempMatrix0;
    private static _tempMatrix1;
    private _direction;
    private _spotAngle;
    private _range;
    spotAngle: number;
    range: number;
    protected _onActive(): void;
    protected _onInActive(): void;
    _prepareToScene(): boolean;
    _parse(data: any, spriteMap: any): void;
}
