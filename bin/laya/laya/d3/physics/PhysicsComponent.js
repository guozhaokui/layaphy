import { Component } from "../../components/Component";
import { Event } from "../../events/Event";
import { Loader } from "../../net/Loader";
import { Transform3D } from "../core/Transform3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { Physics3D } from "./Physics3D";
import { BoxColliderShape } from "./shape/BoxColliderShape";
import { CapsuleColliderShape } from "./shape/CapsuleColliderShape";
import { CompoundColliderShape } from "./shape/CompoundColliderShape";
import { ConeColliderShape } from "./shape/ConeColliderShape";
import { CylinderColliderShape } from "./shape/CylinderColliderShape";
import { MeshColliderShape } from "./shape/MeshColliderShape";
import { SphereColliderShape } from "./shape/SphereColliderShape";
export class PhysicsComponent extends Component {
    constructor(collisionGroup, canCollideWith) {
        super();
        this._restitution = 0.0;
        this._friction = 0.5;
        this._rollingFriction = 0.0;
        this._ccdMotionThreshold = 0.0;
        this._ccdSweptSphereRadius = 0.0;
        this._collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER;
        this._canCollideWith = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER;
        this._colliderShape = null;
        this._transformFlag = 2147483647;
        this._enableProcessCollisions = true;
        this._inPhysicUpdateListIndex = -1;
        this.canScaleShape = true;
        this._collisionGroup = collisionGroup;
        this._canCollideWith = canCollideWith;
        PhysicsComponent._physicObjectsMap[this.id] = this;
    }
    static __init__() {
        PhysicsComponent._nativeVector30 = new Physics3D._physics3D.btVector3(0, 0, 0);
        PhysicsComponent._nativeQuaternion0 = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
    }
    static _createAffineTransformationArray(tranX, tranY, tranZ, rotX, rotY, rotZ, rotW, scale, outE) {
        var x2 = rotX + rotX, y2 = rotY + rotY, z2 = rotZ + rotZ;
        var xx = rotX * x2, xy = rotX * y2, xz = rotX * z2, yy = rotY * y2, yz = rotY * z2, zz = rotZ * z2;
        var wx = rotW * x2, wy = rotW * y2, wz = rotW * z2, sx = scale[0], sy = scale[1], sz = scale[2];
        outE[0] = (1 - (yy + zz)) * sx;
        outE[1] = (xy + wz) * sx;
        outE[2] = (xz - wy) * sx;
        outE[3] = 0;
        outE[4] = (xy - wz) * sy;
        outE[5] = (1 - (xx + zz)) * sy;
        outE[6] = (yz + wx) * sy;
        outE[7] = 0;
        outE[8] = (xz + wy) * sz;
        outE[9] = (yz - wx) * sz;
        outE[10] = (1 - (xx + yy)) * sz;
        outE[11] = 0;
        outE[12] = tranX;
        outE[13] = tranY;
        outE[14] = tranZ;
        outE[15] = 1;
    }
    static _creatShape(shapeData) {
        var colliderShape;
        switch (shapeData.type) {
            case "BoxColliderShape":
                var sizeData = shapeData.size;
                colliderShape = sizeData ? new BoxColliderShape(sizeData[0], sizeData[1], sizeData[2]) : new BoxColliderShape();
                break;
            case "SphereColliderShape":
                colliderShape = new SphereColliderShape(shapeData.radius);
                break;
            case "CapsuleColliderShape":
                colliderShape = new CapsuleColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
                break;
            case "MeshColliderShape":
                var meshCollider = new MeshColliderShape();
                shapeData.mesh && (meshCollider.mesh = Loader.getRes(shapeData.mesh));
                colliderShape = meshCollider;
                break;
            case "ConeColliderShape":
                colliderShape = new ConeColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
                break;
            case "CylinderColliderShape":
                colliderShape = new CylinderColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
                break;
            default:
                throw "unknown shape type.";
        }
        if (shapeData.center) {
            var localOffset = colliderShape.localOffset;
            localOffset.fromArray(shapeData.center);
            colliderShape.localOffset = localOffset;
        }
        return colliderShape;
    }
    static physicVector3TransformQuat(source, qx, qy, qz, qw, out) {
        var x = source.x, y = source.y, z = source.z, ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
        out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    }
    static physicQuaternionMultiply(lx, ly, lz, lw, right, out) {
        var rx = right.x;
        var ry = right.y;
        var rz = right.z;
        var rw = right.w;
        var a = (ly * rz - lz * ry);
        var b = (lz * rx - lx * rz);
        var c = (lx * ry - ly * rx);
        var d = (lx * rx + ly * ry + lz * rz);
        out.x = (lx * rw + rx * lw) + a;
        out.y = (ly * rw + ry * lw) + b;
        out.z = (lz * rw + rz * lw) + c;
        out.w = lw * rw - d;
    }
    get restitution() {
        return this._restitution;
    }
    set restitution(value) {
        this._restitution = value;
        this._nativeColliderObject && this._nativeColliderObject.setRestitution(value);
    }
    get friction() {
        return this._friction;
    }
    set friction(value) {
        this._friction = value;
        this._nativeColliderObject && this._nativeColliderObject.setFriction(value);
    }
    get rollingFriction() {
        return this._nativeColliderObject.getRollingFriction();
    }
    set rollingFriction(value) {
        this._rollingFriction = value;
        this._nativeColliderObject && this._nativeColliderObject.setRollingFriction(value);
    }
    get ccdMotionThreshold() {
        return this._ccdMotionThreshold;
    }
    set ccdMotionThreshold(value) {
        this._ccdMotionThreshold = value;
        this._nativeColliderObject && this._nativeColliderObject.setCcdMotionThreshold(value);
    }
    get ccdSweptSphereRadius() {
        return this._ccdSweptSphereRadius;
    }
    set ccdSweptSphereRadius(value) {
        this._ccdSweptSphereRadius = value;
        this._nativeColliderObject && this._nativeColliderObject.setCcdSweptSphereRadius(value);
    }
    get isActive() {
        return this._nativeColliderObject ? this._nativeColliderObject.isActive() : false;
    }
    set enabled(value) {
        if (this._simulation && this._colliderShape) {
            if (value) {
                this._derivePhysicsTransformation(true);
                this._addToSimulation();
            }
            else {
                this._removeFromSimulation();
            }
        }
        super.enabled = value;
    }
    get colliderShape() {
        return this._colliderShape;
    }
    set colliderShape(value) {
        var lastColliderShape = this._colliderShape;
        if (lastColliderShape) {
            lastColliderShape._attatched = false;
            lastColliderShape._attatchedCollisionObject = null;
        }
        this._colliderShape = value;
        if (value) {
            if (value._attatched) {
                throw "PhysicsComponent: this shape has attatched to other entity.";
            }
            else {
                value._attatched = true;
                value._attatchedCollisionObject = this;
            }
            if (this._nativeColliderObject) {
                this._nativeColliderObject.setCollisionShape(value._nativeShape);
                var canInSimulation = this._simulation && this._enabled;
                (canInSimulation && lastColliderShape) && (this._removeFromSimulation());
                this._onShapeChange(value);
                if (canInSimulation) {
                    this._derivePhysicsTransformation(true);
                    this._addToSimulation();
                }
            }
        }
        else {
            if (this._simulation && this._enabled)
                lastColliderShape && this._removeFromSimulation();
        }
    }
    get simulation() {
        return this._simulation;
    }
    get collisionGroup() {
        return this._collisionGroup;
    }
    set collisionGroup(value) {
        if (this._collisionGroup !== value) {
            this._collisionGroup = value;
            if (this._simulation && this._colliderShape && this._enabled) {
                this._removeFromSimulation();
                this._addToSimulation();
            }
        }
    }
    get canCollideWith() {
        return this._canCollideWith;
    }
    set canCollideWith(value) {
        if (this._canCollideWith !== value) {
            this._canCollideWith = value;
            if (this._simulation && this._colliderShape && this._enabled) {
                this._removeFromSimulation();
                this._addToSimulation();
            }
        }
    }
    _isValid() {
        return this._simulation && this._colliderShape && this._enabled;
    }
    _parse(data) {
        (data.collisionGroup != null) && (this.collisionGroup = data.collisionGroup);
        (data.canCollideWith != null) && (this.canCollideWith = data.canCollideWith);
        (data.ccdMotionThreshold != null) && (this.ccdMotionThreshold = data.ccdMotionThreshold);
        (data.ccdSweptSphereRadius != null) && (this.ccdSweptSphereRadius = data.ccdSweptSphereRadius);
    }
    _parseShape(shapesData) {
        var shapeCount = shapesData.length;
        if (shapeCount === 1) {
            var shape = PhysicsComponent._creatShape(shapesData[0]);
            this.colliderShape = shape;
        }
        else {
            var compoundShape = new CompoundColliderShape();
            for (var i = 0; i < shapeCount; i++) {
                shape = PhysicsComponent._creatShape(shapesData[i]);
                compoundShape.addChildShape(shape);
            }
            this.colliderShape = compoundShape;
        }
    }
    _onScaleChange(scale) {
        this._colliderShape._setScale(scale);
    }
    _setTransformFlag(type, value) {
        if (value)
            this._transformFlag |= type;
        else
            this._transformFlag &= ~type;
    }
    _getTransformFlag(type) {
        return (this._transformFlag & type) != 0;
    }
    _addToSimulation() {
    }
    _removeFromSimulation() {
    }
    _derivePhysicsTransformation(force) {
        this._innerDerivePhysicsTransformation(this._nativeColliderObject.getWorldTransform(), force);
    }
    _innerDerivePhysicsTransformation(physicTransformOut, force) {
        var transform = this.owner._transform;
        var rotation = transform.rotation;
        if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            var shapeOffset = this._colliderShape.localOffset;
            var position = transform.position;
            var nativePosition = PhysicsComponent._nativeVector30;
            if (shapeOffset.x !== 0 || shapeOffset.y !== 0 || shapeOffset.z !== 0) {
                var physicPosition = PhysicsComponent._tempVector30;
                PhysicsComponent.physicVector3TransformQuat(shapeOffset, rotation.x, rotation.y, rotation.z, rotation.w, physicPosition);
                Vector3.add(position, physicPosition, physicPosition);
                nativePosition.setValue(-physicPosition.x, physicPosition.y, physicPosition.z);
            }
            else {
                nativePosition.setValue(-position.x, position.y, position.z);
            }
            physicTransformOut.setOrigin(nativePosition);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
        }
        if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
            var shapeRotation = this._colliderShape.localRotation;
            var nativeRotation = PhysicsComponent._nativeQuaternion0;
            if (shapeRotation.x !== 0 || shapeRotation.y !== 0 || shapeRotation.z !== 0 || shapeRotation.w !== 1) {
                var physicRotation = PhysicsComponent._tempQuaternion0;
                PhysicsComponent.physicQuaternionMultiply(rotation.x, rotation.y, rotation.z, rotation.w, shapeRotation, physicRotation);
                nativeRotation.setValue(-physicRotation.x, physicRotation.y, physicRotation.z, -physicRotation.w);
            }
            else {
                nativeRotation.setValue(-rotation.x, rotation.y, rotation.z, -rotation.w);
            }
            physicTransformOut.setRotation(nativeRotation);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
        }
        if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._onScaleChange(transform.scale);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
        }
    }
    _updateTransformComponent(physicsTransform) {
        var localOffset = this._colliderShape.localOffset;
        var localRotation = this._colliderShape.localRotation;
        var transform = this.owner._transform;
        var position = transform.position;
        var rotation = transform.rotation;
        var nativePosition = physicsTransform.getOrigin();
        var nativeRotation = physicsTransform.getRotation();
        var nativeRotX = -nativeRotation.x();
        var nativeRotY = nativeRotation.y();
        var nativeRotZ = nativeRotation.z();
        var nativeRotW = -nativeRotation.w();
        if (localOffset.x !== 0 || localOffset.y !== 0 || localOffset.z !== 0) {
            var rotShapePosition = PhysicsComponent._tempVector30;
            PhysicsComponent.physicVector3TransformQuat(localOffset, nativeRotX, nativeRotY, nativeRotZ, nativeRotW, rotShapePosition);
            position.x = -nativePosition.x() - rotShapePosition.x;
            position.y = nativePosition.y() - rotShapePosition.y;
            position.z = nativePosition.z() - rotShapePosition.z;
        }
        else {
            position.x = -nativePosition.x();
            position.y = nativePosition.y();
            position.z = nativePosition.z();
        }
        transform.position = position;
        if (localRotation.x !== 0 || localRotation.y !== 0 || localRotation.z !== 0 || localRotation.w !== 1) {
            var invertShapeRotaion = PhysicsComponent._tempQuaternion0;
            localRotation.invert(invertShapeRotaion);
            PhysicsComponent.physicQuaternionMultiply(nativeRotX, nativeRotY, nativeRotZ, nativeRotW, invertShapeRotaion, rotation);
        }
        else {
            rotation.x = nativeRotX;
            rotation.y = nativeRotY;
            rotation.z = nativeRotZ;
            rotation.w = nativeRotW;
        }
        transform.rotation = rotation;
    }
    _onEnable() {
        this._simulation = this.owner._scene.physicsSimulation;
        this._nativeColliderObject.setContactProcessingThreshold(1e30);
        if (this._colliderShape && this._enabled) {
            this._derivePhysicsTransformation(true);
            this._addToSimulation();
        }
    }
    _onDisable() {
        if (this._colliderShape && this._enabled) {
            this._removeFromSimulation();
            (this._inPhysicUpdateListIndex !== -1) && (this._simulation._physicsUpdateList.remove(this));
        }
        this._simulation = null;
    }
    _onShapeChange(colShape) {
        var btColObj = this._nativeColliderObject;
        var flags = btColObj.getCollisionFlags();
        if (colShape.needsCustomCollisionCallback) {
            if ((flags & PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK) === 0)
                btColObj.setCollisionFlags(flags | PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK);
        }
        else {
            if ((flags & PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK) > 0)
                btColObj.setCollisionFlags(flags ^ PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK);
        }
    }
    _onAdded() {
        this.enabled = this._enabled;
        this.restitution = this._restitution;
        this.friction = this._friction;
        this.rollingFriction = this._rollingFriction;
        this.ccdMotionThreshold = this._ccdMotionThreshold;
        this.ccdSweptSphereRadius = this._ccdSweptSphereRadius;
        this.owner.transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
    }
    _onDestroy() {
        var physics3D = Physics3D._physics3D;
        delete PhysicsComponent._physicObjectsMap[this.id];
        physics3D.destroy(this._nativeColliderObject);
        this._colliderShape.destroy();
        super._onDestroy();
        this._nativeColliderObject = null;
        this._colliderShape = null;
        this._simulation = null;
        this.owner.transform.off(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
    }
    _onTransformChanged(flag) {
        if (PhysicsComponent._addUpdateList) {
            flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE;
            if (flag) {
                this._transformFlag |= flag;
                if (this._isValid() && this._inPhysicUpdateListIndex === -1)
                    this._simulation._physicsUpdateList.add(this);
            }
        }
    }
    _cloneTo(dest) {
        var destPhysicsComponent = dest;
        destPhysicsComponent.restitution = this._restitution;
        destPhysicsComponent.friction = this._friction;
        destPhysicsComponent.rollingFriction = this._rollingFriction;
        destPhysicsComponent.ccdMotionThreshold = this._ccdMotionThreshold;
        destPhysicsComponent.ccdSweptSphereRadius = this._ccdSweptSphereRadius;
        destPhysicsComponent.collisionGroup = this._collisionGroup;
        destPhysicsComponent.canCollideWith = this._canCollideWith;
        destPhysicsComponent.canScaleShape = this.canScaleShape;
        (this._colliderShape) && (destPhysicsComponent.colliderShape = this._colliderShape.clone());
    }
}
PhysicsComponent.ACTIVATIONSTATE_ACTIVE_TAG = 1;
PhysicsComponent.ACTIVATIONSTATE_ISLAND_SLEEPING = 2;
PhysicsComponent.ACTIVATIONSTATE_WANTS_DEACTIVATION = 3;
PhysicsComponent.ACTIVATIONSTATE_DISABLE_DEACTIVATION = 4;
PhysicsComponent.ACTIVATIONSTATE_DISABLE_SIMULATION = 5;
PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT = 1;
PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT = 2;
PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE = 4;
PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK = 8;
PhysicsComponent.COLLISIONFLAGS_CHARACTER_OBJECT = 16;
PhysicsComponent.COLLISIONFLAGS_DISABLE_VISUALIZE_OBJECT = 32;
PhysicsComponent.COLLISIONFLAGS_DISABLE_SPU_COLLISION_PROCESSING = 64;
PhysicsComponent._tempVector30 = new Vector3();
PhysicsComponent._tempQuaternion0 = new Quaternion();
PhysicsComponent._tempQuaternion1 = new Quaternion();
PhysicsComponent._tempMatrix4x40 = new Matrix4x4();
PhysicsComponent._physicObjectsMap = {};
PhysicsComponent._addUpdateList = true;
