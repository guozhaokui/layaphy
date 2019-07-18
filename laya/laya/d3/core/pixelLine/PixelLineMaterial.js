import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "../material/BaseMaterial";
export class PixelLineMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("LineShader");
        this._shaderValues.setVector(PixelLineMaterial.COLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
    }
    static __initDefine__() {
        PixelLineMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
    }
    get color() {
        return this._shaderValues.getVector(PixelLineMaterial.COLOR);
    }
    set color(value) {
        this._shaderValues.setVector(PixelLineMaterial.COLOR, value);
    }
    set depthWrite(value) {
        this._shaderValues.setBool(PixelLineMaterial.DEPTH_WRITE, value);
    }
    get depthWrite() {
        return this._shaderValues.getBool(PixelLineMaterial.DEPTH_WRITE);
    }
    set cull(value) {
        this._shaderValues.setInt(PixelLineMaterial.CULL, value);
    }
    get cull() {
        return this._shaderValues.getInt(PixelLineMaterial.CULL);
    }
    set blend(value) {
        this._shaderValues.setInt(PixelLineMaterial.BLEND, value);
    }
    get blend() {
        return this._shaderValues.getInt(PixelLineMaterial.BLEND);
    }
    set blendSrc(value) {
        this._shaderValues.setInt(PixelLineMaterial.BLEND_SRC, value);
    }
    get blendSrc() {
        return this._shaderValues.getInt(PixelLineMaterial.BLEND_SRC);
    }
    set blendDst(value) {
        this._shaderValues.setInt(PixelLineMaterial.BLEND_DST, value);
    }
    get blendDst() {
        return this._shaderValues.getInt(PixelLineMaterial.BLEND_DST);
    }
    set depthTest(value) {
        this._shaderValues.setInt(PixelLineMaterial.DEPTH_TEST, value);
    }
    get depthTest() {
        return this._shaderValues.getInt(PixelLineMaterial.DEPTH_TEST);
    }
    clone() {
        var dest = new PixelLineMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
PixelLineMaterial.COLOR = Shader3D.propertyNameToID("u_Color");
PixelLineMaterial.shaderDefines = null;
PixelLineMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
PixelLineMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
PixelLineMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
PixelLineMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
PixelLineMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
PixelLineMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
