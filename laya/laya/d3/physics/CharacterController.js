import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { Utils3D } from "../utils/Utils3D";
import { PhysicsComponent } from "./PhysicsComponent";
import { Physics3D } from "./Physics3D";
export class CharacterController extends PhysicsComponent {
    constructor(stepheight = 0.1, upAxis = null, collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        super(collisionGroup, canCollideWith);
        this._upAxis = new Vector3(0, 1, 0);
        this._maxSlope = 45.0;
        this._jumpSpeed = 10.0;
        this._fallSpeed = 55.0;
        this._gravity = new Vector3(0, -9.8 * 3, 0);
        this._nativeKinematicCharacter = null;
        this._stepHeight = stepheight;
        (upAxis) && (this._upAxis = upAxis);
    }
    static __init__() {
        CharacterController._nativeTempVector30 = new Physics3D._physics3D.btVector3(0, 0, 0);
    }
    get fallSpeed() {
        return this._fallSpeed;
    }
    set fallSpeed(value) {
        this._fallSpeed = value;
        this._nativeKinematicCharacter.setFallSpeed(value);
    }
    get jumpSpeed() {
        return this._jumpSpeed;
    }
    set jumpSpeed(value) {
        this._jumpSpeed = value;
        this._nativeKinematicCharacter.setJumpSpeed(value);
    }
    get gravity() {
        return this._gravity;
    }
    set gravity(value) {
        this._gravity = value;
        var nativeGravity = CharacterController._nativeTempVector30;
        nativeGravity.setValue(-value.x, value.y, value.z);
        this._nativeKinematicCharacter.setGravity(nativeGravity);
    }
    get maxSlope() {
        return this._maxSlope;
    }
    set maxSlope(value) {
        this._maxSlope = value;
        this._nativeKinematicCharacter.setMaxSlope((value / 180) * Math.PI);
    }
    get isGrounded() {
        return this._nativeKinematicCharacter.onGround();
    }
    get stepHeight() {
        return this._stepHeight;
    }
    set stepHeight(value) {
        this._stepHeight = value;
        this._constructCharacter();
    }
    get upAxis() {
        return this._upAxis;
    }
    set upAxis(value) {
        this._upAxis = value;
        this._constructCharacter();
    }
    _constructCharacter() {
        var physics3D = Physics3D._physics3D;
        if (this._nativeKinematicCharacter)
            physics3D.destroy(this._nativeKinematicCharacter);
        var nativeUpAxis = CharacterController._nativeTempVector30;
        nativeUpAxis.setValue(this._upAxis.x, this._upAxis.y, this._upAxis.z);
        this._nativeKinematicCharacter = new physics3D.btKinematicCharacterController(this._nativeColliderObject, this._colliderShape._nativeShape, this._stepHeight, nativeUpAxis);
        this.fallSpeed = this._fallSpeed;
        this.maxSlope = this._maxSlope;
        this.jumpSpeed = this._jumpSpeed;
        this.gravity = this._gravity;
    }
    _onShapeChange(colShape) {
        super._onShapeChange(colShape);
        this._constructCharacter();
    }
    _onAdded() {
        var physics3D = Physics3D._physics3D;
        var ghostObject = new physics3D.btPairCachingGhostObject();
        ghostObject.setUserIndex(this.id);
        ghostObject.setCollisionFlags(PhysicsComponent.COLLISIONFLAGS_CHARACTER_OBJECT);
        this._nativeColliderObject = ghostObject;
        if (this._colliderShape)
            this._constructCharacter();
        super._onAdded();
    }
    _addToSimulation() {
        this._simulation._characters.push(this);
        this._simulation._addCharacter(this, this._collisionGroup, this._canCollideWith);
    }
    _removeFromSimulation() {
        this._simulation._removeCharacter(this);
        var characters = this._simulation._characters;
        characters.splice(characters.indexOf(this), 1);
    }
    _cloneTo(dest) {
        super._cloneTo(dest);
        var destCharacterController = dest;
        destCharacterController.stepHeight = this._stepHeight;
        destCharacterController.upAxis = this._upAxis;
        destCharacterController.maxSlope = this._maxSlope;
        destCharacterController.jumpSpeed = this._jumpSpeed;
        destCharacterController.fallSpeed = this._fallSpeed;
        destCharacterController.gravity = this._gravity;
    }
    _onDestroy() {
        Physics3D._physics3D.destroy(this._nativeKinematicCharacter);
        super._onDestroy();
        this._nativeKinematicCharacter = null;
    }
    move(movement) {
        var nativeMovement = CharacterController._nativeVector30;
        nativeMovement.setValue(-movement.x, movement.y, movement.z);
        this._nativeKinematicCharacter.setWalkDirection(nativeMovement);
    }
    jump(velocity = null) {
        if (velocity) {
            var nativeVelocity = CharacterController._nativeVector30;
            Utils3D._convertToBulletVec3(velocity, nativeVelocity, true);
            this._nativeKinematicCharacter.jump(nativeVelocity);
        }
        else {
            this._nativeKinematicCharacter.jump();
        }
    }
}
CharacterController.UPAXIS_X = 0;
CharacterController.UPAXIS_Y = 1;
CharacterController.UPAXIS_Z = 2;
