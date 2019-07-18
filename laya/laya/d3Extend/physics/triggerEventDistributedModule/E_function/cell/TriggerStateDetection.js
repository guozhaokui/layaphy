import { TriggerQueueDataPool } from "../../F_data/TriggerQueueDataPool";
export class TriggerStateDetection {
    constructor() {
        this._lastTriggerQueue = {};
        this._triggerQueue = {};
        TriggerQueueDataPool.instance.init(100);
    }
    allTriggerDetection(staticSprite3DQueue, dynamicSprite3DQueue) {
        this._lastTriggerQueue = this._triggerQueue;
        this._triggerQueue = {};
        if (!dynamicSprite3DQueue) {
            return;
        }
        for (var i in dynamicSprite3DQueue) {
            var body = dynamicSprite3DQueue[i];
            body.isDetection = false;
        }
        for (var i in dynamicSprite3DQueue) {
            var body = dynamicSprite3DQueue[i];
            for (var j in staticSprite3DQueue) {
                this.singleTriggerDetection(body, staticSprite3DQueue[j]);
            }
            for (var k in dynamicSprite3DQueue) {
                var target = dynamicSprite3DQueue[k];
                if (!target.isDetection) {
                    this.singleTriggerDetection(body, target);
                }
            }
            body.isDetection = true;
        }
    }
    singleTriggerDetection(thisBody, otherBody) {
        if (thisBody.onlyID != otherBody.onlyID) {
            var isTrigger = thisBody.isCollision(otherBody);
            if (isTrigger) {
                var data = TriggerQueueDataPool.instance.get();
                data.setBody(thisBody, otherBody);
                var key = this.getKey(thisBody, otherBody);
                this._triggerQueue[key] = data;
            }
        }
    }
    getKey(thisBody, otherBody) {
        return thisBody.onlyID > otherBody.onlyID ? otherBody.onlyID + "_" + thisBody.onlyID : thisBody.onlyID + "_" + otherBody.onlyID;
    }
    get lastTriggerQueue() {
        return this._lastTriggerQueue;
    }
    get triggerQueue() {
        return this._triggerQueue;
    }
}
