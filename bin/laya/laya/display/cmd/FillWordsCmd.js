import { Pool } from "../../utils/Pool";
export class FillWordsCmd {
    static create(words, x, y, font, color) {
        var cmd = Pool.getItemByClass("FillWordsCmd", FillWordsCmd);
        cmd.words = words;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color;
        return cmd;
    }
    recover() {
        this.words = null;
        Pool.recover("FillWordsCmd", this);
    }
    run(context, gx, gy) {
        context.fillWords(this.words, this.x + gx, this.y + gy, this.font, this.color);
    }
    get cmdID() {
        return FillWordsCmd.ID;
    }
}
FillWordsCmd.ID = "FillWords";
