import { Pool } from "../../utils/Pool";
export class DrawCircleCmd {
    static create(x, y, radius, fillColor, lineColor, lineWidth, vid) {
        var cmd = Pool.getItemByClass("DrawCircleCmd", DrawCircleCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.radius = radius;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.vid = vid;
        return cmd;
    }
    recover() {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawCircleCmd", this);
    }
    run(context, gx, gy) {
        context._drawCircle(this.x + gx, this.y + gy, this.radius, this.fillColor, this.lineColor, this.lineWidth, this.vid);
    }
    get cmdID() {
        return DrawCircleCmd.ID;
    }
}
DrawCircleCmd.ID = "DrawCircle";
