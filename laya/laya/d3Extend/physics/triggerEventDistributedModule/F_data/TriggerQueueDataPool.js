export class TriggerQueueDataPool {
    constructor() {
        this.point = 0;
    }
    init(len) {
        this.pool = [];
        this.pool.length = len;
        for (var i = 0; i < len; i++) {
            if (!this.pool[i]) {
                this.pool[i] = new TriggerQueueData();
            }
        }
    }
    get() {
        this.point--;
        if (this.point == -1) {
            this.point = 0;
            return new TriggerQueueData();
        }
        else {
            return this.pool[this.point];
        }
    }
    giveBack(value) {
        this.point++;
        if (this.point == this.pool.length) {
            this.pool.push(value);
        }
        else {
            this.pool[this.point] = value;
        }
    }
    static get instance() {
        if (!TriggerQueueDataPool._instance) {
            TriggerQueueDataPool._instance = new TriggerQueueDataPool();
        }
        return TriggerQueueDataPool._instance;
    }
}
