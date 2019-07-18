import { AnimationEvent } from "./AnimationEvent";
import { Resource } from "../../resource/Resource";
import { Handler } from "../../utils/Handler";
export declare class AnimationClip extends Resource {
    static ANIMATIONCLIP: string;
    static _parse(data: any, propertyParams?: any, constructParams?: any[]): AnimationClip;
    static load(url: string, complete: Handler): void;
    islooping: boolean;
    duration(): number;
    constructor();
    private _hermiteInterpolate;
    private _hermiteInterpolateVector3;
    private _hermiteInterpolateQuaternion;
    _evaluateClipDatasRealTimeForNative(nodes: any, playCurTime: number, realTimeCurrentFrameIndexes: Uint16Array, addtive: boolean): void;
    private _evaluateFrameNodeVector3DatasRealTime;
    private _evaluateFrameNodeQuaternionDatasRealTime;
    private _binarySearchEventIndex;
    addEvent(event: AnimationEvent): void;
    protected _disposeResource(): void;
}
