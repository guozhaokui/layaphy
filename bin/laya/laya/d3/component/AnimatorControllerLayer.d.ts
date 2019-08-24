import { AnimatorState } from "./AnimatorState";
import { IClone } from "../core/IClone";
import { IReferenceCounter } from "../resource/IReferenceCounter";
export declare class AnimatorControllerLayer implements IReferenceCounter, IClone {
    private _defaultState;
    private _referenceCount;
    name: string;
    blendingMode: number;
    defaultWeight: number;
    playOnWake: boolean;
    defaultState: AnimatorState;
    constructor(name: string);
    private _removeClip;
    _getReferenceCount(): number;
    _addReference(count?: number): void;
    _removeReference(count?: number): void;
    _clearReference(): void;
    addState(state: AnimatorState): void;
    removeState(state: AnimatorState): void;
    cloneTo(destObject: any): void;
    clone(): any;
}
