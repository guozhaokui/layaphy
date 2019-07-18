import { Pool } from "../../utils/Pool";
export class DrawCanvasCmd {
    constructor() {
        this._paramData = null;
    }
    static create(texture, x, y, width, height) {
        return null;
    }
    recover() {
        this._graphicsCmdEncoder = null;
        Pool.recover("DrawCanvasCmd", this);
    }
    get cmdID() {
        return DrawCanvasCmd.ID;
    }
}
DrawCanvasCmd.ID = "DrawCanvasCmd";
DrawCanvasCmd._DRAW_IMAGE_CMD_ENCODER_ = null;
DrawCanvasCmd._PARAM_TEXTURE_POS_ = 2;
DrawCanvasCmd._PARAM_VB_POS_ = 5;
