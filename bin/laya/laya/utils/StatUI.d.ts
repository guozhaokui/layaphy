import { IStatRender } from "./IStatRender";
export declare class StatUI extends IStatRender {
    private static _fontSize;
    private _txt;
    private _leftText;
    private _canvas;
    private _ctx;
    private _first;
    private _vx;
    private _width;
    private _height;
    private _view;
    show(x?: number, y?: number): void;
    private createUIPre;
    private createUI;
    enable(): void;
    hide(): void;
    set_onclick(fn: Function): void;
    loop(): void;
    private renderInfoPre;
    private renderInfo;
    isCanvasRender(): boolean;
    renderNotCanvas(ctx: any, x: number, y: number): void;
}
