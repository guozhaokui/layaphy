import { Laya } from "Laya";
import { DistributedTriggerEvent } from "../E_function/cell/DistributedTriggerEvent";
import { TriggerStateDetection } from "../E_function/cell/TriggerStateDetection";
export class TriggerManager {
    static get instance() {
        if (!TriggerManager._instance) {
            TriggerManager._instance = new TriggerManager();
        }
        return TriggerManager._instance;
    }
    constructor() {
        this.staticSprite3D = {};
        this.dySprite3D = {};
        this.triggerStateDetection = new TriggerStateDetection();
        this.distributedTriggerEvent = new DistributedTriggerEvent();
        Laya.timer.frameLoop(1, this, this.detection);
    }
    detection() {
        this.triggerStateDetection.allTriggerDetection(this.staticSprite3D, this.dySprite3D);
        this.distributedTriggerEvent.distributedAllEvent(this.triggerStateDetection.lastTriggerQueue, this.triggerStateDetection.triggerQueue);
    }
    addStatic(trigger) {
        this.staticSprite3D[trigger.onlyID] = trigger;
    }
    addDY(trigger) {
        this.dySprite3D[trigger.onlyID] = trigger;
    }
    removeStatic(trigger) {
        delete this.staticSprite3D[trigger.onlyID];
    }
    removeDY(trigger) {
        delete this.dySprite3D[trigger.onlyID];
    }
}
