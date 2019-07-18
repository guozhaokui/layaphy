import { Matrix4x4 } from "../../math/Matrix4x4";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { Physics3D } from "../Physics3D";
export class ColliderShape {
    constructor() {
        this._scale = new Vector3(1, 1, 1);
        this._centerMatrix = new Matrix4x4();
        this._attatched = false;
        this._indexInCompound = -1;
        this._compoundParent = null;
        this._attatchedCollisionObject = null;
        this._referenceCount = 0;
        this._localOffset = new Vector3(0, 0, 0);
        this._localRotation = new Quaternion(0, 0, 0, 1);
        this.needsCustomCollisionCallback = false;
    }
    static __init__() {
        ColliderShape._nativeScale = new Physics3D._physics3D.btVector3(1, 1, 1);
        ColliderShape._nativeVector30 = new Physics3D._physics3D.btVector3(0, 0, 0);
        ColliderShape._nativQuaternion0 = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
        ColliderShape._nativeTransform0 = new Physics3D._physics3D.btTransform();
    }
    static _createAffineTransformation(trans, rot, outE) {
        var x = rot.x, y = rot.y, z = rot.z, w = rot.w, x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;
        outE[0] = (1 - (yy + zz));
        outE[1] = (xy + wz);
        outE[2] = (xz - wy);
        outE[3] = 0;
        outE[4] = (xy - wz);
        outE[5] = (1 - (xx + zz));
        outE[6] = (yz + wx);
        outE[7] = 0;
        outE[8] = (xz + wy);
        outE[9] = (yz - wx);
        outE[10] = (1 - (xx + yy));
        outE[11] = 0;
        outE[12] = trans.x;
        outE[13] = trans.y;
        outE[14] = trans.z;
        outE[15] = 1;
    }
    get type() {
        return this._type;
    }
    get localOffset() {
        return this._localOffset;
    }
    set localOffset(value) {
        this._localOffset = value;
        if (this._compoundParent)
            this._compoundParent._updateChildTransform(this);
    }
    get localRotation() {
        return this._localRotation;
    }
    set localRotation(value) {
        this._localRotation = value;
        if (this._compoundParent)
            this._compoundParent._updateChildTransform(this);
    }
    _setScale(value) {
        if (this._compoundParent) {
            this.updateLocalTransformations();
        }
        else {
            ColliderShape._nativeScale.setValue(value.x, value.y, value.z);
            this._nativeShape.setLocalScaling(ColliderShape._nativeScale);
        }
    }
    _addReference() {
        this._referenceCount++;
    }
    _removeReference() {
        this._referenceCount--;
    }
    updateLocalTransformations() {
        if (this._compoundParent) {
            var offset = ColliderShape._tempVector30;
            Vector3.multiply(this.localOffset, this._scale, offset);
            ColliderShape._createAffineTransformation(offset, this.localRotation, this._centerMatrix.elements);
        }
        else {
            ColliderShape._createAffineTransformation(this.localOffset, this.localRotation, this._centerMatrix.elements);
        }
    }
    cloneTo(destObject) {
        var destColliderShape = destObject;
        this._localOffset.cloneTo(destColliderShape.localOffset);
        this._localRotation.cloneTo(destColliderShape.localRotation);
        destColliderShape.localOffset = destColliderShape.localOffset;
        destColliderShape.localRotation = destColliderShape.localRotation;
    }
    clone() {
        return null;
    }
    destroy() {
        if (this._nativeShape) {
            Physics3D._physics3D.destroy(this._nativeShape);
            this._nativeShape = null;
        }
    }
}
ColliderShape.SHAPEORIENTATION_UPX = 0;
ColliderShape.SHAPEORIENTATION_UPY = 1;
ColliderShape.SHAPEORIENTATION_UPZ = 2;
ColliderShape.SHAPETYPES_BOX = 0;
ColliderShape.SHAPETYPES_SPHERE = 1;
ColliderShape.SHAPETYPES_CYLINDER = 2;
ColliderShape.SHAPETYPES_CAPSULE = 3;
ColliderShape.SHAPETYPES_CONVEXHULL = 4;
ColliderShape.SHAPETYPES_COMPOUND = 5;
ColliderShape.SHAPETYPES_STATICPLANE = 6;
ColliderShape.SHAPETYPES_CONE = 7;
ColliderShape._tempVector30 = new Vector3();
