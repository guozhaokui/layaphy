import { FrameAnimation } from "./FrameAnimation";
export declare class EffectAnimation extends FrameAnimation {
    private static EFFECT_BEGIN;
    private _target;
    private _playEvent;
    private _initData;
    private _aniKeys;
    private _effectClass;
    target: any;
    private _onOtherBegin;
    playEvent: string;
    private _addEvent;
    private _onPlayAction;
    play(start?: any, loop?: boolean, name?: string): void;
    private _recordInitData;
    effectClass: string;
    effectData: any;
    protected _displayToIndex(value: number): void;
    protected _displayNodeToFrame(node: any, frame: number, targetDic?: any): void;
    protected _calculateKeyFrames(node: any): void;
}
