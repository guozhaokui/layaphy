import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";
export class CompoundColliderShape extends ColliderShape {
    constructor() {
        super();
        this._childColliderShapes = [];
        this._type = ColliderShape.SHAPETYPES_COMPOUND;
        this._nativeShape = new Physics3D._physics3D.btCompoundShape();
    }
    static __init__() {
        CompoundColliderShape._nativeVector3One = new Physics3D._physics3D.btVector3(1, 1, 1);
        CompoundColliderShape._nativeTransform = new Physics3D._physics3D.btTransform();
        CompoundColliderShape._nativeOffset = new Physics3D._physics3D.btVector3(0, 0, 0);
        CompoundColliderShape._nativRotation = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
    }
    _clearChildShape(shape) {
        shape._attatched = false;
        shape._compoundParent = null;
        shape._indexInCompound = -1;
    }
    _addReference() {
    }
    _removeReference() {
    }
    _updateChildTransform(shape) {
        var offset = shape.localOffset;
        var rotation = shape.localRotation;
        var nativeOffset = ColliderShape._nativeVector30;
        var nativeQuaternion = ColliderShape._nativQuaternion0;
        var nativeTransform = ColliderShape._nativeTransform0;
        nativeOffset.setValue(-offset.x, offset.y, offset.z);
        nativeQuaternion.setValue(-rotation.x, rotation.y, rotation.z, -rotation.w);
        nativeTransform.setOrigin(nativeOffset);
        nativeTransform.setRotation(nativeQuaternion);
        this._nativeShape.updateChildTransform(shape._indexInCompound, nativeTransform, true);
    }
    addChildShape(shape) {
        if (shape._attatched)
            throw "CompoundColliderShape: this shape has attatched to other entity.";
        shape._attatched = true;
        shape._compoundParent = this;
        shape._indexInCompound = this._childColliderShapes.length;
        this._childColliderShapes.push(shape);
        var offset = shape.localOffset;
        var rotation = shape.localRotation;
        CompoundColliderShape._nativeOffset.setValue(-offset.x, offset.y, offset.z);
        CompoundColliderShape._nativRotation.setValue(-rotation.x, rotation.y, rotation.z, -rotation.w);
        CompoundColliderShape._nativeTransform.setOrigin(CompoundColliderShape._nativeOffset);
        CompoundColliderShape._nativeTransform.setRotation(CompoundColliderShape._nativRotation);
        var nativeScale = this._nativeShape.getLocalScaling();
        this._nativeShape.setLocalScaling(CompoundColliderShape._nativeVector3One);
        this._nativeShape.addChildShape(CompoundColliderShape._nativeTransform, shape._nativeShape);
        this._nativeShape.setLocalScaling(nativeScale);
        (this._attatchedCollisionObject) && (this._attatchedCollisionObject.colliderShape = this);
    }
    removeChildShape(shape) {
        if (shape._compoundParent === this) {
            var index = shape._indexInCompound;
            this._clearChildShape(shape);
            var endShape = this._childColliderShapes[this._childColliderShapes.length - 1];
            endShape._indexInCompound = index;
            this._childColliderShapes[index] = endShape;
            this._childColliderShapes.pop();
            this._nativeShape.removeChildShapeByIndex(index);
        }
    }
    clearChildShape() {
        for (var i = 0, n = this._childColliderShapes.length; i < n; i++) {
            this._clearChildShape(this._childColliderShapes[i]);
            this._nativeShape.removeChildShapeByIndex(0);
        }
        this._childColliderShapes.length = 0;
    }
    getChildShapeCount() {
        return this._childColliderShapes.length;
    }
    cloneTo(destObject) {
        var destCompoundColliderShape = destObject;
        destCompoundColliderShape.clearChildShape();
        for (var i = 0, n = this._childColliderShapes.length; i < n; i++)
            destCompoundColliderShape.addChildShape(this._childColliderShapes[i].clone());
    }
    clone() {
        var dest = new CompoundColliderShape();
        this.cloneTo(dest);
        return dest;
    }
    destroy() {
        super.destroy();
        for (var i = 0, n = this._childColliderShapes.length; i < n; i++) {
            var childShape = this._childColliderShapes[i];
            if (childShape._referenceCount === 0)
                childShape.destroy();
        }
    }
}
