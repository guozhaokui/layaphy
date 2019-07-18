import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
export declare class StaticBatchManager {
    static combine(staticBatchRoot: Sprite3D, renderableSprite3Ds?: RenderableSprite3D[]): void;
    constructor();
}
