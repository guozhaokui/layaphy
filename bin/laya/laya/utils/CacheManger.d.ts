export declare class CacheManger {
    static loopTimeLimit: number;
    private static _cacheList;
    private static _index;
    constructor();
    static regCacheByFunction(disposeFunction: Function, getCacheListFunction: Function): void;
    static unRegCacheByFunction(disposeFunction: Function, getCacheListFunction: Function): void;
    static forceDispose(): void;
    static beginCheck(waitTime?: number): void;
    static stopCheck(): void;
    private static _checkLoop;
}
