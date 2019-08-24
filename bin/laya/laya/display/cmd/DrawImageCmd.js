import { Pool } from "../../utils/Pool";
export class DrawImageCmd {
    static create(texture, x, y, width, height) {
        var cmd = Pool.getItemByClass("DrawImageCmd", DrawImageCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        return cmd;
    }
    recover() {
        this.texture._removeReference();
        this.texture = null;
        Pool.recover("DrawImageCmd", this);
    }
    run(context, gx, gy) {
        context.drawTexture(this.texture, this.x + gx, this.y + gy, this.width, this.height);
    }
    get cmdID() {
        return DrawImageCmd.ID;
    }
}
DrawImageCmd.ID = "DrawImage";
