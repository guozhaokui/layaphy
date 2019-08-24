import { Sprite } from "../display/Sprite";
import { ParticleSetting } from "./ParticleSetting";
import { Context } from "../resource/Context";
import { EmitterBase } from "./emitter/EmitterBase";
export declare class Particle2D extends Sprite {
    private _matrix4;
    private _particleTemplate;
    private _canvasTemplate;
    private _emitter;
    autoPlay: boolean;
    tempCmd: any;
    constructor(setting: ParticleSetting);
    url: string;
    load(url: string): void;
    setParticleSetting(setting: ParticleSetting): void;
    readonly emitter: EmitterBase;
    play(): void;
    stop(): void;
    private _loop;
    advanceTime(passedTime?: number): void;
    customRender(context: Context, x: number, y: number): void;
    destroy(destroyChild?: boolean): void;
}
