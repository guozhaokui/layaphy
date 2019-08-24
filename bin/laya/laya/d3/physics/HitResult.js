import { Vector3 } from "../math/Vector3";
export class HitResult {
    constructor() {
        this.succeeded = false;
        this.collider = null;
        this.point = new Vector3();
        this.normal = new Vector3();
        this.hitFraction = 0;
    }
}
