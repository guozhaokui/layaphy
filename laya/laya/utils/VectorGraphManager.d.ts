export declare class VectorGraphManager {
    static instance: VectorGraphManager;
    useDic: any;
    shapeDic: any;
    shapeLineDic: any;
    private _id;
    private _checkKey;
    private _freeIdArray;
    constructor();
    static getInstance(): VectorGraphManager;
    getId(): number;
    addShape(id: number, shape: any): void;
    addLine(id: number, Line: any): void;
    getShape(id: number): void;
    deleteShape(id: number): void;
    getCacheList(): any[];
    startDispose(key: boolean): void;
    endDispose(): void;
}
