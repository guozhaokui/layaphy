import { Sprite } from "laya/display/Sprite";
export declare class Video extends Sprite {
    static MP4: number;
    static OGG: number;
    static CAMERA: number;
    static WEBM: number;
    static SUPPORT_PROBABLY: string;
    static SUPPORT_MAYBY: string;
    static SUPPORT_NO: string;
    private htmlVideo;
    private videoElement;
    private internalTexture;
    constructor(width?: number, height?: number);
    private static onAbort;
    private static onCanplay;
    private static onCanplaythrough;
    private static onDurationchange;
    private static onEmptied;
    private static onError;
    private static onLoadeddata;
    private static onLoadedmetadata;
    private static onLoadstart;
    private static onPause;
    private static onPlay;
    private static onPlaying;
    private static onProgress;
    private static onRatechange;
    private static onSeeked;
    private static onSeeking;
    private static onStalled;
    private static onSuspend;
    private static onTimeupdate;
    private static onVolumechange;
    private static onWaiting;
    private onPlayComplete;
    load(url: string): void;
    play(): void;
    pause(): void;
    reload(): void;
    canPlayType(type: number): string;
    private renderCanvas;
    private onDocumentClick;
    readonly buffered: any;
    readonly currentSrc: string;
    currentTime: number;
    volume: number;
    readonly readyState: any;
    readonly videoWidth: number;
    readonly videoHeight: number;
    readonly duration: number;
    readonly ended: boolean;
    readonly error: boolean;
    loop: boolean;
    x: number;
    y: number;
    playbackRate: number;
    muted: boolean;
    readonly paused: boolean;
    preload: string;
    readonly seekable: any;
    readonly seeking: boolean;
    size(width: number, height: number): Sprite;
    width: number;
    height: number;
    destroy(detroyChildren?: boolean): void;
    private syncVideoPosition;
}
