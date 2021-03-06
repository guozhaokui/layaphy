import { PostProcess } from "../component/PostProcess";
import { BoundFrustum } from "../math/BoundFrustum";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Ray } from "../math/Ray";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Viewport } from "../math/Viewport";
import { RenderTexture } from "../resource/RenderTexture";
import { Shader3D } from "../shader/Shader3D";
import { BaseCamera } from "./BaseCamera";
import { CommandBuffer } from "./render/command/CommandBuffer";
export declare class Camera extends BaseCamera {
    private _aspectRatio;
    private _viewport;
    private _normalizedViewport;
    private _viewMatrix;
    private _projectionMatrix;
    private _projectionViewMatrix;
    private _boundFrustum;
    private _updateViewMatrix;
    private _postProcess;
    private _enableHDR;
    enableRender: boolean;
    aspectRatio: number;
    viewport: Viewport;
    normalizedViewport: Viewport;
    readonly viewMatrix: Matrix4x4;
    projectionMatrix: Matrix4x4;
    readonly projectionViewMatrix: Matrix4x4;
    readonly boundFrustum: BoundFrustum;
    renderTarget: RenderTexture;
    postProcess: PostProcess;
    enableHDR: boolean;
    constructor(aspectRatio?: number, nearPlane?: number, farPlane?: number);
    _isLayerVisible(layer: number): boolean;
    private _calculationViewport;
    _parse(data: any, spriteMap: any): void;
    protected _calculateProjectionMatrix(): void;
    render(shader?: Shader3D, replacementTag?: string): void;
    viewportPointToRay(point: Vector2, out: Ray): void;
    normalizedViewportPointToRay(point: Vector2, out: Ray): void;
    worldToViewportPoint(position: Vector3, out: Vector3): void;
    worldToNormalizedViewportPoint(position: Vector3, out: Vector3): void;
    convertScreenCoordToOrthographicCoord(source: Vector3, out: Vector3): boolean;
    destroy(destroyChild?: boolean): void;
    addCommandBuffer(event: number, commandBuffer: CommandBuffer): void;
    removeCommandBuffer(event: number, commandBuffer: CommandBuffer): void;
    removeCommandBuffers(event: number): void;
}
