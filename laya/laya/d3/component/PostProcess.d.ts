import { PostProcessEffect } from "../core/render/PostProcessEffect";
export declare class PostProcess {
    private _compositeShader;
    private _compositeShaderData;
    private _effects;
    constructor();
    addEffect(effect: PostProcessEffect): void;
    removeEffect(effect: PostProcessEffect): void;
}
