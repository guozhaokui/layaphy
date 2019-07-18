export declare class TouchManager {
    static I: TouchManager;
    private static _oldArr;
    private static _newArr;
    private static _tEleArr;
    private preOvers;
    private preDowns;
    private preRightDowns;
    enable: boolean;
    private _lastClickTime;
    private _clearTempArrs;
    private getTouchFromArr;
    private removeTouchFromArr;
    private createTouchO;
    onMouseDown(ele: any, touchID: number, isLeft?: boolean): void;
    private sendEvents;
    private getEles;
    private checkMouseOutAndOverOfMove;
    onMouseMove(ele: any, touchID: number): void;
    getLastOvers(): any[];
    stageMouseOut(): void;
    onMouseUp(ele: any, touchID: number, isLeft?: boolean): void;
}
