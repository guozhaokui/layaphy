import { Vector3 } from "../math/Vector3";
import { PhysicsComponent } from "../physics/PhysicsComponent";
export declare class Physics3DUtils {
    static COLLISIONFILTERGROUP_DEFAULTFILTER: number;
    static COLLISIONFILTERGROUP_STATICFILTER: number;
    static COLLISIONFILTERGROUP_KINEMATICFILTER: number;
    static COLLISIONFILTERGROUP_DEBRISFILTER: number;
    static COLLISIONFILTERGROUP_SENSORTRIGGER: number;
    static COLLISIONFILTERGROUP_CHARACTERFILTER: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER1: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER2: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER3: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER4: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER5: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER6: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER7: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER8: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER9: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER10: number;
    static COLLISIONFILTERGROUP_ALLFILTER: number;
    static gravity: Vector3;
    constructor();
    static setColliderCollision(collider1: PhysicsComponent, collider2: PhysicsComponent, collsion: boolean): void;
    static getIColliderCollision(collider1: PhysicsComponent, collider2: PhysicsComponent): boolean;
}
