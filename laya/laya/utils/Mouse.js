export class Mouse {
    static set cursor(cursorStr) {
        Mouse._style.cursor = cursorStr;
    }
    static get cursor() {
        return Mouse._style.cursor;
    }
    static __init__() {
    }
    static hide() {
        if (Mouse.cursor != "none") {
            Mouse._preCursor = Mouse.cursor;
            Mouse.cursor = "none";
        }
    }
    static show() {
        if (Mouse.cursor == "none") {
            if (Mouse._preCursor) {
                Mouse.cursor = Mouse._preCursor;
            }
            else {
                Mouse.cursor = "auto";
            }
        }
    }
}
