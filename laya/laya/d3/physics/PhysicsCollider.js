import { Transform3D } from "../core/Transform3D";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { PhysicsComponent } from "./PhysicsComponent";
import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
import { Physics3D } from "./Physics3D";
export class PhysicsCollider extends PhysicsTriggerComponent {
    constructor(collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        super(collisionGroup, canCollideWith);
    }
    _addToSimulation() {
        this._simulation._addPhysicsCollider(this, this._collisionGroup, this._canCollideWith);
    }
    _removeFromSimulation() {
        this._simulation._removePhysicsCollider(this);
    }
    _onTransformChanged(flag) {
        flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE;
        if (flag) {
            this._transformFlag |= flag;
            if (this._isValid() && this._inPhysicUpdateListIndex === -1)
                this._simulation._physicsUpdateList.add(this);
        }
    }
    _parse(data) {
        (data.friction != null) && (this.friction = data.friction);
        (data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
        (data.restitution != null) && (this.restitution = data.restitution);
        (data.isTrigger != null) && (this.isTrigger = data.isTrigger);
        super._parse(data);
        this._parseShape(data.shapes);
    }
    _onAdded() {
        var physics3D = Physics3D._physics3D;
        var btColObj = new physics3D.btCollisionObject();
        btColObj.setUserIndex(this.id);
        btColObj.forceActivationState(PhysicsComponent.ACTIVATIONSTATE_DISABLE_SIMULATION);
        var flags = btColObj.getCollisionFlags();
        if (this.owner.isStatic) {
            if ((flags & PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
                flags = flags ^ PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
            flags = flags | PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT;
        }
        else {
            if ((flags & PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT) > 0)
                flags = flags ^ PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT;
            flags = flags | PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
        }
        btColObj.setCollisionFlags(flags);
        this._nativeColliderObject = btColObj;
        super._onAdded();
    }
}
