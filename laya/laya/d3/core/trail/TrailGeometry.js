import { LayaGL } from "../../../layagl/LayaGL";
import { Resource } from "../../../resource/Resource";
import { Stat } from "../../../utils/Stat";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Color } from "../../math/Color";
import { MathUtils3D } from "../../math/MathUtils3D";
import { Vector3 } from "../../math/Vector3";
import { BufferState } from "../BufferState";
import { GeometryElement } from "../GeometryElement";
import { TextureMode } from "../TextureMode";
import { TrailAlignment } from "./TrailAlignment";
import { VertexTrail } from "./VertexTrail";
export class TrailGeometry extends GeometryElement {
    constructor(owner) {
        super();
        this._floatCountPerVertices1 = 8;
        this._floatCountPerVertices2 = 5;
        this._increaseSegementCount = 16;
        this._activeIndex = 0;
        this._endIndex = 0;
        this._needAddFirstVertex = false;
        this._isTempEndVertex = false;
        this._vertices1 = null;
        this._vertices2 = null;
        this._lastFixedVertexPosition = new Vector3();
        this._bufferState = new BufferState();
        this.tmpColor = new Color();
        this._disappearBoundsMode = false;
        this._owner = owner;
        this._segementCount = this._increaseSegementCount;
        this._resizeData(this._segementCount, this._bufferState);
        var bounds = this._owner._owner.trailRenderer.bounds;
        var min = bounds.getMin();
        var max = bounds.getMax();
        min.setValue(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        max.setValue(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        bounds.setMin(min);
        bounds.setMax(max);
    }
    _resizeData(segementCount, bufferState) {
        this._subBirthTime = new Float32Array(segementCount);
        this._subDistance = new Float64Array(segementCount);
        var gl = LayaGL.instance;
        var vertexCount = segementCount * 2;
        var vertexDeclaration1 = VertexTrail.vertexDeclaration1;
        var vertexDeclaration2 = VertexTrail.vertexDeclaration2;
        var vertexBuffers = [];
        var vertexbuffer1Size = vertexCount * vertexDeclaration1.vertexStride;
        var vertexbuffer2Size = vertexCount * vertexDeclaration2.vertexStride;
        var memorySize = vertexbuffer1Size + vertexbuffer2Size;
        this._vertices1 = new Float32Array(vertexCount * this._floatCountPerVertices1);
        this._vertices2 = new Float32Array(vertexCount * this._floatCountPerVertices2);
        this._vertexBuffer1 = new VertexBuffer3D(vertexbuffer1Size, gl.STATIC_DRAW, false);
        this._vertexBuffer1.vertexDeclaration = vertexDeclaration1;
        this._vertexBuffer2 = new VertexBuffer3D(vertexbuffer2Size, gl.DYNAMIC_DRAW, false);
        this._vertexBuffer2.vertexDeclaration = vertexDeclaration2;
        vertexBuffers.push(this._vertexBuffer1);
        vertexBuffers.push(this._vertexBuffer2);
        bufferState.bind();
        bufferState.applyVertexBuffers(vertexBuffers);
        bufferState.unBind();
        Resource._addMemory(memorySize, memorySize);
    }
    _resetData() {
        var count = this._endIndex - this._activeIndex;
        var oldVertices1 = new Float32Array(this._vertices1.buffer, this._floatCountPerVertices1 * 2 * this._activeIndex * 4, this._floatCountPerVertices1 * 2 * count);
        var oldVertices2 = new Float32Array(this._vertices2.buffer, this._floatCountPerVertices2 * 2 * this._activeIndex * 4, this._floatCountPerVertices2 * 2 * count);
        var oldSubDistance = new Float64Array(this._subDistance.buffer, this._activeIndex * 8, count);
        var oldSubBirthTime = new Float32Array(this._subBirthTime.buffer, this._activeIndex * 4, count);
        if (count === this._segementCount) {
            this._vertexBuffer1.destroy();
            this._vertexBuffer2.destroy();
            this._segementCount += this._increaseSegementCount;
            this._resizeData(this._segementCount, this._bufferState);
        }
        this._vertices1.set(oldVertices1, 0);
        this._vertices2.set(oldVertices2, 0);
        this._subDistance.set(oldSubDistance, 0);
        this._subBirthTime.set(oldSubBirthTime, 0);
        this._endIndex = count;
        this._activeIndex = 0;
        this._vertexBuffer1.setData(this._vertices1.buffer, 0, this._floatCountPerVertices1 * 2 * this._activeIndex * 4, this._floatCountPerVertices1 * 2 * count * 4);
        this._vertexBuffer2.setData(this._vertices2.buffer, 0, this._floatCountPerVertices2 * 2 * this._activeIndex * 4, this._floatCountPerVertices2 * 2 * count * 4);
    }
    _updateTrail(camera, lastPosition, position) {
        if (!Vector3.equals(lastPosition, position)) {
            if ((this._endIndex - this._activeIndex) === 0)
                this._addTrailByFirstPosition(camera, position);
            else
                this._addTrailByNextPosition(camera, position);
        }
    }
    _addTrailByFirstPosition(camera, position) {
        (this._endIndex === this._segementCount) && (this._resetData());
        this._subDistance[this._endIndex] = 0;
        this._subBirthTime[this._endIndex] = this._owner._curtime;
        this._endIndex++;
        position.cloneTo(this._lastFixedVertexPosition);
        this._needAddFirstVertex = true;
    }
    _addTrailByNextPosition(camera, position) {
        var cameraMatrix = camera.viewMatrix;
        Vector3.transformCoordinate(position, cameraMatrix, TrailGeometry._tempVector33);
        var delVector3 = TrailGeometry._tempVector30;
        var pointAtoBVector3 = TrailGeometry._tempVector31;
        Vector3.transformCoordinate(this._lastFixedVertexPosition, cameraMatrix, TrailGeometry._tempVector34);
        Vector3.subtract(TrailGeometry._tempVector33, TrailGeometry._tempVector34, delVector3);
        switch (this._owner.alignment) {
            case TrailAlignment.View:
                Vector3.cross(TrailGeometry._tempVector33, delVector3, pointAtoBVector3);
                break;
            case TrailAlignment.TransformZ:
                var forward = TrailGeometry._tempVector32;
                this._owner._owner.transform.getForward(forward);
                Vector3.cross(delVector3, forward, pointAtoBVector3);
                break;
        }
        Vector3.normalize(pointAtoBVector3, pointAtoBVector3);
        Vector3.scale(pointAtoBVector3, this._owner.widthMultiplier / 2, pointAtoBVector3);
        var delLength = Vector3.scalarLength(delVector3);
        var tempEndIndex;
        var offset;
        if (this._needAddFirstVertex) {
            this._updateVerticesByPositionData(position, pointAtoBVector3, this._endIndex - 1);
            this._needAddFirstVertex = false;
        }
        if (delLength - this._owner.minVertexDistance >= MathUtils3D.zeroTolerance) {
            if (this._isTempEndVertex) {
                tempEndIndex = this._endIndex - 1;
                offset = delLength - this._subDistance[tempEndIndex];
                this._updateVerticesByPosition(position, pointAtoBVector3, delLength, tempEndIndex);
                this._owner._totalLength += offset;
            }
            else {
                (this._endIndex === this._segementCount) && (this._resetData());
                this._updateVerticesByPosition(position, pointAtoBVector3, delLength, this._endIndex);
                this._owner._totalLength += delLength;
                this._endIndex++;
            }
            position.cloneTo(this._lastFixedVertexPosition);
            this._isTempEndVertex = false;
        }
        else {
            if (this._isTempEndVertex) {
                tempEndIndex = this._endIndex - 1;
                offset = delLength - this._subDistance[tempEndIndex];
                this._updateVerticesByPosition(position, pointAtoBVector3, delLength, tempEndIndex);
                this._owner._totalLength += offset;
            }
            else {
                (this._endIndex === this._segementCount) && (this._resetData());
                this._updateVerticesByPosition(position, pointAtoBVector3, delLength, this._endIndex);
                this._owner._totalLength += delLength;
                this._endIndex++;
            }
            this._isTempEndVertex = true;
        }
    }
    _updateVerticesByPositionData(position, pointAtoBVector3, index) {
        var vertexOffset = this._floatCountPerVertices1 * 2 * index;
        var curtime = this._owner._curtime;
        this._vertices1[vertexOffset] = position.x;
        this._vertices1[vertexOffset + 1] = position.y;
        this._vertices1[vertexOffset + 2] = position.z;
        this._vertices1[vertexOffset + 3] = -pointAtoBVector3.x;
        this._vertices1[vertexOffset + 4] = -pointAtoBVector3.y;
        this._vertices1[vertexOffset + 5] = -pointAtoBVector3.z;
        this._vertices1[vertexOffset + 6] = curtime;
        this._vertices1[vertexOffset + 7] = 1.0;
        this._vertices1[vertexOffset + 8] = position.x;
        this._vertices1[vertexOffset + 9] = position.y;
        this._vertices1[vertexOffset + 10] = position.z;
        this._vertices1[vertexOffset + 11] = pointAtoBVector3.x;
        this._vertices1[vertexOffset + 12] = pointAtoBVector3.y;
        this._vertices1[vertexOffset + 13] = pointAtoBVector3.z;
        this._vertices1[vertexOffset + 14] = curtime;
        this._vertices1[vertexOffset + 15] = 0.0;
        var bounds = this._owner._owner.trailRenderer.bounds;
        var min = bounds.getMin();
        var max = bounds.getMax();
        var up = TrailGeometry._tempVector35;
        var down = TrailGeometry._tempVector36;
        var out = TrailGeometry._tempVector32;
        Vector3.add(position, pointAtoBVector3, up);
        Vector3.subtract(position, pointAtoBVector3, down);
        Vector3.min(down, up, out);
        Vector3.min(min, out, min);
        bounds.setMin(min);
        Vector3.max(up, down, out);
        Vector3.max(max, out, max);
        bounds.setMax(max);
        var floatCount = this._floatCountPerVertices1 * 2;
        this._vertexBuffer1.setData(this._vertices1.buffer, vertexOffset * 4, vertexOffset * 4, floatCount * 4);
    }
    _updateVerticesByPosition(position, pointAtoBVector3, delDistance, index) {
        this._updateVerticesByPositionData(position, pointAtoBVector3, index);
        this._subDistance[index] = delDistance;
        this._subBirthTime[index] = this._owner._curtime;
    }
    _updateVertexBufferUV() {
        var bounds;
        var min, max;
        if (this._disappearBoundsMode) {
            bounds = this._owner._owner.trailRenderer.bounds;
            min = bounds.getMin();
            max = bounds.getMax();
            min.setValue(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            max.setValue(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        }
        var vertexCount = this._endIndex;
        var curLength = 0;
        var gradient = this._owner.colorGradient;
        var startAlphaIndex = gradient.colorAlphaKeysCount - 1;
        var startColorIndex = gradient.colorRGBKeysCount - 1;
        var totalLength = this._owner._totalLength;
        for (var i = this._activeIndex; i < vertexCount; i++) {
            (i !== this._activeIndex) && (curLength += this._subDistance[i]);
            var uvX;
            var lerpFactor;
            if (this._owner.textureMode == TextureMode.Stretch) {
                uvX = 1.0 - curLength / totalLength;
                lerpFactor = uvX;
            }
            else {
                lerpFactor = 1.0 - curLength / totalLength;
                uvX = 1.0 - (totalLength - curLength);
            }
            startColorIndex = gradient.evaluateColorRGB(lerpFactor, this.tmpColor, startColorIndex, true);
            startAlphaIndex = gradient.evaluateColorAlpha(lerpFactor, this.tmpColor, startAlphaIndex, true);
            var stride = this._floatCountPerVertices2 * 2;
            var index = i * stride;
            this._vertices2[index + 0] = uvX;
            this._vertices2[index + 1] = this.tmpColor.r;
            this._vertices2[index + 2] = this.tmpColor.g;
            this._vertices2[index + 3] = this.tmpColor.b;
            this._vertices2[index + 4] = this.tmpColor.a;
            this._vertices2[index + 5] = uvX;
            this._vertices2[index + 6] = this.tmpColor.r;
            this._vertices2[index + 7] = this.tmpColor.g;
            this._vertices2[index + 8] = this.tmpColor.b;
            this._vertices2[index + 9] = this.tmpColor.a;
            if (this._disappearBoundsMode) {
                var posOffset = this._floatCountPerVertices1 * 2 * i;
                var pos = TrailGeometry._tempVector32;
                var up = TrailGeometry._tempVector33;
                var side = TrailGeometry._tempVector34;
                pos.setValue(this._vertices1[posOffset + 0], this._vertices1[posOffset + 1], this._vertices1[posOffset + 2]);
                up.setValue(this._vertices1[posOffset + 3], this._vertices1[posOffset + 4], this._vertices1[posOffset + 5]);
                Vector3.add(pos, up, side);
                Vector3.min(side, min, min);
                Vector3.max(side, max, max);
                Vector3.subtract(pos, up, side);
                Vector3.min(side, min, min);
                Vector3.max(side, max, max);
            }
        }
        if (this._disappearBoundsMode) {
            bounds.setMin(min);
            bounds.setMax(max);
            this._disappearBoundsMode = false;
        }
        var offset = this._activeIndex * stride;
        this._vertexBuffer2.setData(this._vertices2.buffer, offset * 4, offset * 4, (vertexCount * stride - offset) * 4);
    }
    _updateDisappear() {
        var count = this._endIndex;
        for (var i = this._activeIndex; i < count; i++) {
            if (this._owner._curtime - this._subBirthTime[i] >= this._owner.time + MathUtils3D.zeroTolerance) {
                var nextIndex = i + 1;
                if (nextIndex !== count)
                    this._owner._totalLength -= this._subDistance[nextIndex];
                if (this._isTempEndVertex && (nextIndex === count - 1)) {
                    var offset = this._floatCountPerVertices1 * i * 2;
                    var fixedPos = this._lastFixedVertexPosition;
                    fixedPos.x = this._vertices1[0];
                    fixedPos.y = this._vertices1[1];
                    fixedPos.z = this._vertices1[2];
                    this._isTempEndVertex = false;
                }
                this._activeIndex++;
                this._disappearBoundsMode = true;
            }
            else {
                break;
            }
        }
    }
    _getType() {
        return TrailGeometry._type;
    }
    _prepareRender(state) {
        return this._endIndex - this._activeIndex > 1;
    }
    _render(state) {
        this._bufferState.bind();
        var gl = LayaGL.instance;
        var start = this._activeIndex * 2;
        var count = this._endIndex * 2 - start;
        gl.drawArrays(gl.TRIANGLE_STRIP, start, count);
        Stat.renderBatches++;
        Stat.trianglesFaces += count - 2;
    }
    destroy() {
        super.destroy();
        var memorySize = this._vertexBuffer1._byteLength + this._vertexBuffer2._byteLength;
        Resource._addMemory(-memorySize, -memorySize);
        this._bufferState.destroy();
        this._vertexBuffer1.destroy();
        this._vertexBuffer2.destroy();
        this._bufferState = null;
        this._vertices1 = null;
        this._vertexBuffer1 = null;
        this._vertices2 = null;
        this._vertexBuffer2 = null;
        this._subBirthTime = null;
        this._subDistance = null;
        this._lastFixedVertexPosition = null;
        this._disappearBoundsMode = false;
    }
}
TrailGeometry.ALIGNMENT_VIEW = 0;
TrailGeometry.ALIGNMENT_TRANSFORM_Z = 1;
TrailGeometry._tempVector30 = new Vector3();
TrailGeometry._tempVector31 = new Vector3();
TrailGeometry._tempVector32 = new Vector3();
TrailGeometry._tempVector33 = new Vector3();
TrailGeometry._tempVector34 = new Vector3();
TrailGeometry._tempVector35 = new Vector3();
TrailGeometry._tempVector36 = new Vector3();
TrailGeometry._type = GeometryElement._typeCounter++;
