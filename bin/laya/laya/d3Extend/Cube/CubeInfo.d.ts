//import { SubCubeGeometry } from "SubCubeGeometry";
export declare class CubeInfo {
    static _aoFactor: number;
    static aoFactor: number[];
    static Objcect0down: any[];
    static Objcect0front: any[];
    static Objcect0right: any[];
    static Objcect1down: any[];
    static Objcect1left: any[];
    static Objcect1front: any[];
    static Objcect2down: any[];
    static Objcect2back: any[];
    static Objcect2right: any[];
    static Objcect3down: any[];
    static Objcect3left: any[];
    static Objcect3back: any[];
    static Objcect4up: any[];
    static Objcect4front: any[];
    static Objcect4right: any[];
    static Objcect5up: any[];
    static Objcect5left: any[];
    static Objcect5front: any[];
    static Objcect6up: any[];
    static Objcect6back: any[];
    static Objcect6right: any[];
    static Objcect7up: any[];
    static Objcect7back: any[];
    static Objcect7left: any[];
    static PanduanWei: Int32Array;
    static MODIFYE_NONE: number;
    static MODIFYE_ADD: number;
    static MODIFYE_REMOVE: number;
    static MODIFYE_UPDATE: number;
    static MODIFYE_UPDATEAO: number;
    static MODIFYE_UPDATEPROPERTY: number;
    frontFaceAO: Int32Array;
    static _pool: any[];
    selectArrayIndex: number[];
    static create(x: number, y: number, z: number): CubeInfo;
    static recover(cube: CubeInfo): void;
    subCube: any;
    updateCube: any;
    x: number;
    y: number;
    z: number;
    color: number;
    point: number;
    modifyFlag: number;
    frontVBIndex: number;
    backVBIndex: number;
    leftVBIndex: number;
    rightVBIndex: number;
    topVBIndex: number;
    downVBIndex: number;
    modifyIndex: number;
    cubeProperty: number;
    constructor(_x: number, _y: number, _z: number);
    update(): void;
    clearAoData(): void;
    static Cal24Object(): void;
    private static CalOneObjectKeyValue;
    calDirectCubeExit(Wei: number): number;
    getVBPointbyFaceIndex(faceIndex: number): number;
    returnColorProperty(): number;
    ClearSelectArray(): void;
}
