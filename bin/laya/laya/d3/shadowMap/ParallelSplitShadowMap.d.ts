import { BaseCamera } from "../core/BaseCamera";
import { Scene3D } from "../core/scene/Scene3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector3 } from "../math/Vector3";
export declare class ParallelSplitShadowMap {
    constructor();
    setInfo(scene: Scene3D, maxDistance: number, globalParallelDir: Vector3, shadowMapTextureSize: number, numberOfPSSM: number, PCFType: number): void;
    setPCFType(PCFtype: number): void;
    getPCFType(): number;
    setFarDistance(value: number): void;
    getFarDistance(): number;
    shadowMapCount: number;
    private _beginSampler;
    calcSplitFrustum(sceneCamera: BaseCamera): void;
    static multiplyMatrixOutFloat32Array(left: Matrix4x4, right: Matrix4x4, out: Float32Array): void;
    setShadowMapTextureSize(size: number): void;
    disposeAllRenderTarget(): void;
}
