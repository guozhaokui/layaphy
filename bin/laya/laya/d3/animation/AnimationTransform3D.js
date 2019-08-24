import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Utils3D } from "../utils/Utils3D";
import { Event } from "../../events/Event";
import { EventDispatcher } from "../../events/EventDispatcher";
import { Render } from "../../renders/Render";
import { ConchQuaternion } from "../math/Native/ConchQuaternion";
import { ConchVector3 } from "../math/Native/ConchVector3";
export class AnimationTransform3D extends EventDispatcher {
    constructor(owner, localPosition = null, localRotation = null, localScale = null, worldMatrix = null) {
        super();
        this._owner = owner;
        this._children = [];
        this._localMatrix = new Float32Array(16);
        if (Render.supportWebGLPlusAnimation) {
            this._localPosition = new ConchVector3(0, 0, 0, localPosition);
            this._localRotation = new ConchQuaternion(0, 0, 0, 1, localRotation);
            this._localScale = new ConchVector3(0, 0, 0, localScale);
            this._worldMatrix = worldMatrix;
        }
        else {
            this._localPosition = new Vector3();
            this._localRotation = new Quaternion();
            this._localScale = new Vector3();
            this._worldMatrix = new Float32Array(16);
        }
        this._localQuaternionUpdate = false;
        this._locaEulerlUpdate = false;
        this._localUpdate = false;
        this._worldUpdate = true;
    }
    _getlocalMatrix() {
        if (this._localUpdate) {
            Utils3D._createAffineTransformationArray(this._localPosition, this._localRotation, this._localScale, this._localMatrix);
            this._localUpdate = false;
        }
        return this._localMatrix;
    }
    _onWorldTransform() {
        if (!this._worldUpdate) {
            this._worldUpdate = true;
            this.event(Event.TRANSFORM_CHANGED);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldTransform();
        }
    }
    get localPosition() {
        return this._localPosition;
    }
    set localPosition(value) {
        this._localPosition = value;
        this._localUpdate = true;
        this._onWorldTransform();
    }
    get localRotation() {
        if (this._localQuaternionUpdate) {
            var euler = this._localRotationEuler;
            Quaternion.createFromYawPitchRoll(euler.y / AnimationTransform3D._angleToRandin, euler.x / AnimationTransform3D._angleToRandin, euler.z / AnimationTransform3D._angleToRandin, this._localRotation);
            this._localQuaternionUpdate = false;
        }
        return this._localRotation;
    }
    set localRotation(value) {
        this._localRotation = value;
        this._locaEulerlUpdate = true;
        this._localQuaternionUpdate = false;
        this._localUpdate = true;
        this._onWorldTransform();
    }
    get localScale() {
        return this._localScale;
    }
    set localScale(value) {
        this._localScale = value;
        this._localUpdate = true;
        this._onWorldTransform();
    }
    get localRotationEuler() {
        if (this._locaEulerlUpdate) {
            this._localRotation.getYawPitchRoll(AnimationTransform3D._tempVector3);
            var euler = AnimationTransform3D._tempVector3;
            var localRotationEuler = this._localRotationEuler;
            localRotationEuler.x = euler.y * AnimationTransform3D._angleToRandin;
            localRotationEuler.y = euler.x * AnimationTransform3D._angleToRandin;
            localRotationEuler.z = euler.z * AnimationTransform3D._angleToRandin;
            this._locaEulerlUpdate = false;
        }
        return this._localRotationEuler;
    }
    set localRotationEuler(value) {
        this._localRotationEuler = value;
        this._locaEulerlUpdate = false;
        this._localQuaternionUpdate = true;
        this._localUpdate = true;
        this._onWorldTransform();
    }
    getWorldMatrix() {
        if (!Render.supportWebGLPlusAnimation && this._worldUpdate) {
            if (this._parent != null) {
                Utils3D.matrix4x4MultiplyFFF(this._parent.getWorldMatrix(), this._getlocalMatrix(), this._worldMatrix);
            }
            else {
                var e = this._worldMatrix;
                e[1] = e[2] = e[3] = e[4] = e[6] = e[7] = e[8] = e[9] = e[11] = e[12] = e[13] = e[14] = 0;
                e[0] = e[5] = e[10] = e[15] = 1;
            }
            this._worldUpdate = false;
        }
        if (Render.supportWebGLPlusAnimation && this._worldUpdate) {
            this._worldUpdate = false;
        }
        return this._worldMatrix;
    }
    setParent(value) {
        if (this._parent !== value) {
            if (this._parent) {
                var parentChilds = this._parent._children;
                var index = parentChilds.indexOf(this);
                parentChilds.splice(index, 1);
            }
            if (value) {
                value._children.push(this);
                (value) && (this._onWorldTransform());
            }
            this._parent = value;
        }
    }
}
AnimationTransform3D._tempVector3 = new Vector3();
AnimationTransform3D._angleToRandin = 180 / Math.PI;
