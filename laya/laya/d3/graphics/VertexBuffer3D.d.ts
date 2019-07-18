import { Buffer } from "../../webgl/utils/Buffer";
import { VertexDeclaration } from "./VertexDeclaration";
export declare class VertexBuffer3D extends Buffer {
    static DATATYPE_FLOAT32ARRAY: number;
    static DATATYPE_UINT8ARRAY: number;
    vertexDeclaration: VertexDeclaration;
    readonly vertexCount: number;
    readonly canRead: boolean;
    constructor(byteLength: number, bufferUsage: number, canRead?: boolean);
    bind(): boolean;
    setData(buffer: ArrayBuffer, bufferOffset?: number, dataStartIndex?: number, dataCount?: number): void;
    getUint8Data(): Uint8Array;
    getFloat32Data(): Float32Array;
    markAsUnreadbale(): void;
    destroy(): void;
}
