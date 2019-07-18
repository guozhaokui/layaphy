import { IClone } from "./IClone";
import { Animator } from "../component/Animator";
import { Resource } from "../../resource/Resource";
import { Handler } from "../../utils/Handler";
export declare class Avatar extends Resource implements IClone {
    static AVATAR: string;
    static _parse(data: any, propertyParams?: any, constructParams?: any[]): Avatar;
    static load(url: string, complete: Handler): void;
    private _nativeNodeCount;
    constructor();
    private _initCloneToAnimator;
    private _parseNode;
    _cloneDatasToAnimator(destAnimator: Animator): void;
    cloneTo(destObject: any): void;
    clone(): any;
}
