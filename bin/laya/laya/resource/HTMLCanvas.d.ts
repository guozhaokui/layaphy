import { Bitmap } from "./Bitmap";
import { Texture } from "./Texture";
import { Context } from "./Context";
export declare class HTMLCanvas extends Bitmap {
    private _ctx;
    readonly source: any;
    constructor(createCanvas?: boolean);
    clear(): void;
    destroy(): void;
    release(): void;
    readonly context: Context;
    getContext(contextID: string, other?: any): Context;
    getMemSize(): number;
    size(w: number, h: number): void;
    getTexture(): Texture;
    toBase64(type: string, encoderOptions: number): string;
    toBase64Async(type: string, encoderOptions: number, callBack: Function): void;
}
