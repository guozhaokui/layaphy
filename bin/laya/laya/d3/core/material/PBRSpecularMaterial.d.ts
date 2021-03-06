import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { BaseMaterial } from "./BaseMaterial";
export declare class PBRSpecularMaterial extends BaseMaterial {
    static SmoothnessSource_SpecularTexture_Alpha: number;
    static SmoothnessSource_AlbedoTexture_Alpha: number;
    static RENDERMODE_OPAQUE: number;
    static RENDERMODE_CUTOUT: number;
    static RENDERMODE_FADE: number;
    static RENDERMODE_TRANSPARENT: number;
    static SHADERDEFINE_ALBEDOTEXTURE: number;
    static SHADERDEFINE_NORMALTEXTURE: number;
    static SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA: number;
    static SHADERDEFINE_SPECULARTEXTURE: number;
    static SHADERDEFINE_OCCLUSIONTEXTURE: number;
    static SHADERDEFINE_PARALLAXTEXTURE: number;
    static SHADERDEFINE_EMISSION: number;
    static SHADERDEFINE_EMISSIONTEXTURE: number;
    static SHADERDEFINE_TILINGOFFSET: number;
    static SHADERDEFINE_ALPHAPREMULTIPLY: number;
    static ALBEDOTEXTURE: number;
    static SPECULARTEXTURE: number;
    static NORMALTEXTURE: number;
    static PARALLAXTEXTURE: number;
    static OCCLUSIONTEXTURE: number;
    static EMISSIONTEXTURE: number;
    static ALBEDOCOLOR: number;
    static SPECULARCOLOR: number;
    static EMISSIONCOLOR: number;
    static SMOOTHNESS: number;
    static SMOOTHNESSSCALE: number;
    static SMOOTHNESSSOURCE: number;
    static OCCLUSIONSTRENGTH: number;
    static NORMALSCALE: number;
    static PARALLAXSCALE: number;
    static ENABLEEMISSION: number;
    static ENABLEREFLECT: number;
    static TILINGOFFSET: number;
    static CULL: number;
    static BLEND: number;
    static BLEND_SRC: number;
    static BLEND_DST: number;
    static DEPTH_TEST: number;
    static DEPTH_WRITE: number;
    static defaultMaterial: PBRSpecularMaterial;
    private _albedoColor;
    private _specularColor;
    private _emissionColor;
    albedoColorR: number;
    albedoColorG: number;
    albedoColorB: number;
    albedoColorA: number;
    albedoColor: Vector4;
    albedoTexture: BaseTexture;
    normalTexture: BaseTexture;
    normalTextureScale: number;
    parallaxTexture: BaseTexture;
    parallaxTextureScale: number;
    occlusionTexture: BaseTexture;
    occlusionTextureStrength: number;
    specularTexture: BaseTexture;
    specularColorR: number;
    specularColorG: number;
    specularColorB: number;
    specularColorA: number;
    specularColor: Vector4;
    smoothness: number;
    smoothnessTextureScale: number;
    smoothnessSource: number;
    enableEmission: boolean;
    emissionColor: Vector4;
    emissionTexture: BaseTexture;
    enableReflection: boolean;
    tilingOffsetX: number;
    tilingOffsetY: number;
    tilingOffsetZ: number;
    tilingOffsetW: number;
    tilingOffset: Vector4;
    renderMode: number;
    depthWrite: boolean;
    cull: number;
    blend: number;
    blendSrc: number;
    blendDst: number;
    depthTest: number;
    constructor();
    clone(): any;
    cloneTo(destObject: any): void;
}
