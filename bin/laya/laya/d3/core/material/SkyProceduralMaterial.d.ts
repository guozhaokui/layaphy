import { Vector4 } from "../../math/Vector4";
import { BaseMaterial } from "./BaseMaterial";
export declare class SkyProceduralMaterial extends BaseMaterial {
    static SUN_NODE: number;
    static SUN_SIMPLE: number;
    static SUN_HIGH_QUALITY: number;
    static defaultMaterial: SkyProceduralMaterial;
    private _sunDisk;
    sunDisk: number;
    sunSize: number;
    sunSizeConvergence: number;
    atmosphereThickness: number;
    skyTint: Vector4;
    groundTint: Vector4;
    exposure: number;
    constructor();
    clone(): any;
}
