import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
export declare class PixelLineData {
    startPosition: Vector3;
    endPosition: Vector3;
    startColor: Color;
    endColor: Color;
    cloneTo(destObject: PixelLineData): void;
}
