import { Matrix4x4 } from "../math/Matrix4x4";
import { Ray } from "../math/Ray";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Viewport } from "../math/Viewport";
export declare class Picker {
    private static _tempVector30;
    private static _tempVector31;
    private static _tempVector32;
    private static _tempVector33;
    private static _tempVector34;
    constructor();
    static calculateCursorRay(point: Vector2, viewPort: Viewport, projectionMatrix: Matrix4x4, viewMatrix: Matrix4x4, world: Matrix4x4, out: Ray): void;
    static rayIntersectsTriangle(ray: Ray, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3): number;
}
