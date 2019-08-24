import { Component } from "../../components/Component";
import { PhysicsSimulation } from "./PhysicsSimulation";
import { ColliderShape } from "./shape/ColliderShape";
export declare class PhysicsComponent extends Component {
    canScaleShape: boolean;
    restitution: number;
    friction: number;
    rollingFriction: number;
    ccdMotionThreshold: number;
    ccdSweptSphereRadius: number;
    readonly isActive: boolean;
    enabled: boolean;
    colliderShape: ColliderShape;
    readonly simulation: PhysicsSimulation;
    collisionGroup: number;
    canCollideWith: number;
    constructor(collisionGroup: number, canCollideWith: number);
    _parse(data: any): void;
    protected _onEnable(): void;
    protected _onDisable(): void;
    _onAdded(): void;
    protected _onDestroy(): void;
    _cloneTo(dest: Component): void;
}
