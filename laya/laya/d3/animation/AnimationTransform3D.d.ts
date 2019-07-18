import { AnimationNode } from "./AnimationNode";
import { EventDispatcher } from "../../events/EventDispatcher";
export declare class AnimationTransform3D extends EventDispatcher {
    private static _tempVector3;
    private static _angleToRandin;
    private _localMatrix;
    private _worldMatrix;
    private _localPosition;
    private _localRotation;
    private _localScale;
    private _localQuaternionUpdate;
    private _locaEulerlUpdate;
    private _localUpdate;
    private _parent;
    private _children;
    constructor(owner: AnimationNode, localPosition?: Float32Array, localRotation?: Float32Array, localScale?: Float32Array, worldMatrix?: Float32Array);
    private _getlocalMatrix;
    private _onWorldTransform;
    getWorldMatrix(): Float32Array;
    setParent(value: AnimationTransform3D): void;
}
