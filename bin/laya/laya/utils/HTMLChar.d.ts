export declare class HTMLChar {
    private static _isWordRegExp;
    x: number;
    y: number;
    width: number;
    height: number;
    isWord: boolean;
    char: string;
    charNum: number;
    style: any;
    constructor();
    setData(char: string, w: number, h: number, style: any): HTMLChar;
    reset(): HTMLChar;
    recover(): void;
    static create(): HTMLChar;
}
