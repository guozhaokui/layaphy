import { ColliderBase } from "./ColliderBase";
import { Physics } from "./Physics";
import { ClassUtils } from "../utils/ClassUtils";
export class ChainCollider extends ColliderBase {
    constructor() {
        super(...arguments);
        this._x = 0;
        this._y = 0;
        this._points = "0,0,100,0";
        this._loop = false;
    }
    getDef() {
        if (!this._shape) {
            this._shape = new window.box2d.b2ChainShape();
            this._setShape(false);
        }
        this.label = (this.label || "ChainCollider");
        return super.getDef();
    }
    _setShape(re = true) {
        var arr = this._points.split(",");
        var len = arr.length;
        if (len % 2 == 1)
            throw "ChainCollider points lenth must a multiplier of 2";
        var ps = [];
        for (var i = 0, n = len; i < n; i += 2) {
            ps.push(new window.box2d.b2Vec2((this._x + parseInt(arr[i])) / Physics.PIXEL_RATIO, (this._y + parseInt(arr[i + 1])) / Physics.PIXEL_RATIO));
        }
        this._loop ? this._shape.CreateLoop(ps, len / 2) : this._shape.CreateChain(ps, len / 2);
        if (re)
            this.refresh();
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
        if (this._shape)
            this._setShape();
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
        if (this._shape)
            this._setShape();
    }
    get points() {
        return this._points;
    }
    set points(value) {
        if (!value)
            throw "ChainCollider points cannot be empty";
        this._points = value;
        if (this._shape)
            this._setShape();
    }
    get loop() {
        return this._loop;
    }
    set loop(value) {
        this._loop = value;
        if (this._shape)
            this._setShape();
    }
}
ClassUtils.regClass("laya.physics.ChainCollider", ChainCollider);
ClassUtils.regClass("Laya.ChainCollider", ChainCollider);
