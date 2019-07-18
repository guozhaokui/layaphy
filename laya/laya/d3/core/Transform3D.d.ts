import { EventDispatcher } from "../../events/EventDispatcher";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Sprite3D } from "./Sprite3D";
export declare class Transform3D extends EventDispatcher {
    readonly owner: Sprite3D;
    readonly worldNeedUpdate: boolean;
    localPositionX: number;
    localPositionY: number;
    localPositionZ: number;
    localPosition: Vector3;
    localRotationX: number;
    localRotationY: number;
    localRotationZ: number;
    localRotationW: number;
    localRotation: Quaternion;
    localScaleX: number;
    localScaleY: number;
    localScaleZ: number;
    localScale: Vector3;
    localRotationEulerX: number;
    localRotationEulerY: number;
    localRotationEulerZ: number;
    localRotationEuler: Vector3;
    localMatrix: Matrix4x4;
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    rotationEuler: Vector3;
    worldMatrix: Matrix4x4;
    constructor(owner: Sprite3D);
    translate(translation: Vector3, isLocal?: boolean): void;
    rotate(rotation: Vector3, isLocal?: boolean, isRadian?: boolean): void;
    getForward(forward: Vector3): void;
    getUp(up: Vector3): void;
    getRight(right: Vector3): void;
    lookAt(target: Vector3, up: Vector3, isLocal?: boolean): void;
}
