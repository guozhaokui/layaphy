import { ColliderBase } from "./ColliderBase";
import { Physics } from "./Physics";
import { ClassUtils } from "../utils/ClassUtils";
export class BoxCollider extends ColliderBase {
    constructor() {
        super(...arguments);
        this._x = 0;
        this._y = 0;
        this._width = 100;
        this._height = 100;
    }
    getDef() {
        if (!this._shape) {
            this._shape = new window.box2d.b2PolygonShape();
            this._setShape(false);
        }
        this.label = (this.label || "BoxCollider");
        return super.getDef();
    }
    _setShape(re = true) {
        var scaleX = (this.owner["scaleX"] || 1);
        var scaleY = (this.owner["scaleY"] || 1);
        this._shape.SetAsBox(this._width / 2 / Physics.PIXEL_RATIO * scaleX, this._height / 2 / Physics.PIXEL_RATIO * scaleY, new window.box2d.b2Vec2((this._width / 2 + this._x) / Physics.PIXEL_RATIO * scaleX, (this._height / 2 + this._y) / Physics.PIXEL_RATIO * scaleY));
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
    get width() {
        return this._width;
    }
    set width(value) {
        if (value <= 0)
            throw "BoxCollider size cannot be less than 0";
        this._width = value;
        if (this._shape)
            this._setShape();
    }
    get height() {
        return this._height;
    }
    set height(value) {
        if (value <= 0)
            throw "BoxCollider size cannot be less than 0";
        this._height = value;
        if (this._shape)
            this._setShape();
    }
    resetShape(re = true) {
        this._setShape();
    }
}
ClassUtils.regClass("laya.physics.BoxCollider", BoxCollider);
ClassUtils.regClass("Laya.BoxCollider", BoxCollider);
