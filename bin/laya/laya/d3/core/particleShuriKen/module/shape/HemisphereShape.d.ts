import { BaseShape } from "./BaseShape";
import { BoundBox } from "../../../../math/BoundBox";
import { Rand } from "../../../../math/Rand";
import { Vector3 } from "../../../../math/Vector3";
export declare class HemisphereShape extends BaseShape {
    radius: number;
    emitFromShell: boolean;
    constructor();
    protected _getShapeBoundBox(boundBox: BoundBox): void;
    protected _getSpeedBoundBox(boundBox: BoundBox): void;
    generatePositionAndDirection(position: Vector3, direction: Vector3, rand?: Rand, randomSeeds?: Uint32Array): void;
    cloneTo(destObject: any): void;
}
