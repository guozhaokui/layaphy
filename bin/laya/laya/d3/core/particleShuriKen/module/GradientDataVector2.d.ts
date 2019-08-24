import { IClone } from "../../IClone";
import { Vector2 } from "../../../math/Vector2";
export declare class GradientDataVector2 implements IClone {
    private _currentLength;
    readonly gradientCount: number;
    constructor();
    add(key: number, value: Vector2): void;
    cloneTo(destObject: any): void;
    clone(): any;
}
