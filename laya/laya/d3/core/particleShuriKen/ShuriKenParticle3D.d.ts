import { RenderableSprite3D } from "../RenderableSprite3D";
import { ShurikenParticleRenderer } from "./ShurikenParticleRenderer";
import { ShurikenParticleSystem } from "./ShurikenParticleSystem";
export declare class ShuriKenParticle3D extends RenderableSprite3D {
    readonly particleSystem: ShurikenParticleSystem;
    readonly particleRenderer: ShurikenParticleRenderer;
    constructor();
    _parse(data: any, spriteMap: any): void;
    _activeHierarchy(activeChangeComponents: any[]): void;
    _inActiveHierarchy(activeChangeComponents: any[]): void;
    destroy(destroyChild?: boolean): void;
}
