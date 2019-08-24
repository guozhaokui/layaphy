import { IClone } from "./laya/d3/core/IClone";
import { Vector3 } from "./laya/d3/math/Vector3";
export declare class Config3D implements IClone {
    static _default: Config3D;
    private _defaultPhysicsMemory;
    _editerEnvironment: boolean;
    isAntialias: boolean;
    isAlpha: boolean;
    premultipliedAlpha: boolean;
    isStencil: boolean;
    octreeCulling: boolean;
    octreeInitialSize: number;
    octreeInitialCenter: Vector3;
    octreeMinNodeSize: number;
    octreeLooseness: number;
    debugFrustumCulling: boolean;
    defaultPhysicsMemory: number;
    constructor();
    cloneTo(dest: any): void;
    clone(): any;
}
