import { Pool } from "../../utils/Pool";
export class StrokeTextCmd {
    static create(text, x, y, font, color, lineWidth, textAlign) {
        var cmd = Pool.getItemByClass("StrokeTextCmd", StrokeTextCmd);
        cmd.text = text;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color;
        cmd.lineWidth = lineWidth;
        cmd.textAlign = textAlign;
        return cmd;
    }
    recover() {
        Pool.recover("StrokeTextCmd", this);
    }
    run(context, gx, gy) {
        context.strokeWord(this.text, this.x + gx, this.y + gy, this.font, this.color, this.lineWidth, this.textAlign);
    }
    get cmdID() {
        return StrokeTextCmd.ID;
    }
}
StrokeTextCmd.ID = "StrokeText";
