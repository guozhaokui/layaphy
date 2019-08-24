import { SingletonList } from "../component/SingletonList";
export class PhysicsUpdateList extends SingletonList {
    constructor() {
        super();
    }
    add(element) {
        var index = element._inPhysicUpdateListIndex;
        if (index !== -1)
            throw "PhysicsUpdateList:element has  in  PhysicsUpdateList.";
        this._add(element);
        element._inPhysicUpdateListIndex = this.length++;
    }
    remove(element) {
        var index = element._inPhysicUpdateListIndex;
        this.length--;
        if (index !== this.length) {
            var end = this.elements[this.length];
            this.elements[index] = end;
            end._inPhysicUpdateListIndex = index;
        }
        element._inPhysicUpdateListIndex = -1;
    }
}
