import { Pool } from "../../utils/Pool";
export class DrawPolyCmd {
    static create(x, y, points, fillColor, lineColor, lineWidth, isConvexPolygon, vid) {
        var cmd = Pool.getItemByClass("DrawPolyCmd", DrawPolyCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.points = points;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.isConvexPolygon = isConvexPolygon;
        cmd.vid = vid;
        return cmd;
    }
    recover() {
        this.points = null;
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawPolyCmd", this);
    }
    run(context, gx, gy) {
        context._drawPoly(this.x + gx, this.y + gy, this.points, this.fillColor, this.lineColor, this.lineWidth, this.isConvexPolygon, this.vid);
    }
    get cmdID() {
        return DrawPolyCmd.ID;
    }
}
DrawPolyCmd.ID = "DrawPoly";
