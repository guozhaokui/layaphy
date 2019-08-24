import { Sprite } from "../display/Sprite";
import { Handler } from "../utils/Handler";
export declare class SoundNode extends Sprite {
    url: string;
    private _channel;
    private _tar;
    private _playEvents;
    private _stopEvents;
    constructor();
    private _onParentChange;
    play(loops?: number, complete?: Handler): void;
    stop(): void;
    private _setPlayAction;
    private _setPlayActions;
    playEvent: string;
    target: Sprite;
    stopEvent: string;
}
