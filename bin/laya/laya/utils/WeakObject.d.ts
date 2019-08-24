export declare class WeakObject {
    static supportWeakMap: boolean;
    static delInterval: number;
    static I: WeakObject;
    private static _keys;
    private static _maps;
    static clearCache(): void;
    constructor();
    set(key: any, value: any): void;
    get(key: any): any;
    del(key: any): void;
    has(key: any): boolean;
}
