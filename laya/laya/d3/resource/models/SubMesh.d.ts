import { GeometryElement } from "../../core/GeometryElement";
import { Mesh } from "./Mesh";
export declare class SubMesh extends GeometryElement {
    readonly indexCount: number;
    constructor(mesh: Mesh);
    getIndices(): Uint16Array;
    setIndices(indices: Uint16Array): void;
    destroy(): void;
}
