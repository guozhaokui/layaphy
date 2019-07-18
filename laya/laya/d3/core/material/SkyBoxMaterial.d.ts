import { Vector4 } from "../../math/Vector4";
import { TextureCube } from "../../resource/TextureCube";
import { BaseMaterial } from "./BaseMaterial";
export declare class SkyBoxMaterial extends BaseMaterial {
    static TINTCOLOR: number;
    static EXPOSURE: number;
    static ROTATION: number;
    static TEXTURECUBE: number;
    static defaultMaterial: SkyBoxMaterial;
    tintColor: Vector4;
    exposure: number;
    rotation: number;
    textureCube: TextureCube;
    clone(): any;
    constructor();
}
