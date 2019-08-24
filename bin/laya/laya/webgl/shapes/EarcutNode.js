export class EarcutNode {
    constructor(i, x, y) {
        this.i = i;
        this.x = x;
        this.y = y;
        this.prev = null;
        this.next = null;
        this.z = null;
        this.prevZ = null;
        this.nextZ = null;
        this.steiner = false;
    }
}
