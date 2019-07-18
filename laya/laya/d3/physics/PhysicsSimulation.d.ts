import { Quaternion } from "../math/Quaternion";
import { Ray } from "../math/Ray";
import { Vector3 } from "../math/Vector3";
import { Constraint3D } from "./Constraint3D";
import { HitResult } from "./HitResult";
import { ColliderShape } from "./shape/ColliderShape";
export declare class PhysicsSimulation {
    static disableSimulation: boolean;
    static createConstraint(): void;
    maxSubSteps: number;
    fixedTimeStep: number;
    continuousCollisionDetection: boolean;
    gravity: Vector3;
    raycastFromTo(from: Vector3, to: Vector3, out?: HitResult, collisonGroup?: number, collisionMask?: number): boolean;
    raycastAllFromTo(from: Vector3, to: Vector3, out: HitResult[], collisonGroup?: number, collisionMask?: number): boolean;
    rayCast(ray: Ray, outHitResult?: HitResult, distance?: number, collisonGroup?: number, collisionMask?: number): boolean;
    rayCastAll(ray: Ray, out: HitResult[], distance?: number, collisonGroup?: number, collisionMask?: number): boolean;
    shapeCast(shape: ColliderShape, fromPosition: Vector3, toPosition: Vector3, out?: HitResult, fromRotation?: Quaternion, toRotation?: Quaternion, collisonGroup?: number, collisionMask?: number, allowedCcdPenetration?: number): boolean;
    shapeCastAll(shape: ColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult[], fromRotation?: Quaternion, toRotation?: Quaternion, collisonGroup?: number, collisionMask?: number, allowedCcdPenetration?: number): boolean;
    addConstraint(constraint: Constraint3D, disableCollisionsBetweenLinkedBodies?: boolean): void;
    removeConstraint(constraint: Constraint3D): void;
    clearForces(): void;
}
