export declare class LayaGPU {
    private static _extentionVendorPrefixes;
    private _gl;
    private _vaoExt;
    private _angleInstancedArrays;
    constructor(gl: any, isWebGL2: boolean);
    private _getExtension;
    createVertexArray(): any;
    bindVertexArray(vertexArray: any): void;
    deleteVertexArray(vertexArray: any): void;
    isVertexArray(vertexArray: any): void;
    drawElementsInstanced(mode: number, count: number, type: number, offset: number, instanceCount: number): void;
    drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void;
    vertexAttribDivisor(index: number, divisor: number): void;
    supportInstance(): boolean;
}
