import { Pool } from "../../utils/Pool";
export class RotateCmd {
    static create(angle, pivotX, pivotY) {
        var cmd = Pool.getItemByClass("RotateCmd", RotateCmd);
        cmd.angle = angle;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }
    recover() {
        Pool.recover("RotateCmd", this);
    }
    run(context, gx, gy) {
        context._rotate(this.angle, this.pivotX + gx, this.pivotY + gy);
    }
    get cmdID() {
        return RotateCmd.ID;
    }
}
RotateCmd.ID = "Rotate";
