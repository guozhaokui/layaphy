import { Vector3 } from "../../math/Vector3";
import { Physics3D } from "../Physics3D";
import { ColliderShape } from "./ColliderShape";
export class CapsuleColliderShape extends ColliderShape {
    constructor(radius = 0.5, length = 1.25, orientation = ColliderShape.SHAPEORIENTATION_UPY) {
        super();
        this._radius = radius;
        this._length = length;
        this._orientation = orientation;
        this._type = ColliderShape.SHAPETYPES_CAPSULE;
        switch (orientation) {
            case ColliderShape.SHAPEORIENTATION_UPX:
                this._nativeShape = new Physics3D._physics3D.btCapsuleShapeX(radius, length - radius * 2);
                break;
            case ColliderShape.SHAPEORIENTATION_UPY:
                this._nativeShape = new Physics3D._physics3D.btCapsuleShape(radius, length - radius * 2);
                break;
            case ColliderShape.SHAPEORIENTATION_UPZ:
                this._nativeShape = new Physics3D._physics3D.btCapsuleShapeZ(radius, length - radius * 2);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
    }
    get radius() {
        return this._radius;
    }
    get length() {
        return this._length;
    }
    get orientation() {
        return this._orientation;
    }
    _setScale(value) {
        var fixScale = CapsuleColliderShape._tempVector30;
        switch (this.orientation) {
            case ColliderShape.SHAPEORIENTATION_UPX:
                fixScale.x = value.x;
                fixScale.y = fixScale.z = Math.max(value.y, value.z);
                break;
            case ColliderShape.SHAPEORIENTATION_UPY:
                fixScale.y = value.y;
                fixScale.x = fixScale.z = Math.max(value.x, value.z);
                break;
            case ColliderShape.SHAPEORIENTATION_UPZ:
                fixScale.z = value.z;
                fixScale.x = fixScale.y = Math.max(value.x, value.y);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
        super._setScale(fixScale);
    }
    clone() {
        var dest = new CapsuleColliderShape(this._radius, this._length, this._orientation);
        this.cloneTo(dest);
        return dest;
    }
}
CapsuleColliderShape._tempVector30 = new Vector3();
