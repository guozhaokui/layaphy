import { Vector2 } from "./math/Vector2";
export class Touch {
    constructor() {
        this._indexInList = -1;
        this._identifier = -1;
        this._position = new Vector2();
    }
    get identifier() {
        return this._identifier;
    }
    get position() {
        return this._position;
    }
    _getIndexInList() {
        return this._indexInList;
    }
    _setIndexInList(index) {
        this._indexInList = index;
    }
}
