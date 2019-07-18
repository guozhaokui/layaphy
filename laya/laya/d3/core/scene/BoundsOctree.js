import { BoundsOctreeNode } from "./BoundsOctreeNode";
import { OctreeMotionList } from "./OctreeMotionList";
import { Vector3 } from "../../math/Vector3";
export class BoundsOctree {
    constructor(initialWorldSize, initialWorldPos, minNodeSize, looseness) {
        this._motionObjects = new OctreeMotionList();
        this.count = 0;
        if (minNodeSize > initialWorldSize) {
            console.warn("Minimum node size must be at least as big as the initial world size. Was: " + minNodeSize + " Adjusted to: " + initialWorldSize);
            minNodeSize = initialWorldSize;
        }
        this._initialSize = initialWorldSize;
        this._minSize = minNodeSize;
        this._looseness = Math.min(Math.max(looseness, 1.0), 2.0);
        this._rootNode = new BoundsOctreeNode(this, null, initialWorldSize, initialWorldPos);
    }
    _getMaxDepth(node, depth) {
        depth++;
        var children = node._children;
        if (children != null) {
            var curDepth = depth;
            for (var i = 0, n = children.length; i < n; i++) {
                var child = children[i];
                child && (depth = Math.max(this._getMaxDepth(child, curDepth), depth));
            }
        }
        return depth;
    }
    _grow(growObjectCenter) {
        var xDirection = growObjectCenter.x >= 0 ? 1 : -1;
        var yDirection = growObjectCenter.y >= 0 ? 1 : -1;
        var zDirection = growObjectCenter.z >= 0 ? 1 : -1;
        var oldRoot = this._rootNode;
        var half = this._rootNode.baseLength / 2;
        var newLength = this._rootNode.baseLength * 2;
        var rootCenter = this._rootNode.center;
        var newCenter = new Vector3(rootCenter.x + xDirection * half, rootCenter.y + yDirection * half, rootCenter.z + zDirection * half);
        this._rootNode = new BoundsOctreeNode(this, null, newLength, newCenter);
        if (oldRoot.hasAnyObjects()) {
            var rootPos = this._rootNode._bestFitChild(oldRoot.center);
            var children = [];
            for (var i = 0; i < 8; i++) {
                if (i == rootPos) {
                    oldRoot._parent = this._rootNode;
                    children[i] = oldRoot;
                }
            }
            this._rootNode._children = children;
        }
    }
    add(object) {
        var count = 0;
        while (!this._rootNode.add(object)) {
            var growCenter = BoundsOctree._tempVector30;
            Vector3.subtract(object.bounds.getCenter(), this._rootNode.center, growCenter);
            this._grow(growCenter);
            if (++count > 20) {
                throw "Aborted Add operation as it seemed to be going on forever (" + (count - 1) + ") attempts at growing the octree.";
            }
        }
        this.count++;
    }
    remove(object) {
        var removed = object._getOctreeNode().remove(object);
        if (removed) {
            this.count--;
        }
        return removed;
    }
    update(object) {
        var count = 0;
        var octreeNode = object._getOctreeNode();
        if (octreeNode) {
            while (!octreeNode._update(object)) {
                var growCenter = BoundsOctree._tempVector30;
                Vector3.subtract(object.bounds.getCenter(), this._rootNode.center, growCenter);
                this._grow(growCenter);
                if (++count > 20) {
                    throw "Aborted Add operation as it seemed to be going on forever (" + (count - 1) + ") attempts at growing the octree.";
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    shrinkRootIfPossible() {
        this._rootNode = this._rootNode.shrinkIfPossible(this._initialSize);
    }
    addMotionObject(object) {
        this._motionObjects.add(object);
    }
    removeMotionObject(object) {
        this._motionObjects.remove(object);
    }
    updateMotionObjects() {
        var elements = this._motionObjects.elements;
        for (var i = 0, n = this._motionObjects.length; i < n; i++) {
            var object = elements[i];
            this.update(object);
            object._setIndexInMotionList(-1);
        }
        this._motionObjects.length = 0;
    }
    isCollidingWithBoundBox(checkBounds) {
        return this._rootNode.isCollidingWithBoundBox(checkBounds);
    }
    isCollidingWithRay(ray, maxDistance = Number.MAX_VALUE) {
        return this._rootNode.isCollidingWithRay(ray, maxDistance);
    }
    getCollidingWithBoundBox(checkBound, result) {
        this._rootNode.getCollidingWithBoundBox(checkBound, result);
    }
    getCollidingWithRay(ray, result, maxDistance = Number.MAX_VALUE) {
        this._rootNode.getCollidingWithRay(ray, result, maxDistance);
    }
    getCollidingWithFrustum(context, shader, replacementTag) {
        this._rootNode.getCollidingWithFrustum(context, shader, replacementTag);
    }
    getMaxBounds() {
        return this._rootNode.getBound();
    }
    drawAllBounds(pixelLine) {
        var maxDepth = this._getMaxDepth(this._rootNode, -1);
        this._rootNode.drawAllBounds(pixelLine, -1, maxDepth);
    }
    drawAllObjects(pixelLine) {
        var maxDepth = this._getMaxDepth(this._rootNode, -1);
        this._rootNode.drawAllObjects(pixelLine, -1, maxDepth);
    }
}
BoundsOctree._tempVector30 = new Vector3();
