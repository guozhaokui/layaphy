import { PhysicsComponent } from "./PhysicsComponent";
export class PhysicsTriggerComponent extends PhysicsComponent {
    constructor(collisionGroup, canCollideWith) {
        super(collisionGroup, canCollideWith);
        this._isTrigger = false;
    }
    get isTrigger() {
        return this._isTrigger;
    }
    set isTrigger(value) {
        this._isTrigger = value;
        if (this._nativeColliderObject) {
            var flags = this._nativeColliderObject.getCollisionFlags();
            if (value) {
                if ((flags & PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE) === 0)
                    this._nativeColliderObject.setCollisionFlags(flags | PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
            }
            else {
                if ((flags & PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE) !== 0)
                    this._nativeColliderObject.setCollisionFlags(flags ^ PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
            }
        }
    }
    _onAdded() {
        super._onAdded();
        this.isTrigger = this._isTrigger;
    }
    _cloneTo(dest) {
        super._cloneTo(dest);
        dest.isTrigger = this._isTrigger;
    }
}
