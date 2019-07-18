export declare class Stat {
    static FPS: number;
    static loopCount: number;
    static shaderCall: number;
    static renderBatches: number;
    static savedRenderBatches: number;
    static trianglesFaces: number;
    static spriteCount: number;
    static spriteRenderUseCacheCount: number;
    static frustumCulling: number;
    static octreeNodeCulling: number;
    static canvasNormal: number;
    static canvasBitmap: number;
    static canvasReCache: number;
    static renderSlow: boolean;
    static gpuMemory: number;
    static cpuMemory: number;
    static _fpsStr: string;
    static _canvasStr: string;
    static _spriteStr: string;
    static _fpsData: any[];
    static _timer: number;
    static _count: number;
    static show(x?: number, y?: number): void;
    static enable(): void;
    static hide(): void;
    static clear(): void;
    static onclick: Function;
}
