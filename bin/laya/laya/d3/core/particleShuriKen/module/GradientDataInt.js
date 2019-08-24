export class GradientDataInt {
    constructor() {
        this._currentLength = 0;
        this._elements = new Float32Array(8);
    }
    get gradientCount() {
        return this._currentLength / 2;
    }
    add(key, value) {
        if (this._currentLength < 8) {
            if ((this._currentLength === 6) && ((key !== 1))) {
                key = 1;
                console.log("Warning:the forth key is  be force set to 1.");
            }
            this._elements[this._currentLength++] = key;
            this._elements[this._currentLength++] = value;
        }
        else {
            console.log("Warning:data count must lessEqual than 4");
        }
    }
    cloneTo(destObject) {
        var destGradientDataInt = destObject;
        destGradientDataInt._currentLength = this._currentLength;
        var destElements = destGradientDataInt._elements;
        for (var i = 0, n = this._elements.length; i < n; i++) {
            destElements[i] = this._elements[i];
        }
    }
    clone() {
        var destGradientDataInt = new GradientDataInt();
        this.cloneTo(destGradientDataInt);
        return destGradientDataInt;
    }
}
