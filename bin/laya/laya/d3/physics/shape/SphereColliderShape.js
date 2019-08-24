import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";
export class SphereColliderShape extends ColliderShape {
    get radius() {
        return this._radius;
    }
    constructor(radius = 0.5) {
        super();
        this._radius = radius;
        this._type = ColliderShape.SHAPETYPES_SPHERE;
        this._nativeShape = new Physics3D._physics3D.btSphereShape(radius);
    }
    clone() {
        var dest = new SphereColliderShape(this._radius);
        this.cloneTo(dest);
        return dest;
    }
}
