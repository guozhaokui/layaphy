export class ICharRender {
    getWidth(font, str) { return 0; }
    scale(sx, sy) {
    }
    get canvasWidth() {
        return 0;
    }
    set canvasWidth(w) {
    }
    getCharBmp(char, font, lineWidth, colStr, strokeColStr, size, margin_left, margin_top, margin_right, margin_bottom, rect = null) {
        return null;
    }
}
