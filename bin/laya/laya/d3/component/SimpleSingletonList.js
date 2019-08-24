import { SingletonList } from "./SingletonList";
export class SimpleSingletonList extends SingletonList {
    constructor() {
        super();
    }
    add(element) {
        var index = element._getIndexInList();
        if (index !== -1)
            throw "SimpleSingletonList:" + element + " has  in  SingletonList.";
        this._add(element);
        element._setIndexInList(this.length++);
    }
    remove(element) {
        var index = element._getIndexInList();
        this.length--;
        if (index !== this.length) {
            var end = this.elements[this.length];
            this.elements[index] = end;
            end._setIndexInList(index);
        }
        element._setIndexInList(-1);
    }
}
