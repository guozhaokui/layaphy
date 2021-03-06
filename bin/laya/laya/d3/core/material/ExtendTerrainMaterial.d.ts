import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { BaseMaterial } from "./BaseMaterial";
export declare class ExtendTerrainMaterial extends BaseMaterial {
    static RENDERMODE_OPAQUE: number;
    static RENDERMODE_TRANSPARENT: number;
    static SPLATALPHATEXTURE: number;
    static DIFFUSETEXTURE1: number;
    static DIFFUSETEXTURE2: number;
    static DIFFUSETEXTURE3: number;
    static DIFFUSETEXTURE4: number;
    static DIFFUSETEXTURE5: number;
    static DIFFUSESCALEOFFSET1: number;
    static DIFFUSESCALEOFFSET2: number;
    static DIFFUSESCALEOFFSET3: number;
    static DIFFUSESCALEOFFSET4: number;
    static DIFFUSESCALEOFFSET5: number;
    static CULL: number;
    static BLEND: number;
    static BLEND_SRC: number;
    static BLEND_DST: number;
    static DEPTH_TEST: number;
    static DEPTH_WRITE: number;
    static SHADERDEFINE_DETAIL_NUM1: number;
    static SHADERDEFINE_DETAIL_NUM2: number;
    static SHADERDEFINE_DETAIL_NUM3: number;
    static SHADERDEFINE_DETAIL_NUM4: number;
    static SHADERDEFINE_DETAIL_NUM5: number;
    private _enableLighting;
    splatAlphaTexture: BaseTexture;
    diffuseTexture1: BaseTexture;
    diffuseTexture2: BaseTexture;
    diffuseTexture3: BaseTexture;
    diffuseTexture4: BaseTexture;
    diffuseTexture5: BaseTexture;
    private _setDetailNum;
    diffuseScaleOffset1: Vector4;
    diffuseScaleOffset2: Vector4;
    diffuseScaleOffset3: Vector4;
    diffuseScaleOffset4: Vector4;
    diffuseScaleOffset5: Vector4;
    enableLighting: boolean;
    renderMode: number;
    depthWrite: boolean;
    cull: number;
    blend: number;
    blendSrc: number;
    blendDst: number;
    depthTest: number;
    constructor();
    clone(): any;
}
