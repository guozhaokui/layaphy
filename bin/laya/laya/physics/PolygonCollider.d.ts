import { ColliderBase } from "./ColliderBase";
export declare class PolygonCollider extends ColliderBase {
    private _x;
    private _y;
    private _points;
    protected getDef(): any;
    private _setShape;
    x: number;
    y: number;
    points: string;
}
