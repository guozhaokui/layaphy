import { Burst } from "./Burst";
import { IClone } from "../../IClone";
import { IDestroy } from "../../../../resource/IDestroy";
export declare class Emission implements IClone, IDestroy {
    private _destroyed;
    private _emissionRate;
    enbale: boolean;
    emissionRate: number;
    readonly destroyed: boolean;
    constructor();
    destroy(): void;
    getBurstsCount(): number;
    getBurstByIndex(index: number): Burst;
    addBurst(burst: Burst): void;
    removeBurst(burst: Burst): void;
    removeBurstByIndex(index: number): void;
    clearBurst(): void;
    cloneTo(destObject: any): void;
    clone(): any;
}
