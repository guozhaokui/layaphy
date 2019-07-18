import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { BaseMaterial } from "./BaseMaterial";
export declare class WaterPrimaryMaterial extends BaseMaterial {
    static HORIZONCOLOR: number;
    static MAINTEXTURE: number;
    static NORMALTEXTURE: number;
    static WAVESCALE: number;
    static WAVESPEED: number;
    static SHADERDEFINE_MAINTEXTURE: number;
    static SHADERDEFINE_NORMALTEXTURE: number;
    static defaultMaterial: WaterPrimaryMaterial;
    horizonColor: Vector4;
    mainTexture: BaseTexture;
    normalTexture: BaseTexture;
    waveScale: number;
    waveSpeed: Vector4;
    constructor();
    clone(): any;
}
