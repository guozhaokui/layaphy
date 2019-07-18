import { Handler } from "../utils/Handler";
import { Sprite } from "../display/Sprite";
import { Tween } from "../utils/Tween";
import { Component } from "../components/Component";
export declare class EffectBase extends Component {
    duration: number;
    delay: number;
    repeat: number;
    ease: string;
    eventName: string;
    target: Sprite;
    autoDestroyAtComplete: boolean;
    protected _comlete: Handler;
    protected _tween: Tween;
    protected _onAwake(): void;
    protected _exeTween(): void;
    protected _doTween(): Tween;
    onReset(): void;
}
