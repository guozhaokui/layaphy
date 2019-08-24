import { Vector3 } from "../math/Vector3";
import { PhysicsComponent } from "./PhysicsComponent";
import { ColliderShape } from "./shape/ColliderShape";
import { Component } from "../../components/Component";
export declare class CharacterController extends PhysicsComponent {
    static UPAXIS_X: number;
    static UPAXIS_Y: number;
    static UPAXIS_Z: number;
    fallSpeed: number;
    jumpSpeed: number;
    gravity: Vector3;
    maxSlope: number;
    readonly isGrounded: boolean;
    stepHeight: number;
    upAxis: Vector3;
    constructor(stepheight?: number, upAxis?: Vector3, collisionGroup?: number, canCollideWith?: number);
    _onShapeChange(colShape: ColliderShape): void;
    _onAdded(): void;
    _addToSimulation(): void;
    _removeFromSimulation(): void;
    _cloneTo(dest: Component): void;
    protected _onDestroy(): void;
    move(movement: Vector3): void;
    jump(velocity?: Vector3): void;
}
