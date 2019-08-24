import { EventDispatcher } from "../events/EventDispatcher";
import { Handler } from "../utils/Handler";
export declare class SoundChannel extends EventDispatcher {
    url: string;
    loops: number;
    startTime: number;
    isStopped: boolean;
    completeHandler: Handler;
    volume: number;
    readonly position: number;
    readonly duration: number;
    play(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    protected __runComplete(handler: Handler): void;
}
