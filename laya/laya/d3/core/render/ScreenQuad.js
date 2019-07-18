import { BufferState } from "../BufferState";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { VertexElement } from "../../graphics/VertexElement";
import { VertexElementFormat } from "../../graphics/VertexElementFormat";
import { Resource } from "../../../resource/Resource";
import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
export class ScreenQuad extends Resource {
    constructor() {
        super();
        this._bufferState = new BufferState();
        this._bufferStateInvertUV = new BufferState();
        var gl = LayaGL.instance;
        this._vertexBuffer = new VertexBuffer3D(16 * 4, gl.STATIC_DRAW, false);
        this._vertexBuffer.vertexDeclaration = ScreenQuad._vertexDeclaration;
        this._vertexBuffer.setData(ScreenQuad._vertices.buffer);
        this._bufferState.bind();
        this._bufferState.applyVertexBuffer(this._vertexBuffer);
        this._bufferState.unBind();
        this._vertexBufferInvertUV = new VertexBuffer3D(16 * 4, gl.STATIC_DRAW, false);
        this._vertexBufferInvertUV.vertexDeclaration = ScreenQuad._vertexDeclaration;
        this._vertexBufferInvertUV.setData(ScreenQuad._verticesInvertUV.buffer);
        this._bufferStateInvertUV.bind();
        this._bufferStateInvertUV.applyVertexBuffer(this._vertexBufferInvertUV);
        this._bufferStateInvertUV.unBind();
        this._setGPUMemory(this._vertexBuffer._byteLength + this._vertexBufferInvertUV._byteLength);
    }
    static __init__() {
        ScreenQuad._vertexDeclaration = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, ScreenQuad.SCREENQUAD_POSITION_UV)]);
        ScreenQuad.instance = new ScreenQuad();
        ScreenQuad.instance.lock = true;
    }
    render() {
        var gl = LayaGL.instance;
        this._bufferState.bind();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        Stat.renderBatches++;
    }
    renderInvertUV() {
        var gl = LayaGL.instance;
        this._bufferStateInvertUV.bind();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
ScreenQuad.SCREENQUAD_POSITION_UV = 0;
ScreenQuad._vertices = new Float32Array([1, 1, 1, 0, 1, -1, 1, 1, -1, 1, 0, 0, -1, -1, 0, 1]);
ScreenQuad._verticesInvertUV = new Float32Array([1, 1, 1, 1, 1, -1, 1, 0, -1, 1, 0, 1, -1, -1, 0, 0]);
