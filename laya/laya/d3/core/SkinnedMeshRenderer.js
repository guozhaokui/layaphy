import { Event } from "../../events/Event";
import { LayaGL } from "../../layagl/LayaGL";
import { Stat } from "../../utils/Stat";
import { FrustumCulling } from "../graphics/FrustumCulling";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector3 } from "../math/Vector3";
import { Utils3D } from "../utils/Utils3D";
import { Bounds } from "./Bounds";
import { MeshRenderer } from "./MeshRenderer";
import { Sprite3D } from "./Sprite3D";
import { Transform3D } from "./Transform3D";
import { RenderElement } from "./render/RenderElement";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { Render } from "../../renders/Render";
export class SkinnedMeshRenderer extends MeshRenderer {
    constructor(owner) {
        super(owner);
        this._bones = [];
        this._skinnedDataLoopMarks = [];
        this._localBounds = new Bounds(Vector3._ZERO, Vector3._ZERO);
        this._cacheAnimationNode = [];
        (owner) && (this._owner.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
    }
    get localBounds() {
        return this._localBounds;
    }
    set localBounds(value) {
        this._localBounds = value;
    }
    get rootBone() {
        return this._cacheRootBone;
    }
    set rootBone(value) {
        if (this._cacheRootBone != value) {
            if (this._cacheRootBone)
                this._cacheRootBone.transform.off(Event.TRANSFORM_CHANGED, this, this._boundChange);
            value.transform.on(Event.TRANSFORM_CHANGED, this, this._boundChange);
            this._cacheRootBone = value;
            this._boundChange(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE);
        }
    }
    get bones() {
        return this._bones;
    }
    _computeSkinnedDataForNative() {
        if (this._cacheMesh && this._cacheAvatar || this._cacheMesh && !this._cacheAvatar) {
            var bindPoses = this._cacheMesh._inverseBindPoses;
            var meshBindPoseIndices = this._cacheMesh._bindPoseIndices;
            var pathMarks = this._cacheMesh._skinDataPathMarks;
            for (var i = 0, n = this._cacheMesh.subMeshCount; i < n; i++) {
                var subMeshBoneIndices = this._cacheMesh.getSubMesh(i)._boneIndicesList;
                var subData = this._skinnedData[i];
                for (var j = 0, m = subMeshBoneIndices.length; j < m; j++) {
                    var boneIndices = subMeshBoneIndices[j];
                    if (this._cacheAvatar && Render.supportWebGLPlusAnimation)
                        this._computeSubSkinnedDataNative(this._cacheAnimator._animationNodeWorldMatrixs, this._cacheAnimationNodeIndices, this._cacheMesh._inverseBindPosesBuffer, boneIndices, meshBindPoseIndices, subData[j]);
                    else
                        this._computeSubSkinnedData(bindPoses, boneIndices, meshBindPoseIndices, subData[j], pathMarks);
                }
            }
        }
    }
    _computeSkinnedData() {
        if (this._cacheMesh && this._cacheAvatar || this._cacheMesh && !this._cacheAvatar) {
            var bindPoses = this._cacheMesh._inverseBindPoses;
            var meshBindPoseIndices = this._cacheMesh._bindPoseIndices;
            var pathMarks = this._cacheMesh._skinDataPathMarks;
            for (var i = 0, n = this._cacheMesh.subMeshCount; i < n; i++) {
                var subMeshBoneIndices = this._cacheMesh.getSubMesh(i)._boneIndicesList;
                var subData = this._skinnedData[i];
                for (var j = 0, m = subMeshBoneIndices.length; j < m; j++) {
                    var boneIndices = subMeshBoneIndices[j];
                    this._computeSubSkinnedData(bindPoses, boneIndices, meshBindPoseIndices, subData[j], pathMarks);
                }
            }
        }
    }
    _computeSubSkinnedData(bindPoses, boneIndices, meshBindPoseInices, data, pathMarks) {
        for (var k = 0, q = boneIndices.length; k < q; k++) {
            var index = boneIndices[k];
            if (this._skinnedDataLoopMarks[index] === Stat.loopCount) {
                var p = pathMarks[index];
                var preData = this._skinnedData[p[0]][p[1]];
                var srcIndex = p[2] * 16;
                var dstIndex = k * 16;
                for (var d = 0; d < 16; d++)
                    data[dstIndex + d] = preData[srcIndex + d];
            }
            else {
                if (!this._cacheAvatar) {
                    var boneIndex = meshBindPoseInices[index];
                    Utils3D._mulMatrixArray(this._bones[boneIndex].transform.worldMatrix.elements, bindPoses[boneIndex], data, k * 16);
                }
                else {
                    Utils3D._mulMatrixArray(this._cacheAnimationNode[index].transform.getWorldMatrix(), bindPoses[meshBindPoseInices[index]], data, k * 16);
                }
                this._skinnedDataLoopMarks[index] = Stat.loopCount;
            }
        }
    }
    _boundChange(flag) {
        this._boundsChange = true;
        if (this._octreeNode) {
            if (this._cacheAvatar) {
                if (this._indexInOctreeMotionList === -1)
                    this._octreeNode._octree.addMotionObject(this);
            }
            else {
                flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE;
                if (flag) {
                    if (this._indexInOctreeMotionList === -1)
                        this._octreeNode._octree.addMotionObject(this);
                }
            }
        }
    }
    _createRenderElement() {
        return new RenderElement();
    }
    _onMeshChange(value) {
        super._onMeshChange(value);
        this._cacheMesh = value;
        var subMeshCount = value.subMeshCount;
        this._skinnedData = [];
        this._skinnedDataLoopMarks.length = value._bindPoseIndices.length;
        for (var i = 0; i < subMeshCount; i++) {
            var subBoneIndices = value.getSubMesh(i)._boneIndicesList;
            var subCount = subBoneIndices.length;
            var subData = this._skinnedData[i] = [];
            for (var j = 0; j < subCount; j++)
                subData[j] = new Float32Array(subBoneIndices[j].length * 16);
        }
        (this._cacheAvatar && value) && (this._getCacheAnimationNodes());
    }
    _setCacheAnimator(animator) {
        this._cacheAnimator = animator;
        this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
        this._setRootNode();
    }
    _calculateBoundingBox() {
        if (!this._cacheAvatar) {
            if (this._cacheRootBone)
                this._localBounds._tranform(this._cacheRootBone.transform.worldMatrix, this._bounds);
            else
                this._localBounds._tranform(this._owner.transform.worldMatrix, this._bounds);
        }
        else {
            if (this._cacheAnimator && this._rootBone) {
                var worldMat = SkinnedMeshRenderer._tempMatrix4x4;
                Utils3D.matrix4x4MultiplyMFM(this._cacheAnimator.owner.transform.worldMatrix, this._cacheRootAnimationNode.transform.getWorldMatrix(), worldMat);
                this._localBounds._tranform(worldMat, this._bounds);
            }
            else {
                super._calculateBoundingBox();
            }
        }
        if (Render.supportWebGLPlusCulling) {
            var min = this._bounds.getMin();
            var max = this._bounds.getMax();
            var buffer = FrustumCulling._cullingBuffer;
            buffer[this._cullingBufferIndex + 1] = min.x;
            buffer[this._cullingBufferIndex + 2] = min.y;
            buffer[this._cullingBufferIndex + 3] = min.z;
            buffer[this._cullingBufferIndex + 4] = max.x;
            buffer[this._cullingBufferIndex + 5] = max.y;
            buffer[this._cullingBufferIndex + 6] = max.z;
        }
    }
    _renderUpdate(context, transform) {
        if (this._cacheAnimator) {
            this._computeSkinnedData();
            if (!this._cacheAvatar) {
                this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
            }
            else {
                var aniOwnerTrans = this._cacheAnimator.owner._transform;
                this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, aniOwnerTrans.worldMatrix);
            }
        }
        else {
            this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
        }
    }
    _renderUpdateWithCamera(context, transform) {
        var projectionView = context.projectionViewMatrix;
        if (!this._cacheAvatar) {
            this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
        }
        else {
            if (this._cacheAnimator) {
                var aniOwnerTrans = this._cacheAnimator.owner._transform;
                Matrix4x4.multiply(projectionView, aniOwnerTrans.worldMatrix, this._projectionViewWorldMatrix);
            }
            else {
                Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
            }
            this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
        }
    }
    _destroy() {
        super._destroy();
        if (!this._cacheAvatar) {
            (this._cacheRootBone && !this._cacheRootBone.destroyed) && (this._cacheRootBone.transform.off(Event.TRANSFORM_CHANGED, this, this._boundChange));
        }
        else {
            if (this._cacheRootAnimationNode)
                this._cacheRootAnimationNode.transform.off(Event.TRANSFORM_CHANGED, this, this._boundChange);
        }
    }
    get bounds() {
        if (this._boundsChange || this._cacheAvatar) {
            this._calculateBoundingBox();
            this._boundsChange = false;
        }
        return this._bounds;
    }
    _setRootBone(name) {
        this._rootBone = name;
        this._setRootNode();
    }
    _setRootNode() {
        var rootNode;
        if (this._cacheAnimator && this._rootBone && this._cacheAvatar)
            rootNode = this._cacheAnimator._avatarNodeMap[this._rootBone];
        else
            rootNode = null;
        if (this._cacheRootAnimationNode != rootNode) {
            this._boundChange(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE);
            if (this._cacheRootAnimationNode)
                this._cacheRootAnimationNode.transform.off(Event.TRANSFORM_CHANGED, this, this._boundChange);
            (rootNode) && (rootNode.transform.on(Event.TRANSFORM_CHANGED, this, this._boundChange));
            this._cacheRootAnimationNode = rootNode;
        }
    }
    _getCacheAnimationNodes() {
        var meshBoneNames = this._cacheMesh._boneNames;
        var bindPoseIndices = this._cacheMesh._bindPoseIndices;
        var innerBindPoseCount = bindPoseIndices.length;
        if (!Render.supportWebGLPlusAnimation) {
            this._cacheAnimationNode.length = innerBindPoseCount;
            var nodeMap = this._cacheAnimator._avatarNodeMap;
            for (var i = 0; i < innerBindPoseCount; i++) {
                var node = nodeMap[meshBoneNames[bindPoseIndices[i]]];
                this._cacheAnimationNode[i] = node;
            }
        }
        else {
            this._cacheAnimationNodeIndices = new Uint16Array(innerBindPoseCount);
            var nodeMapC = this._cacheAnimator._avatarNodeMap;
            for (i = 0; i < innerBindPoseCount; i++) {
                var nodeC = nodeMapC[meshBoneNames[bindPoseIndices[i]]];
                this._cacheAnimationNodeIndices[i] = nodeC._worldMatrixIndex;
            }
        }
    }
    _setCacheAvatar(value) {
        if (this._cacheAvatar !== value) {
            if (this._cacheMesh) {
                this._cacheAvatar = value;
                if (value) {
                    this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
                    this._getCacheAnimationNodes();
                }
            }
            else {
                this._cacheAvatar = value;
            }
            this._setRootNode();
        }
    }
    _computeSubSkinnedDataNative(worldMatrixs, cacheAnimationNodeIndices, inverseBindPosesBuffer, boneIndices, bindPoseInices, data) {
        LayaGL.instance.computeSubSkinnedData(worldMatrixs, cacheAnimationNodeIndices, inverseBindPosesBuffer, boneIndices, bindPoseInices, data);
    }
}
SkinnedMeshRenderer._tempMatrix4x4 = new Matrix4x4();
