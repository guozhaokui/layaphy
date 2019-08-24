export class GradientDataVector2 {
    constructor() {
        this._currentLength = 0;
        this._elements = new Float32Array(12);
    }
    get gradientCount() {
        return this._currentLength / 3;
    }
    add(key, value) {
        if (this._currentLength < 8) {
            if ((this._currentLength === 6) && ((key !== 1))) {
                key = 1;
                console.log("GradientDataVector2 warning:the forth key is  be force set to 1.");
            }
            this._elements[this._currentLength++] = key;
            this._elements[this._currentLength++] = value.x;
            this._elements[this._currentLength++] = value.y;
        }
        else {
            console.log("GradientDataVector2 warning:data count must lessEqual than 4");
        }
    }
    cloneTo(destObject) {
        var destGradientDataVector2 = destObject;
        destGradientDataVector2._currentLength = this._currentLength;
        var destElements = destGradientDataVector2._elements;
        for (var i = 0, n = this._elements.length; i < n; i++) {
            destElements[i] = this._elements[i];
        }
    }
    clone() {
        var destGradientDataVector2 = new GradientDataVector2();
        this.cloneTo(destGradientDataVector2);
        return destGradientDataVector2;
    }
}
