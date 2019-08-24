import { Pool } from "../../utils/Pool";
export class DrawLineCmd {
    static create(fromX, fromY, toX, toY, lineColor, lineWidth, vid) {
        var cmd = Pool.getItemByClass("DrawLineCmd", DrawLineCmd);
        cmd.fromX = fromX;
        cmd.fromY = fromY;
        cmd.toX = toX;
        cmd.toY = toY;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.vid = vid;
        return cmd;
    }
    recover() {
        Pool.recover("DrawLineCmd", this);
    }
    run(context, gx, gy) {
        context._drawLine(gx, gy, this.fromX, this.fromY, this.toX, this.toY, this.lineColor, this.lineWidth, this.vid);
    }
    get cmdID() {
        return DrawLineCmd.ID;
    }
}
DrawLineCmd.ID = "DrawLine";
