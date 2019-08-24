import { CubeInfo } from "./CubeInfo";
import { Vector3 } from "laya/d3/math/Vector3";
export declare class CubeMap {
    static SIZE: number;
    static CUBESIZE: number;
    static CUBENUMS: number;
    data: any;
    length: number;
    private _fenKuaiArray;
    xMax: number;
    xMin: number;
    yMax: number;
    yMin: number;
    zMax: number;
    zMin: number;
    constructor();
    add(x: number, y: number, z: number, value: any): void;
    check32(x: number, y: number, z: number): any;
    add2(x: number, y: number, z: number, value: any): void;
    find(x: number, y: number, z: number): any;
    remove(x: number, y: number, z: number): void;
    clear(): void;
    saveData(): any[];
    returnData(): any[];
    returnAllCube(): CubeInfo[];
    checkColor(colorNum: number): boolean;
    modolCenter(): Vector3;
}
