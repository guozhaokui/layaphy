import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { Vector4 } from "laya/d3/math/Vector4";
import { ShaderDefines } from "laya/d3/shader/ShaderDefines";
import { BaseTexture } from "laya/resource/BaseTexture";
export declare class CubeMaterial extends BaseMaterial {
    static SPECULARSOURCE_DIFFUSEMAPALPHA: number;
    static SPECULARSOURCE_SPECULARMAP: number;
    static RENDERMODE_OPAQUE: number;
    static RENDERMODE_CUTOUT: number;
    static RENDERMODE_TRANSPARENT: number;
    static SHADERDEFINE_DIFFUSEMAP: number;
    static SHADERDEFINE_NORMALMAP: number;
    static SHADERDEFINE_SPECULARMAP: number;
    static SHADERDEFINE_TILINGOFFSET: number;
    static SHADERDEFINE_ENABLEVERTEXCOLOR: number;
    static SHADERDEFINE_MODENABLEVERTEXCOLOR: number;
    static SHADERDEFINE_SOLIDCOLORTEXTURE: number;
    static ALBEDOTEXTURE: number;
    static NORMALTEXTURE: number;
    static SPECULARTEXTURE: number;
    static ALBEDOCOLOR: number;
    static MATERIALSPECULAR: number;
    static SHININESS: number;
    static TILINGOFFSET: number;
    static defaultMaterial: CubeMaterial;
    static shaderDefines: ShaderDefines;
    static __init__(): void;
    private _albedoColor;
    private _albedoIntensity;
    private _enableLighting;
    private _enableVertexColor;
    _ColorR: number;
    _ColorG: number;
    _ColorB: number;
    _ColorA: number;
    _SpecColorR: number;
    _SpecColorG: number;
    _SpecColorB: number;
    _SpecColorA: number;
    _AlbedoIntensity: number;
    _Shininess: number;
    _MainTex_STX: number;
    _MainTex_STY: number;
    _MainTex_STZ: number;
    _MainTex_STW: number;
    _Cutoff: number;
    renderMode: number;
    enableVertexColor: boolean;
    modEnableVertexColor: boolean;
    solidColorTexture: boolean;
    tilingOffsetX: number;
    tilingOffsetY: number;
    tilingOffsetZ: number;
    tilingOffsetW: number;
    tilingOffset: Vector4;
    albedoColorR: number;
    albedoColorG: number;
    albedoColorB: number;
    albedoColorA: number;
    albedoColor: Vector4;
    albedoIntensity: number;
    specularColorR: number;
    specularColorG: number;
    specularColorB: number;
    specularColorA: number;
    specularColor: Vector4;
    shininess: number;
    albedoTexture: BaseTexture;
    normalTexture: BaseTexture;
    specularTexture: BaseTexture;
    enableLighting: boolean;
    disableFog(): void;
    constructor();
    clone(): any;
    cloneTo(destObject: any): void;
}
