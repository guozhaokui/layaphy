export declare class Log {
    private static _logdiv;
    private static _btn;
    private static _count;
    static maxCount: number;
    static autoScrollToBottom: boolean;
    static enable(): void;
    static toggle(): void;
    static print(value: string): void;
    static clear(): void;
}
