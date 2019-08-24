import { IClone } from "../../../IClone";
import { Rand } from "../../../../math/Rand";
import { Vector3 } from "../../../../math/Vector3";
export declare class BaseShape implements IClone {
    enable: boolean;
    randomDirection: boolean;
    constructor();
    generatePositionAndDirection(position: Vector3, direction: Vector3, rand?: Rand, randomSeeds?: Uint32Array): void;
    cloneTo(destObject: any): void;
    clone(): any;
}
