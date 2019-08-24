import { CubePhysicsCompnent } from "../../CubePhysicsCompnent";
export declare class TriggerQueueData {
    thisBody: CubePhysicsCompnent;
    otherBody: CubePhysicsCompnent;
    constructor();
    getKey(): string;
    setBody(thisBody: CubePhysicsCompnent, otherBody: CubePhysicsCompnent): void;
}
