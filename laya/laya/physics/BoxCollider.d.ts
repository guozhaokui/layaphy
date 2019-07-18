import { ColliderBase } from "./ColliderBase";
export declare class BoxCollider extends ColliderBase {
    private static _temp;
    private _x;
    private _y;
    private _width;
    private _height;
    protected getDef(): any;
    private _setShape;
    x: number;
    y: number;
    width: number;
    height: number;
    resetShape(re?: boolean): void;
}
