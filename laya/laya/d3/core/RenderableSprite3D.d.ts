import { Node } from "../../display/Node";
import { Animator } from "../component/Animator";
import { Vector4 } from "../math/Vector4";
import { ShaderDefines } from "../shader/ShaderDefines";
import { Sprite3D } from "./Sprite3D";
export declare class RenderableSprite3D extends Sprite3D {
    static SHADERDEFINE_RECEIVE_SHADOW: number;
    static SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV: number;
    static SAHDERDEFINE_LIGHTMAP: number;
    static LIGHTMAPSCALEOFFSET: number;
    static LIGHTMAP: number;
    static PICKCOLOR: number;
    pickColor: Vector4;
    static shaderDefines: ShaderDefines;
    constructor(name: string);
    protected _onInActive(): void;
    protected _onActive(): void;
    protected _onActiveInScene(): void;
    _setBelongScene(scene: Node): void;
    _setUnBelongScene(): void;
    protected _changeHierarchyAnimator(animator: Animator): void;
    destroy(destroyChild?: boolean): void;
}
