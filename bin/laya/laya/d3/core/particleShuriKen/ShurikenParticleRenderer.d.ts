import { BoundFrustum } from "../../math/BoundFrustum";
import { Mesh } from "../../resource/models/Mesh";
import { Bounds } from "../Bounds";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { Transform3D } from "../Transform3D";
import { ShuriKenParticle3D } from "./ShuriKenParticle3D";
export declare class ShurikenParticleRenderer extends BaseRender {
    stretchedBillboardCameraSpeedScale: number;
    stretchedBillboardSpeedScale: number;
    stretchedBillboardLengthScale: number;
    renderMode: number;
    mesh: Mesh;
    constructor(owner: ShuriKenParticle3D);
    protected _calculateBoundingBox(): void;
    _needRender(boundFrustum: BoundFrustum): boolean;
    _renderUpdate(context: RenderContext3D, transfrom: Transform3D): void;
    readonly bounds: Bounds;
    _destroy(): void;
}
