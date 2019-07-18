import { DynamicBatchManager } from "./DynamicBatchManager";
import { SubMeshDynamicBatch } from "./SubMeshDynamicBatch";
import { BufferState } from "../core/BufferState";
import { BatchMark } from "../core/render/BatchMark";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { SingletonList } from "../component/SingletonList";
export class MeshRenderDynamicBatchManager extends DynamicBatchManager {
    constructor() {
        super();
        this._instanceBatchOpaqueMarks = [];
        this._vertexBatchOpaqueMarks = [];
        this._cacheBufferStates = [];
        this._updateCountMark = 0;
    }
    getInstanceBatchOpaquaMark(receiveShadow, materialID, subMeshID, invertFace) {
        var instanceReceiveShadowMarks = (this._instanceBatchOpaqueMarks[receiveShadow ? 0 : 1]) || (this._instanceBatchOpaqueMarks[receiveShadow ? 0 : 1] = []);
        var instanceMaterialMarks = (instanceReceiveShadowMarks[materialID]) || (instanceReceiveShadowMarks[materialID] = []);
        var instancSubMeshMarks = (instanceMaterialMarks[subMeshID]) || (instanceMaterialMarks[subMeshID] = []);
        return instancSubMeshMarks[invertFace ? 1 : 0] || (instancSubMeshMarks[invertFace ? 1 : 0] = new BatchMark());
    }
    getVertexBatchOpaquaMark(lightMapIndex, receiveShadow, materialID, verDecID) {
        var dynLightMapMarks = (this._vertexBatchOpaqueMarks[lightMapIndex]) || (this._vertexBatchOpaqueMarks[lightMapIndex] = []);
        var dynReceiveShadowMarks = (dynLightMapMarks[receiveShadow ? 0 : 1]) || (dynLightMapMarks[receiveShadow ? 0 : 1] = []);
        var dynMaterialMarks = (dynReceiveShadowMarks[materialID]) || (dynReceiveShadowMarks[materialID] = []);
        return dynMaterialMarks[verDecID] || (dynMaterialMarks[verDecID] = new BatchMark());
    }
    _getBufferState(vertexDeclaration) {
        var bufferState = this._cacheBufferStates[vertexDeclaration.id];
        if (!bufferState) {
            var instance = SubMeshDynamicBatch.instance;
            bufferState = new BufferState();
            bufferState.bind();
            var vertexBuffer = instance._vertexBuffer;
            vertexBuffer.vertexDeclaration = vertexDeclaration;
            bufferState.applyVertexBuffer(vertexBuffer);
            bufferState.applyIndexBuffer(instance._indexBuffer);
            bufferState.unBind();
            this._cacheBufferStates[vertexDeclaration.id] = bufferState;
        }
        return bufferState;
    }
    _getBatchRenderElementFromPool() {
        var renderElement = this._batchRenderElementPool[this._batchRenderElementPoolIndex++];
        if (!renderElement) {
            renderElement = new SubMeshRenderElement();
            this._batchRenderElementPool[this._batchRenderElementPoolIndex - 1] = renderElement;
            renderElement.vertexBatchElementList = new SingletonList();
            renderElement.instanceBatchElementList = new SingletonList();
        }
        return renderElement;
    }
    _clear() {
        super._clear();
        this._updateCountMark++;
    }
}
MeshRenderDynamicBatchManager.instance = new MeshRenderDynamicBatchManager();
