import { Pool } from "../../utils/Pool";
export class ScaleCmd {
    static create(scaleX, scaleY, pivotX, pivotY) {
        var cmd = Pool.getItemByClass("ScaleCmd", ScaleCmd);
        cmd.scaleX = scaleX;
        cmd.scaleY = scaleY;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }
    recover() {
        Pool.recover("ScaleCmd", this);
    }
    run(context, gx, gy) {
        context._scale(this.scaleX, this.scaleY, this.pivotX + gx, this.pivotY + gy);
    }
    get cmdID() {
        return ScaleCmd.ID;
    }
}
ScaleCmd.ID = "Scale";
