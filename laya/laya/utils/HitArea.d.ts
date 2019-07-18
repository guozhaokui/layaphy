import { Graphics } from "../display/Graphics";
export declare class HitArea {
    private static _cmds;
    private static _rect;
    private static _ptPoint;
    private _hit;
    private _unHit;
    contains(x: number, y: number): boolean;
    static _isHitGraphic(x: number, y: number, graphic: Graphics): boolean;
    hit: Graphics;
    unHit: Graphics;
}
