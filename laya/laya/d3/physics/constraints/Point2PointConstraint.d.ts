import { Vector3 } from "../../math/Vector3";
export declare class Point2PointConstraint {
    pivotInA: Vector3;
    pivotInB: Vector3;
    damping: number;
    impulseClamp: number;
    tau: number;
    constructor();
}
