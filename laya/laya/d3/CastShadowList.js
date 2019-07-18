import { SingletonList } from "./component/SingletonList";
export class CastShadowList extends SingletonList {
    constructor() {
        super();
    }
    add(element) {
        var index = element._indexInCastShadowList;
        if (index !== -1)
            throw "CastShadowList:element has  in  CastShadowList.";
        this._add(element);
        element._indexInCastShadowList = this.length++;
    }
    remove(element) {
        var index = element._indexInCastShadowList;
        this.length--;
        if (index !== this.length) {
            var end = this.elements[this.length];
            this.elements[index] = end;
            end._indexInCastShadowList = index;
        }
        element._indexInCastShadowList = -1;
    }
}
