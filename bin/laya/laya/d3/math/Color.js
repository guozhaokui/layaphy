export class Color {
    constructor(r = 1, g = 1, b = 1, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static gammaToLinearSpace(value) {
        if (value <= 0.04045)
            return value / 12.92;
        else if (value < 1.0)
            return Math.pow((value + 0.055) / 1.055, 2.4);
        else
            return Math.pow(value, 2.4);
    }
    static linearToGammaSpace(value) {
        if (value <= 0.0)
            return 0.0;
        else if (value <= 0.0031308)
            return 12.92 * value;
        else if (value <= 1.0)
            return 1.055 * Math.pow(value, 0.41666) - 0.055;
        else
            return Math.pow(value, 0.41666);
    }
    toLinear(out) {
        out.r = Color.gammaToLinearSpace(this.r);
        out.g = Color.gammaToLinearSpace(this.g);
        out.b = Color.gammaToLinearSpace(this.b);
    }
    toGamma(out) {
        out.r = Color.linearToGammaSpace(this.r);
        out.g = Color.linearToGammaSpace(this.g);
        out.b = Color.linearToGammaSpace(this.b);
    }
    cloneTo(destObject) {
        var destColor = destObject;
        destColor.r = this.r;
        destColor.g = this.g;
        destColor.b = this.b;
        destColor.a = this.a;
    }
    clone() {
        var dest = new Color();
        this.cloneTo(dest);
        return dest;
    }
    forNativeElement() {
    }
}
Color.RED = new Color(1, 0, 0, 1);
Color.GREEN = new Color(0, 1, 0, 1);
Color.BLUE = new Color(0, 0, 1, 1);
Color.CYAN = new Color(0, 1, 1, 1);
Color.YELLOW = new Color(1, 0.92, 0.016, 1);
Color.MAGENTA = new Color(1, 0, 1, 1);
Color.GRAY = new Color(0.5, 0.5, 0.5, 1);
Color.WHITE = new Color(1, 1, 1, 1);
Color.BLACK = new Color(0, 0, 0, 1);
