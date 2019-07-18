import { GradientMode } from "./GradientMode";
export class Gradient {
    constructor(maxColorRGBKeyCount, maxColorAlphaKeyCount) {
        this._mode = 0;
        this._maxColorRGBKeysCount = 0;
        this._maxColorAlphaKeysCount = 0;
        this._colorRGBKeysCount = 0;
        this._colorAlphaKeysCount = 0;
        this._alphaElements = null;
        this._rgbElements = null;
        this._maxColorRGBKeysCount = maxColorRGBKeyCount;
        this._maxColorAlphaKeysCount = maxColorAlphaKeyCount;
        this._rgbElements = new Float32Array(maxColorRGBKeyCount * 4);
        this._alphaElements = new Float32Array(maxColorAlphaKeyCount * 2);
    }
    get mode() {
        return this._mode;
    }
    set mode(value) {
        this._mode = value;
    }
    get colorRGBKeysCount() {
        return this._colorRGBKeysCount;
    }
    get colorAlphaKeysCount() {
        return this._colorAlphaKeysCount;
    }
    get maxColorRGBKeysCount() {
        return this._maxColorRGBKeysCount;
    }
    get maxColorAlphaKeysCount() {
        return this._maxColorAlphaKeysCount;
    }
    addColorRGB(key, value) {
        if (this._colorRGBKeysCount < this._maxColorRGBKeysCount) {
            var offset = this._colorRGBKeysCount * 4;
            this._rgbElements[offset] = key;
            this._rgbElements[offset + 1] = value.r;
            this._rgbElements[offset + 2] = value.g;
            this._rgbElements[offset + 3] = value.b;
            this._colorRGBKeysCount++;
        }
        else {
            console.warn("Gradient:warning:data count must lessEqual than " + this._maxColorRGBKeysCount);
        }
    }
    addColorAlpha(key, value) {
        if (this._colorAlphaKeysCount < this._maxColorAlphaKeysCount) {
            var offset = this._colorAlphaKeysCount * 2;
            this._alphaElements[offset] = key;
            this._alphaElements[offset + 1] = value;
            this._colorAlphaKeysCount++;
        }
        else {
            console.warn("Gradient:warning:data count must lessEqual than " + this._maxColorAlphaKeysCount);
        }
    }
    updateColorRGB(index, key, value) {
        if (index < this._colorRGBKeysCount) {
            var offset = index * 4;
            this._rgbElements[offset] = key;
            this._rgbElements[offset + 1] = value.r;
            this._rgbElements[offset + 2] = value.g;
            this._rgbElements[offset + 3] = value.b;
        }
        else {
            console.warn("Gradient:warning:index must lessEqual than colorRGBKeysCount:" + this._colorRGBKeysCount);
        }
    }
    updateColorAlpha(index, key, value) {
        if (index < this._colorAlphaKeysCount) {
            var offset = index * 2;
            this._alphaElements[offset] = key;
            this._alphaElements[offset + 1] = value;
        }
        else {
            console.warn("Gradient:warning:index must lessEqual than colorAlphaKeysCount:" + this._colorAlphaKeysCount);
        }
    }
    evaluateColorRGB(lerpFactor, out, startSearchIndex = 0, reverseSearch = false) {
        lerpFactor = Math.min(Math.max(lerpFactor, 0.0), 1.0);
        var rgbElements = this._rgbElements;
        var curIndex = startSearchIndex;
        if (reverseSearch) {
            for (var i = curIndex; i >= 0; i--) {
                var offset = i * 4;
                var left = rgbElements[offset];
                if (lerpFactor === left) {
                    out.r = rgbElements[offset + 1];
                    out.g = rgbElements[offset + 2];
                    out.b = rgbElements[offset + 3];
                    return curIndex;
                }
                switch (this._mode) {
                    case GradientMode.Blend:
                        if (lerpFactor > left) {
                            var right = rgbElements[offset + 4];
                            if (lerpFactor > right)
                                throw "Gradient:wrong startSearchIndex.";
                            var diff = right - left;
                            var y1 = right - lerpFactor;
                            var y2 = lerpFactor - left;
                            out.r = (y1 * rgbElements[offset + 1] + y2 * rgbElements[offset + 5]) / diff;
                            out.g = (y1 * rgbElements[offset + 2] + y2 * rgbElements[offset + 6]) / diff;
                            out.b = (y1 * rgbElements[offset + 3] + y2 * rgbElements[offset + 7]) / diff;
                            return curIndex;
                        }
                        else {
                            curIndex--;
                            continue;
                        }
                    case GradientMode.Fixed:
                        if (lerpFactor > left) {
                            if (lerpFactor > rgbElements[offset + 4])
                                throw "Gradient:wrong startSearchIndex.";
                            out.r = rgbElements[offset + 5];
                            out.g = rgbElements[offset + 6];
                            out.b = rgbElements[offset + 7];
                            return curIndex;
                        }
                        else {
                            curIndex--;
                            continue;
                        }
                    default:
                        throw "Gradient:unknown mode.";
                }
            }
        }
        else {
            for (var i = 0, n = this._rgbElements.length; i < n; i++) {
                offset = i * 4;
                var right = rgbElements[offset];
                if (lerpFactor === right) {
                    out.r = rgbElements[offset + 1];
                    out.g = rgbElements[offset + 2];
                    out.b = rgbElements[offset + 3];
                    return curIndex;
                }
                switch (this._mode) {
                    case GradientMode.Blend:
                        if (lerpFactor < right) {
                            var left = rgbElements[offset - 4];
                            if (lerpFactor < left)
                                throw "Gradient:wrong startSearchIndex.";
                            var diff = right - left;
                            var y1 = right - lerpFactor;
                            var y2 = lerpFactor - left;
                            out.r = (y1 * rgbElements[offset - 3] + y2 * rgbElements[offset + 1]) / diff;
                            out.g = (y1 * rgbElements[offset - 2] + y2 * rgbElements[offset + 2]) / diff;
                            out.b = (y1 * rgbElements[offset - 1] + y2 * rgbElements[offset + 3]) / diff;
                            return curIndex;
                        }
                        else {
                            curIndex++;
                            continue;
                        }
                    case GradientMode.Fixed:
                        if (lerpFactor < right) {
                            if (lerpFactor < rgbElements[offset - 4])
                                throw "Gradient:wrong startSearchIndex.";
                            out.r = rgbElements[offset + 1];
                            out.g = rgbElements[offset + 2];
                            out.b = rgbElements[offset + 3];
                            return curIndex;
                        }
                        else {
                            curIndex++;
                            continue;
                        }
                    default:
                        throw "Gradient:unknown mode.";
                }
            }
        }
        return curIndex;
    }
    evaluateColorAlpha(lerpFactor, outColor, startSearchIndex = 0, reverseSearch = false) {
        lerpFactor = Math.min(Math.max(lerpFactor, 0.0), 1.0);
        var alphaElements = this._alphaElements;
        var curIndex = startSearchIndex;
        if (reverseSearch) {
            for (var i = curIndex; i >= 0; i--) {
                var offset = i * 2;
                var left = alphaElements[offset];
                if (lerpFactor === left) {
                    outColor.a = alphaElements[offset + 1];
                    return curIndex;
                }
                switch (this._mode) {
                    case GradientMode.Blend:
                        if (lerpFactor > left) {
                            var right = alphaElements[offset + 2];
                            if (lerpFactor > right)
                                throw "Gradient:wrong startSearchIndex.";
                            var diff = right - left;
                            var x1 = right - lerpFactor;
                            var x2 = lerpFactor - left;
                            outColor.a = (x1 * alphaElements[offset + 1] + x2 * alphaElements[offset + 3]) / diff;
                            return curIndex;
                        }
                        else {
                            curIndex--;
                            continue;
                        }
                    case GradientMode.Fixed:
                        if (lerpFactor > left) {
                            if (lerpFactor > alphaElements[offset + 2])
                                throw "Gradient:wrong startSearchIndex.";
                            outColor.a = alphaElements[offset + 3];
                            return curIndex;
                        }
                        else {
                            curIndex--;
                            continue;
                        }
                    default:
                        throw "Gradient:unknown mode.";
                }
            }
        }
        else {
            for (var i = curIndex, n = this._alphaElements.length; i < n; i++) {
                var offset = i * 2;
                var right = alphaElements[offset];
                if (lerpFactor === right) {
                    outColor.a = alphaElements[offset + 1];
                    return curIndex;
                }
                switch (this._mode) {
                    case GradientMode.Blend:
                        if (lerpFactor < right) {
                            var left = alphaElements[offset - 2];
                            if (lerpFactor < left)
                                throw "Gradient:wrong startSearchIndex.";
                            var diff = right - left;
                            var x1 = right - lerpFactor;
                            var x2 = lerpFactor - left;
                            outColor.a = (x1 * alphaElements[offset - 1] + x2 * alphaElements[offset + 1]) / diff;
                            return curIndex;
                        }
                        else {
                            curIndex++;
                            continue;
                        }
                    case GradientMode.Fixed:
                        if (lerpFactor < right) {
                            if (lerpFactor < alphaElements[offset - 2])
                                throw "Gradient:wrong startSearchIndex.";
                            outColor.a = alphaElements[offset + 1];
                            return curIndex;
                        }
                        else {
                            curIndex++;
                            continue;
                        }
                    default:
                        throw "Gradient:unknown mode.";
                }
            }
        }
        return curIndex;
    }
    cloneTo(destObject) {
        var destGradientDataColor = destObject;
        var i, n;
        destGradientDataColor._colorAlphaKeysCount = this._colorAlphaKeysCount;
        var destAlphaElements = destGradientDataColor._alphaElements;
        for (i = 0, n = this._alphaElements.length; i < n; i++)
            destAlphaElements[i] = this._alphaElements[i];
        destGradientDataColor._colorRGBKeysCount = this._colorRGBKeysCount;
        var destRGBElements = destGradientDataColor._rgbElements;
        for (i = 0, n = this._rgbElements.length; i < n; i++)
            destRGBElements[i] = this._rgbElements[i];
    }
    clone() {
        var destGradientDataColor = new Gradient(this._maxColorRGBKeysCount, this._maxColorAlphaKeysCount);
        this.cloneTo(destGradientDataColor);
        return destGradientDataColor;
    }
}
