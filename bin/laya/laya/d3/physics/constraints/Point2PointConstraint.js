import { Vector3 } from "../../math/Vector3";
export class Point2PointConstraint {
    constructor() {
        this._pivotInA = new Vector3();
        this._pivotInB = new Vector3();
    }
    get pivotInA() {
        return this._pivotInA;
    }
    set pivotInA(value) {
        this._pivotInA = value;
    }
    get pivotInB() {
        return this._pivotInB;
    }
    set pivotInB(value) {
        this._pivotInB = value;
    }
    get damping() {
        return this._damping;
    }
    set damping(value) {
        this._damping = value;
    }
    get impulseClamp() {
        return this._impulseClamp;
    }
    set impulseClamp(value) {
        this._impulseClamp = value;
    }
    get tau() {
        return this._tau;
    }
    set tau(value) {
        this._tau = value;
    }
}
