import { SoundChannel } from "./SoundChannel";
import { EventDispatcher } from "../events/EventDispatcher";
export declare class Sound extends EventDispatcher {
    load(url: string): void;
    play(startTime?: number, loops?: number): SoundChannel;
    readonly duration: number;
    dispose(): void;
}
