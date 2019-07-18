import { AccelerationInfo } from "./AccelerationInfo";
import { EventDispatcher } from "../../events/EventDispatcher";
export declare class Accelerator extends EventDispatcher {
    private static _instance;
    static readonly instance: Accelerator;
    private static acceleration;
    private static accelerationIncludingGravity;
    private static rotationRate;
    private static onChrome;
    constructor(singleton: number);
    on(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    off(type: string, caller: any, listener: Function, onceOnly?: boolean): EventDispatcher;
    private onDeviceOrientationChange;
    private static transformedAcceleration;
    static getTransformedAcceleration(acceleration: AccelerationInfo): AccelerationInfo;
}
