import { Component } from "../../components/Component";
import { PhysicsComponent } from "./PhysicsComponent";
export declare class PhysicsTriggerComponent extends PhysicsComponent {
    isTrigger: boolean;
    constructor(collisionGroup: number, canCollideWith: number);
    _onAdded(): void;
    _cloneTo(dest: Component): void;
}
