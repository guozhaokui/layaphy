import { ParticleTemplateBase } from "../ParticleTemplateBase";
export declare class EmitterBase {
    protected _frameTime: number;
    protected _emissionRate: number;
    protected _emissionTime: number;
    minEmissionTime: number;
    particleTemplate: ParticleTemplateBase;
    emissionRate: number;
    start(duration?: number): void;
    stop(): void;
    clear(): void;
    emit(): void;
    advanceTime(passedTime?: number): void;
}
