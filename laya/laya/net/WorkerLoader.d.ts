import { EventDispatcher } from "../events/EventDispatcher";
export declare class WorkerLoader extends EventDispatcher {
    static I: WorkerLoader;
    static workerPath: string;
    private static _preLoadFun;
    private static _enable;
    private static _tryEnabled;
    worker: Worker;
    protected _useWorkerLoader: boolean;
    constructor();
    static workerSupported(): boolean;
    static enableWorkerLoader(): void;
    static enable: boolean;
    private workerMessage;
    private imageLoaded;
    loadImage(url: string): void;
    protected _loadImage(url: string): void;
}
