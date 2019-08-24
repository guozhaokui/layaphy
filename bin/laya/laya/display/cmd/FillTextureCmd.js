import { Pool } from "../../utils/Pool";
export class FillTextureCmd {
    static create(texture, x, y, width, height, type, offset, other) {
        var cmd = Pool.getItemByClass("FillTextureCmd", FillTextureCmd);
        cmd.texture = texture;
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.type = type;
        cmd.offset = offset;
        cmd.other = other;
        return cmd;
    }
    recover() {
        this.texture = null;
        this.offset = null;
        this.other = null;
        Pool.recover("FillTextureCmd", this);
    }
    run(context, gx, gy) {
        context.fillTexture(this.texture, this.x + gx, this.y + gy, this.width, this.height, this.type, this.offset, this.other);
    }
    get cmdID() {
        return FillTextureCmd.ID;
    }
}
FillTextureCmd.ID = "FillTexture";
