import { Pool } from "../../utils/Pool";
export class DrawPieCmd {
    static create(x, y, radius, startAngle, endAngle, fillColor, lineColor, lineWidth, vid) {
        var cmd = Pool.getItemByClass("DrawPieCmd", DrawPieCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.radius = radius;
        cmd._startAngle = startAngle;
        cmd._endAngle = endAngle;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.vid = vid;
        return cmd;
    }
    recover() {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawPieCmd", this);
    }
    run(context, gx, gy) {
        context._drawPie(this.x + gx, this.y + gy, this.radius, this._startAngle, this._endAngle, this.fillColor, this.lineColor, this.lineWidth, this.vid);
    }
    get cmdID() {
        return DrawPieCmd.ID;
    }
    get startAngle() {
        return this._startAngle * 180 / Math.PI;
    }
    set startAngle(value) {
        this._startAngle = value * Math.PI / 180;
    }
    get endAngle() {
        return this._endAngle * 180 / Math.PI;
    }
    set endAngle(value) {
        this._endAngle = value * Math.PI / 180;
    }
}
DrawPieCmd.ID = "DrawPie";
