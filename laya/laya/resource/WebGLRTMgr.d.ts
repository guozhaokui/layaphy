import { RenderTexture2D } from "./RenderTexture2D";
export declare class WebGLRTMgr {
    private static dict;
    static getRT(w: number, h: number): RenderTexture2D;
    static releaseRT(rt: RenderTexture2D): void;
}
