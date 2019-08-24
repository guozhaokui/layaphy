import { Event } from "../../events/Event";
import { EventDispatcher } from "../../events/EventDispatcher";
import { MathUtils3D } from "../math/MathUtils3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Matrix3x3 } from "../math/Matrix3x3";
export class Transform3D extends EventDispatcher {
    constructor(owner) {
        super();
        this._localPosition = new Vector3(0, 0, 0);
        this._localRotation = new Quaternion(0, 0, 0, 1);
        this._localScale = new Vector3(1, 1, 1);
        this._localRotationEuler = new Vector3(0, 0, 0);
        this._localMatrix = new Matrix4x4();
        this._position = new Vector3(0, 0, 0);
        this._rotation = new Quaternion(0, 0, 0, 1);
        this._scale = new Vector3(1, 1, 1);
        this._rotationEuler = new Vector3(0, 0, 0);
        this._worldMatrix = new Matrix4x4();
        this._children = null;
        this._parent = null;
        this._dummy = null;
        this._transformFlag = 0;
        this._owner = owner;
        this._children = [];
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION | Transform3D.TRANSFORM_LOCALEULER | Transform3D.TRANSFORM_LOCALMATRIX, false);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE | Transform3D.TRANSFORM_WORLDMATRIX, true);
    }
    get _isFrontFaceInvert() {
        var scale = this.scale;
        var isInvert = scale.x < 0;
        (scale.y < 0) && (isInvert = !isInvert);
        (scale.z < 0) && (isInvert = !isInvert);
        return isInvert;
    }
    get owner() {
        return this._owner;
    }
    get worldNeedUpdate() {
        return this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX);
    }
    get localPositionX() {
        return this._localPosition.x;
    }
    set localPositionX(x) {
        this._localPosition.x = x;
        this.localPosition = this._localPosition;
    }
    get localPositionY() {
        return this._localPosition.y;
    }
    set localPositionY(y) {
        this._localPosition.y = y;
        this.localPosition = this._localPosition;
    }
    get localPositionZ() {
        return this._localPosition.z;
    }
    set localPositionZ(z) {
        this._localPosition.z = z;
        this.localPosition = this._localPosition;
    }
    get localPosition() {
        return this._localPosition;
    }
    set localPosition(value) {
        if (this._localPosition !== value)
            value.cloneTo(this._localPosition);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, true);
        this._onWorldPositionTransform();
    }
    get localRotationX() {
        return this.localRotation.x;
    }
    set localRotationX(x) {
        this._localRotation.x = x;
        this.localRotation = this._localRotation;
    }
    get localRotationY() {
        return this.localRotation.y;
    }
    set localRotationY(y) {
        this._localRotation.y = y;
        this.localRotation = this._localRotation;
    }
    get localRotationZ() {
        return this.localRotation.z;
    }
    set localRotationZ(z) {
        this._localRotation.z = z;
        this.localRotation = this._localRotation;
    }
    get localRotationW() {
        return this.localRotation.w;
    }
    set localRotationW(w) {
        this._localRotation.w = w;
        this.localRotation = this._localRotation;
    }
    get localRotation() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION)) {
            var eulerE = this._localRotationEuler;
            Quaternion.createFromYawPitchRoll(eulerE.y / Transform3D._angleToRandin, eulerE.x / Transform3D._angleToRandin, eulerE.z / Transform3D._angleToRandin, this._localRotation);
            this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
        }
        return this._localRotation;
    }
    set localRotation(value) {
        if (this._localRotation !== value)
            value.cloneTo(this._localRotation);
        this._localRotation.normalize(this._localRotation);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER | Transform3D.TRANSFORM_LOCALMATRIX, true);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
        this._onWorldRotationTransform();
    }
    get localScaleX() {
        return this._localScale.x;
    }
    set localScaleX(value) {
        this._localScale.x = value;
        this.localScale = this._localScale;
    }
    get localScaleY() {
        return this._localScale.y;
    }
    set localScaleY(value) {
        this._localScale.y = value;
        this.localScale = this._localScale;
    }
    get localScaleZ() {
        return this._localScale.z;
    }
    set localScaleZ(value) {
        this._localScale.z = value;
        this.localScale = this._localScale;
    }
    get localScale() {
        return this._localScale;
    }
    set localScale(value) {
        if (this._localScale !== value)
            value.cloneTo(this._localScale);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, true);
        this._onWorldScaleTransform();
    }
    get localRotationEulerX() {
        return this.localRotationEuler.x;
    }
    set localRotationEulerX(value) {
        this._localRotationEuler.x = value;
        this.localRotationEuler = this._localRotationEuler;
    }
    get localRotationEulerY() {
        return this.localRotationEuler.y;
    }
    set localRotationEulerY(value) {
        this._localRotationEuler.y = value;
        this.localRotationEuler = this._localRotationEuler;
    }
    get localRotationEulerZ() {
        return this.localRotationEuler.z;
    }
    set localRotationEulerZ(value) {
        this._localRotationEuler.z = value;
        this.localRotationEuler = this._localRotationEuler;
    }
    get localRotationEuler() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALEULER)) {
            this._localRotation.getYawPitchRoll(Transform3D._tempVector30);
            var euler = Transform3D._tempVector30;
            var localRotationEuler = this._localRotationEuler;
            localRotationEuler.x = euler.y * Transform3D._angleToRandin;
            localRotationEuler.y = euler.x * Transform3D._angleToRandin;
            localRotationEuler.z = euler.z * Transform3D._angleToRandin;
            this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, false);
        }
        return this._localRotationEuler;
    }
    set localRotationEuler(value) {
        if (this._localRotationEuler !== value)
            value.cloneTo(this._localRotationEuler);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, false);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION | Transform3D.TRANSFORM_LOCALMATRIX, true);
        this._onWorldRotationTransform();
    }
    get localMatrix() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX)) {
            Matrix4x4.createAffineTransformation(this._localPosition, this.localRotation, this._localScale, this._localMatrix);
            this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, false);
        }
        return this._localMatrix;
    }
    set localMatrix(value) {
        if (this._localMatrix !== value)
            value.cloneTo(this._localMatrix);
        this._localMatrix.decomposeTransRotScale(this._localPosition, this._localRotation, this._localScale);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, true);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, false);
        this._onWorldTransform();
    }
    get position() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            if (this._parent != null) {
                var worldMatE = this.worldMatrix.elements;
                this._position.x = worldMatE[12];
                this._position.y = worldMatE[13];
                this._position.z = worldMatE[14];
            }
            else {
                this._localPosition.cloneTo(this._position);
            }
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
        }
        return this._position;
    }
    set position(value) {
        if (this._parent != null) {
            var parentInvMat = Transform3D._tempMatrix0;
            this._parent.worldMatrix.invert(parentInvMat);
            Vector3.transformCoordinate(value, parentInvMat, this._localPosition);
        }
        else {
            value.cloneTo(this._localPosition);
        }
        this.localPosition = this._localPosition;
        if (this._position !== value)
            value.cloneTo(this._position);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
    }
    get rotation() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
            if (this._parent != null)
                Quaternion.multiply(this._parent.rotation, this.localRotation, this._rotation);
            else
                this.localRotation.cloneTo(this._rotation);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
        }
        return this._rotation;
    }
    set rotation(value) {
        if (this._parent != null) {
            this._parent.rotation.invert(Transform3D._tempQuaternion0);
            Quaternion.multiply(Transform3D._tempQuaternion0, value, this._localRotation);
        }
        else {
            value.cloneTo(this._localRotation);
        }
        this.localRotation = this._localRotation;
        if (value !== this._rotation)
            value.cloneTo(this._rotation);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
    }
    get rotationEuler() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this.rotation.getYawPitchRoll(Transform3D._tempVector30);
            var eulerE = Transform3D._tempVector30;
            var rotationEulerE = this._rotationEuler;
            rotationEulerE.x = eulerE.y * Transform3D._angleToRandin;
            rotationEulerE.y = eulerE.x * Transform3D._angleToRandin;
            rotationEulerE.z = eulerE.z * Transform3D._angleToRandin;
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDEULER, false);
        }
        return this._rotationEuler;
    }
    set rotationEuler(value) {
        Quaternion.createFromYawPitchRoll(value.y / Transform3D._angleToRandin, value.x / Transform3D._angleToRandin, value.z / Transform3D._angleToRandin, this._rotation);
        this.rotation = this._rotation;
        if (this._rotationEuler !== value)
            value.cloneTo(this._rotationEuler);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDEULER, false);
    }
    get worldMatrix() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX)) {
            if (this._parent != null)
                Matrix4x4.multiply(this._parent.worldMatrix, this.localMatrix, this._worldMatrix);
            else
                this.localMatrix.cloneTo(this._worldMatrix);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX, false);
        }
        return this._worldMatrix;
    }
    set worldMatrix(value) {
        if (this._parent === null) {
            value.cloneTo(this._localMatrix);
        }
        else {
            this._parent.worldMatrix.invert(this._localMatrix);
            Matrix4x4.multiply(this._localMatrix, value, this._localMatrix);
        }
        this.localMatrix = this._localMatrix;
        if (this._worldMatrix !== value)
            value.cloneTo(this._worldMatrix);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX, false);
    }
    _getScaleMatrix() {
        var invRotation = Transform3D._tempQuaternion0;
        var invRotationMat = Transform3D._tempMatrix3x30;
        var worldRotScaMat = Transform3D._tempMatrix3x31;
        var scaMat = Transform3D._tempMatrix3x32;
        Matrix3x3.createFromMatrix4x4(this.worldMatrix, worldRotScaMat);
        this.rotation.invert(invRotation);
        Matrix3x3.createRotationQuaternion(invRotation, invRotationMat);
        Matrix3x3.multiply(invRotationMat, worldRotScaMat, scaMat);
        return scaMat;
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
    _setParent(value) {
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
    _onWorldPositionRotationTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionRotationTransform();
        }
    }
    _onWorldPositionScaleTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionScaleTransform();
        }
    }
    _onWorldPositionTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionTransform();
        }
    }
    _onWorldRotationTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionRotationTransform();
        }
    }
    _onWorldScaleTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionScaleTransform();
        }
    }
    _onWorldTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldTransform();
        }
    }
    translate(translation, isLocal = true) {
        if (isLocal) {
            Matrix4x4.createFromQuaternion(this.localRotation, Transform3D._tempMatrix0);
            Vector3.transformCoordinate(translation, Transform3D._tempMatrix0, Transform3D._tempVector30);
            Vector3.add(this.localPosition, Transform3D._tempVector30, this._localPosition);
            this.localPosition = this._localPosition;
        }
        else {
            Vector3.add(this.position, translation, this._position);
            this.position = this._position;
        }
    }
    rotate(rotation, isLocal = true, isRadian = true) {
        var rot;
        if (isRadian) {
            rot = rotation;
        }
        else {
            Vector3.scale(rotation, Math.PI / 180.0, Transform3D._tempVector30);
            rot = Transform3D._tempVector30;
        }
        Quaternion.createFromYawPitchRoll(rot.y, rot.x, rot.z, Transform3D._tempQuaternion0);
        if (isLocal) {
            Quaternion.multiply(this._localRotation, Transform3D._tempQuaternion0, this._localRotation);
            this.localRotation = this._localRotation;
        }
        else {
            Quaternion.multiply(Transform3D._tempQuaternion0, this.rotation, this._rotation);
            this.rotation = this._rotation;
        }
    }
    getForward(forward) {
        var worldMatElem = this.worldMatrix.elements;
        forward.x = -worldMatElem[8];
        forward.y = -worldMatElem[9];
        forward.z = -worldMatElem[10];
    }
    getUp(up) {
        var worldMatElem = this.worldMatrix.elements;
        up.x = worldMatElem[4];
        up.y = worldMatElem[5];
        up.z = worldMatElem[6];
    }
    getRight(right) {
        var worldMatElem = this.worldMatrix.elements;
        right.x = worldMatElem[0];
        right.y = worldMatElem[1];
        right.z = worldMatElem[2];
    }
    lookAt(target, up, isLocal = false) {
        var eye;
        if (isLocal) {
            eye = this._localPosition;
            if (Math.abs(eye.x - target.x) < MathUtils3D.zeroTolerance && Math.abs(eye.y - target.y) < MathUtils3D.zeroTolerance && Math.abs(eye.z - target.z) < MathUtils3D.zeroTolerance)
                return;
            Quaternion.lookAt(this._localPosition, target, up, this._localRotation);
            this._localRotation.invert(this._localRotation);
            this.localRotation = this._localRotation;
        }
        else {
            var worldPosition = this.position;
            eye = worldPosition;
            if (Math.abs(eye.x - target.x) < MathUtils3D.zeroTolerance && Math.abs(eye.y - target.y) < MathUtils3D.zeroTolerance && Math.abs(eye.z - target.z) < MathUtils3D.zeroTolerance)
                return;
            Quaternion.lookAt(worldPosition, target, up, this._rotation);
            this._rotation.invert(this._rotation);
            this.rotation = this._rotation;
        }
    }
    getLossyWorldScale() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            if (this._parent !== null) {
                var scaMatE = this._getScaleMatrix().elements;
                this._scale.x = scaMatE[0];
                this._scale.y = scaMatE[4];
                this._scale.z = scaMatE[8];
            }
            else {
                this._localScale.cloneTo(this._scale);
            }
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
        }
        return this._scale;
    }
    setLossyWorldScale(value) {
        if (this._parent !== null) {
            var scaleMat = Transform3D._tempMatrix3x33;
            var localScaleMat = Transform3D._tempMatrix3x33;
            var localScaleMatE = localScaleMat.elements;
            var parInvScaleMat = this._parent._getScaleMatrix();
            parInvScaleMat.invert(parInvScaleMat);
            Matrix3x3.createFromScaling(value, scaleMat);
            Matrix3x3.multiply(parInvScaleMat, scaleMat, localScaleMat);
            this._localScale.x = localScaleMatE[0];
            this._localScale.y = localScaleMatE[4];
            this._localScale.z = localScaleMatE[8];
        }
        else {
            value.cloneTo(this._localScale);
        }
        this.localScale = this._localScale;
        if (this._scale !== value)
            value.cloneTo(this._scale);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
    }
    get scale() {
//        console.warn("Transfrm3D: discard function,please use getLossyWorldScale instead.");
        return this.getLossyWorldScale();
    }
    set scale(value) {
        console.warn("Transfrm3D: discard function,please use setLossyWorldScale instead.");
        this.setLossyWorldScale(value);
    }
}
Transform3D._tempVector30 = new Vector3();
Transform3D._tempQuaternion0 = new Quaternion();
Transform3D._tempMatrix0 = new Matrix4x4();
Transform3D._tempMatrix3x30 = new Matrix3x3();
Transform3D._tempMatrix3x31 = new Matrix3x3();
Transform3D._tempMatrix3x32 = new Matrix3x3();
Transform3D._tempMatrix3x33 = new Matrix3x3();
Transform3D.TRANSFORM_LOCALQUATERNION = 0x01;
Transform3D.TRANSFORM_LOCALEULER = 0x02;
Transform3D.TRANSFORM_LOCALMATRIX = 0x04;
Transform3D.TRANSFORM_WORLDPOSITION = 0x08;
Transform3D.TRANSFORM_WORLDQUATERNION = 0x10;
Transform3D.TRANSFORM_WORLDSCALE = 0x20;
Transform3D.TRANSFORM_WORLDMATRIX = 0x40;
Transform3D.TRANSFORM_WORLDEULER = 0x80;
Transform3D._angleToRandin = 180 / Math.PI;
