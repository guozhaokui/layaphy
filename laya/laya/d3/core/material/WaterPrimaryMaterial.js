import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "./BaseMaterial";
export class WaterPrimaryMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("WaterPrimary");
        this._shaderValues.setVector(WaterPrimaryMaterial.HORIZONCOLOR, new Vector4(0.172, 0.463, 0.435, 0));
        this._shaderValues.setNumber(WaterPrimaryMaterial.WAVESCALE, 0.15);
        this._shaderValues.setVector(WaterPrimaryMaterial.WAVESPEED, new Vector4(19, 9, -16, -7));
    }
    static __initDefine__() {
        WaterPrimaryMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        WaterPrimaryMaterial.SHADERDEFINE_MAINTEXTURE = WaterPrimaryMaterial.shaderDefines.registerDefine("MAINTEXTURE");
        WaterPrimaryMaterial.SHADERDEFINE_NORMALTEXTURE = WaterPrimaryMaterial.shaderDefines.registerDefine("NORMALTEXTURE");
    }
    get horizonColor() {
        return this._shaderValues.getVector(WaterPrimaryMaterial.HORIZONCOLOR);
    }
    set horizonColor(value) {
        this._shaderValues.setVector(WaterPrimaryMaterial.HORIZONCOLOR, value);
    }
    get mainTexture() {
        return this._shaderValues.getTexture(WaterPrimaryMaterial.MAINTEXTURE);
    }
    set mainTexture(value) {
        if (value)
            this._shaderValues.addDefine(WaterPrimaryMaterial.SHADERDEFINE_MAINTEXTURE);
        else
            this._shaderValues.removeDefine(WaterPrimaryMaterial.SHADERDEFINE_MAINTEXTURE);
        this._shaderValues.setTexture(WaterPrimaryMaterial.MAINTEXTURE, value);
    }
    get normalTexture() {
        return this._shaderValues.getTexture(WaterPrimaryMaterial.NORMALTEXTURE);
    }
    set normalTexture(value) {
        if (value)
            this._shaderValues.addDefine(WaterPrimaryMaterial.SHADERDEFINE_NORMALTEXTURE);
        else
            this._shaderValues.removeDefine(WaterPrimaryMaterial.SHADERDEFINE_NORMALTEXTURE);
        this._shaderValues.setTexture(WaterPrimaryMaterial.NORMALTEXTURE, value);
    }
    get waveScale() {
        return this._shaderValues.getNumber(WaterPrimaryMaterial.WAVESCALE);
    }
    set waveScale(value) {
        this._shaderValues.setNumber(WaterPrimaryMaterial.WAVESCALE, value);
    }
    get waveSpeed() {
        return this._shaderValues.getVector(WaterPrimaryMaterial.WAVESPEED);
    }
    set waveSpeed(value) {
        this._shaderValues.setVector(WaterPrimaryMaterial.WAVESPEED, value);
    }
    clone() {
        var dest = new WaterPrimaryMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
WaterPrimaryMaterial.HORIZONCOLOR = Shader3D.propertyNameToID("u_HorizonColor");
WaterPrimaryMaterial.MAINTEXTURE = Shader3D.propertyNameToID("u_MainTexture");
WaterPrimaryMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
WaterPrimaryMaterial.WAVESCALE = Shader3D.propertyNameToID("u_WaveScale");
WaterPrimaryMaterial.WAVESPEED = Shader3D.propertyNameToID("u_WaveSpeed");
WaterPrimaryMaterial.shaderDefines = null;
