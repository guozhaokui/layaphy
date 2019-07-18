export declare class CallLater {
    static I: CallLater;
    private _pool;
    private _map;
    private _laters;
    private _getHandler;
    callLater(caller: any, method: Function, args?: any[]): void;
    runCallLater(caller: any, method: Function): void;
}
