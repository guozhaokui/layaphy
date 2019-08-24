export class WordText {
    constructor() {
        this.save = [];
        this.toUpperCase = null;
        this.width = -1;
        this.pageChars = [];
        this.startID = 0;
        this.startIDStroke = 0;
        this.lastGCCnt = 0;
        this.splitRender = false;
    }
    setText(txt) {
        this.changed = true;
        this._text = txt;
        this.width = -1;
        this.cleanCache();
    }
    toString() {
        return this._text;
    }
    get length() {
        return this._text ? this._text.length : 0;
    }
    charCodeAt(i) {
        return this._text ? this._text.charCodeAt(i) : NaN;
    }
    charAt(i) {
        return this._text ? this._text.charAt(i) : null;
    }
    cleanCache() {
        this.pageChars.forEach(function (p) {
            var tex = p.tex;
            var words = p.words;
            if (p.words.length == 1 && tex && tex.ri) {
                tex.destroy();
            }
        });
        this.pageChars = [];
        this.startID = 0;
    }
}
