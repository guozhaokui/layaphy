import { ColliderBase } from "./ColliderBase";
export declare class CircleCollider extends ColliderBase {
    private static _temp;
    private _x;
    private _y;
    private _radius;
    protected getDef(): any;
    private _setShape;
    x: number;
    y: number;
    radius: number;
    resetShape(re?: boolean): void;
}
