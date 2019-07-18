import { PixelLineVertex } from "./PixelLineVertex";
import { BufferState } from "../BufferState";
import { GeometryElement } from "../GeometryElement";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
export class PixelLineFilter extends GeometryElement {
    constructor(owner, maxLineCount) {
        super();
        this._floatCountPerVertices = 7;
        this._minUpdate = Number.MAX_VALUE;
        this._maxUpdate = Number.MIN_VALUE;
        this._bufferState = new BufferState();
        this._maxLineCount = 0;
        this._lineCount = 0;
        var pointCount = maxLineCount * 2;
        this._owner = owner;
        this._maxLineCount = maxLineCount;
        this._vertices = new Float32Array(pointCount * this._floatCountPerVertices);
        this._vertexBuffer = new VertexBuffer3D(PixelLineVertex.vertexDeclaration.vertexStride * pointCount, LayaGL.instance.STATIC_DRAW, false);
        this._vertexBuffer.vertexDeclaration = PixelLineVertex.vertexDeclaration;
        this._bufferState.bind();
        this._bufferState.applyVertexBuffer(this._vertexBuffer);
        this._bufferState.unBind();
    }
    _getType() {
        return PixelLineFilter._type;
    }
    _resizeLineData(maxCount) {
        var pointCount = maxCount * 2;
        var lastVertices = this._vertices;
        this._vertexBuffer.destroy();
        this._maxLineCount = maxCount;
        var vertexCount = pointCount * this._floatCountPerVertices;
        this._vertices = new Float32Array(vertexCount);
        this._vertexBuffer = new VertexBuffer3D(PixelLineVertex.vertexDeclaration.vertexStride * pointCount, LayaGL.instance.STATIC_DRAW, false);
        this._vertexBuffer.vertexDeclaration = PixelLineVertex.vertexDeclaration;
        if (vertexCount < lastVertices.length) {
            this._vertices.set(new Float32Array(lastVertices.buffer, 0, vertexCount));
            this._vertexBuffer.setData(this._vertices.buffer, 0, 0, vertexCount * 4);
        }
        else {
            this._vertices.set(lastVertices);
            this._vertexBuffer.setData(this._vertices.buffer, 0, 0, lastVertices.length * 4);
        }
        this._bufferState.bind();
        this._bufferState.applyVertexBuffer(this._vertexBuffer);
        this._bufferState.unBind();
    }
    _updateLineVertices(offset, startPosition, endPosition, startColor, endColor) {
        if (startPosition) {
            this._vertices[offset + 0] = startPosition.x;
            this._vertices[offset + 1] = startPosition.y;
            this._vertices[offset + 2] = startPosition.z;
        }
        if (startColor) {
            this._vertices[offset + 3] = startColor.r;
            this._vertices[offset + 4] = startColor.g;
            this._vertices[offset + 5] = startColor.b;
            this._vertices[offset + 6] = startColor.a;
        }
        if (endPosition) {
            this._vertices[offset + 7] = endPosition.x;
            this._vertices[offset + 8] = endPosition.y;
            this._vertices[offset + 9] = endPosition.z;
        }
        if (endColor) {
            this._vertices[offset + 10] = endColor.r;
            this._vertices[offset + 11] = endColor.g;
            this._vertices[offset + 12] = endColor.b;
            this._vertices[offset + 13] = endColor.a;
        }
        this._minUpdate = Math.min(this._minUpdate, offset);
        this._maxUpdate = Math.max(this._maxUpdate, offset + this._floatCountPerVertices * 2);
    }
    _removeLineData(index) {
        var floatCount = this._floatCountPerVertices * 2;
        var nextIndex = index + 1;
        var offset = index * floatCount;
        var rightPartVertices = new Float32Array(this._vertices.buffer, nextIndex * floatCount * 4, (this._lineCount - nextIndex) * floatCount);
        this._vertices.set(rightPartVertices, offset);
        this._minUpdate = Math.min(this._minUpdate, offset);
        this._maxUpdate = Math.max(this._maxUpdate, offset + floatCount);
        this._lineCount--;
    }
    _updateLineData(index, startPosition, endPosition, startColor, endColor) {
        var floatCount = this._floatCountPerVertices * 2;
        var offset = index * floatCount;
        this._updateLineVertices(offset, startPosition, endPosition, startColor, endColor);
    }
    _updateLineDatas(index, data) {
        var floatCount = this._floatCountPerVertices * 2;
        var offset = index * floatCount;
        var count = data.length;
        for (var i = 0; i < count; i++) {
            var line = data[i];
            this._updateLineVertices((index + i) * floatCount, line.startPosition, line.endPosition, line.startColor, line.endColor);
        }
    }
    _getLineData(index, out) {
        var startPosition = out.startPosition;
        var startColor = out.startColor;
        var endPosition = out.endPosition;
        var endColor = out.endColor;
        var vertices = this._vertices;
        var offset = index * this._floatCountPerVertices * 2;
        startPosition.x = vertices[offset + 0];
        startPosition.y = vertices[offset + 1];
        startPosition.z = vertices[offset + 2];
        startColor.r = vertices[offset + 3];
        startColor.g = vertices[offset + 4];
        startColor.b = vertices[offset + 5];
        startColor.a = vertices[offset + 6];
        endPosition.x = vertices[offset + 7];
        endPosition.y = vertices[offset + 8];
        endPosition.z = vertices[offset + 9];
        endColor.r = vertices[offset + 10];
        endColor.g = vertices[offset + 11];
        endColor.b = vertices[offset + 12];
        endColor.a = vertices[offset + 13];
    }
    _prepareRender(state) {
        return true;
    }
    _render(state) {
        if (this._minUpdate !== Number.MAX_VALUE && this._maxUpdate !== Number.MIN_VALUE) {
            this._vertexBuffer.setData(this._vertices.buffer, this._minUpdate * 4, this._minUpdate * 4, (this._maxUpdate - this._minUpdate) * 4);
            this._minUpdate = Number.MAX_VALUE;
            this._maxUpdate = Number.MIN_VALUE;
        }
        if (this._lineCount > 0) {
            this._bufferState.bind();
            var gl = LayaGL.instance;
            gl.drawArrays(gl.LINES, 0, this._lineCount * 2);
            Stat.renderBatches++;
        }
    }
    destroy() {
        if (this._destroyed)
            return;
        super.destroy();
        this._bufferState.destroy();
        this._vertexBuffer.destroy();
        this._bufferState = null;
        this._vertexBuffer = null;
        this._vertices = null;
    }
}
PixelLineFilter._type = GeometryElement._typeCounter++;
