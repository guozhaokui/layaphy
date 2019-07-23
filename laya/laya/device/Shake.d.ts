import { EventDispatcher } from "laya/events/EventDispatcher";
export declare class Shake extends EventDispatcher {
    private throushold;
    private shakeInterval;
    private callback;
    private lastX;
    private lastY;
    private lastZ;
    private lastMillSecond;
    constructor();
    private static _instance;
    static readonly instance: Shake;
    start(throushold: number, interval: number): void;
    stop(): void;
    private onShake;
    private isShaked;
}
