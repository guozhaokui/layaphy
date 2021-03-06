export declare class CubeInfoArray {
    static Add: number;
    static Delete: number;
    static Updata: number;
    currentPosindex: number;
    PositionArray: number[];
    currentColorindex: number;
    colorArray: number[];
    Layar: number;
    dx: number;
    dy: number;
    dz: number;
    sizex: number;
    sizey: number;
    sizez: number;
    complete: Function;
    operation: number;
    clear(): void;
    constructor();
    static create(): CubeInfoArray;
    dispose(): void;
    static recover(cubeinfoArray: CubeInfoArray): void;
    append(x: number, y: number, z: number, color: number): void;
    find(x: number, y: number, z: number): number;
    removefind(): void;
    private listObject;
    private _rotation;
    private _v3;
    maxminXYZ: Int32Array;
    private midx;
    private midy;
    private midz;
    setToCube(x: number, y: number, z: number, color: number): void;
    calMidxyz(): void;
    rotation(x?: number, y?: number, z?: number): void;
    scale(x?: number, y?: number, z?: number): void;
}
