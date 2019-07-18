export declare class PoolCache {
    sign: string;
    maxCount: number;
    getCacheList(): any[];
    tryDispose(force: boolean): void;
    static addPoolCacheManager(sign: string, maxCount?: number): void;
}
