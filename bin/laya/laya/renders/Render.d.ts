import { Context } from "../resource/Context";
import { HTMLCanvas } from "../resource/HTMLCanvas";
export declare class Render {
    static supportWebGLPlusCulling: boolean;
    static supportWebGLPlusAnimation: boolean;
    static supportWebGLPlusRendering: boolean;
    static isConchApp: boolean;
    static is3DMode: boolean;
    constructor(width: number, height: number, mainCanv: HTMLCanvas);
    private _timeId;
    private _onVisibilitychange;
    initRender(canvas: HTMLCanvas, w: number, h: number): boolean;
    private _enterFrame;
    static readonly context: Context;
    static readonly canvas: any;
}
