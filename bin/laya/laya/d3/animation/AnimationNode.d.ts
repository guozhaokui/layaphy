import { IClone } from "../core/IClone";
export declare class AnimationNode implements IClone {
    private _children;
    name: string;
    constructor(localPosition?: Float32Array, localRotation?: Float32Array, localScale?: Float32Array, worldMatrix?: Float32Array);
    addChild(child: AnimationNode): void;
    removeChild(child: AnimationNode): void;
    getChildByName(name: string): AnimationNode;
    getChildByIndex(index: number): AnimationNode;
    getChildCount(): number;
    cloneTo(destObject: any): void;
    clone(): any;
}
