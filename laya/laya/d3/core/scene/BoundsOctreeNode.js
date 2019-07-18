import { Stat } from "../../../utils/Stat";
import { BoundBox } from "../../math/BoundBox";
import { CollisionUtils } from "../../math/CollisionUtils";
import { Color } from "../../math/Color";
import { ContainmentType } from "../../math/ContainmentType";
import { Vector3 } from "../../math/Vector3";
import { Utils3D } from "../../utils/Utils3D";
export class BoundsOctreeNode {
    constructor(octree, parent, baseLength, center) {
        this._bounds = new BoundBox(new Vector3(), new Vector3());
        this._objects = [];
        this._isContaion = false;
        this.center = new Vector3();
        this.baseLength = 0.0;
        this._setValues(octree, parent, baseLength, center);
    }
    static _encapsulates(outerBound, innerBound) {
        return CollisionUtils.boxContainsBox(outerBound, innerBound) == ContainmentType.Contains;
    }
    _setValues(octree, parent, baseLength, center) {
        this._octree = octree;
        this._parent = parent;
        this.baseLength = baseLength;
        center.cloneTo(this.center);
        var min = this._bounds.min;
        var max = this._bounds.max;
        var halfSize = (octree._looseness * baseLength) / 2;
        min.setValue(center.x - halfSize, center.y - halfSize, center.z - halfSize);
        max.setValue(center.x + halfSize, center.y + halfSize, center.z + halfSize);
    }
    _getChildBound(index) {
        if (this._children != null && this._children[index]) {
            return this._children[index]._bounds;
        }
        else {
            var quarter = this.baseLength / 4;
            var halfChildSize = ((this.baseLength / 2) * this._octree._looseness) / 2;
            var bounds = BoundsOctreeNode._tempBoundBox;
            var min = bounds.min;
            var max = bounds.max;
            switch (index) {
                case 0:
                    min.x = this.center.x - quarter - halfChildSize;
                    min.y = this.center.y + quarter - halfChildSize;
                    min.z = this.center.z - quarter - halfChildSize;
                    max.x = this.center.x - quarter + halfChildSize;
                    max.y = this.center.y + quarter + halfChildSize;
                    max.z = this.center.z - quarter + halfChildSize;
                    break;
                case 1:
                    min.x = this.center.x + quarter - halfChildSize;
                    min.y = this.center.y + quarter - halfChildSize;
                    min.z = this.center.z - quarter - halfChildSize;
                    max.x = this.center.x + quarter + halfChildSize;
                    max.y = this.center.y + quarter + halfChildSize;
                    max.z = this.center.z - quarter + halfChildSize;
                    break;
                case 2:
                    min.x = this.center.x - quarter - halfChildSize;
                    min.y = this.center.y + quarter - halfChildSize;
                    min.z = this.center.z + quarter - halfChildSize;
                    max.x = this.center.x - quarter + halfChildSize;
                    max.y = this.center.y + quarter + halfChildSize;
                    max.z = this.center.z + quarter + halfChildSize;
                    break;
                case 3:
                    min.x = this.center.x + quarter - halfChildSize;
                    min.y = this.center.y + quarter - halfChildSize;
                    min.z = this.center.z + quarter - halfChildSize;
                    max.x = this.center.x + quarter + halfChildSize;
                    max.y = this.center.y + quarter + halfChildSize;
                    max.z = this.center.z + quarter + halfChildSize;
                    break;
                case 4:
                    min.x = this.center.x - quarter - halfChildSize;
                    min.y = this.center.y - quarter - halfChildSize;
                    min.z = this.center.z - quarter - halfChildSize;
                    max.x = this.center.x - quarter + halfChildSize;
                    max.y = this.center.y - quarter + halfChildSize;
                    max.z = this.center.z - quarter + halfChildSize;
                    break;
                case 5:
                    min.x = this.center.x + quarter - halfChildSize;
                    min.y = this.center.y - quarter - halfChildSize;
                    min.z = this.center.z - quarter - halfChildSize;
                    max.x = this.center.x + quarter + halfChildSize;
                    max.y = this.center.y - quarter + halfChildSize;
                    max.z = this.center.z - quarter + halfChildSize;
                    break;
                case 6:
                    min.x = this.center.x - quarter - halfChildSize;
                    min.y = this.center.y - quarter - halfChildSize;
                    min.z = this.center.z + quarter - halfChildSize;
                    max.x = this.center.x - quarter + halfChildSize;
                    max.y = this.center.y - quarter + halfChildSize;
                    max.z = this.center.z + quarter + halfChildSize;
                    break;
                case 7:
                    min.x = this.center.x + quarter - halfChildSize;
                    min.y = this.center.y - quarter - halfChildSize;
                    min.z = this.center.z + quarter - halfChildSize;
                    max.x = this.center.x + quarter + halfChildSize;
                    max.y = this.center.y - quarter + halfChildSize;
                    max.z = this.center.z + quarter + halfChildSize;
                    break;
                default:
            }
            return bounds;
        }
    }
    _getChildCenter(index) {
        if (this._children != null) {
            return this._children[index].center;
        }
        else {
            var quarter = this.baseLength / 4;
            var childCenter = BoundsOctreeNode._tempVector30;
            switch (index) {
                case 0:
                    childCenter.x = this.center.x - quarter;
                    childCenter.y = this.center.y + quarter;
                    childCenter.z = this.center.z - quarter;
                    break;
                case 1:
                    childCenter.x = this.center.x + quarter;
                    childCenter.y = this.center.y + quarter;
                    childCenter.z = this.center.z - quarter;
                    break;
                case 2:
                    childCenter.x = this.center.x - quarter;
                    childCenter.y = this.center.y + quarter;
                    childCenter.z = this.center.z + quarter;
                    break;
                case 3:
                    childCenter.x = this.center.x + quarter;
                    childCenter.y = this.center.y + quarter;
                    childCenter.z = this.center.z + quarter;
                    break;
                case 4:
                    childCenter.x = this.center.x - quarter;
                    childCenter.y = this.center.y - quarter;
                    childCenter.z = this.center.z - quarter;
                    break;
                case 5:
                    childCenter.x = this.center.x + quarter;
                    childCenter.y = this.center.y - quarter;
                    childCenter.z = this.center.z - quarter;
                    break;
                case 6:
                    childCenter.x = this.center.x - quarter;
                    childCenter.y = this.center.y - quarter;
                    childCenter.z = this.center.z + quarter;
                    break;
                case 7:
                    childCenter.x = this.center.x + quarter;
                    childCenter.y = this.center.y - quarter;
                    childCenter.z = this.center.z + quarter;
                    break;
                default:
            }
            return childCenter;
        }
    }
    _getChild(index) {
        var quarter = this.baseLength / 4;
        this._children || (this._children = []);
        switch (index) {
            case 0:
                return this._children[0] || (this._children[0] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + -quarter, this.center.y + quarter, this.center.z - quarter)));
            case 1:
                return this._children[1] || (this._children[1] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + quarter, this.center.y + quarter, this.center.z - quarter)));
            case 2:
                return this._children[2] || (this._children[2] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x - quarter, this.center.y + quarter, this.center.z + quarter)));
            case 3:
                return this._children[3] || (this._children[3] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + quarter, this.center.y + quarter, this.center.z + quarter)));
            case 4:
                return this._children[4] || (this._children[4] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x - quarter, this.center.y - quarter, this.center.z - quarter)));
            case 5:
                return this._children[5] || (this._children[5] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + quarter, this.center.y - quarter, this.center.z - quarter)));
            case 6:
                return this._children[6] || (this._children[6] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x - quarter, this.center.y - quarter, this.center.z + quarter)));
            case 7:
                return this._children[7] || (this._children[7] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + quarter, this.center.y - quarter, this.center.z + quarter)));
            default:
                throw "BoundsOctreeNode: unknown index.";
        }
    }
    _shouldMerge() {
        var objectCount = this._objects.length;
        for (var i = 0; i < 8; i++) {
            var child = this._children[i];
            if (child) {
                if (child._children != null)
                    return false;
                objectCount += child._objects.length;
            }
        }
        return objectCount <= BoundsOctreeNode._NUM_OBJECTS_ALLOWED;
    }
    _mergeChildren() {
        for (var i = 0; i < 8; i++) {
            var child = this._children[i];
            if (child) {
                child._parent = null;
                var childObjects = child._objects;
                for (var j = childObjects.length - 1; j >= 0; j--) {
                    var childObject = childObjects[j];
                    this._objects.push(childObject);
                    childObject._setOctreeNode(this);
                }
            }
        }
        this._children = null;
    }
    _merge() {
        if (this._children === null) {
            var parent = this._parent;
            if (parent && parent._shouldMerge()) {
                parent._mergeChildren();
                parent._merge();
            }
        }
    }
    _checkAddNode(object) {
        if (this._children == null) {
            if (this._objects.length < BoundsOctreeNode._NUM_OBJECTS_ALLOWED || (this.baseLength / 2) < this._octree._minSize) {
                return this;
            }
            for (var i = this._objects.length - 1; i >= 0; i--) {
                var existObject = this._objects[i];
                var fitChildIndex = this._bestFitChild(existObject.bounds.getCenter());
                if (BoundsOctreeNode._encapsulates(this._getChildBound(fitChildIndex), existObject.bounds._getBoundBox())) {
                    this._objects.splice(this._objects.indexOf(existObject), 1);
                    this._getChild(fitChildIndex)._add(existObject);
                }
            }
        }
        var newFitChildIndex = this._bestFitChild(object.bounds.getCenter());
        if (BoundsOctreeNode._encapsulates(this._getChildBound(newFitChildIndex), object.bounds._getBoundBox()))
            return this._getChild(newFitChildIndex)._checkAddNode(object);
        else
            return this;
    }
    _add(object) {
        var addNode = this._checkAddNode(object);
        addNode._objects.push(object);
        object._setOctreeNode(addNode);
    }
    _remove(object) {
        var index = this._objects.indexOf(object);
        this._objects.splice(index, 1);
        object._setOctreeNode(null);
        this._merge();
    }
    _addUp(object) {
        if ((CollisionUtils.boxContainsBox(this._bounds, object.bounds._getBoundBox()) === ContainmentType.Contains)) {
            this._add(object);
            return true;
        }
        else {
            if (this._parent)
                return this._parent._addUp(object);
            else
                return false;
        }
    }
    _getCollidingWithFrustum(context, frustum, testVisible, camPos, customShader, replacementTag) {
        if (testVisible) {
            var type = frustum.containsBoundBox(this._bounds);
            Stat.octreeNodeCulling++;
            if (type === ContainmentType.Disjoint)
                return;
            testVisible = (type === ContainmentType.Intersects);
        }
        this._isContaion = !testVisible;
        var camera = context.camera;
        var scene = context.scene;
        for (var i = 0, n = this._objects.length; i < n; i++) {
            var render = this._objects[i];
            if (camera._isLayerVisible(render._owner.layer) && render._enable) {
                if (testVisible) {
                    Stat.frustumCulling++;
                    if (!render._needRender(frustum))
                        continue;
                }
                render._distanceForSort = Vector3.distance(render.bounds.getCenter(), camPos);
                var elements = render._renderElements;
                for (var j = 0, m = elements.length; j < m; j++) {
                    var element = elements[j];
                    element._update(scene, context, customShader, replacementTag);
                }
            }
        }
        if (this._children != null) {
            for (i = 0; i < 8; i++) {
                var child = this._children[i];
                child && child._getCollidingWithFrustum(context, frustum, testVisible, camPos, customShader, replacementTag);
            }
        }
    }
    _getCollidingWithBoundBox(checkBound, testVisible, result) {
        if (testVisible) {
            var type = CollisionUtils.boxContainsBox(this._bounds, checkBound);
            if (type === ContainmentType.Disjoint)
                return;
            testVisible = (type === ContainmentType.Intersects);
        }
        if (testVisible) {
            for (var i = 0, n = this._objects.length; i < n; i++) {
                var object = this._objects[i];
                if (CollisionUtils.intersectsBoxAndBox(object.bounds._getBoundBox(), checkBound)) {
                    result.push(object);
                }
            }
        }
        if (this._children != null) {
            for (i = 0; i < 8; i++) {
                var child = this._children[i];
                child._getCollidingWithBoundBox(checkBound, testVisible, result);
            }
        }
    }
    _bestFitChild(boundCenter) {
        return (boundCenter.x <= this.center.x ? 0 : 1) + (boundCenter.y >= this.center.y ? 0 : 4) + (boundCenter.z <= this.center.z ? 0 : 2);
    }
    _update(object) {
        if (CollisionUtils.boxContainsBox(this._bounds, object.bounds._getBoundBox()) === ContainmentType.Contains) {
            var addNode = this._checkAddNode(object);
            if (addNode !== object._getOctreeNode()) {
                addNode._objects.push(object);
                object._setOctreeNode(addNode);
                var index = this._objects.indexOf(object);
                this._objects.splice(index, 1);
                this._merge();
            }
            return true;
        }
        else {
            if (this._parent) {
                var sucess = this._parent._addUp(object);
                if (sucess) {
                    index = this._objects.indexOf(object);
                    this._objects.splice(index, 1);
                    this._merge();
                }
                return sucess;
            }
            else {
                return false;
            }
        }
    }
    add(object) {
        if (!BoundsOctreeNode._encapsulates(this._bounds, object.bounds._getBoundBox()))
            return false;
        this._add(object);
        return true;
    }
    remove(object) {
        if (object._getOctreeNode() !== this)
            return false;
        this._remove(object);
        return true;
    }
    update(object) {
        if (object._getOctreeNode() !== this)
            return false;
        return this._update(object);
    }
    shrinkIfPossible(minLength) {
        if (this.baseLength < minLength * 2)
            return this;
        var bestFit = -1;
        for (var i = 0, n = this._objects.length; i < n; i++) {
            var object = this._objects[i];
            var newBestFit = this._bestFitChild(object.bounds.getCenter());
            if (i == 0 || newBestFit == bestFit) {
                var childBounds = this._getChildBound(newBestFit);
                if (BoundsOctreeNode._encapsulates(childBounds, object.bounds._getBoundBox()))
                    (i == 0) && (bestFit = newBestFit);
                else
                    return this;
            }
            else {
                return this;
            }
        }
        if (this._children != null) {
            var childHadContent = false;
            for (i = 0, n = this._children.length; i < n; i++) {
                var child = this._children[i];
                if (child && child.hasAnyObjects()) {
                    if (childHadContent)
                        return this;
                    if (bestFit >= 0 && bestFit != i)
                        return this;
                    childHadContent = true;
                    bestFit = i;
                }
            }
        }
        else {
            if (bestFit != -1) {
                var childCenter = this._getChildCenter(bestFit);
                this._setValues(this._octree, null, this.baseLength / 2, childCenter);
            }
            return this;
        }
        if (bestFit != -1) {
            var newRoot = this._children[bestFit];
            newRoot._parent = null;
            return newRoot;
        }
        else {
            return this;
        }
    }
    hasAnyObjects() {
        if (this._objects.length > 0)
            return true;
        if (this._children != null) {
            for (var i = 0; i < 8; i++) {
                var child = this._children[i];
                if (child && child.hasAnyObjects())
                    return true;
            }
        }
        return false;
    }
    getCollidingWithBoundBox(checkBound, result) {
        this._getCollidingWithBoundBox(checkBound, true, result);
    }
    getCollidingWithRay(ray, result, maxDistance = Number.MAX_VALUE) {
        var distance = CollisionUtils.intersectsRayAndBoxRD(ray, this._bounds);
        if (distance == -1 || distance > maxDistance)
            return;
        for (var i = 0, n = this._objects.length; i < n; i++) {
            var object = this._objects[i];
            distance = CollisionUtils.intersectsRayAndBoxRD(ray, object.bounds._getBoundBox());
            if (distance !== -1 && distance <= maxDistance)
                result.push(object);
        }
        if (this._children != null) {
            for (i = 0; i < 8; i++) {
                var child = this._children[i];
                child.getCollidingWithRay(ray, result, maxDistance);
            }
        }
    }
    getCollidingWithFrustum(context, customShader, replacementTag) {
        var cameraPos = context.camera.transform.position;
        var boundFrustum = context.camera.boundFrustum;
        this._getCollidingWithFrustum(context, boundFrustum, true, cameraPos, customShader, replacementTag);
    }
    isCollidingWithBoundBox(checkBound) {
        if (!(CollisionUtils.intersectsBoxAndBox(this._bounds, checkBound)))
            return false;
        for (var i = 0, n = this._objects.length; i < n; i++) {
            var object = this._objects[i];
            if (CollisionUtils.intersectsBoxAndBox(object.bounds._getBoundBox(), checkBound))
                return true;
        }
        if (this._children != null) {
            for (i = 0; i < 8; i++) {
                var child = this._children[i];
                if (child.isCollidingWithBoundBox(checkBound))
                    return true;
            }
        }
        return false;
    }
    isCollidingWithRay(ray, maxDistance = Number.MAX_VALUE) {
        var distance = CollisionUtils.intersectsRayAndBoxRD(ray, this._bounds);
        if (distance == -1 || distance > maxDistance)
            return false;
        for (var i = 0, n = this._objects.length; i < n; i++) {
            var object = this._objects[i];
            distance = CollisionUtils.intersectsRayAndBoxRD(ray, object.bounds._getBoundBox());
            if (distance !== -1 && distance <= maxDistance)
                return true;
        }
        if (this._children != null) {
            for (i = 0; i < 8; i++) {
                var child = this._children[i];
                if (child.isCollidingWithRay(ray, maxDistance))
                    return true;
            }
        }
        return false;
    }
    getBound() {
        return this._bounds;
    }
    drawAllBounds(debugLine, currentDepth, maxDepth) {
        if (this._children === null && this._objects.length == 0)
            return;
        currentDepth++;
        var color = BoundsOctreeNode._tempColor0;
        if (this._isContaion) {
            color.r = 0.0;
            color.g = 0.0;
            color.b = 1.0;
        }
        else {
            var tint = maxDepth ? currentDepth / maxDepth : 0;
            color.r = 1.0 - tint;
            color.g = tint;
            color.b = 0.0;
        }
        color.a = 0.3;
        Utils3D._drawBound(debugLine, this._bounds, color);
        if (this._children != null) {
            for (var i = 0; i < 8; i++) {
                var child = this._children[i];
                child && child.drawAllBounds(debugLine, currentDepth, maxDepth);
            }
        }
    }
    drawAllObjects(debugLine, currentDepth, maxDepth) {
        currentDepth++;
        var color = BoundsOctreeNode._tempColor0;
        if (this._isContaion) {
            color.r = 0.0;
            color.g = 0.0;
            color.b = 1.0;
        }
        else {
            var tint = maxDepth ? currentDepth / maxDepth : 0;
            color.r = 1.0 - tint;
            color.g = tint;
            color.b = 0.0;
        }
        color.a = 1.0;
        for (var i = 0, n = this._objects.length; i < n; i++)
            Utils3D._drawBound(debugLine, this._objects[i].bounds._getBoundBox(), color);
        if (this._children != null) {
            for (i = 0; i < 8; i++) {
                var child = this._children[i];
                child && child.drawAllObjects(debugLine, currentDepth, maxDepth);
            }
        }
    }
}
BoundsOctreeNode._tempVector3 = new Vector3();
BoundsOctreeNode._tempVector30 = new Vector3();
BoundsOctreeNode._tempVector31 = new Vector3();
BoundsOctreeNode._tempColor0 = new Color();
BoundsOctreeNode._tempBoundBox = new BoundBox(new Vector3(), new Vector3());
BoundsOctreeNode._NUM_OBJECTS_ALLOWED = 8;
