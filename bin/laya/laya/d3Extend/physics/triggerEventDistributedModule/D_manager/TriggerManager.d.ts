import { CubePhysicsCompnent } from "../../CubePhysicsCompnent";
import { DistributedTriggerEvent } from "../E_function/cell/DistributedTriggerEvent";
import { TriggerStateDetection } from "../E_function/cell/TriggerStateDetection";
export declare class TriggerManager {
    private static _instance;
    static readonly instance: TriggerManager;
    private staticSprite3D;
    private dySprite3D;
    triggerStateDetection: TriggerStateDetection;
    distributedTriggerEvent: DistributedTriggerEvent;
    constructor();
    private detection;
    addStatic(trigger: CubePhysicsCompnent): void;
    addDY(trigger: CubePhysicsCompnent): void;
    removeStatic(trigger: CubePhysicsCompnent): void;
    removeDY(trigger: CubePhysicsCompnent): void;
}
