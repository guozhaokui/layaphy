import { Rectangle } from "../maths/Rectangle";
export declare class GraphicsBounds {
    private static _tempMatrix;
    private static _initMatrix;
    private static _tempPoints;
    private static _tempMatrixArrays;
    private static _tempCmds;
    private _temp;
    private _bounds;
    private _rstBoundPoints;
    private _cacheBoundsType;
    destroy(): void;
    static create(): GraphicsBounds;
    reset(): void;
    getBounds(realSize?: boolean): Rectangle;
    getBoundPoints(realSize?: boolean): any[];
    private _getCmdPoints;
    private _switchMatrix;
    private static _addPointArrToRst;
    private static _addPointToRst;
    private _getPiePoints;
    private _getTriAngBBXPoints;
    private _getDraw9GridBBXPoints;
    private _getPathPoints;
}
