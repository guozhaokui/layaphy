import { Rectangle } from "../../maths/Rectangle";
import { Pool } from "../../utils/Pool";
export class HTMLHitRect {
    constructor() {
        this.rec = new Rectangle();
        this.reset();
    }
    reset() {
        this.rec.reset();
        this.href = null;
        return this;
    }
    recover() {
        Pool.recover("HTMLHitRect", this.reset());
    }
    static create() {
        return Pool.getItemByClass("HTMLHitRect", HTMLHitRect);
    }
}
