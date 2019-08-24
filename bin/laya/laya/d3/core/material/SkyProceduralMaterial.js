import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "./BaseMaterial";
export class SkyProceduralMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("SkyBoxProcedural");
        this.sunDisk = SkyProceduralMaterial.SUN_HIGH_QUALITY;
        this.sunSize = 0.04;
        this.sunSizeConvergence = 5;
        this.atmosphereThickness = 1.0;
        this.skyTint = new Vector4(0.5, 0.5, 0.5, 1.0);
        this.groundTint = new Vector4(0.369, 0.349, 0.341, 1.0);
        this.exposure = 1.3;
    }
    static __initDefine__() {
        SkyProceduralMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        SkyProceduralMaterial.SHADERDEFINE_SUN_HIGH_QUALITY = SkyProceduralMaterial.shaderDefines.registerDefine("SUN_HIGH_QUALITY");
        SkyProceduralMaterial.SHADERDEFINE_SUN_SIMPLE = SkyProceduralMaterial.shaderDefines.registerDefine("SUN_SIMPLE");
    }
    get sunDisk() {
        return this._sunDisk;
    }
    set sunDisk(value) {
        switch (value) {
            case SkyProceduralMaterial.SUN_HIGH_QUALITY:
                this._shaderValues.removeDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_SIMPLE);
                this._shaderValues.addDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_HIGH_QUALITY);
                break;
            case SkyProceduralMaterial.SUN_SIMPLE:
                this._shaderValues.removeDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_HIGH_QUALITY);
                this._shaderValues.addDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_SIMPLE);
                break;
            case SkyProceduralMaterial.SUN_NODE:
                this._shaderValues.removeDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_HIGH_QUALITY);
                this._shaderValues.removeDefine(SkyProceduralMaterial.SHADERDEFINE_SUN_SIMPLE);
                break;
            default:
                throw "SkyBoxProceduralMaterial: unknown sun value.";
        }
        this._sunDisk = value;
    }
    get sunSize() {
        return this._shaderValues.getNumber(SkyProceduralMaterial.SUNSIZE);
    }
    set sunSize(value) {
        value = Math.min(Math.max(0.0, value), 1.0);
        this._shaderValues.setNumber(SkyProceduralMaterial.SUNSIZE, value);
    }
    get sunSizeConvergence() {
        return this._shaderValues.getNumber(SkyProceduralMaterial.SUNSIZECONVERGENCE);
    }
    set sunSizeConvergence(value) {
        value = Math.min(Math.max(0.0, value), 20.0);
        this._shaderValues.setNumber(SkyProceduralMaterial.SUNSIZECONVERGENCE, value);
    }
    get atmosphereThickness() {
        return this._shaderValues.getNumber(SkyProceduralMaterial.ATMOSPHERETHICKNESS);
    }
    set atmosphereThickness(value) {
        value = Math.min(Math.max(0.0, value), 5.0);
        this._shaderValues.setNumber(SkyProceduralMaterial.ATMOSPHERETHICKNESS, value);
    }
    get skyTint() {
        return this._shaderValues.getVector(SkyProceduralMaterial.SKYTINT);
    }
    set skyTint(value) {
        this._shaderValues.setVector(SkyProceduralMaterial.SKYTINT, value);
    }
    get groundTint() {
        return this._shaderValues.getVector(SkyProceduralMaterial.GROUNDTINT);
    }
    set groundTint(value) {
        this._shaderValues.setVector(SkyProceduralMaterial.GROUNDTINT, value);
    }
    get exposure() {
        return this._shaderValues.getNumber(SkyProceduralMaterial.EXPOSURE);
    }
    set exposure(value) {
        value = Math.min(Math.max(0.0, value), 8.0);
        this._shaderValues.setNumber(SkyProceduralMaterial.EXPOSURE, value);
    }
    clone() {
        var dest = new SkyProceduralMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
SkyProceduralMaterial.SUN_NODE = 0;
SkyProceduralMaterial.SUN_SIMPLE = 1;
SkyProceduralMaterial.SUN_HIGH_QUALITY = 2;
SkyProceduralMaterial.SUNSIZE = Shader3D.propertyNameToID("u_SunSize");
SkyProceduralMaterial.SUNSIZECONVERGENCE = Shader3D.propertyNameToID("u_SunSizeConvergence");
SkyProceduralMaterial.ATMOSPHERETHICKNESS = Shader3D.propertyNameToID("u_AtmosphereThickness");
SkyProceduralMaterial.SKYTINT = Shader3D.propertyNameToID("u_SkyTint");
SkyProceduralMaterial.GROUNDTINT = Shader3D.propertyNameToID("u_GroundTint");
SkyProceduralMaterial.EXPOSURE = Shader3D.propertyNameToID("u_Exposure");
SkyProceduralMaterial.shaderDefines = null;
