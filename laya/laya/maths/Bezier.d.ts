export declare class Bezier {
    static I: Bezier;
    private _controlPoints;
    private _calFun;
    private _switchPoint;
    getPoint2(t: number, rst: any[]): void;
    getPoint3(t: number, rst: any[]): void;
    insertPoints(count: number, rst: any[]): void;
    getBezierPoints(pList: any[], inSertCount?: number, count?: number): any[];
}
