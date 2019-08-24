export class FontInfo {
    constructor(font) {
        this._font = "14px Arial";
        this._family = "Arial";
        this._size = 14;
        this._italic = false;
        this._bold = false;
        this._id = FontInfo._gfontID++;
        this.setFont(font || this._font);
    }
    static Parse(font) {
        if (font === FontInfo._lastFont) {
            return FontInfo._lastFontInfo;
        }
        var r = FontInfo._cache[font];
        if (!r) {
            r = FontInfo._cache[font] = new FontInfo(font);
        }
        FontInfo._lastFont = font;
        FontInfo._lastFontInfo = r;
        return r;
    }
    setFont(value) {
        this._font = value;
        var _words = value.split(' ');
        var l = _words.length;
        if (l < 2) {
            if (l == 1) {
                if (_words[0].indexOf('px') > 0) {
                    this._size = parseInt(_words[0]);
                }
            }
            return;
        }
        var szpos = -1;
        for (var i = 0; i < l; i++) {
            if (_words[i].indexOf('px') > 0 || _words[i].indexOf('pt') > 0) {
                szpos = i;
                this._size = parseInt(_words[i]);
                if (this._size <= 0) {
                    console.error('font parse error:' + value);
                    this._size = 14;
                }
                break;
            }
        }
        var fpos = szpos + 1;
        var familys = _words[fpos];
        fpos++;
        for (; fpos < l; fpos++) {
            familys += ' ' + _words[fpos];
        }
        this._family = (familys.split(','))[0];
        this._italic = _words.indexOf('italic') >= 0;
        this._bold = _words.indexOf('bold') >= 0;
    }
}
FontInfo.EMPTY = new FontInfo(null);
FontInfo._cache = {};
FontInfo._gfontID = 0;
FontInfo._lastFont = '';
