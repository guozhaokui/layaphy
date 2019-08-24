export declare class StringKey {
    private _strsToID;
    private _idToStrs;
    private _length;
    add(str: string): number;
    getID(str: string): number;
    getName(id: number): string;
}
