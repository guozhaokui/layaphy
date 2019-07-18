import { CubePhysicsCompnent } from "./CubePhysicsCompnent";
import { CubeMeshManager } from "./CubeMeshManager";
import { CubeMap } from "../Cube/CubeMap";
import { Vector3 } from "laya/d3/math/Vector3";
import { CubeInfoArray } from "../worldMaker/CubeInfoArray";
export declare class CubeEditCubeCollider extends CubePhysicsCompnent {
    data: any;
    collisionCube: Vector3;
    cubeProperty: number;
    constructor();
    onAwake(): void;
    dataAdd(x: number, y: number, z: number, color: number): void;
    find(x: number, y: number, z: number): number;
    clear(): void;
    InitCubemap(cubemap: CubeMap, cubeMeshManager: CubeMeshManager): void;
    InitCubeInfoArray(cubeinfoArray: CubeInfoArray): void;
    isCollision(other: CubePhysicsCompnent): number;
}
