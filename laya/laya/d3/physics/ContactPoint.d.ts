import { PhysicsComponent } from "./PhysicsComponent";
import { Vector3 } from "../math/Vector3";
export declare class ContactPoint {
    colliderA: PhysicsComponent;
    colliderB: PhysicsComponent;
    distance: number;
    normal: Vector3;
    positionOnA: Vector3;
    positionOnB: Vector3;
    constructor();
}
