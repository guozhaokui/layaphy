import { Sprite } from "../display/Sprite";
import { UIComponent } from "./UIComponent";
export declare class TipManager extends UIComponent {
    static offsetX: number;
    static offsetY: number;
    static tipTextColor: string;
    static tipBackColor: string;
    static tipDelay: number;
    private _tipBox;
    private _tipText;
    private _defaultTipHandler;
    constructor();
    private _onStageHideTip;
    private _onStageShowTip;
    private _showTip;
    private _onStageMouseDown;
    private _onStageMouseMove;
    private _showToStage;
    closeAll(): void;
    showDislayTip(tip: Sprite): void;
    private _showDefaultTip;
    defaultTipHandler: Function;
}
