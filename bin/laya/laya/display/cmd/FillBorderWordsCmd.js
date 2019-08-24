import { Pool } from "../../utils/Pool";
export class FillBorderWordsCmd {
    static create(words, x, y, font, fillColor, borderColor, lineWidth) {
        var cmd = Pool.getItemByClass("FillBorderWordsCmd", FillBorderWordsCmd);
        cmd.words = words;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.fillColor = fillColor;
        cmd.borderColor = borderColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }
    recover() {
        this.words = null;
        Pool.recover("FillBorderWordsCmd", this);
    }
    run(context, gx, gy) {
        context.fillBorderWords(this.words, this.x + gx, this.y + gy, this.font, this.fillColor, this.borderColor, this.lineWidth);
    }
    get cmdID() {
        return FillBorderWordsCmd.ID;
    }
}
FillBorderWordsCmd.ID = "FillBorderWords";
