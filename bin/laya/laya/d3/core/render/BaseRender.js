import { Bounds } from "../Bounds";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { Transform3D } from "../Transform3D";
import { FrustumCulling } from "../../graphics/FrustumCulling";
import { Vector3 } from "../../math/Vector3";
import { ShaderData } from "../../shader/ShaderData";
import { Event } from "../../../events/Event";
import { EventDispatcher } from "../../../events/EventDispatcher";
import { Render } from "../../../renders/Render";
export class BaseRender extends EventDispatcher {
    constructor(owner) {
        super();
        this._indexInList = -1;
        this._indexInCastShadowList = -1;
        this._boundsChange = true;
        this._supportOctree = true;
        this._sharedMaterials = [];
        this._visible = true;
        this._indexInOctreeMotionList = -1;
        this._updateMark = -1;
        this._updateRenderType = -1;
        this._isPartOfStaticBatch = false;
        this._staticBatch = null;
        this._id = ++BaseRender._uniqueIDCounter;
        this._indexInCastShadowList = -1;
        this._bounds = new Bounds(Vector3._ZERO, Vector3._ZERO);
        if (Render.supportWebGLPlusCulling) {
            var length = FrustumCulling._cullingBufferLength;
            this._cullingBufferIndex = length;
            var cullingBuffer = FrustumCulling._cullingBuffer;
            var resizeLength = length + 7;
            if (resizeLength >= cullingBuffer.length) {
                var temp = cullingBuffer;
                cullingBuffer = FrustumCulling._cullingBuffer = new Float32Array(cullingBuffer.length + 4096);
                cullingBuffer.set(temp, 0);
            }
            cullingBuffer[length] = 2;
            FrustumCulling._cullingBufferLength = resizeLength;
        }
        this._renderElements = [];
        this._owner = owner;
        this._enable = true;
        this._materialsInstance = [];
        this._shaderValues = new ShaderData(null);
        this.lightmapIndex = -1;
        this._castShadow = false;
        this.receiveShadow = false;
        this.sortingFudge = 0.0;
        (owner) && (this._owner.transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
    }
    get id() {
        return this._id;
    }
    get lightmapIndex() {
        return this._lightmapIndex;
    }
    set lightmapIndex(value) {
        if (this._lightmapIndex !== value) {
            this._lightmapIndex = value;
            this._applyLightMapParams();
        }
    }
    get lightmapScaleOffset() {
        return this._lightmapScaleOffset;
    }
    set lightmapScaleOffset(value) {
        this._lightmapScaleOffset = value;
        this._shaderValues.setVector(RenderableSprite3D.LIGHTMAPSCALEOFFSET, value);
        this._shaderValues.addDefine(RenderableSprite3D.SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV);
    }
    get enable() {
        return this._enable;
    }
    set enable(value) {
        this._enable = !!value;
    }
    get material() {
        var material = this._sharedMaterials[0];
        if (material && !this._materialsInstance[0]) {
            var insMat = this._getInstanceMaterial(material, 0);
            var renderElement = this._renderElements[0];
            (renderElement) && (renderElement.material = insMat);
        }
        return this._sharedMaterials[0];
    }
    set material(value) {
        this.sharedMaterial = value;
    }
    get materials() {
        for (var i = 0, n = this._sharedMaterials.length; i < n; i++) {
            if (!this._materialsInstance[i]) {
                var insMat = this._getInstanceMaterial(this._sharedMaterials[i], i);
                var renderElement = this._renderElements[i];
                (renderElement) && (renderElement.material = insMat);
            }
        }
        return this._sharedMaterials.slice();
    }
    set materials(value) {
        this.sharedMaterials = value;
    }
    get sharedMaterial() {
        return this._sharedMaterials[0];
    }
    set sharedMaterial(value) {
        var lastValue = this._sharedMaterials[0];
        if (lastValue !== value) {
            this._sharedMaterials[0] = value;
            this._materialsInstance[0] = false;
            this._changeMaterialReference(lastValue, value);
            var renderElement = this._renderElements[0];
            (renderElement) && (renderElement.material = value);
        }
    }
    get sharedMaterials() {
        return this._sharedMaterials.slice();
    }
    set sharedMaterials(value) {
        var materialsInstance = this._materialsInstance;
        var sharedMats = this._sharedMaterials;
        for (var i = 0, n = sharedMats.length; i < n; i++) {
            var lastMat = sharedMats[i];
            (lastMat) && (lastMat._removeReference());
        }
        if (value) {
            var count = value.length;
            materialsInstance.length = count;
            sharedMats.length = count;
            for (i = 0; i < count; i++) {
                lastMat = sharedMats[i];
                var mat = value[i];
                if (lastMat !== mat) {
                    materialsInstance[i] = false;
                    var renderElement = this._renderElements[i];
                    (renderElement) && (renderElement.material = mat);
                }
                if (mat) {
                    mat._addReference();
                }
                sharedMats[i] = mat;
            }
        }
        else {
            throw new Error("BaseRender: shadredMaterials value can't be null.");
        }
    }
    get bounds() {
        if (this._boundsChange) {
            this._calculateBoundingBox();
            this._boundsChange = false;
        }
        return this._bounds;
    }
    set receiveShadow(value) {
        if (this._receiveShadow !== value) {
            this._receiveShadow = value;
            if (value)
                this._shaderValues.addDefine(RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW);
            else
                this._shaderValues.removeDefine(RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW);
        }
    }
    get receiveShadow() {
        return this._receiveShadow;
    }
    get castShadow() {
        return this._castShadow;
    }
    set castShadow(value) {
        if (this._castShadow !== value) {
            if (this._owner.activeInHierarchy) {
                if (value)
                    this._scene._addShadowCastRenderObject(this);
                else
                    this._scene._removeShadowCastRenderObject(this);
            }
            this._castShadow = value;
        }
    }
    get isPartOfStaticBatch() {
        return this._isPartOfStaticBatch;
    }
    _getOctreeNode() {
        return this._octreeNode;
    }
    _setOctreeNode(value) {
        this._octreeNode = value;
    }
    _getIndexInMotionList() {
        return this._indexInOctreeMotionList;
    }
    _setIndexInMotionList(value) {
        this._indexInOctreeMotionList = value;
    }
    _changeMaterialReference(lastValue, value) {
        (lastValue) && (lastValue._removeReference());
        value._addReference();
    }
    _getInstanceMaterial(material, index) {
        var insMat = material.clone();
        insMat.name = insMat.name + "(Instance)";
        this._materialsInstance[index] = true;
        this._changeMaterialReference(this._sharedMaterials[index], insMat);
        this._sharedMaterials[index] = insMat;
        return insMat;
    }
    _applyLightMapParams() {
        if (this._scene && this._lightmapIndex >= 0) {
            var lightMaps = this._scene.getlightmaps();
            if (this._lightmapIndex < lightMaps.length) {
                this._shaderValues.addDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
                this._shaderValues.setTexture(RenderableSprite3D.LIGHTMAP, lightMaps[this._lightmapIndex]);
            }
            else {
                this._shaderValues.removeDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
            }
        }
        else {
            this._shaderValues.removeDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
        }
    }
    _onWorldMatNeedChange(flag) {
        this._boundsChange = true;
        if (this._octreeNode) {
            flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE;
            if (flag) {
                if (this._indexInOctreeMotionList === -1)
                    this._octreeNode._octree.addMotionObject(this);
            }
        }
    }
    _calculateBoundingBox() {
        throw ("BaseRender: must override it.");
    }
    _getIndexInList() {
        return this._indexInList;
    }
    _setIndexInList(index) {
        this._indexInList = index;
    }
    _setBelongScene(scene) {
        if (this._scene !== scene) {
            this._scene = scene;
            this._applyLightMapParams();
        }
    }
    _needRender(boundFrustum) {
        return true;
    }
    _renderUpdate(context, transform) {
    }
    _renderUpdateWithCamera(context, transform) {
    }
    _revertBatchRenderUpdate(context) {
    }
    _destroy() {
        (this._indexInOctreeMotionList !== -1) && (this._octreeNode._octree.removeMotionObject(this));
        this.offAll();
        var i = 0, n = 0;
        for (i = 0, n = this._renderElements.length; i < n; i++)
            this._renderElements[i].destroy();
        for (i = 0, n = this._sharedMaterials.length; i < n; i++)
            (this._sharedMaterials[i].destroyed) || (this._sharedMaterials[i]._removeReference());
        this._renderElements = null;
        this._owner = null;
        this._sharedMaterials = null;
        this._bounds = null;
        this._lightmapScaleOffset = null;
    }
}
BaseRender._tempBoundBoxCorners = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];
BaseRender._uniqueIDCounter = 0;
