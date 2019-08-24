import { AnimationClip } from "../animation/AnimationClip";
import { AnimatorStateScript } from "../animation/AnimatorStateScript";
import { IClone } from "../core/IClone";
import { IReferenceCounter } from "../resource/IReferenceCounter";
export declare class AnimatorState implements IReferenceCounter, IClone {
    private _referenceCount;
    name: string;
    speed: number;
    clipStart: number;
    clipEnd: number;
    clip: AnimationClip;
    constructor();
    _getReferenceCount(): number;
    _addReference(count?: number): void;
    _removeReference(count?: number): void;
    _clearReference(): void;
    addScript(type: new () => any): AnimatorStateScript;
    getScript(type: new () => any): AnimatorStateScript;
    getScripts(type: new () => any): AnimatorStateScript[];
    cloneTo(destObject: any): void;
    clone(): any;
}
