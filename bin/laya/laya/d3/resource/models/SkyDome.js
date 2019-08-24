import { SkyMesh } from "./SkyMesh";
import { BufferState } from "../../core/BufferState";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexPositionTexture0 } from "../../graphics/Vertex/VertexPositionTexture0";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
export class SkyDome extends SkyMesh {
    constructor(stacks = 48, slices = 48) {
        super();
        var gl = LayaGL.instance;
        this._stacks = stacks;
        this._slices = slices;
        var vertexDeclaration = VertexPositionTexture0.vertexDeclaration;
        var vertexFloatCount = vertexDeclaration.vertexStride / 4;
        var numberVertices = (this._stacks + 1) * (this._slices + 1);
        var numberIndices = (3 * this._stacks * (this._slices + 1)) * 2;
        var vertices = new Float32Array(numberVertices * vertexFloatCount);
        var indices = new Uint16Array(numberIndices);
        var stackAngle = Math.PI / this._stacks;
        var sliceAngle = (Math.PI * 2.0) / this._slices;
        var vertexIndex = 0;
        var vertexCount = 0;
        var indexCount = 0;
        for (var stack = 0; stack < (this._stacks + 1); stack++) {
            var r = Math.sin(stack * stackAngle);
            var y = Math.cos(stack * stackAngle);
            for (var slice = 0; slice < (this._slices + 1); slice++) {
                var x = r * Math.sin(slice * sliceAngle);
                var z = r * Math.cos(slice * sliceAngle);
                vertices[vertexCount + 0] = x * SkyDome._radius;
                vertices[vertexCount + 1] = y * SkyDome._radius;
                vertices[vertexCount + 2] = z * SkyDome._radius;
                vertices[vertexCount + 3] = -(slice / this._slices) + 0.75;
                vertices[vertexCount + 4] = stack / this._stacks;
                vertexCount += vertexFloatCount;
                if (stack != (this._stacks - 1)) {
                    indices[indexCount++] = vertexIndex + 1;
                    indices[indexCount++] = vertexIndex;
                    indices[indexCount++] = vertexIndex + (this._slices + 1);
                    indices[indexCount++] = vertexIndex + (this._slices + 1);
                    indices[indexCount++] = vertexIndex;
                    indices[indexCount++] = vertexIndex + (this._slices);
                    vertexIndex++;
                }
            }
        }
        this._vertexBuffer = new VertexBuffer3D(vertices.length * 4, gl.STATIC_DRAW, false);
        this._vertexBuffer.vertexDeclaration = vertexDeclaration;
        this._indexBuffer = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, indices.length, gl.STATIC_DRAW, false);
        this._vertexBuffer.setData(vertices.buffer);
        this._indexBuffer.setData(indices);
        var bufferState = new BufferState();
        bufferState.bind();
        bufferState.applyVertexBuffer(this._vertexBuffer);
        bufferState.applyIndexBuffer(this._indexBuffer);
        bufferState.unBind();
        this._bufferState = bufferState;
    }
    static __init__() {
        SkyDome.instance = new SkyDome();
    }
    get stacks() {
        return this._stacks;
    }
    get slices() {
        return this._slices;
    }
    _render(state) {
        var gl = LayaGL.instance;
        var indexCount = this._indexBuffer.indexCount;
        gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
        Stat.trianglesFaces += indexCount / 3;
        Stat.renderBatches++;
    }
}
SkyDome._radius = 1;
