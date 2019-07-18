import { Pool } from "../../utils/Pool";
export class BoundsStyle {
    reset() {
        if (this.bounds)
            this.bounds.recover();
        if (this.userBounds)
            this.userBounds.recover();
        this.bounds = null;
        this.userBounds = null;
        this.temBM = null;
        return this;
    }
    recover() {
        Pool.recover("BoundsStyle", this.reset());
    }
    static create() {
        return Pool.getItemByClass("BoundsStyle", BoundsStyle);
    }
}
