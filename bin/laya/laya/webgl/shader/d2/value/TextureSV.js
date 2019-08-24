import { Value2D } from "./Value2D";
import { WebGL } from "../../../WebGL";
import { ShaderDefines2D } from "../ShaderDefines2D";
export class TextureSV extends Value2D {
    constructor(subID = 0) {
        super(ShaderDefines2D.TEXTURE2D, subID);
        this.strength = 0;
        this.blurInfo = null;
        this.colorMat = null;
        this.colorAlpha = null;
        this._attribLocation = ['posuv', 0, 'attribColor', 1, 'attribFlags', 2];
    }
    clear() {
        this.texture = null;
        this.shader = null;
        this.defines._value = this.subID + (WebGL.shaderHighPrecision ? ShaderDefines2D.SHADERDEFINE_FSHIGHPRECISION : 0);
    }
}
