import { AnimationBase } from "./AnimationBase";
export declare class FrameAnimation extends AnimationBase {
    private static _sortIndexFun;
    _targetDic: any;
    _animationData: any;
    protected _usedFrames: any[];
    constructor();
    clear(): AnimationBase;
    protected _displayToIndex(value: number): void;
    protected _displayNodeToFrame(node: any, frame: number, targetDic?: any): void;
    private _calculateDatas;
    protected _calculateKeyFrames(node: any): void;
    resetNodes(): void;
    private _calculateNodePropFrames;
    private _dealKeyFrame;
    private _calculateFrameValues;
}
