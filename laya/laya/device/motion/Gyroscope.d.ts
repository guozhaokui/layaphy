import { EventDispatcher } from "../../events/EventDispatcher";
export declare class Gyroscope extends EventDispatcher {
    private static info;
    private static _instance;
    static readonly instance: Gyroscope;
    constructor(singleton: number);
    on(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    off(type: string, caller: any, listener: Function, onceOnly?: boolean): EventDispatcher;
    private onDeviceOrientationChange;
}
