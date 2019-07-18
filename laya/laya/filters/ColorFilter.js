import { Filter } from "./Filter";
import { ColorUtils } from "../utils/ColorUtils";
export class ColorFilter extends Filter {
    constructor(mat = null) {
        super();
        if (!mat)
            mat = this._copyMatrix(ColorFilter.IDENTITY_MATRIX);
        this._mat = new Float32Array(16);
        this._alpha = new Float32Array(4);
        this.setByMatrix(mat);
    }
    gray() {
        return this.setByMatrix(ColorFilter.GRAY_MATRIX);
    }
    color(red = 0, green = 0, blue = 0, alpha = 1) {
        return this.setByMatrix([1, 0, 0, 0, red, 0, 1, 0, 0, green, 0, 0, 1, 0, blue, 0, 0, 0, 1, alpha]);
    }
    setColor(color) {
        var arr = ColorUtils.create(color).arrColor;
        var mt = [0, 0, 0, 0, 256 * arr[0], 0, 0, 0, 0, 256 * arr[1], 0, 0, 0, 0, 256 * arr[2], 0, 0, 0, 1, 0];
        return this.setByMatrix(mt);
    }
    setByMatrix(matrix) {
        if (this._matrix != matrix)
            this._copyMatrix(matrix);
        var j = 0;
        var z = 0;
        for (var i = 0; i < 20; i++) {
            if (i % 5 != 4) {
                this._mat[j++] = matrix[i];
            }
            else {
                this._alpha[z++] = matrix[i];
            }
        }
        return this;
    }
    get type() {
        return Filter.COLOR;
    }
    adjustColor(brightness, contrast, saturation, hue) {
        this.adjustHue(hue);
        this.adjustContrast(contrast);
        this.adjustBrightness(brightness);
        this.adjustSaturation(saturation);
        return this;
    }
    adjustBrightness(brightness) {
        brightness = this._clampValue(brightness, 100);
        if (brightness == 0 || isNaN(brightness))
            return this;
        return this._multiplyMatrix([1, 0, 0, 0, brightness, 0, 1, 0, 0, brightness, 0, 0, 1, 0, brightness, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }
    adjustContrast(contrast) {
        contrast = this._clampValue(contrast, 100);
        if (contrast == 0 || isNaN(contrast))
            return this;
        var x;
        if (contrast < 0) {
            x = 127 + contrast / 100 * 127;
        }
        else {
            x = contrast % 1;
            if (x == 0) {
                x = ColorFilter.DELTA_INDEX[contrast];
            }
            else {
                x = ColorFilter.DELTA_INDEX[(contrast << 0)] * (1 - x) + ColorFilter.DELTA_INDEX[(contrast << 0) + 1] * x;
            }
            x = x * 127 + 127;
        }
        var x1 = x / 127;
        var x2 = (127 - x) * 0.5;
        return this._multiplyMatrix([x1, 0, 0, 0, x2, 0, x1, 0, 0, x2, 0, 0, x1, 0, x2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }
    adjustSaturation(saturation) {
        saturation = this._clampValue(saturation, 100);
        if (saturation == 0 || isNaN(saturation))
            return this;
        var x = 1 + ((saturation > 0) ? 3 * saturation / 100 : saturation / 100);
        var dx = 1 - x;
        var r = 0.3086 * dx;
        var g = 0.6094 * dx;
        var b = 0.0820 * dx;
        return this._multiplyMatrix([r + x, g, b, 0, 0, r, g + x, b, 0, 0, r, g, b + x, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }
    adjustHue(hue) {
        hue = this._clampValue(hue, 180) / 180 * Math.PI;
        if (hue == 0 || isNaN(hue))
            return this;
        var cos = Math.cos(hue);
        var sin = Math.sin(hue);
        var r = 0.213;
        var g = 0.715;
        var b = 0.072;
        return this._multiplyMatrix([r + cos * (1 - r) + sin * (-r), g + cos * (-g) + sin * (-g), b + cos * (-b) + sin * (1 - b), 0, 0, r + cos * (-r) + sin * (0.143), g + cos * (1 - g) + sin * (0.140), b + cos * (-b) + sin * (-0.283), 0, 0, r + cos * (-r) + sin * (-(1 - r)), g + cos * (-g) + sin * (g), b + cos * (1 - b) + sin * (b), 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }
    reset() {
        return this.setByMatrix(this._copyMatrix(ColorFilter.IDENTITY_MATRIX));
    }
    _multiplyMatrix(matrix) {
        var col = [];
        this._matrix = this._fixMatrix(this._matrix);
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                col[j] = this._matrix[j + i * 5];
            }
            for (j = 0; j < 5; j++) {
                var val = 0;
                for (var k = 0; k < 5; k++) {
                    val += matrix[j + k * 5] * col[k];
                }
                this._matrix[j + i * 5] = val;
            }
        }
        return this.setByMatrix(this._matrix);
    }
    _clampValue(val, limit) {
        return Math.min(limit, Math.max(-limit, val));
    }
    _fixMatrix(matrix = null) {
        if (matrix == null)
            return ColorFilter.IDENTITY_MATRIX;
        if (matrix.length < ColorFilter.LENGTH)
            matrix = matrix.slice(0, matrix.length).concat(ColorFilter.IDENTITY_MATRIX.slice(matrix.length, ColorFilter.LENGTH));
        else if (matrix.length > ColorFilter.LENGTH)
            matrix = matrix.slice(0, ColorFilter.LENGTH);
        return matrix;
    }
    _copyMatrix(matrix) {
        var len = ColorFilter.LENGTH;
        if (!this._matrix)
            this._matrix = [];
        for (var i = 0; i < len; i++) {
            this._matrix[i] = matrix[i];
        }
        return this._matrix;
    }
}
ColorFilter.DELTA_INDEX = [0, 0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.11, 0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24, 0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42, 0.44, 0.46, 0.48, 0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98, 1.0, 1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54, 1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0, 2.12, 2.25, 2.37, 2.50, 2.62, 2.75, 2.87, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.3, 4.7, 4.9, 5.0, 5.5, 6.0, 6.5, 6.8, 7.0, 7.3, 7.5, 7.8, 8.0, 8.4, 8.7, 9.0, 9.4, 9.6, 9.8, 10.0];
ColorFilter.GRAY_MATRIX = [0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0];
ColorFilter.IDENTITY_MATRIX = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];
ColorFilter.LENGTH = 25;
