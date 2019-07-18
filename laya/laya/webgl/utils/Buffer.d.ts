export declare class Buffer {
    static _bindedVertexBuffer: any;
    static _bindedIndexBuffer: any;
    protected _glBuffer: any;
    protected _buffer: any;
    protected _bufferType: number;
    protected _bufferUsage: number;
    _byteLength: number;
    readonly bufferUsage: number;
    constructor();
    _bindForVAO(): void;
    bind(): boolean;
    destroy(): void;
}
