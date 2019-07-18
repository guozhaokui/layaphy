import { ParticleSetting } from "./ParticleSetting";
import { Texture } from "../resource/Texture";
export declare class ParticleTemplateBase {
    settings: ParticleSetting;
    protected texture: Texture;
    constructor();
    addParticleArray(position: Float32Array, velocity: Float32Array): void;
}
