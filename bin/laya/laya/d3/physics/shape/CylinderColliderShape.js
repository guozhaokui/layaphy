import { Physics3D } from "../Physics3D";
import { ColliderShape } from "./ColliderShape";
export class CylinderColliderShape extends ColliderShape {
    constructor(radius = 0.5, height = 1.0, orientation = ColliderShape.SHAPEORIENTATION_UPY) {
        super();
        this._radius = 1;
        this._height = 0.5;
        this._radius = radius;
        this._height = height;
        this._orientation = orientation;
        this._type = ColliderShape.SHAPETYPES_CYLINDER;
        switch (orientation) {
            case ColliderShape.SHAPEORIENTATION_UPX:
                CylinderColliderShape._nativeSize.setValue(height / 2, radius, radius);
                this._nativeShape = new Physics3D._physics3D.btCylinderShapeX(CylinderColliderShape._nativeSize);
                break;
            case ColliderShape.SHAPEORIENTATION_UPY:
                CylinderColliderShape._nativeSize.setValue(radius, height / 2, radius);
                this._nativeShape = new Physics3D._physics3D.btCylinderShape(CylinderColliderShape._nativeSize);
                break;
            case ColliderShape.SHAPEORIENTATION_UPZ:
                CylinderColliderShape._nativeSize.setValue(radius, radius, height / 2);
                this._nativeShape = new Physics3D._physics3D.btCylinderShapeZ(CylinderColliderShape._nativeSize);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
    }
    static __init__() {
        CylinderColliderShape._nativeSize = new Physics3D._physics3D.btVector3(0, 0, 0);
    }
    get radius() {
        return this._radius;
    }
    get height() {
        return this._height;
    }
    get orientation() {
        return this._orientation;
    }
    clone() {
        var dest = new CylinderColliderShape(this._radius, this._height, this._orientation);
        this.cloneTo(dest);
        return dest;
    }
}
