import { SkinMeshForGraphic } from "./bone/canvasmesh/SkinMeshForGraphic";
import { Graphics } from "../display/Graphics";
export declare class GraphicsAni extends Graphics {
    drawSkin(skinA: SkinMeshForGraphic, alpha: number): void;
    private static _caches;
    static create(): GraphicsAni;
    static recycle(graphics: GraphicsAni): void;
}
