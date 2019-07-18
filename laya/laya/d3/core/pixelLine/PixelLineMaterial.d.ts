import { Vector4 } from "../../math/Vector4";
import { BaseMaterial } from "../material/BaseMaterial";
export declare class PixelLineMaterial extends BaseMaterial {
    static COLOR: number;
    static defaultMaterial: PixelLineMaterial;
    static CULL: number;
    static BLEND: number;
    static BLEND_SRC: number;
    static BLEND_DST: number;
    static DEPTH_TEST: number;
    static DEPTH_WRITE: number;
    color: Vector4;
    depthWrite: boolean;
    cull: number;
    blend: number;
    blendSrc: number;
    blendDst: number;
    depthTest: number;
    constructor();
    clone(): any;
}
