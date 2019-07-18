import { Pool } from "../../utils/Pool";
export class ClipRectCmd {
    static create(x, y, width, height) {
        var cmd = Pool.getItemByClass("ClipRectCmd", ClipRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        return cmd;
    }
    recover() {
        Pool.recover("ClipRectCmd", this);
    }
    run(context, gx, gy) {
        context.clipRect(this.x + gx, this.y + gy, this.width, this.height);
    }
    get cmdID() {
        return ClipRectCmd.ID;
    }
}
ClipRectCmd.ID = "ClipRect";
