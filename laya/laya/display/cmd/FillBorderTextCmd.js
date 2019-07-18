import { Pool } from "../../utils/Pool";
export class FillBorderTextCmd {
    static create(text, x, y, font, fillColor, borderColor, lineWidth, textAlign) {
        var cmd = Pool.getItemByClass("FillBorderTextCmd", FillBorderTextCmd);
        cmd.text = text;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.fillColor = fillColor;
        cmd.borderColor = borderColor;
        cmd.lineWidth = lineWidth;
        cmd.textAlign = textAlign;
        return cmd;
    }
    recover() {
        Pool.recover("FillBorderTextCmd", this);
    }
    run(context, gx, gy) {
        context.fillBorderText(this.text, this.x + gx, this.y + gy, this.font, this.fillColor, this.borderColor, this.lineWidth, this.textAlign);
    }
    get cmdID() {
        return FillBorderTextCmd.ID;
    }
}
FillBorderTextCmd.ID = "FillBorderText";
