import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { Utils3D } from "../utils/Utils3D";
import { PhysicsComponent } from "./PhysicsComponent";
import { Physics3D } from "./Physics3D";
import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
export class Rigidbody3D extends PhysicsTriggerComponent {
    constructor(collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        super(collisionGroup, canCollideWith);
        this._isKinematic = false;
        this._mass = 1.0;
        this._gravity = new Vector3(0, -10, 0);
        this._angularDamping = 0.0;
        this._linearDamping = 0.0;
        this._overrideGravity = false;
        this._totalTorque = new Vector3(0, 0, 0);
        this._totalForce = new Vector3(0, 0, 0);
        this._linearVelocity = new Vector3();
        this._angularVelocity = new Vector3();
        this._linearFactor = new Vector3(1, 1, 1);
        this._angularFactor = new Vector3(1, 1, 1);
        this._detectCollisions = true;
    }
    static __init__() {
        Rigidbody3D._nativeTempVector30 = new Physics3D._physics3D.btVector3(0, 0, 0);
        Rigidbody3D._nativeTempVector31 = new Physics3D._physics3D.btVector3(0, 0, 0);
        Rigidbody3D._nativeVector3Zero = new Physics3D._physics3D.btVector3(0, 0, 0);
        Rigidbody3D._nativeInertia = new Physics3D._physics3D.btVector3(0, 0, 0);
        Rigidbody3D._nativeImpulse = new Physics3D._physics3D.btVector3(0, 0, 0);
        Rigidbody3D._nativeImpulseOffset = new Physics3D._physics3D.btVector3(0, 0, 0);
        Rigidbody3D._nativeGravity = new Physics3D._physics3D.btVector3(0, 0, 0);
    }
    get mass() {
        return this._mass;
    }
    set mass(value) {
        value = Math.max(value, 1e-07);
        this._mass = value;
        (this._isKinematic) || (this._updateMass(value));
    }
    get isKinematic() {
        return this._isKinematic;
    }
    set isKinematic(value) {
        this._isKinematic = value;
        var canInSimulation = !!(this._simulation && this._enabled && this._colliderShape);
        canInSimulation && this._removeFromSimulation();
        var natColObj = this._nativeColliderObject;
        var flags = natColObj.getCollisionFlags();
        if (value) {
            flags = flags | PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
            natColObj.setCollisionFlags(flags);
            this._nativeColliderObject.forceActivationState(PhysicsComponent.ACTIVATIONSTATE_DISABLE_DEACTIVATION);
            this._enableProcessCollisions = false;
            this._updateMass(0);
        }
        else {
            if ((flags & PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
                flags = flags ^ PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
            natColObj.setCollisionFlags(flags);
            this._nativeColliderObject.setActivationState(PhysicsComponent.ACTIVATIONSTATE_ACTIVE_TAG);
            this._enableProcessCollisions = true;
            this._updateMass(this._mass);
        }
        var nativeZero = Rigidbody3D._nativeVector3Zero;
        natColObj.setInterpolationLinearVelocity(nativeZero);
        natColObj.setLinearVelocity(nativeZero);
        natColObj.setInterpolationAngularVelocity(nativeZero);
        natColObj.setAngularVelocity(nativeZero);
        canInSimulation && this._addToSimulation();
    }
    get linearDamping() {
        return this._linearDamping;
    }
    set linearDamping(value) {
        this._linearDamping = value;
        if (this._nativeColliderObject)
            this._nativeColliderObject.setDamping(value, this._angularDamping);
    }
    get angularDamping() {
        return this._angularDamping;
    }
    set angularDamping(value) {
        this._angularDamping = value;
        if (this._nativeColliderObject)
            this._nativeColliderObject.setDamping(this._linearDamping, value);
    }
    get overrideGravity() {
        return this._overrideGravity;
    }
    set overrideGravity(value) {
        this._overrideGravity = value;
        if (this._nativeColliderObject) {
            var flag = this._nativeColliderObject.getFlags();
            if (value) {
                if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) === 0)
                    this._nativeColliderObject.setFlags(flag | Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
            }
            else {
                if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) > 0)
                    this._nativeColliderObject.setFlags(flag ^ Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
            }
        }
    }
    get gravity() {
        return this._gravity;
    }
    set gravity(value) {
        this._gravity = value;
        Rigidbody3D._nativeGravity.setValue(-value.x, value.y, value.z);
        this._nativeColliderObject.setGravity(Rigidbody3D._nativeGravity);
    }
    get totalForce() {
        if (this._nativeColliderObject) {
            var nativeTotalForce = this._nativeColliderObject.getTotalForce();
            Utils3D._convertToLayaVec3(nativeTotalForce, this._totalForce, true);
            return this._totalForce;
        }
        return null;
    }
    get linearFactor() {
        if (this._nativeColliderObject)
            return this._linearFactor;
        return null;
    }
    set linearFactor(value) {
        this._linearFactor = value;
        if (this._nativeColliderObject) {
            var nativeValue = Rigidbody3D._nativeTempVector30;
            Utils3D._convertToBulletVec3(value, nativeValue, false);
            this._nativeColliderObject.setLinearFactor(nativeValue);
        }
    }
    get linearVelocity() {
        if (this._nativeColliderObject)
            Utils3D._convertToLayaVec3(this._nativeColliderObject.getLinearVelocity(), this._linearVelocity, true);
        return this._linearVelocity;
    }
    set linearVelocity(value) {
        this._linearVelocity = value;
        if (this._nativeColliderObject) {
            var nativeValue = Rigidbody3D._nativeTempVector30;
            Utils3D._convertToBulletVec3(value, nativeValue, true);
            (this.isSleeping) && (this.wakeUp());
            this._nativeColliderObject.setLinearVelocity(nativeValue);
        }
    }
    get angularFactor() {
        if (this._nativeColliderObject)
            return this._angularFactor;
        return null;
    }
    set angularFactor(value) {
        this._angularFactor = value;
        if (this._nativeColliderObject) {
            var nativeValue = Rigidbody3D._nativeTempVector30;
            Utils3D._convertToBulletVec3(value, nativeValue, false);
            this._nativeColliderObject.setAngularFactor(nativeValue);
        }
    }
    get angularVelocity() {
        if (this._nativeColliderObject)
            Utils3D._convertToLayaVec3(this._nativeColliderObject.getAngularVelocity(), this._angularVelocity, true);
        return this._angularVelocity;
    }
    set angularVelocity(value) {
        this._angularVelocity = value;
        if (this._nativeColliderObject) {
            var nativeValue = Rigidbody3D._nativeTempVector30;
            Utils3D._convertToBulletVec3(value, nativeValue, true);
            (this.isSleeping) && (this.wakeUp());
            this._nativeColliderObject.setAngularVelocity(nativeValue);
        }
    }
    get totalTorque() {
        if (this._nativeColliderObject) {
            var nativeTotalTorque = this._nativeColliderObject.getTotalTorque();
            Utils3D._convertToLayaVec3(nativeTotalTorque, this._totalTorque, true);
            return this._totalTorque;
        }
        return null;
    }
    get detectCollisions() {
        return this._detectCollisions;
    }
    set detectCollisions(value) {
        if (this._detectCollisions !== value) {
            this._detectCollisions = value;
            if (this._colliderShape && this._enabled && this._simulation) {
                this._simulation._removeRigidBody(this);
                this._simulation._addRigidBody(this, this._collisionGroup, value ? this._canCollideWith : 0);
            }
        }
    }
    get isSleeping() {
        if (this._nativeColliderObject)
            return this._nativeColliderObject.getActivationState() === PhysicsComponent.ACTIVATIONSTATE_ISLAND_SLEEPING;
        return false;
    }
    get sleepLinearVelocity() {
        return this._nativeColliderObject.getLinearSleepingThreshold();
    }
    set sleepLinearVelocity(value) {
        this._nativeColliderObject.setSleepingThresholds(value, this._nativeColliderObject.getAngularSleepingThreshold());
    }
    get sleepAngularVelocity() {
        return this._nativeColliderObject.getAngularSleepingThreshold();
    }
    set sleepAngularVelocity(value) {
        this._nativeColliderObject.setSleepingThresholds(this._nativeColliderObject.getLinearSleepingThreshold(), value);
    }
    _updateMass(mass) {
        if (this._nativeColliderObject && this._colliderShape) {
            this._colliderShape._nativeShape.calculateLocalInertia(mass, Rigidbody3D._nativeInertia);
            this._nativeColliderObject.setMassProps(mass, Rigidbody3D._nativeInertia);
            this._nativeColliderObject.updateInertiaTensor();
        }
    }
    _delegateMotionStateGetWorldTransform(worldTransPointer) {
    }
    _delegateMotionStateSetWorldTransform(worldTransPointer) {
        var rigidBody = this._rigidbody;
        rigidBody._simulation._updatedRigidbodies++;
        var physics3D = Physics3D._physics3D;
        var worldTrans = physics3D.wrapPointer(worldTransPointer, physics3D.btTransform);
        rigidBody._updateTransformComponent(worldTrans);
    }
    _delegateMotionStateGetWorldTransformNative(ridgidBody3D, worldTransPointer) {
    }
    _delegateMotionStateSetWorldTransformNative(rigidBody3D, worldTransPointer) {
        var rigidBody = rigidBody3D;
        rigidBody._simulation._updatedRigidbodies++;
        var physics3D = Physics3D._physics3D;
        var worldTrans = physics3D.wrapPointer(worldTransPointer, physics3D.btTransform);
        rigidBody._updateTransformComponent(worldTrans);
    }
    _onScaleChange(scale) {
        super._onScaleChange(scale);
        this._updateMass(this._isKinematic ? 0 : this._mass);
    }
    _delegateMotionStateClear() {
        this._rigidbody = null;
    }
    _onAdded() {
        var physics3D = Physics3D._physics3D;
        var motionState = new physics3D.LayaMotionState();
        var isConchApp = (window.conch != null);
        if (isConchApp && physics3D.LayaMotionState.prototype.setRigidbody) {
            motionState.setRigidbody(this);
            motionState.setNativeGetWorldTransform(this._delegateMotionStateGetWorldTransformNative);
            motionState.setNativeSetWorldTransform(this._delegateMotionStateSetWorldTransformNative);
        }
        else {
            motionState.getWorldTransform = this._delegateMotionStateGetWorldTransform;
            motionState.setWorldTransform = this._delegateMotionStateSetWorldTransform;
        }
        motionState.clear = this._delegateMotionStateClear;
        motionState._rigidbody = this;
        this._nativeMotionState = motionState;
        var constructInfo = new physics3D.btRigidBodyConstructionInfo(0.0, motionState, null, Rigidbody3D._nativeVector3Zero);
        var btRigid = new physics3D.btRigidBody(constructInfo);
        btRigid.setUserIndex(this.id);
        this._nativeColliderObject = btRigid;
        super._onAdded();
        this.mass = this._mass;
        this.linearFactor = this._linearFactor;
        this.angularFactor = this._angularFactor;
        this.linearDamping = this._linearDamping;
        this.angularDamping = this._angularDamping;
        this.overrideGravity = this._overrideGravity;
        this.gravity = this._gravity;
        this.isKinematic = this._isKinematic;
        physics3D.destroy(constructInfo);
    }
    _onShapeChange(colShape) {
        super._onShapeChange(colShape);
        if (this._isKinematic) {
            this._updateMass(0);
        }
        else {
            this._nativeColliderObject.setCenterOfMassTransform(this._nativeColliderObject.getWorldTransform());
            this._updateMass(this._mass);
        }
    }
    _parse(data) {
        (data.friction != null) && (this.friction = data.friction);
        (data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
        (data.restitution != null) && (this.restitution = data.restitution);
        (data.isTrigger != null) && (this.isTrigger = data.isTrigger);
        (data.mass != null) && (this.mass = data.mass);
        (data.isKinematic != null) && (this.isKinematic = data.isKinematic);
        (data.linearDamping != null) && (this.linearDamping = data.linearDamping);
        (data.angularDamping != null) && (this.angularDamping = data.angularDamping);
        (data.overrideGravity != null) && (this.overrideGravity = data.overrideGravity);
        if (data.gravity) {
            this.gravity.fromArray(data.gravity);
            this.gravity = this.gravity;
        }
        super._parse(data);
        this._parseShape(data.shapes);
    }
    _onDestroy() {
        var physics3D = Physics3D._physics3D;
        this._nativeMotionState.clear();
        physics3D.destroy(this._nativeMotionState);
        super._onDestroy();
        this._nativeMotionState = null;
        this._gravity = null;
        this._totalTorque = null;
        this._linearVelocity = null;
        this._angularVelocity = null;
        this._linearFactor = null;
        this._angularFactor = null;
    }
    _addToSimulation() {
        this._simulation._addRigidBody(this, this._collisionGroup, this._detectCollisions ? this._canCollideWith : 0);
    }
    _removeFromSimulation() {
        this._simulation._removeRigidBody(this);
    }
    _cloneTo(dest) {
        super._cloneTo(dest);
        var destRigidbody3D = dest;
        destRigidbody3D.isKinematic = this._isKinematic;
        destRigidbody3D.mass = this._mass;
        destRigidbody3D.gravity = this._gravity;
        destRigidbody3D.angularDamping = this._angularDamping;
        destRigidbody3D.linearDamping = this._linearDamping;
        destRigidbody3D.overrideGravity = this._overrideGravity;
        destRigidbody3D.linearVelocity = this._linearVelocity;
        destRigidbody3D.angularVelocity = this._angularVelocity;
        destRigidbody3D.linearFactor = this._linearFactor;
        destRigidbody3D.angularFactor = this._angularFactor;
        destRigidbody3D.detectCollisions = this._detectCollisions;
    }
    applyForce(force, localOffset = null) {
        if (this._nativeColliderObject == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        var nativeForce = Rigidbody3D._nativeTempVector30;
        nativeForce.setValue(-force.x, force.y, force.z);
        if (localOffset) {
            var nativeOffset = Rigidbody3D._nativeTempVector31;
            nativeOffset.setValue(-localOffset.x, localOffset.y, localOffset.z);
            this._nativeColliderObject.applyForce(nativeForce, nativeOffset);
        }
        else {
            this._nativeColliderObject.applyCentralForce(nativeForce);
        }
    }
    applyTorque(torque) {
        if (this._nativeColliderObject == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        var nativeTorque = Rigidbody3D._nativeTempVector30;
        nativeTorque.setValue(-torque.x, torque.y, torque.z);
        this._nativeColliderObject.applyTorque(nativeTorque);
    }
    applyImpulse(impulse, localOffset = null) {
        if (this._nativeColliderObject == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        Rigidbody3D._nativeImpulse.setValue(-impulse.x, impulse.y, impulse.z);
        if (localOffset) {
            Rigidbody3D._nativeImpulseOffset.setValue(-localOffset.x, localOffset.y, localOffset.z);
            this._nativeColliderObject.applyImpulse(Rigidbody3D._nativeImpulse, Rigidbody3D._nativeImpulseOffset);
        }
        else {
            this._nativeColliderObject.applyCentralImpulse(Rigidbody3D._nativeImpulse);
        }
    }
    applyTorqueImpulse(torqueImpulse) {
        if (this._nativeColliderObject == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        var nativeTorqueImpulse = Rigidbody3D._nativeTempVector30;
        nativeTorqueImpulse.setValue(-torqueImpulse.x, torqueImpulse.y, torqueImpulse.z);
        this._nativeColliderObject.applyTorqueImpulse(nativeTorqueImpulse);
    }
    wakeUp() {
        this._nativeColliderObject && (this._nativeColliderObject.activate(false));
    }
    clearForces() {
        var rigidBody = this._nativeColliderObject;
        if (rigidBody == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        rigidBody.clearForces();
        var nativeZero = Rigidbody3D._nativeVector3Zero;
        rigidBody.setInterpolationLinearVelocity(nativeZero);
        rigidBody.setLinearVelocity(nativeZero);
        rigidBody.setInterpolationAngularVelocity(nativeZero);
        rigidBody.setAngularVelocity(nativeZero);
    }
}
Rigidbody3D.TYPE_STATIC = 0;
Rigidbody3D.TYPE_DYNAMIC = 1;
Rigidbody3D.TYPE_KINEMATIC = 2;
Rigidbody3D._BT_DISABLE_WORLD_GRAVITY = 1;
Rigidbody3D._BT_ENABLE_GYROPSCOPIC_FORCE = 2;
