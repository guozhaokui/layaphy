export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    setValue(x, y) {
        this.x = x;
        this.y = y;
    }
    static scale(a, b, out) {
        out.x = a.x * b;
        out.y = a.y * b;
    }
    fromArray(array, offset = 0) {
        this.x = array[offset + 0];
        this.y = array[offset + 1];
    }
    cloneTo(destObject) {
        var destVector2 = destObject;
        destVector2.x = this.x;
        destVector2.y = this.y;
    }
    static dot(a, b) {
        return (a.x * b.x) + (a.y * b.y);
    }
    static normalize(s, out) {
        var x = s.x, y = s.y;
        var len = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
        }
    }
    static scalarLength(a) {
        var x = a.x, y = a.y;
        return Math.sqrt(x * x + y * y);
    }
    clone() {
        var destVector2 = new Vector2();
        this.cloneTo(destVector2);
        return destVector2;
    }
    forNativeElement(nativeElements = null) {
        if (nativeElements) {
            this.elements = nativeElements;
            this.elements[0] = this.x;
            this.elements[1] = this.y;
        }
        else {
            this.elements = new Float32Array([this.x, this.y]);
        }
        Vector2.rewriteNumProperty(this, "x", 0);
        Vector2.rewriteNumProperty(this, "y", 1);
    }
    static rewriteNumProperty(proto, name, index) {
        Object["defineProperty"](proto, name, {
            "get": function () {
                return this.elements[index];
            },
            "set": function (v) {
                this.elements[index] = v;
            }
        });
    }
}
Vector2.ZERO = new Vector2(0.0, 0.0);
Vector2.ONE = new Vector2(1.0, 1.0);
