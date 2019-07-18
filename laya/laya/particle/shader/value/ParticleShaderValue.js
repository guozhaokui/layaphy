import { ParticleShader } from "../ParticleShader";
import { Value2D } from "../../../webgl/shader/d2/value/Value2D";
import { RenderState2D } from "../../../webgl/utils/RenderState2D";
export class ParticleShaderValue extends Value2D {
    constructor() {
        super(0, 0);
        if (!ParticleShaderValue.pShader) {
            ParticleShaderValue.pShader = new ParticleShader();
        }
    }
    upload() {
        var size = this.size;
        size[0] = RenderState2D.width;
        size[1] = RenderState2D.height;
        this.alpha = this.ALPHA * RenderState2D.worldAlpha;
        ParticleShaderValue.pShader.upload(this);
    }
}
ParticleShaderValue.pShader = null;
