import { SingletonList } from "../../component/SingletonList";
export class OctreeMotionList extends SingletonList {
    constructor() {
        super();
    }
    add(element) {
        var index = element._getIndexInMotionList();
        if (index !== -1)
            throw "OctreeMotionList:element has  in  PhysicsUpdateList.";
        this._add(element);
        element._setIndexInMotionList(this.length++);
    }
    remove(element) {
        var index = element._getIndexInMotionList();
        this.length--;
        if (index !== this.length) {
            var end = this.elements[this.length];
            this.elements[index] = end;
            end._setIndexInMotionList(index);
        }
        element._setIndexInMotionList(-1);
    }
}
