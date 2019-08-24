import { BaseTexture } from "../../resource/BaseTexture";
export declare class RenderTexture extends BaseTexture {
    static readonly currentActive: RenderTexture;
    static createFromPool(width: number, height: number, format?: number, depthStencilFormat?: number, filterMode?: number): RenderTexture;
    static recoverToPool(renderTexture: RenderTexture): void;
    readonly depthStencilFormat: number;
    readonly defaulteTexture: BaseTexture;
    constructor(width: number, height: number, format?: number, depthStencilFormat?: number);
    getData(x: number, y: number, width: number, height: number, out: Uint8Array): Uint8Array;
    protected _disposeResource(): void;
}
