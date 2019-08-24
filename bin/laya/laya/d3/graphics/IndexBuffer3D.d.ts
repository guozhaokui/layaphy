import { Buffer } from "../../webgl/utils/Buffer";
export declare class IndexBuffer3D extends Buffer {
    static INDEXTYPE_UBYTE: string;
    static INDEXTYPE_USHORT: string;
    readonly indexType: string;
    readonly indexTypeByteCount: number;
    readonly indexCount: number;
    readonly canRead: boolean;
    constructor(indexType: string, indexCount: number, bufferUsage?: number, canRead?: boolean);
    _bindForVAO(): void;
    bind(): boolean;
    setData(data: any, bufferOffset?: number, dataStartIndex?: number, dataCount?: number): void;
    getData(): Uint16Array;
    destroy(): void;
}
