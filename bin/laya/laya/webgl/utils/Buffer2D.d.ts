import { WebGLContext } from "../WebGLContext";
import { Buffer } from "./Buffer";
export declare class Buffer2D extends Buffer {
    static FLOAT32: number;
    static SHORT: number;
    static __int__(gl: WebGLContext): void;
    protected _maxsize: number;
    _upload: boolean;
    protected _uploadSize: number;
    protected _bufferSize: number;
    protected _u8Array: Uint8Array;
    readonly bufferLength: number;
    byteLength: number;
    setByteLength(value: number): void;
    needSize(sz: number): number;
    constructor();
    protected _bufferData(): void;
    protected _bufferSubData(offset?: number, dataStart?: number, dataLength?: number): void;
    protected _checkArrayUse(): void;
    _bind_uploadForVAO(): boolean;
    _bind_upload(): boolean;
    _bind_subUpload(offset?: number, dataStart?: number, dataLength?: number): boolean;
    _resizeBuffer(nsz: number, copy: boolean): Buffer2D;
    append(data: any): void;
    appendU16Array(data: Uint16Array, len: number): void;
    appendEx(data: any, type: new (buf: any, len: any) => any): void;
    appendEx2(data: any, type: new (buff: any, len: any) => any, dataLen: number, perDataLen?: number): void;
    getBuffer(): ArrayBuffer;
    setNeedUpload(): void;
    getNeedUpload(): boolean;
    upload(): boolean;
    subUpload(offset?: number, dataStart?: number, dataLength?: number): boolean;
    protected _disposeResource(): void;
    clear(): void;
}
