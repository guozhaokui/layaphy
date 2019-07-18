export class VertexElement {
    get offset() {
        return this._offset;
    }
    get elementFormat() {
        return this._elementFormat;
    }
    get elementUsage() {
        return this._elementUsage;
    }
    constructor(offset, elementFormat, elementUsage) {
        this._offset = offset;
        this._elementFormat = elementFormat;
        this._elementUsage = elementUsage;
    }
}
