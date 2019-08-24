export declare class EventDispatcher {
    static MOUSE_EVENTS: any;
    private _events;
    hasListener(type: string): boolean;
    event(type: string, data?: any): boolean;
    on(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    once(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    off(type: string, caller: any, listener: Function, onceOnly?: boolean): EventDispatcher;
    offAll(type?: string): EventDispatcher;
    offAllCaller(caller: any): EventDispatcher;
    private _recoverHandlers;
    isMouseEvent(type: string): boolean;
}
