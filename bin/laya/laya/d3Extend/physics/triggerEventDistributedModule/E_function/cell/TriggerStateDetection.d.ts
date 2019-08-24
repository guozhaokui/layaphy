export declare class TriggerStateDetection {
    private _lastTriggerQueue;
    private _triggerQueue;
    constructor();
    allTriggerDetection(staticSprite3DQueue: any, dynamicSprite3DQueue: any): void;
    private singleTriggerDetection;
    private getKey;
    readonly lastTriggerQueue: any;
    readonly triggerQueue: any;
}
