import { Resource } from "./Resource";
export class Bitmap extends Resource {
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    constructor() {
        super();
        this._width = -1;
        this._height = -1;
    }
    _getSource() {
        throw "Bitmap: must override it.";
    }
}
