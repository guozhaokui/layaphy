import { Mesh } from "./Mesh";
import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration";
export declare class PrimitiveMesh {
    static __init__(): void;
    static _createMesh(vertexDeclaration: VertexDeclaration, vertices: Float32Array, indices: Uint16Array): Mesh
    static createBox(long?: number, height?: number, width?: number): Mesh;
    static createCapsule(radius?: number, height?: number, stacks?: number, slices?: number): Mesh;
    static createCone(radius?: number, height?: number, slices?: number): Mesh;
    static createCylinder(radius?: number, height?: number, slices?: number): Mesh;
    static createPlane(long?: number, width?: number, stacks?: number, slices?: number): Mesh;
    static createQuad(long?: number, width?: number): Mesh;
    static createSphere(radius?: number, stacks?: number, slices?: number): Mesh;
}
