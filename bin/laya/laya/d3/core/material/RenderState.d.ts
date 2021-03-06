import { IClone } from "../IClone";
import { Vector4 } from "../../math/Vector4";
export declare class RenderState implements IClone {
    static CULL_NONE: number;
    static CULL_FRONT: number;
    static CULL_BACK: number;
    static BLEND_DISABLE: number;
    static BLEND_ENABLE_ALL: number;
    static BLEND_ENABLE_SEPERATE: number;
    static BLENDPARAM_ZERO: number;
    static BLENDPARAM_ONE: number;
    static BLENDPARAM_SRC_COLOR: number;
    static BLENDPARAM_ONE_MINUS_SRC_COLOR: number;
    static BLENDPARAM_DST_COLOR: number;
    static BLENDPARAM_ONE_MINUS_DST_COLOR: number;
    static BLENDPARAM_SRC_ALPHA: number;
    static BLENDPARAM_ONE_MINUS_SRC_ALPHA: number;
    static BLENDPARAM_DST_ALPHA: number;
    static BLENDPARAM_ONE_MINUS_DST_ALPHA: number;
    static BLENDPARAM_SRC_ALPHA_SATURATE: number;
    static BLENDEQUATION_ADD: number;
    static BLENDEQUATION_SUBTRACT: number;
    static BLENDEQUATION_REVERSE_SUBTRACT: number;
    static DEPTHTEST_OFF: number;
    static DEPTHTEST_NEVER: number;
    static DEPTHTEST_LESS: number;
    static DEPTHTEST_EQUAL: number;
    static DEPTHTEST_LEQUAL: number;
    static DEPTHTEST_GREATER: number;
    static DEPTHTEST_NOTEQUAL: number;
    static DEPTHTEST_GEQUAL: number;
    static DEPTHTEST_ALWAYS: number;
    cull: number;
    blend: number;
    srcBlend: number;
    dstBlend: number;
    srcBlendRGB: number;
    dstBlendRGB: number;
    srcBlendAlpha: number;
    dstBlendAlpha: number;
    blendConstColor: Vector4;
    blendEquation: number;
    blendEquationRGB: number;
    blendEquationAlpha: number;
    depthTest: number;
    depthWrite: boolean;
    constructor();
    cloneTo(dest: any): void;
    clone(): any;
}
