import { AnimationNode } from "../animation/AnimationNode";
import { Render } from "../../renders/Render";
import { Resource } from "../../resource/Resource";
import { ILaya } from "../../../ILaya";
export class Avatar extends Resource {
    constructor() {
        super();
        this._nativeNodeCount = 0;
        this._nativeCurCloneCount = 0;
    }
    static _parse(data, propertyParams = null, constructParams = null) {
        var avatar = new Avatar();
        avatar._rootNode = new AnimationNode(new Float32Array(3), new Float32Array(4), new Float32Array(3), new Float32Array(16));
        if (Render.supportWebGLPlusAnimation)
            avatar._nativeNodeCount++;
        if (data.version) {
            var rootNode = data.rootNode;
            (rootNode) && (avatar._parseNode(rootNode, avatar._rootNode));
        }
        return avatar;
    }
    static load(url, complete) {
        ILaya.loader.create(url, complete, null, Avatar.AVATAR);
    }
    _initCloneToAnimator(destNode, destAnimator) {
        destAnimator._avatarNodeMap[destNode.name] = destNode;
        for (var i = 0, n = destNode.getChildCount(); i < n; i++)
            this._initCloneToAnimator(destNode.getChildByIndex(i), destAnimator);
    }
    _parseNode(nodaData, node) {
        var name = nodaData.props.name;
        node.name = name;
        var props = nodaData.props;
        var transform = node.transform;
        var pos = transform.localPosition;
        var rot = transform.localRotation;
        var sca = transform.localScale;
        pos.fromArray(props.translate);
        rot.fromArray(props.rotation);
        sca.fromArray(props.scale);
        transform.localPosition = pos;
        transform.localRotation = rot;
        transform.localScale = sca;
        var childrenData = nodaData.child;
        for (var j = 0, n = childrenData.length; j < n; j++) {
            var childData = childrenData[j];
            var childBone = new AnimationNode(new Float32Array(3), new Float32Array(4), new Float32Array(3), new Float32Array(16));
            node.addChild(childBone);
            if (Render.supportWebGLPlusAnimation)
                this._nativeNodeCount++;
            this._parseNode(childData, childBone);
        }
    }
    _cloneDatasToAnimator(destAnimator) {
        var destRoot;
        destRoot = this._rootNode.clone();
        var transform = this._rootNode.transform;
        var destTransform = destRoot.transform;
        var destPosition = destTransform.localPosition;
        var destRotation = destTransform.localRotation;
        var destScale = destTransform.localScale;
        transform.localPosition.cloneTo(destPosition);
        transform.localRotation.cloneTo(destRotation);
        transform.localScale.cloneTo(destScale);
        destTransform.localPosition = destPosition;
        destTransform.localRotation = destRotation;
        destTransform.localScale = destScale;
        destAnimator._avatarNodeMap = {};
        this._initCloneToAnimator(destRoot, destAnimator);
    }
    cloneTo(destObject) {
        var destAvatar = destObject;
        var destRoot = this._rootNode.clone();
        destAvatar._rootNode = destRoot;
    }
    clone() {
        var dest = new Avatar();
        this.cloneTo(dest);
        return dest;
    }
    _cloneDatasToAnimatorNative(destAnimator) {
        var animationNodeLocalPositions = new Float32Array(this._nativeNodeCount * 3);
        var animationNodeLocalRotations = new Float32Array(this._nativeNodeCount * 4);
        var animationNodeLocalScales = new Float32Array(this._nativeNodeCount * 3);
        var animationNodeWorldMatrixs = new Float32Array(this._nativeNodeCount * 16);
        var animationNodeParentIndices = new Int16Array(this._nativeNodeCount);
        destAnimator._animationNodeLocalPositions = animationNodeLocalPositions;
        destAnimator._animationNodeLocalRotations = animationNodeLocalRotations;
        destAnimator._animationNodeLocalScales = animationNodeLocalScales;
        destAnimator._animationNodeWorldMatrixs = animationNodeWorldMatrixs;
        destAnimator._animationNodeParentIndices = animationNodeParentIndices;
        this._nativeCurCloneCount = 0;
        var destRoot = this._rootNode._cloneNative(animationNodeLocalPositions, animationNodeLocalRotations, animationNodeLocalScales, animationNodeWorldMatrixs, animationNodeParentIndices, -1, this);
        var transform = this._rootNode.transform;
        var destTransform = destRoot.transform;
        var destPosition = destTransform.localPosition;
        var destRotation = destTransform.localRotation;
        var destScale = destTransform.localScale;
        transform.localPosition.cloneTo(destPosition);
        transform.localRotation.cloneTo(destRotation);
        transform.localScale.cloneTo(destScale);
        destTransform.localPosition = destPosition;
        destTransform.localRotation = destRotation;
        destTransform.localScale = destScale;
        destAnimator._avatarNodeMap = {};
        this._initCloneToAnimator(destRoot, destAnimator);
    }
}
Avatar.AVATAR = "AVATAR";
