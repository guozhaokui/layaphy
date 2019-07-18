import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";
export class ConeColliderShape extends ColliderShape {
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
                this._nativeShape = new Physics3D._physics3D.btConeShapeX(radius, height);
                break;
            case ColliderShape.SHAPEORIENTATION_UPY:
                this._nativeShape = new Physics3D._physics3D.btConeShape(radius, height);
                break;
            case ColliderShape.SHAPEORIENTATION_UPZ:
                this._nativeShape = new Physics3D._physics3D.btConeShapeZ(radius, height);
                break;
            default:
                throw "ConeColliderShape:unknown orientation.";
        }
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
        var dest = new ConeColliderShape(this._radius, this._height, this._orientation);
        this.cloneTo(dest);
        return dest;
    }
}
