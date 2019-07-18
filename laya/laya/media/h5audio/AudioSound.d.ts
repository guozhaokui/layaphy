import { EventDispatcher } from "../../events/EventDispatcher";
import { SoundChannel } from "../SoundChannel";
export declare class AudioSound extends EventDispatcher {
    private static _audioCache;
    url: string;
    audio: HTMLAudioElement;
    loaded: boolean;
    dispose(): void;
    private static _makeMusicOK;
    load(url: string): void;
    play(startTime?: number, loops?: number): SoundChannel;
    readonly duration: number;
}
