export declare class LocalStorage {
    static _baseClass: any;
    static items: any;
    static support: boolean;
    static __init__(): boolean;
    static setItem(key: string, value: string): void;
    static getItem(key: string): string;
    static setJSON(key: string, value: any): void;
    static getJSON(key: string): any;
    static removeItem(key: string): void;
    static clear(): void;
}
