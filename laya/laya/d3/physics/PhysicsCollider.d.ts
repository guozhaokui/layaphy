import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
export declare class PhysicsCollider extends PhysicsTriggerComponent {
    constructor(collisionGroup?: number, canCollideWith?: number);
    _addToSimulation(): void;
    _removeFromSimulation(): void;
    _onTransformChanged(flag: number): void;
    _parse(data: any): void;
    _onAdded(): void;
}
