import { Node } from "../../display/Node";
import { Handler } from "../../utils/Handler";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Transform3D } from "./Transform3D";
import { ICreateResource } from "../../resource/ICreateResource";
export declare class Sprite3D extends Node implements ICreateResource {
    static HIERARCHY: string;
    static instantiate(original: Sprite3D, parent?: Node, worldPositionStays?: boolean, position?: Vector3, rotation?: Quaternion): Sprite3D;
    static load(url: string, complete: Handler): void;
    readonly id: number;
    layer: number;
    readonly url: string;
    readonly isStatic: boolean;
    readonly transform: Transform3D;
    constructor(name?: string, isStatic?: boolean);
    _setCreateURL(url: string): void;
    protected _onAdded(): void;
    protected _onRemoved(): void;
    _parse(data: any, spriteMap: any): void;
    _cloneTo(destObject: any, srcRoot: Node, dstRoot: Node): void;
    clone(): Node;
    destroy(destroyChild?: boolean): void;
}
