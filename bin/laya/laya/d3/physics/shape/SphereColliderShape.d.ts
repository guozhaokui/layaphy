import { ColliderShape } from "./ColliderShape";
export declare class SphereColliderShape extends ColliderShape {
    private _radius;
    readonly radius: number;
    constructor(radius?: number);
    clone(): any;
}
