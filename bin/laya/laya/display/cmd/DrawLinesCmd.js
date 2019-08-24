import { Pool } from "../../utils/Pool";
export class DrawLinesCmd {
    static create(x, y, points, lineColor, lineWidth, vid) {
        var cmd = Pool.getItemByClass("DrawLinesCmd", DrawLinesCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.points = points;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.vid = vid;
        return cmd;
    }
    recover() {
        this.points = null;
        this.lineColor = null;
        Pool.recover("DrawLinesCmd", this);
    }
    run(context, gx, gy) {
        context._drawLines(this.x + gx, this.y + gy, this.points, this.lineColor, this.lineWidth, this.vid);
    }
    get cmdID() {
        return DrawLinesCmd.ID;
    }
}
DrawLinesCmd.ID = "DrawLines";
