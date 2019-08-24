export class StringKey {
    constructor() {
        this._strsToID = {};
        this._idToStrs = [];
        this._length = 0;
    }
    add(str) {
        var index = this._strsToID[str];
        if (index != null)
            return index;
        this._idToStrs[this._length] = str;
        return this._strsToID[str] = this._length++;
    }
    getID(str) {
        var index = this._strsToID[str];
        return index == null ? -1 : index;
    }
    getName(id) {
        var str = this._idToStrs[id];
        return str == null ? undefined : str;
    }
}
