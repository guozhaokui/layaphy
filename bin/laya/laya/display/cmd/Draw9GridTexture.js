import { Pool } from "../../utils/Pool";
export class Draw9GridTexture {
    constructor() {
    }
    static create(texture, x, y, width, height, sizeGrid) {
        var cmd = Pool.getItemByClass("Draw9GridTexture", Draw9GridTexture);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.sizeGrid = sizeGrid;
        return cmd;
    }
    recover() {
        this.texture._removeReference();
        Pool.recover("Draw9GridTexture", this);
    }
    run(context, gx, gy) {
        context.drawTextureWithSizeGrid(this.texture, this.x, this.y, this.width, this.height, this.sizeGrid, gx, gy);
    }
    get cmdID() {
        return Draw9GridTexture.ID;
    }
}
Draw9GridTexture.ID = "Draw9GridTexture";
