import { Pool } from "../utils/Pool";
export class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static create() {
        return Pool.getItemByClass("Point", Point);
    }
    setTo(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    reset() {
        this.x = this.y = 0;
        return this;
    }
    recover() {
        Pool.recover("Point", this.reset());
    }
    distance(x, y) {
        return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
    }
    toString() {
        return this.x + "," + this.y;
    }
    normalize() {
        var d = Math.sqrt(this.x * this.x + this.y * this.y);
        if (d > 0) {
            var id = 1.0 / d;
            this.x *= id;
            this.y *= id;
        }
    }
    copy(point) {
        return this.setTo(point.x, point.y);
    }
}
Point.TEMP = new Point();
Point.EMPTY = new Point();
