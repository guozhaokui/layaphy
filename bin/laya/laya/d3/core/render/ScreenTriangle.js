import { BufferState } from "../BufferState";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { VertexElement } from "../../graphics/VertexElement";
import { VertexElementFormat } from "../../graphics/VertexElementFormat";
import { LayaGL } from "../../../layagl/LayaGL";
import { Resource } from "../../../resource/Resource";
import { Stat } from "../../../utils/Stat";
export class ScreenTriangle extends Resource {
    constructor() {
        super();
        this._bufferState = new BufferState();
        this._bufferStateInvertUV = new BufferState();
        var gl = LayaGL.instance;
        this._vertexBuffer = new VertexBuffer3D(12 * 4, gl.STATIC_DRAW, false);
        this._vertexBuffer.vertexDeclaration = ScreenTriangle._vertexDeclaration;
        this._vertexBuffer.setData(ScreenTriangle._vertices.buffer);
        this._bufferState.bind();
        this._bufferState.applyVertexBuffer(this._vertexBuffer);
        this._bufferState.unBind();
        this._vertexBufferInvertUV = new VertexBuffer3D(12 * 4, gl.STATIC_DRAW, false);
        this._vertexBufferInvertUV.vertexDeclaration = ScreenTriangle._vertexDeclaration;
        this._vertexBufferInvertUV.setData(ScreenTriangle._verticesInvertUV.buffer);
        this._bufferStateInvertUV.bind();
        this._bufferStateInvertUV.applyVertexBuffer(this._vertexBufferInvertUV);
        this._bufferStateInvertUV.unBind();
        this._setGPUMemory(this._vertexBuffer._byteLength + this._vertexBufferInvertUV._byteLength);
    }
    static __init__() {
        ScreenTriangle._vertexDeclaration = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, ScreenTriangle.SCREENTRIANGLE_POSITION_UV)]);
        ScreenTriangle.instance = new ScreenTriangle();
        ScreenTriangle.instance.lock = true;
    }
    render() {
        var gl = LayaGL.instance;
        this._bufferState.bind();
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        Stat.renderBatches++;
    }
    renderInvertUV() {
        var gl = LayaGL.instance;
        this._bufferStateInvertUV.bind();
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        Stat.renderBatches++;
    }
    destroy() {
        super.destroy();
        this._bufferState.destroy();
        this._vertexBuffer.destroy();
        this._bufferStateInvertUV.destroy();
        this._vertexBufferInvertUV.destroy();
        this._setGPUMemory(0);
    }
}
ScreenTriangle.SCREENTRIANGLE_POSITION_UV = 0;
ScreenTriangle._vertices = new Float32Array([-1, -1, 0, 1, -1, 3, 0, -1, 3, -1, 2, 1]);
ScreenTriangle._verticesInvertUV = new Float32Array([-1, -1, 0, 0, -1, 3, 0, 2, 3, -1, 2, 0]);
