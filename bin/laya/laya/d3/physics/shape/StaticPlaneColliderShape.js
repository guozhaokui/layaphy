import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";
export class StaticPlaneColliderShape extends ColliderShape {
    static __init__() {
        StaticPlaneColliderShape._nativeNormal = new Physics3D._physics3D.btVector3(0, 0, 0);
    }
    constructor(normal, offset) {
        super();
        this._normal = normal;
        this._offset = offset;
        this._type = ColliderShape.SHAPETYPES_STATICPLANE;
        StaticPlaneColliderShape._nativeNormal.setValue(-normal.x, normal.y, normal.z);
        this._nativeShape = new Physics3D._physics3D.btStaticPlaneShape(StaticPlaneColliderShape._nativeNormal, offset);
    }
    clone() {
        var dest = new StaticPlaneColliderShape(this._normal, this._offset);
        this.cloneTo(dest);
        return dest;
    }
}
