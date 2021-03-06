export class AtlasGrid {
    constructor(width = 0, height = 0, id = 0) {
        this.atlasID = 0;
        this._width = 0;
        this._height = 0;
        this._texCount = 0;
        this._rowInfo = null;
        this._cells = null;
        this._used = 0;
        this._cells = null;
        this._rowInfo = null;
        this.atlasID = id;
        this._init(width, height);
    }
    addRect(type, width, height, pt) {
        if (!this._get(width, height, pt))
            return false;
        this._fill(pt.x, pt.y, width, height, type);
        this._texCount++;
        return true;
    }
    _release() {
        this._cells = null;
        this._rowInfo = null;
    }
    _init(width, height) {
        this._width = width;
        this._height = height;
        this._release();
        if (this._width == 0)
            return false;
        this._cells = new Uint8Array(this._width * this._height * 3);
        this._rowInfo = new Uint8Array(this._height);
        this._used = 0;
        this._clear();
        return true;
    }
    _get(width, height, pt) {
        if (width > this._width || height > this._height) {
            return false;
        }
        var rx = -1;
        var ry = -1;
        var nWidth = this._width;
        var nHeight = this._height;
        var pCellBox = this._cells;
        for (var y = 0; y < nHeight; y++) {
            if (this._rowInfo[y] < width)
                continue;
            for (var x = 0; x < nWidth;) {
                var tm = (y * nWidth + x) * 3;
                if (pCellBox[tm] != 0 || pCellBox[tm + 1] < width || pCellBox[tm + 2] < height) {
                    x += pCellBox[tm + 1];
                    continue;
                }
                rx = x;
                ry = y;
                for (var xx = 0; xx < width; xx++) {
                    if (pCellBox[3 * xx + tm + 2] < height) {
                        rx = -1;
                        break;
                    }
                }
                if (rx < 0) {
                    x += pCellBox[tm + 1];
                    continue;
                }
                pt.x = rx;
                pt.y = ry;
                return true;
            }
        }
        return false;
    }
    _fill(x, y, w, h, type) {
        var nWidth = this._width;
        var nHeghit = this._height;
        this._check((x + w) <= nWidth && (y + h) <= nHeghit);
        for (var yy = y; yy < (h + y); ++yy) {
            this._check(this._rowInfo[yy] >= w);
            this._rowInfo[yy] -= w;
            for (var xx = 0; xx < w; xx++) {
                var tm = (x + yy * nWidth + xx) * 3;
                this._check(this._cells[tm] == 0);
                this._cells[tm] = type;
                this._cells[tm + 1] = w;
                this._cells[tm + 2] = h;
            }
        }
        if (x > 0) {
            for (yy = 0; yy < h; ++yy) {
                var s = 0;
                for (xx = x - 1; xx >= 0; --xx, ++s) {
                    if (this._cells[((y + yy) * nWidth + xx) * 3] != 0)
                        break;
                }
                for (xx = s; xx > 0; --xx) {
                    this._cells[((y + yy) * nWidth + x - xx) * 3 + 1] = xx;
                    this._check(xx > 0);
                }
            }
        }
        if (y > 0) {
            for (xx = x; xx < (x + w); ++xx) {
                s = 0;
                for (yy = y - 1; yy >= 0; --yy, s++) {
                    if (this._cells[(xx + yy * nWidth) * 3] != 0)
                        break;
                }
                for (yy = s; yy > 0; --yy) {
                    this._cells[(xx + (y - yy) * nWidth) * 3 + 2] = yy;
                    this._check(yy > 0);
                }
            }
        }
        this._used += (w * h) / (this._width * this._height);
    }
    _check(ret) {
        if (ret == false) {
            console.log("xtexMerger 错误啦");
        }
    }
    _clear() {
        this._texCount = 0;
        for (var y = 0; y < this._height; y++) {
            this._rowInfo[y] = this._width;
        }
        for (var i = 0; i < this._height; i++) {
            for (var j = 0; j < this._width; j++) {
                var tm = (i * this._width + j) * 3;
                this._cells[tm] = 0;
                this._cells[tm + 1] = this._width - j;
                this._cells[tm + 2] = this._width - i;
            }
        }
    }
}
