import { ColorUtils } from "../../utils/ColorUtils";
import { FontInfo } from "../../utils/FontInfo";
import { Pool } from "../../utils/Pool";
import { WordText } from "../../utils/WordText";
import { ILaya } from "../../../ILaya";
export class FillTextCmd {
    constructor() {
        this._textIsWorldText = false;
        this._fontColor = 0xffffffff;
        this._strokeColor = 0;
        this._fontObj = FillTextCmd._defFontObj;
        this._nTexAlign = 0;
    }
    static create(text, x, y, font, color, textAlign) {
        var cmd = Pool.getItemByClass("FillTextCmd", FillTextCmd);
        cmd.text = text;
        cmd._textIsWorldText = text instanceof WordText;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color;
        cmd.textAlign = textAlign;
        return cmd;
    }
    recover() {
        Pool.recover("FillTextCmd", this);
    }
    run(context, gx, gy) {
        if (ILaya.stage.isGlobalRepaint()) {
            this._textIsWorldText && this._text.cleanCache();
        }
        if (this._textIsWorldText) {
            context._fast_filltext(this._text, this.x + gx, this.y + gy, this._fontObj, this._color, null, 0, this._nTexAlign, 0);
        }
        else {
            context.drawText(this._text, this.x + gx, this.y + gy, this._font, this._color, this._textAlign);
        }
    }
    get cmdID() {
        return FillTextCmd.ID;
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this._textIsWorldText = value instanceof WordText;
        this._textIsWorldText && this._text.cleanCache();
    }
    get font() {
        return this._font;
    }
    set font(value) {
        this._font = value;
        this._fontObj = FontInfo.Parse(value);
        this._textIsWorldText && this._text.cleanCache();
    }
    get color() {
        return this._color;
    }
    set color(value) {
        this._color = value;
        this._fontColor = ColorUtils.create(value).numColor;
        this._textIsWorldText && this._text.cleanCache();
    }
    get textAlign() {
        return this._textAlign;
    }
    set textAlign(value) {
        this._textAlign = value;
        switch (value) {
            case 'center':
                this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
            default:
                this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_DEFAULT;
        }
        this._textIsWorldText && this._text.cleanCache();
    }
}
FillTextCmd.ID = "FillText";
FillTextCmd._defFontObj = new FontInfo(null);
