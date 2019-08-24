export class TriggerQueueData {
    constructor() {
    }
    getKey() {
        return this.thisBody.onlyID > this.otherBody.onlyID ? this.otherBody.onlyID + "_" + this.thisBody.onlyID : this.thisBody.onlyID + "_" + this.otherBody.onlyID;
    }
    setBody(thisBody, otherBody) {
        this.thisBody = thisBody;
        this.otherBody = otherBody;
    }
}
