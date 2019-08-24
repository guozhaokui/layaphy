import { PostProcessEffect } from "./PostProcessEffect";
import { PostProcessRenderContext } from "./PostProcessRenderContext";
import { Color } from "../../math/Color";
import { Texture2D } from "../../../resource/Texture2D";
export declare class BloomEffect extends PostProcessEffect {
    clamp: number;
    color: Color;
    fastMode: boolean;
    dirtTexture: Texture2D;
    intensity: number;
    threshold: number;
    softKnee: number;
    diffusion: number;
    anamorphicRatio: number;
    dirtIntensity: number;
    constructor();
    render(context: PostProcessRenderContext): void;
}
