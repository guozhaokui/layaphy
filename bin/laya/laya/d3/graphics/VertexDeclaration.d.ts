import { VertexElement } from "./VertexElement";
export declare class VertexDeclaration {
    readonly id: number;
    readonly vertexStride: number;
    readonly vertexElementCount: number;
    constructor(vertexStride: number, vertexElements: Array<VertexElement>);
    getVertexElementByIndex(index: number): VertexElement;
}
