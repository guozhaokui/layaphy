import { Sprite } from "../../display/Sprite";
import { HTMLStyle } from "../utils/HTMLStyle";
export declare class HTMLDivElement extends Sprite {
    private _recList;
    private _innerHTML;
    private _repaintState;
    constructor();
    destroy(destroyChild?: boolean): void;
    private _htmlDivRepaint;
    private _updateGraphicWork;
    private _setGraphicDirty;
    private _doClears;
    private _updateGraphic;
    readonly style: HTMLStyle;
    innerHTML: string;
    private _refresh;
    readonly contextWidth: number;
    readonly contextHeight: number;
    private _onMouseClick;
    private _eventLink;
}
