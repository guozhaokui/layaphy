export class SingletonList {
    constructor() {
        this.elements = [];
        this.length = 0;
    }
    _add(element) {
        if (this.length === this.elements.length)
            this.elements.push(element);
        else
            this.elements[this.length] = element;
    }
    add(element) {
        if (this.length === this.elements.length)
            this.elements.push(element);
        else
            this.elements[this.length] = element;
        this.length++;
    }
}
