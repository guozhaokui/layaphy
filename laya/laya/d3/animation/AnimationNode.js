import { AnimationTransform3D } from "./AnimationTransform3D";
export class AnimationNode {
    constructor(localPosition = null, localRotation = null, localScale = null, worldMatrix = null) {
        this._children = [];
        this.transform = new AnimationTransform3D(this, localPosition, localRotation, localScale, worldMatrix);
    }
    addChild(child) {
        child._parent = this;
        child.transform.setParent(this.transform);
        this._children.push(child);
    }
    removeChild(child) {
        var index = this._children.indexOf(child);
        (index !== -1) && (this._children.splice(index, 1));
    }
    getChildByName(name) {
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            if (child.name === name)
                return child;
        }
        return null;
    }
    getChildByIndex(index) {
        return this._children[index];
    }
    getChildCount() {
        return this._children.length;
    }
    cloneTo(destObject) {
        var destNode = destObject;
        destNode.name = this.name;
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            var destChild = child.clone();
            destNode.addChild(destChild);
            var transform = child.transform;
            var destTransform = destChild.transform;
            var destLocalPosition = destTransform.localPosition;
            var destLocalRotation = destTransform.localRotation;
            var destLocalScale = destTransform.localScale;
            transform.localPosition.cloneTo(destLocalPosition);
            transform.localRotation.cloneTo(destLocalRotation);
            transform.localScale.cloneTo(destLocalScale);
            destTransform.localPosition = destLocalPosition;
            destTransform.localRotation = destLocalRotation;
            destTransform.localScale = destLocalScale;
        }
    }
    clone() {
        var dest = new AnimationNode();
        this.cloneTo(dest);
        return dest;
    }
    _cloneNative(localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, parentIndex, avatar) {
        var curID = avatar._nativeCurCloneCount;
        animationNodeParentIndices[curID] = parentIndex;
        var localPosition = new Float32Array(localPositions.buffer, curID * 3 * 4, 3);
        var localRotation = new Float32Array(localRotations.buffer, curID * 4 * 4, 4);
        var localScale = new Float32Array(localScales.buffer, curID * 3 * 4, 3);
        var worldMatrix = new Float32Array(animationNodeWorldMatrixs.buffer, curID * 16 * 4, 16);
        var dest = new AnimationNode(localPosition, localRotation, localScale, worldMatrix);
        dest._worldMatrixIndex = curID;
        this._cloneToNative(dest, localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, curID, avatar);
        return dest;
    }
    _cloneToNative(destObject, localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, parentIndex, avatar) {
        var destNode = destObject;
        destNode.name = this.name;
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            avatar._nativeCurCloneCount++;
            var destChild = child._cloneNative(localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, parentIndex, avatar);
            destNode.addChild(destChild);
            var transform = child.transform;
            var destTransform = destChild.transform;
            var destLocalPosition = destTransform.localPosition;
            var destLocalRotation = destTransform.localRotation;
            var destLocalScale = destTransform.localScale;
            transform.localPosition.cloneTo(destLocalPosition);
            transform.localRotation.cloneTo(destLocalRotation);
            transform.localScale.cloneTo(destLocalScale);
            destTransform.localPosition = destLocalPosition;
            destTransform.localRotation = destLocalRotation;
            destTransform.localScale = destLocalScale;
        }
    }
}
