import { Vector4 } from "../../math/Vector4";
export class RenderState {
    constructor() {
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.srcBlend = RenderState.BLENDPARAM_ONE;
        this.dstBlend = RenderState.BLENDPARAM_ZERO;
        this.srcBlendRGB = RenderState.BLENDPARAM_ONE;
        this.dstBlendRGB = RenderState.BLENDPARAM_ZERO;
        this.srcBlendAlpha = RenderState.BLENDPARAM_ONE;
        this.dstBlendAlpha = RenderState.BLENDPARAM_ZERO;
        this.blendConstColor = new Vector4(1, 1, 1, 1);
        this.blendEquation = RenderState.BLENDEQUATION_ADD;
        this.blendEquationRGB = RenderState.BLENDEQUATION_ADD;
        this.blendEquationAlpha = RenderState.BLENDEQUATION_ADD;
        this.depthTest = RenderState.DEPTHTEST_LEQUAL;
        this.depthWrite = true;
    }
    cloneTo(dest) {
        var destState = dest;
        destState.cull = this.cull;
        destState.blend = this.blend;
        destState.srcBlend = this.srcBlend;
        destState.dstBlend = this.dstBlend;
        destState.srcBlendRGB = this.srcBlendRGB;
        destState.dstBlendRGB = this.dstBlendRGB;
        destState.srcBlendAlpha = this.srcBlendAlpha;
        destState.dstBlendAlpha = this.dstBlendAlpha;
        this.blendConstColor.cloneTo(destState.blendConstColor);
        destState.blendEquation = this.blendEquation;
        destState.blendEquationRGB = this.blendEquationRGB;
        destState.blendEquationAlpha = this.blendEquationAlpha;
        destState.depthTest = this.depthTest;
        destState.depthWrite = this.depthWrite;
    }
    clone() {
        var dest = new RenderState();
        this.cloneTo(dest);
        return dest;
    }
}
RenderState.CULL_NONE = 0;
RenderState.CULL_FRONT = 1;
RenderState.CULL_BACK = 2;
RenderState.BLEND_DISABLE = 0;
RenderState.BLEND_ENABLE_ALL = 1;
RenderState.BLEND_ENABLE_SEPERATE = 2;
RenderState.BLENDPARAM_ZERO = 0;
RenderState.BLENDPARAM_ONE = 1;
RenderState.BLENDPARAM_SRC_COLOR = 0x0300;
RenderState.BLENDPARAM_ONE_MINUS_SRC_COLOR = 0x0301;
RenderState.BLENDPARAM_DST_COLOR = 0x0306;
RenderState.BLENDPARAM_ONE_MINUS_DST_COLOR = 0x0307;
RenderState.BLENDPARAM_SRC_ALPHA = 0x0302;
RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA = 0x0303;
RenderState.BLENDPARAM_DST_ALPHA = 0x0304;
RenderState.BLENDPARAM_ONE_MINUS_DST_ALPHA = 0x0305;
RenderState.BLENDPARAM_SRC_ALPHA_SATURATE = 0x0308;
RenderState.BLENDEQUATION_ADD = 0;
RenderState.BLENDEQUATION_SUBTRACT = 1;
RenderState.BLENDEQUATION_REVERSE_SUBTRACT = 2;
RenderState.DEPTHTEST_OFF = 0;
RenderState.DEPTHTEST_NEVER = 0x0200;
RenderState.DEPTHTEST_LESS = 0x0201;
RenderState.DEPTHTEST_EQUAL = 0x0202;
RenderState.DEPTHTEST_LEQUAL = 0x0203;
RenderState.DEPTHTEST_GREATER = 0x0204;
RenderState.DEPTHTEST_NOTEQUAL = 0x0205;
RenderState.DEPTHTEST_GEQUAL = 0x0206;
RenderState.DEPTHTEST_ALWAYS = 0x0207;
