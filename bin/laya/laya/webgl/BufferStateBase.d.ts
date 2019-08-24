export declare class BufferStateBase {
    private _nativeVertexArrayObject;
    constructor();
    bind(): void;
    unBind(): void;
    destroy(): void;
    bindForNative(): void;
    unBindForNative(): void;
}
