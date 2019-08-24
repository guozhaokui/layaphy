import { VertexMesh } from "../graphics/Vertex/VertexMesh";
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration";
export class MeshFilter {
    get sharedMesh() {
        return this._sharedMesh;
    }
    set sharedMesh(value) {
        if (this._sharedMesh !== value) {
            var defineDatas = this._owner._render._shaderValues;
            var lastValue = this._sharedMesh;
            if (lastValue) {
                lastValue._removeReference();
                defineDatas.removeDefine(this._getMeshDefine(lastValue));
            }
            if (value) {
                value._addReference();
                defineDatas.addDefine(this._getMeshDefine(value));
            }
            this._owner._render._onMeshChange(value);
            this._sharedMesh = value;
        }
    }
    constructor(owner) {
        this._owner = owner;
    }
    _getMeshDefine(mesh) {
        var define;
        for (var i = 0, n = mesh._subMeshes.length; i < n; i++) {
            var subMesh = mesh.getSubMesh(i);
            var vertexElements = subMesh._vertexBuffer._vertexDeclaration._vertexElements;
            for (var j = 0, m = vertexElements.length; j < m; j++) {
                var vertexElement = vertexElements[j];
                var name = vertexElement._elementUsage;
                switch (name) {
                    case VertexMesh.MESH_COLOR0:
                        define |= MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR;
                        break;
                    case VertexMesh.MESH_TEXTURECOORDINATE0:
                        define |= MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0;
                        break;
                    case VertexMesh.MESH_TEXTURECOORDINATE1:
                        define |= MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1;
                        break;
                }
            }
        }
        return define;
    }
    destroy() {
        this._owner = null;
        (this._sharedMesh) && (this._sharedMesh._removeReference(), this._sharedMesh = null);
    }
}
