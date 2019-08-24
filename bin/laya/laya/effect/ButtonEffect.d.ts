import { Sprite } from "../display/Sprite";
export declare class ButtonEffect {
    private _tar;
    private _curState;
    private _curTween;
    effectScale: number;
    tweenTime: number;
    effectEase: string;
    backEase: string;
    target: Sprite;
    private toChangedState;
    private toInitState;
    private tweenComplete;
}
