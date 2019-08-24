import { Vector3 } from "../math/Vector3";
export class ContactPoint {
    constructor() {
        this._idCounter = 0;
        this.colliderA = null;
        this.colliderB = null;
        this.distance = 0;
        this.normal = new Vector3();
        this.positionOnA = new Vector3();
        this.positionOnB = new Vector3();
        this._id = ++this._idCounter;
    }
}
