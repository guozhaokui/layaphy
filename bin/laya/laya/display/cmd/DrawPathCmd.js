import { Pool } from "../../utils/Pool";
export class DrawPathCmd {
    static create(x, y, paths, brush, pen) {
        var cmd = Pool.getItemByClass("DrawPathCmd", DrawPathCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.paths = paths;
        cmd.brush = brush;
        cmd.pen = pen;
        return cmd;
    }
    recover() {
        this.paths = null;
        this.brush = null;
        this.pen = null;
        Pool.recover("DrawPathCmd", this);
    }
    run(context, gx, gy) {
        context._drawPath(this.x + gx, this.y + gy, this.paths, this.brush, this.pen);
    }
    get cmdID() {
        return DrawPathCmd.ID;
    }
}
DrawPathCmd.ID = "DrawPath";
