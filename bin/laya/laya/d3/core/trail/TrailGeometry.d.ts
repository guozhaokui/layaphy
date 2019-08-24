import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
import { TrailFilter } from "./TrailFilter";
export declare class TrailGeometry extends GeometryElement {
    static ALIGNMENT_VIEW: number;
    static ALIGNMENT_TRANSFORM_Z: number;
    private tmpColor;
    private _disappearBoundsMode;
    constructor(owner: TrailFilter);
    _getType(): number;
    _prepareRender(state: RenderContext3D): boolean;
    _render(state: RenderContext3D): void;
    destroy(): void;
}
