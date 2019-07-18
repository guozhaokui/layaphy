import { ColliderBase } from "./ColliderBase";
export declare class ChainCollider extends ColliderBase {
    private _x;
    private _y;
    private _points;
    private _loop;
    protected getDef(): any;
    private _setShape;
    x: number;
    y: number;
    points: string;
    loop: boolean;
}
