import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";
export class MeshColliderShape extends ColliderShape {
    constructor() {
        super();
        this._mesh = null;
        this._convex = false;
    }
    get mesh() {
        return this._mesh;
    }
    set mesh(value) {
        if (this._mesh !== value) {
            var physics3D = Physics3D._physics3D;
            if (this._mesh) {
                physics3D.destroy(this._nativeShape);
            }
            if (value) {
                this._nativeShape = new Physics3D._physics3D.btGImpactMeshShape(value._getPhysicMesh());
                this._nativeShape.updateBound();
            }
            this._mesh = value;
        }
    }
    get convex() {
        return this._convex;
    }
    set convex(value) {
        this._convex = value;
    }
    _setScale(value) {
        if (this._compoundParent) {
            this.updateLocalTransformations();
        }
        else {
            ColliderShape._nativeScale.setValue(value.x, value.y, value.z);
            this._nativeShape.setLocalScaling(ColliderShape._nativeScale);
            this._nativeShape.updateBound();
        }
    }
    cloneTo(destObject) {
        var destMeshCollider = destObject;
        destMeshCollider.convex = this._convex;
        destMeshCollider.mesh = this._mesh;
        super.cloneTo(destObject);
    }
    clone() {
        var dest = new MeshColliderShape();
        this.cloneTo(dest);
        return dest;
    }
    destroy() {
        if (this._nativeShape) {
            var physics3D = Physics3D._physics3D;
            physics3D.destroy(this._nativeShape);
            this._nativeShape = null;
        }
    }
}
