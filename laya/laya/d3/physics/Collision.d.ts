import { ContactPoint } from "./ContactPoint";
import { PhysicsComponent } from "./PhysicsComponent";
export declare class Collision {
    contacts: ContactPoint[];
    other: PhysicsComponent;
    constructor();
}
