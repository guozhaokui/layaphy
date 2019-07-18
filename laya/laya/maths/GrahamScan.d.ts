import { Point } from "./Point";
export declare class GrahamScan {
    private static _mPointList;
    private static _tempPointList;
    private static _temPList;
    private static _temArr;
    static multiply(p1: Point, p2: Point, p0: Point): number;
    static dis(p1: Point, p2: Point): number;
    private static _getPoints;
    static getFrom(rst: any[], src: any[], count: number): any[];
    static getFromR(rst: any[], src: any[], count: number): any[];
    static pListToPointList(pList: any[], tempUse?: boolean): any[];
    static pointListToPlist(pointList: any[]): any[];
    static scanPList(pList: any[]): any[];
    static scan(PointSet: any[]): any[];
}
