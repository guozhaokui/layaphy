import { RenderContext3D } from "../../core/render/RenderContext3D";
import { SkyMesh } from "./SkyMesh";
export declare class SkyBox extends SkyMesh {
    static instance: SkyBox;
    constructor();
    _render(state: RenderContext3D): void;
}
