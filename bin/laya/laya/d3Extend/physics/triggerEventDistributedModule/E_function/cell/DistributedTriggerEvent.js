import { TriggerEvent } from "../../F_data/TriggerEvent";
import { TriggerQueueDataPool } from "../../F_data/TriggerQueueDataPool";
export class DistributedTriggerEvent {
    distributedAllEvent(lastTriggerQueue, currentTriggerQueue) {
        for (var i in currentTriggerQueue) {
            var value = lastTriggerQueue[i];
            if (value) {
                console.log(currentTriggerQueue[i].thisBody.onlyID, currentTriggerQueue[i].thisBody.isStatic, currentTriggerQueue[i].otherBody.onlyID, currentTriggerQueue[i].otherBody.isStatic, "STAY");
                this.distributedEvent(TriggerEvent.TRIGGER_STAY, currentTriggerQueue[i]);
                TriggerQueueDataPool.instance.giveBack(value);
                delete lastTriggerQueue[i];
            }
            else {
                console.log(currentTriggerQueue[i].thisBody.onlyID, currentTriggerQueue[i].thisBody.isStatic, currentTriggerQueue[i].otherBody.onlyID, currentTriggerQueue[i].otherBody.isStatic, "ENTER");
                this.distributedEvent(TriggerEvent.TRIGGER_ENTER, currentTriggerQueue[i]);
            }
        }
        for (var i in lastTriggerQueue) {
            var value = lastTriggerQueue[i];
            console.log(value.thisBody.onlyID, value.thisBody.isStatic, value.otherBody.onlyID, value.otherBody.isStatic, "EXIT");
            this.distributedEvent(TriggerEvent.TRIGGER_EXIT, value);
            TriggerQueueDataPool.instance.giveBack(value);
        }
    }
    distributedEvent(triggerEvent, queue) {
        queue.thisBody.owner.event(triggerEvent, queue.otherBody);
        queue.otherBody.owner.event(triggerEvent, queue.thisBody);
    }
}
