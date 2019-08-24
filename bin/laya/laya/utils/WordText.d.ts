export declare class WordText {
    id: number;
    save: any[];
    toUpperCase: string;
    changed: boolean;
    width: number;
    pageChars: any[];
    startID: number;
    startIDStroke: number;
    lastGCCnt: number;
    splitRender: boolean;
    setText(txt: string): void;
    toString(): string;
    readonly length: number;
    charCodeAt(i: number): number;
    charAt(i: number): string;
    cleanCache(): void;
}
