import { TriggerQueueData } from "../../F_data/TriggerQueueData";
export declare class DistributedTriggerEvent {
    distributedAllEvent(lastTriggerQueue: any, currentTriggerQueue: any): void;
    distributedEvent(triggerEvent: string, queue: TriggerQueueData): void;
}
