import { PhysicsComponent } from "./PhysicsComponent";
import { Vector3 } from "../math/Vector3";
export declare class HitResult {
    succeeded: boolean;
    collider: PhysicsComponent;
    point: Vector3;
    normal: Vector3;
    hitFraction: number;
    constructor();
}
