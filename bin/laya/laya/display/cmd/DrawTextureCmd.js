import { ColorFilter } from "../../filters/ColorFilter";
import { Pool } from "../../utils/Pool";
export class DrawTextureCmd {
    constructor() {
        this.colorFlt = null;
        this.uv = null;
    }
    static create(texture, x, y, width, height, matrix, alpha, color, blendMode, uv) {
        var cmd = Pool.getItemByClass("DrawTextureCmd", DrawTextureCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.matrix = matrix;
        cmd.alpha = alpha;
        cmd.color = color;
        cmd.blendMode = blendMode;
        cmd.uv = uv;
        if (color) {
            cmd.colorFlt = new ColorFilter();
            cmd.colorFlt.setColor(color);
        }
        return cmd;
    }
    recover() {
        this.texture._removeReference();
        this.texture = null;
        this.matrix = null;
        Pool.recover("DrawTextureCmd", this);
    }
    run(context, gx, gy) {
        context.drawTextureWithTransform(this.texture, this.x, this.y, this.width, this.height, this.matrix, gx, gy, this.alpha, this.blendMode, this.colorFlt, this.uv);
    }
    get cmdID() {
        return DrawTextureCmd.ID;
    }
}
DrawTextureCmd.ID = "DrawTexture";
