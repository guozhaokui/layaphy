import { SoundChannel } from "../SoundChannel";
export declare class AudioSoundChannel extends SoundChannel {
    private _audio;
    private _onEnd;
    private _resumePlay;
    constructor(audio: HTMLAudioElement);
    private __onEnd;
    private __resumePlay;
    play(): void;
    readonly position: number;
    readonly duration: number;
    stop(): void;
    pause(): void;
    resume(): void;
    volume: number;
}
