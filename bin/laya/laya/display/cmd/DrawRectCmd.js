import { Pool } from "../../utils/Pool";
export class DrawRectCmd {
    static create(x, y, width, height, fillColor, lineColor, lineWidth) {
        var cmd = Pool.getItemByClass("DrawRectCmd", DrawRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }
    recover() {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawRectCmd", this);
    }
    run(context, gx, gy) {
        context.drawRect(this.x + gx, this.y + gy, this.width, this.height, this.fillColor, this.lineColor, this.lineWidth);
    }
    get cmdID() {
        return DrawRectCmd.ID;
    }
}
DrawRectCmd.ID = "DrawRect";
