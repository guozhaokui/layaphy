import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { BufferStateBase } from "../../webgl/BufferStateBase";
export class BufferState extends BufferStateBase {
    constructor() {
        super();
    }
    applyVertexBuffer(vertexBuffer) {
        if (BufferStateBase._curBindedBufferState === this) {
            var gl = LayaGL.instance;
            var verDec = vertexBuffer.vertexDeclaration;
            var valueData = null;
            if (Render.supportWebGLPlusRendering)
                valueData = verDec._shaderValues._nativeArray;
            else
                valueData = verDec._shaderValues.getData();
            vertexBuffer.bind();
            for (var k in valueData) {
                var loc = parseInt(k);
                var attribute = valueData[k];
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, attribute[0], attribute[1], !!attribute[2], attribute[3], attribute[4]);
            }
        }
        else {
            throw "BufferState: must call bind() function first.";
        }
    }
    applyVertexBuffers(vertexBuffers) {
        if (BufferStateBase._curBindedBufferState === this) {
            var gl = LayaGL.instance;
            for (var i = 0, n = vertexBuffers.length; i < n; i++) {
                var verBuf = vertexBuffers[i];
                var verDec = verBuf.vertexDeclaration;
                var valueData = null;
                if (Render.supportWebGLPlusRendering)
                    valueData = verDec._shaderValues._nativeArray;
                else
                    valueData = verDec._shaderValues.getData();
                verBuf.bind();
                for (var k in valueData) {
                    var loc = parseInt(k);
                    var attribute = valueData[k];
                    gl.enableVertexAttribArray(loc);
                    gl.vertexAttribPointer(loc, attribute[0], attribute[1], !!attribute[2], attribute[3], attribute[4]);
                }
            }
        }
        else {
            throw "BufferState: must call bind() function first.";
        }
    }
    applyInstanceVertexBuffer(vertexBuffer) {
        if (LayaGL.layaGPUInstance.supportInstance()) {
            if (BufferStateBase._curBindedBufferState === this) {
                var gl = LayaGL.instance;
                var verDec = vertexBuffer.vertexDeclaration;
                var valueData = null;
                if (Render.supportWebGLPlusRendering)
                    valueData = verDec._shaderValues._nativeArray;
                else
                    valueData = verDec._shaderValues.getData();
                vertexBuffer.bind();
                for (var k in valueData) {
                    var loc = parseInt(k);
                    var attribute = valueData[k];
                    gl.enableVertexAttribArray(loc);
                    gl.vertexAttribPointer(loc, attribute[0], attribute[1], !!attribute[2], attribute[3], attribute[4]);
                    LayaGL.layaGPUInstance.vertexAttribDivisor(loc, 1);
                }
            }
            else {
                throw "BufferState: must call bind() function first.";
            }
        }
    }
    applyIndexBuffer(indexBuffer) {
        if (BufferStateBase._curBindedBufferState === this) {
            if (this._bindedIndexBuffer !== indexBuffer) {
                indexBuffer._bindForVAO();
                this._bindedIndexBuffer = indexBuffer;
            }
        }
        else {
            throw "BufferState: must call bind() function first.";
        }
    }
}
