import { Node } from "../../display/Node";
import { Loader } from "../../net/Loader";
import { URL } from "../../net/URL";
import { Animator } from "../component/Animator";
import { Shader3D } from "../shader/Shader3D";
import { Transform3D } from "./Transform3D";
import { Laya } from "../../../Laya";
export class Sprite3D extends Node {
    constructor(name = null, isStatic = false) {
        super();
        this._needProcessCollisions = false;
        this._needProcessTriggers = false;
        this._id = ++Sprite3D._uniqueIDCounter;
        this._transform = new Transform3D(this);
        this._isStatic = isStatic;
        this.layer = 0;
        this.name = name ? name : "New Sprite3D";
    }
    static __init__() {
    }
    static instantiate(original, parent = null, worldPositionStays = true, position = null, rotation = null) {
        var destSprite3D = original.clone();
        (parent) && (parent.addChild(destSprite3D));
        var transform = destSprite3D.transform;
        if (worldPositionStays) {
            var worldMatrix = transform.worldMatrix;
            original.transform.worldMatrix.cloneTo(worldMatrix);
            transform.worldMatrix = worldMatrix;
        }
        else {
            (position) && (transform.position = position);
            (rotation) && (transform.rotation = rotation);
        }
        return destSprite3D;
    }
    static load(url, complete) {
        Laya.loader.create(url, complete, null, Sprite3D.HIERARCHY);
    }
    get id() {
        return this._id;
    }
    get layer() {
        return this._layer;
    }
    set layer(value) {
        if (this._layer !== value) {
            if (value >= 0 && value <= 30) {
                this._layer = value;
            }
            else {
                throw new Error("Layer value must be 0-30.");
            }
        }
    }
    get url() {
        return this._url;
    }
    get isStatic() {
        return this._isStatic;
    }
    get transform() {
        return this._transform;
    }
    _setCreateURL(url) {
        this._url = URL.formatURL(url);
    }
    _changeAnimatorsToLinkSprite3D(sprite3D, isLink, path) {
        var animator = this.getComponent(Animator);
        if (animator) {
            if (!animator.avatar)
                sprite3D._changeAnimatorToLinkSprite3DNoAvatar(animator, isLink, path);
        }
        if (this._parent && this._parent instanceof Sprite3D) {
            path.unshift(this._parent.name);
            var p = this._parent;
            (p._hierarchyAnimator) && (p._changeAnimatorsToLinkSprite3D(sprite3D, isLink, path));
        }
    }
    _setHierarchyAnimator(animator, parentAnimator) {
        this._changeHierarchyAnimator(animator);
        this._changeAnimatorAvatar(animator.avatar);
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            (child._hierarchyAnimator == parentAnimator) && (child._setHierarchyAnimator(animator, parentAnimator));
        }
    }
    _clearHierarchyAnimator(animator, parentAnimator) {
        this._changeHierarchyAnimator(parentAnimator);
        this._changeAnimatorAvatar(parentAnimator ? parentAnimator.avatar : null);
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            (child._hierarchyAnimator == animator) && (child._clearHierarchyAnimator(animator, parentAnimator));
        }
    }
    _changeHierarchyAnimatorAvatar(animator, avatar) {
        this._changeAnimatorAvatar(avatar);
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            (child._hierarchyAnimator == animator) && (child._changeHierarchyAnimatorAvatar(animator, avatar));
        }
    }
    _changeAnimatorToLinkSprite3DNoAvatar(animator, isLink, path) {
        animator._handleSpriteOwnersBySprite(isLink, path, this);
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            var index = path.length;
            path.push(child.name);
            child._changeAnimatorToLinkSprite3DNoAvatar(animator, isLink, path);
            path.splice(index, 1);
        }
    }
    _changeHierarchyAnimator(animator) {
        this._hierarchyAnimator = animator;
    }
    _changeAnimatorAvatar(avatar) {
    }
    _onAdded() {
        if (this._parent instanceof Sprite3D) {
            var parent3D = this._parent;
            this.transform._setParent(parent3D.transform);
            if (parent3D._hierarchyAnimator) {
                (!this._hierarchyAnimator) && (this._setHierarchyAnimator(parent3D._hierarchyAnimator, null));
                parent3D._changeAnimatorsToLinkSprite3D(this, true, [this.name]);
            }
        }
        super._onAdded();
    }
    _onRemoved() {
        super._onRemoved();
        if (this._parent instanceof Sprite3D) {
            var parent3D = this._parent;
            this.transform._setParent(null);
            if (parent3D._hierarchyAnimator) {
                (this._hierarchyAnimator == parent3D._hierarchyAnimator) && (this._clearHierarchyAnimator(parent3D._hierarchyAnimator, null));
                parent3D._changeAnimatorsToLinkSprite3D(this, false, [this.name]);
            }
        }
    }
    _parse(data, spriteMap) {
        (data.isStatic !== undefined) && (this._isStatic = data.isStatic);
        (data.active !== undefined) && (this.active = data.active);
        (data.name != undefined) && (this.name = data.name);
        if (data.position !== undefined) {
            var loccalPosition = this.transform.localPosition;
            loccalPosition.fromArray(data.position);
            this.transform.localPosition = loccalPosition;
        }
        if (data.rotationEuler !== undefined) {
            var localRotationEuler = this.transform.localRotationEuler;
            localRotationEuler.fromArray(data.rotationEuler);
            this.transform.localRotationEuler = localRotationEuler;
        }
        if (data.rotation !== undefined) {
            var localRotation = this.transform.localRotation;
            localRotation.fromArray(data.rotation);
            this.transform.localRotation = localRotation;
        }
        if (data.scale !== undefined) {
            var localScale = this.transform.localScale;
            localScale.fromArray(data.scale);
            this.transform.localScale = localScale;
        }
        (data.layer != undefined) && (this.layer = data.layer);
    }
    _cloneTo(destObject, srcRoot, dstRoot) {
        if (this.destroyed)
            throw new Error("Sprite3D: Can't be cloned if the Sprite3D has destroyed.");
        var destSprite3D = destObject;
        destSprite3D.name = this.name;
        destSprite3D.destroyed = this.destroyed;
        destSprite3D.active = this.active;
        var destLocalPosition = destSprite3D.transform.localPosition;
        this.transform.localPosition.cloneTo(destLocalPosition);
        destSprite3D.transform.localPosition = destLocalPosition;
        var destLocalRotation = destSprite3D.transform.localRotation;
        this.transform.localRotation.cloneTo(destLocalRotation);
        destSprite3D.transform.localRotation = destLocalRotation;
        var destLocalScale = destSprite3D.transform.localScale;
        this.transform.localScale.cloneTo(destLocalScale);
        destSprite3D.transform.localScale = destLocalScale;
        destSprite3D._isStatic = this._isStatic;
        destSprite3D.layer = this.layer;
        super._cloneTo(destSprite3D, srcRoot, dstRoot);
    }
    static _createSprite3DInstance(scrSprite) {
        var node = scrSprite._create();
        var children = scrSprite._children;
        for (var i = 0, n = children.length; i < n; i++) {
            var child = Sprite3D._createSprite3DInstance(children[i]);
            node.addChild(child);
        }
        return node;
    }
    static _parseSprite3DInstance(srcRoot, dstRoot, scrSprite, dstSprite) {
        var srcChildren = scrSprite._children;
        var dstChildren = dstSprite._children;
        for (var i = 0, n = srcChildren.length; i < n; i++)
            Sprite3D._parseSprite3DInstance(srcRoot, dstRoot, srcChildren[i], dstChildren[i]);
        scrSprite._cloneTo(dstSprite, srcRoot, dstRoot);
    }
    clone() {
        var dstSprite3D = Sprite3D._createSprite3DInstance(this);
        Sprite3D._parseSprite3DInstance(this, dstSprite3D, this, dstSprite3D);
        return dstSprite3D;
    }
    destroy(destroyChild = true) {
        if (this.destroyed)
            return;
        super.destroy(destroyChild);
        this._transform = null;
        this._scripts = null;
        this._url && Loader.clearRes(this._url);
    }
    _create() {
        return new Sprite3D();
    }
}
Sprite3D.HIERARCHY = "HIERARCHY";
Sprite3D.WORLDMATRIX = Shader3D.propertyNameToID("u_WorldMat");
Sprite3D.MVPMATRIX = Shader3D.propertyNameToID("u_MvpMatrix");
Sprite3D._uniqueIDCounter = 0;
