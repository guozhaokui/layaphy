export class GradientDataNumber {
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
                console.log("GradientDataNumber warning:the forth key is  be force set to 1.");
            }
            this._elements[this._currentLength++] = key;
            this._elements[this._currentLength++] = value;
        }
        else {
            console.log("GradientDataNumber warning:data count must lessEqual than 4");
        }
    }
    getKeyByIndex(index) {
        return this._elements[index * 2];
    }
    getValueByIndex(index) {
        return this._elements[index * 2 + 1];
    }
    getAverageValue() {
        var total = 0;
        for (var i = 0, n = this._currentLength - 2; i < n; i += 2) {
            var subValue = this._elements[i + 1];
            subValue += this._elements[i + 3];
            subValue = subValue * (this._elements[i + 2] - this._elements[i]);
        }
        return total / 2;
    }
    cloneTo(destObject) {
        var destGradientDataNumber = destObject;
        destGradientDataNumber._currentLength = this._currentLength;
        var destElements = destGradientDataNumber._elements;
        for (var i = 0, n = this._elements.length; i < n; i++)
            destElements[i] = this._elements[i];
    }
    clone() {
        var destGradientDataNumber = new GradientDataNumber();
        this.cloneTo(destGradientDataNumber);
        return destGradientDataNumber;
    }
}
