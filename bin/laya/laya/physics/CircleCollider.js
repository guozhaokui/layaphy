import { ColliderBase } from "./ColliderBase";
import { Physics } from "./Physics";
import { ClassUtils } from "../utils/ClassUtils";
export class CircleCollider extends ColliderBase {
    constructor() {
        super(...arguments);
        this._x = 0;
        this._y = 0;
        this._radius = 50;
    }
    getDef() {
        if (!this._shape) {
            this._shape = new window.box2d.b2CircleShape();
            this._setShape(false);
        }
        this.label = (this.label || "CircleCollider");
        return super.getDef();
    }
    _setShape(re = true) {
        var scale = this.owner["scaleX"] || 1;
        this._shape.m_radius = this._radius / Physics.PIXEL_RATIO * scale;
        this._shape.m_p.Set((this._radius + this._x) / Physics.PIXEL_RATIO * scale, (this._radius + this._y) / Physics.PIXEL_RATIO * scale);
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
    get radius() {
        return this._radius;
    }
    set radius(value) {
        if (value <= 0)
            throw "CircleCollider radius cannot be less than 0";
        this._radius = value;
        if (this._shape)
            this._setShape();
    }
    resetShape(re = true) {
        this._setShape();
    }
}
ClassUtils.regClass("laya.physics.CircleCollider", CircleCollider);
ClassUtils.regClass("Laya.CircleCollider", CircleCollider);
