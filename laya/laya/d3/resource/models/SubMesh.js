import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { GeometryElement } from "../../core/GeometryElement";
import { SkinnedMeshSprite3D } from "../../core/SkinnedMeshSprite3D";
export class SubMesh extends GeometryElement {
    constructor(mesh) {
        super();
        this._id = ++SubMesh._uniqueIDCounter;
        this._mesh = mesh;
        this._boneIndicesList = [];
        this._subIndexBufferStart = [];
        this._subIndexBufferCount = [];
    }
    get indexCount() {
        return this._indexCount;
    }
    _setIndexRange(indexStart, indexCount) {
        this._indexStart = indexStart;
        this._indexCount = indexCount;
        this._indices = new Uint16Array(this._indexBuffer.getData().buffer, indexStart * 2, indexCount);
    }
    _getType() {
        return SubMesh._type;
    }
    _prepareRender(state) {
        this._mesh._uploadVerticesData();
        return true;
    }
    _render(state) {
        var gl = LayaGL.instance;
        this._mesh._bufferState.bind();
        var skinnedDatas = state.renderElement.render._skinnedData;
        if (skinnedDatas) {
            var subSkinnedDatas = skinnedDatas[this._indexInMesh];
            var boneIndicesListCount = this._boneIndicesList.length;
            for (var i = 0; i < boneIndicesListCount; i++) {
                state.shader.uploadCustomUniform(SkinnedMeshSprite3D.BONES, subSkinnedDatas[i]);
                gl.drawElements(gl.TRIANGLES, this._subIndexBufferCount[i], gl.UNSIGNED_SHORT, this._subIndexBufferStart[i] * 2);
            }
        }
        else {
            gl.drawElements(gl.TRIANGLES, this._indexCount, gl.UNSIGNED_SHORT, this._indexStart * 2);
        }
        Stat.trianglesFaces += this._indexCount / 3;
        Stat.renderBatches++;
    }
    getIndices() {
        if (this._mesh._isReadable)
            return this._indices.slice();
        else
            throw "SubMesh:can't get indices on subMesh,mesh's isReadable must be true.";
    }
    setIndices(indices) {
        this._indexBuffer.setData(indices, this._indexStart, 0, this._indexCount);
    }
    destroy() {
        if (this._destroyed)
            return;
        super.destroy();
        this._indexBuffer.destroy();
        this._indexBuffer = null;
        this._mesh = null;
        this._boneIndicesList = null;
        this._subIndexBufferStart = null;
        this._subIndexBufferCount = null;
        this._skinAnimationDatas = null;
    }
}
SubMesh._uniqueIDCounter = 0;
SubMesh._type = GeometryElement._typeCounter++;
