export class DefineDatas {
    constructor() {
        this.value = 0;
    }
    add(define) {
        this.value |= define;
    }
    remove(define) {
        this.value &= ~define;
    }
    has(define) {
        return (this.value & define) > 0;
    }
    cloneTo(destObject) {
        var destDefineData = destObject;
        destDefineData.value = this.value;
    }
    clone() {
        var dest = new DefineDatas();
        this.cloneTo(dest);
        return dest;
    }
}
