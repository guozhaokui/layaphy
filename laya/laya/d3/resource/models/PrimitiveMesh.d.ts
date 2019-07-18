import { Mesh } from "./Mesh";
export declare class PrimitiveMesh {
    static __init__(): void;
    static createBox(long?: number, height?: number, width?: number): Mesh;
    static createCapsule(radius?: number, height?: number, stacks?: number, slices?: number): Mesh;
    static createCone(radius?: number, height?: number, slices?: number): Mesh;
    static createCylinder(radius?: number, height?: number, slices?: number): Mesh;
    static createPlane(long?: number, width?: number, stacks?: number, slices?: number): Mesh;
    static createQuad(long?: number, width?: number): Mesh;
    static createSphere(radius?: number, stacks?: number, slices?: number): Mesh;
}
