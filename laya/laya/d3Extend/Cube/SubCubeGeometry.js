import { CubeGeometry } from "./CubeGeometry";
import { CubeInfo } from "./CubeInfo";
import { BufferState } from "laya/d3/core/BufferState";
import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Resource } from "laya/resource/Resource";
import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D";
import { LayaGL } from "laya/layagl/LayaGL";
import { Stat } from "laya/utils/Stat";
import { WebGLContext } from "laya/webgl/WebGLContext";
export class SubCubeGeometry {
    constructor() {
        this._currentVertexCount = 0;
        this._vertices = [];
        this._vertexbuffers = [];
        this._vertexUpdateFlag = [];
        this._bufferStates = [];
        this.cubeCount = 0;
        this._createVertexBuffer(SubCubeGeometry.SUBVERTEXCOUNT);
        this._currentVertexSize = SubCubeGeometry.SUBVERTEXCOUNT;
        var memory = this._currentVertexSize * SubCubeGeometry.FLOATCOUNTPERVERTEX * 4;
        Resource._addCPUMemory(memory);
        Resource._addGPUMemory(memory);
    }
    static create(owner) {
        var subCube;
        if (SubCubeGeometry._pool.length) {
            subCube = SubCubeGeometry._pool.pop();
            subCube._cubeMap = owner.cubeMap;
            subCube._currentVertexCount = 0;
        }
        else {
            subCube = new SubCubeGeometry();
            subCube._cubeMap = owner.cubeMap;
        }
        return subCube;
    }
    static recover(cube) {
        SubCubeGeometry._pool.push(cube);
    }
    static __init__() {
        var maxFaceNums = 65536 / 4;
        var indexCount = maxFaceNums * 6;
        SubCubeGeometry._indexBuffer = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, indexCount, WebGLContext.STATIC_DRAW, false);
        var indices = new Uint16Array(indexCount);
        for (var i = 0; i < maxFaceNums; i++) {
            var indexOffset = i * 6;
            var pointOffset = i * 4;
            indices[indexOffset] = pointOffset;
            indices[indexOffset + 1] = 2 + pointOffset;
            indices[indexOffset + 2] = 1 + pointOffset;
            indices[indexOffset + 3] = pointOffset;
            indices[indexOffset + 4] = 3 + pointOffset;
            indices[indexOffset + 5] = 2 + pointOffset;
        }
        SubCubeGeometry._indexBuffer.setData(indices);
        var uvArrayCount = maxFaceNums * 4 * 2;
        SubCubeGeometry._UVvertexBuffer = new VertexBuffer3D(uvArrayCount * 4, WebGLContext.STATIC_DRAW, false);
        var uvs = new Float32Array(uvArrayCount);
        for (var j = 0; j < maxFaceNums; j++) {
            var uvoffset = j * 8;
            uvs[uvoffset] = 1;
            uvs[uvoffset + 1] = 0;
            uvs[uvoffset + 2] = 0;
            uvs[uvoffset + 3] = 0;
            uvs[uvoffset + 4] = 0;
            uvs[uvoffset + 5] = 1;
            uvs[uvoffset + 6] = 1;
            uvs[uvoffset + 7] = 1;
        }
        SubCubeGeometry._UVvertexBuffer.setData(uvs);
        var verDec = VertexMesh.getVertexDeclaration("UV");
        SubCubeGeometry._UVvertexBuffer.vertexDeclaration = verDec;
    }
    static getKey(x, y, z) {
        return (Math.floor(x / SubCubeGeometry.SIZE)) * SubCubeGeometry.MAXSUBCOUNT * SubCubeGeometry.MAXSUBCOUNT + (Math.floor(y / SubCubeGeometry.SIZE)) * SubCubeGeometry.MAXSUBCOUNT + Math.floor(z / SubCubeGeometry.SIZE);
    }
    _clearEditerInfo() {
        this._cubeMap = null;
    }
    _createVertexBuffer(verticesCount) {
        var verDec = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR");
        var newVertices = new Float32Array(verticesCount * SubCubeGeometry.FLOATCOUNTPERVERTEX);
        var newVertecBuffer = new VertexBuffer3D(verDec.vertexStride * verticesCount, WebGLContext.DYNAMIC_DRAW, false);
        var vertexbufferVector = [];
        var bufferState = new BufferState();
        newVertecBuffer.vertexDeclaration = verDec;
        bufferState.bind();
        vertexbufferVector.push(newVertecBuffer);
        vertexbufferVector.push(SubCubeGeometry._UVvertexBuffer);
        bufferState.applyVertexBuffers(vertexbufferVector);
        bufferState.applyIndexBuffer(SubCubeGeometry._indexBuffer);
        bufferState.unBind();
        this._vertices.push(newVertices);
        this._vertexbuffers.push(newVertecBuffer);
        this._vertexUpdateFlag.push([2147483647, -2147483647]);
        this._bufferStates.push(bufferState);
    }
    _resizeVertexBuffer(vertexCount) {
        var needBufferCount = Math.ceil(vertexCount / 65536);
        var curBufferIndex = this._vertexbuffers.length - 1;
        var curBufferResizeCount = Math.min(vertexCount - curBufferIndex * 65536, 65536);
        if (this._currentVertexSize % 65536 !== 0) {
            var curVertices = this._vertices[curBufferIndex];
            var curVertexBuffer = this._vertexbuffers[curBufferIndex];
            var bufferState = this._bufferStates[curBufferIndex];
            var lastVertices = curVertices;
            curVertexBuffer.destroy();
            curVertices = new Float32Array(curBufferResizeCount * SubCubeGeometry.FLOATCOUNTPERVERTEX);
            curVertices.set(lastVertices, 0);
            var verdec = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR");
            curVertexBuffer = new VertexBuffer3D(verdec.vertexStride * curBufferResizeCount, WebGLContext.DYNAMIC_DRAW, false);
            curVertexBuffer.vertexDeclaration = verdec;
            curVertexBuffer.setData(curVertices);
            this._vertices[curBufferIndex] = curVertices;
            this._vertexbuffers[curBufferIndex] = curVertexBuffer;
            bufferState.bind();
            bufferState.applyVertexBuffer(curVertexBuffer);
            bufferState.unBind();
        }
        for (var i = curBufferIndex + 1; i < needBufferCount; i++) {
            var verticesCount = Math.min(vertexCount - i * 65536, 65536);
            this._createVertexBuffer(verticesCount);
        }
        var memory = (vertexCount - this._currentVertexSize) * SubCubeGeometry.FLOATCOUNTPERVERTEX * 4;
        Resource._addCPUMemory(memory);
        Resource._addGPUMemory(memory);
        this._currentVertexSize = vertexCount;
    }
    _addFaceVertex(cubeInfo, FaceIndex) {
        if (cubeInfo.getVBPointbyFaceIndex(FaceIndex) != -1) {
            return;
        }
        var subCube = cubeInfo.subCube;
        if (!subCube) {
            return;
        }
        if (subCube._currentVertexCount === subCube._currentVertexSize)
            subCube._resizeVertexBuffer(subCube._currentVertexSize + SubCubeGeometry.SUBVERTEXCOUNT);
        var point1Factor, point2Factor, point3Factor, point4Factor;
        var cubeInfo1, cubeInfo2, cubeInfo3, cubeInfo4;
        var aoFactor = CubeInfo.aoFactor;
        var vertices = subCube._vertices;
        var vertexUpdateFlag = subCube._vertexUpdateFlag;
        var x = cubeInfo.x - CubeGeometry.HLAFMAXSIZE;
        var y = cubeInfo.y - CubeGeometry.HLAFMAXSIZE;
        var z = cubeInfo.z - CubeGeometry.HLAFMAXSIZE;
        var colorIndex = cubeInfo.color;
        var offset = Math.floor(subCube._currentVertexCount % 65536) * 10;
        var verticesIndex = subCube._currentVertexCount == 0 ? 0 : Math.ceil(subCube._currentVertexCount / 65536) - 1;
        var vertexArray = vertices[verticesIndex];
        var updateFlag = vertexUpdateFlag[verticesIndex];
        (updateFlag[0] > offset) && (updateFlag[0] = offset);
        (updateFlag[1] < offset + 39) && (updateFlag[1] = offset + 39);
        subCube._currentVertexCount += 4;
        var r = (colorIndex & 0xff) / 255;
        var g = ((colorIndex & 0xff00) >> 8) / 255;
        var b = ((colorIndex & 0xff0000) >> 16) / 255;
        var a = (colorIndex & 0xff000000) >> 24;
        var num1;
        var num2;
        var num3;
        var num4;
        switch (FaceIndex) {
            case 0:
                cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
                cubeInfo2 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
                cubeInfo3 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
                cubeInfo4 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
                num1 = CubeInfo.Objcect4front[cubeInfo1.point];
                num2 = CubeInfo.Objcect5front[cubeInfo2.point];
                num3 = CubeInfo.Objcect1front[cubeInfo3.point];
                num4 = CubeInfo.Objcect0front[cubeInfo4.point];
                point1Factor = aoFactor[num1];
                point2Factor = aoFactor[num2];
                point3Factor = aoFactor[num3];
                point4Factor = aoFactor[num4];
                cubeInfo.frontVBIndex = (verticesIndex << 24) + offset;
                vertexArray[offset] = x + 1;
                vertexArray[offset + 1] = y + 1;
                vertexArray[offset + 2] = z + 1;
                vertexArray[offset + 3] = 0.0;
                vertexArray[offset + 4] = 0.0;
                vertexArray[offset + 5] = 1.0;
                vertexArray[offset + 6] = r * point1Factor;
                vertexArray[offset + 7] = g * point1Factor;
                vertexArray[offset + 8] = b * point1Factor;
                vertexArray[offset + 9] = a;
                vertexArray[offset + 10] = x;
                vertexArray[offset + 11] = y + 1;
                vertexArray[offset + 12] = z + 1;
                vertexArray[offset + 13] = 0.0;
                vertexArray[offset + 14] = 0.0;
                vertexArray[offset + 15] = 1.0;
                vertexArray[offset + 16] = r * point2Factor;
                vertexArray[offset + 17] = g * point2Factor;
                vertexArray[offset + 18] = b * point2Factor;
                vertexArray[offset + 19] = a;
                vertexArray[offset + 20] = x;
                vertexArray[offset + 21] = y;
                vertexArray[offset + 22] = z + 1;
                vertexArray[offset + 23] = 0.0;
                vertexArray[offset + 24] = 0.0;
                vertexArray[offset + 25] = 1.0;
                vertexArray[offset + 26] = r * point3Factor;
                vertexArray[offset + 27] = g * point3Factor;
                vertexArray[offset + 28] = b * point3Factor;
                vertexArray[offset + 29] = a;
                vertexArray[offset + 30] = x + 1;
                vertexArray[offset + 31] = y;
                vertexArray[offset + 32] = z + 1;
                vertexArray[offset + 33] = 0.0;
                vertexArray[offset + 34] = 0.0;
                vertexArray[offset + 35] = 1.0;
                vertexArray[offset + 36] = r * point4Factor;
                vertexArray[offset + 37] = g * point4Factor;
                vertexArray[offset + 38] = b * point4Factor;
                vertexArray[offset + 39] = a;
                break;
            case 1:
                cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
                cubeInfo2 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
                cubeInfo3 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
                cubeInfo4 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
                num1 = CubeInfo.Objcect4right[cubeInfo1.point];
                num2 = CubeInfo.Objcect0right[cubeInfo2.point];
                num3 = CubeInfo.Objcect2right[cubeInfo3.point];
                num4 = CubeInfo.Objcect6right[cubeInfo4.point];
                point1Factor = aoFactor[num1];
                point2Factor = aoFactor[num2];
                point3Factor = aoFactor[num3];
                point4Factor = aoFactor[num4];
                cubeInfo.rightVBIndex = (verticesIndex << 24) + offset;
                vertexArray[offset] = x + 1;
                vertexArray[offset + 1] = y + 1;
                vertexArray[offset + 2] = z + 1;
                vertexArray[offset + 3] = 1.0;
                vertexArray[offset + 4] = 0.0;
                vertexArray[offset + 5] = 0.0;
                vertexArray[offset + 6] = r * point1Factor;
                vertexArray[offset + 7] = g * point1Factor;
                vertexArray[offset + 8] = b * point1Factor;
                vertexArray[offset + 9] = a;
                vertexArray[offset + 10] = x + 1;
                vertexArray[offset + 11] = y;
                vertexArray[offset + 12] = z + 1;
                vertexArray[offset + 13] = 1.0;
                vertexArray[offset + 14] = 0.0;
                vertexArray[offset + 15] = 0.0;
                vertexArray[offset + 16] = r * point2Factor;
                vertexArray[offset + 17] = g * point2Factor;
                vertexArray[offset + 18] = b * point2Factor;
                vertexArray[offset + 19] = a;
                vertexArray[offset + 20] = x + 1;
                vertexArray[offset + 21] = y;
                vertexArray[offset + 22] = z;
                vertexArray[offset + 23] = 1.0;
                vertexArray[offset + 24] = 0.0;
                vertexArray[offset + 25] = 0.0;
                vertexArray[offset + 26] = r * point3Factor;
                vertexArray[offset + 27] = g * point3Factor;
                vertexArray[offset + 28] = b * point3Factor;
                vertexArray[offset + 29] = a;
                vertexArray[offset + 30] = x + 1;
                vertexArray[offset + 31] = y + 1;
                vertexArray[offset + 32] = z;
                vertexArray[offset + 33] = 1.0;
                vertexArray[offset + 34] = 0.0;
                vertexArray[offset + 35] = 0.0;
                vertexArray[offset + 36] = r * point4Factor;
                vertexArray[offset + 37] = g * point4Factor;
                vertexArray[offset + 38] = b * point4Factor;
                vertexArray[offset + 39] = a;
                break;
            case 2:
                cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
                cubeInfo2 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
                cubeInfo3 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
                cubeInfo4 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
                num1 = CubeInfo.Objcect4up[cubeInfo1.point];
                num2 = CubeInfo.Objcect6up[cubeInfo2.point];
                num3 = CubeInfo.Objcect7up[cubeInfo3.point];
                num4 = CubeInfo.Objcect5up[cubeInfo4.point];
                point1Factor = aoFactor[num1];
                point2Factor = aoFactor[num2];
                point3Factor = aoFactor[num3];
                point4Factor = aoFactor[num4];
                cubeInfo.topVBIndex = (verticesIndex << 24) + offset;
                vertexArray[offset] = x + 1;
                vertexArray[offset + 1] = y + 1;
                vertexArray[offset + 2] = z + 1;
                vertexArray[offset + 3] = 0.0;
                vertexArray[offset + 4] = 1.0;
                vertexArray[offset + 5] = 0.0;
                vertexArray[offset + 6] = r * point1Factor;
                vertexArray[offset + 7] = g * point1Factor;
                vertexArray[offset + 8] = b * point1Factor;
                vertexArray[offset + 9] = a;
                vertexArray[offset + 10] = x + 1;
                vertexArray[offset + 11] = y + 1;
                vertexArray[offset + 12] = z;
                vertexArray[offset + 13] = 0.0;
                vertexArray[offset + 14] = 1.0;
                vertexArray[offset + 15] = 0.0;
                vertexArray[offset + 16] = r * point2Factor;
                vertexArray[offset + 17] = g * point2Factor;
                vertexArray[offset + 18] = b * point2Factor;
                vertexArray[offset + 19] = a;
                vertexArray[offset + 20] = x;
                vertexArray[offset + 21] = y + 1;
                vertexArray[offset + 22] = z;
                vertexArray[offset + 23] = 0.0;
                vertexArray[offset + 24] = 1.0;
                vertexArray[offset + 25] = 0.0;
                vertexArray[offset + 26] = r * point3Factor;
                vertexArray[offset + 27] = g * point3Factor;
                vertexArray[offset + 28] = b * point3Factor;
                vertexArray[offset + 29] = a;
                vertexArray[offset + 30] = x;
                vertexArray[offset + 31] = y + 1;
                vertexArray[offset + 32] = z + 1;
                vertexArray[offset + 33] = 0.0;
                vertexArray[offset + 34] = 1.0;
                vertexArray[offset + 35] = 0.0;
                vertexArray[offset + 36] = r * point4Factor;
                vertexArray[offset + 37] = g * point4Factor;
                vertexArray[offset + 38] = b * point4Factor;
                vertexArray[offset + 39] = a;
                break;
            case 3:
                cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
                cubeInfo2 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
                cubeInfo3 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
                cubeInfo4 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
                num1 = CubeInfo.Objcect5left[cubeInfo1.point];
                num2 = CubeInfo.Objcect7left[cubeInfo2.point];
                num3 = CubeInfo.Objcect3left[cubeInfo3.point];
                num4 = CubeInfo.Objcect1left[cubeInfo4.point];
                point1Factor = aoFactor[num1];
                point2Factor = aoFactor[num2];
                point3Factor = aoFactor[num3];
                point4Factor = aoFactor[num4];
                cubeInfo.leftVBIndex = (verticesIndex << 24) + offset;
                vertexArray[offset] = x;
                vertexArray[offset + 1] = y + 1;
                vertexArray[offset + 2] = z + 1;
                vertexArray[offset + 3] = -1.0;
                vertexArray[offset + 4] = 0.0;
                vertexArray[offset + 5] = 0.0;
                vertexArray[offset + 6] = r * point1Factor;
                vertexArray[offset + 7] = g * point1Factor;
                vertexArray[offset + 8] = b * point1Factor;
                vertexArray[offset + 9] = a;
                vertexArray[offset + 10] = x;
                vertexArray[offset + 11] = y + 1;
                vertexArray[offset + 12] = z;
                vertexArray[offset + 13] = -1.0;
                vertexArray[offset + 14] = 0.0;
                vertexArray[offset + 15] = 0.0;
                vertexArray[offset + 16] = r * point2Factor;
                vertexArray[offset + 17] = g * point2Factor;
                vertexArray[offset + 18] = b * point2Factor;
                vertexArray[offset + 19] = a;
                vertexArray[offset + 20] = x;
                vertexArray[offset + 21] = y;
                vertexArray[offset + 22] = z;
                vertexArray[offset + 23] = -1.0;
                vertexArray[offset + 24] = 0.0;
                vertexArray[offset + 25] = 0.0;
                vertexArray[offset + 26] = r * point3Factor;
                vertexArray[offset + 27] = g * point3Factor;
                vertexArray[offset + 28] = b * point3Factor;
                vertexArray[offset + 29] = a;
                vertexArray[offset + 30] = x;
                vertexArray[offset + 31] = y;
                vertexArray[offset + 32] = z + 1;
                vertexArray[offset + 33] = -1.0;
                vertexArray[offset + 34] = 0.0;
                vertexArray[offset + 35] = 0.0;
                vertexArray[offset + 36] = r * point4Factor;
                vertexArray[offset + 37] = g * point4Factor;
                vertexArray[offset + 38] = b * point4Factor;
                vertexArray[offset + 39] = a;
                break;
            case 4:
                cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
                cubeInfo2 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
                cubeInfo3 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
                cubeInfo4 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
                num1 = CubeInfo.Objcect3down[cubeInfo1.point];
                num2 = CubeInfo.Objcect2down[cubeInfo2.point];
                num3 = CubeInfo.Objcect0down[cubeInfo3.point];
                num4 = CubeInfo.Objcect1down[cubeInfo4.point];
                point1Factor = aoFactor[num1];
                point2Factor = aoFactor[num2];
                point3Factor = aoFactor[num3];
                point4Factor = aoFactor[num4];
                cubeInfo.downVBIndex = (verticesIndex << 24) + offset;
                vertexArray[offset] = x;
                vertexArray[offset + 1] = y;
                vertexArray[offset + 2] = z;
                vertexArray[offset + 3] = 0.0;
                vertexArray[offset + 4] = -1.0;
                vertexArray[offset + 5] = 0.0;
                vertexArray[offset + 6] = r * point1Factor;
                vertexArray[offset + 7] = g * point1Factor;
                vertexArray[offset + 8] = b * point1Factor;
                vertexArray[offset + 9] = a;
                vertexArray[offset + 10] = x + 1;
                vertexArray[offset + 11] = y;
                vertexArray[offset + 12] = z;
                vertexArray[offset + 13] = 0.0;
                vertexArray[offset + 14] = -1.0;
                vertexArray[offset + 15] = 0.0;
                vertexArray[offset + 16] = r * point2Factor;
                vertexArray[offset + 17] = g * point2Factor;
                vertexArray[offset + 18] = b * point2Factor;
                vertexArray[offset + 19] = a;
                vertexArray[offset + 20] = x + 1;
                vertexArray[offset + 21] = y;
                vertexArray[offset + 22] = z + 1;
                vertexArray[offset + 23] = 0.0;
                vertexArray[offset + 24] = -1.0;
                vertexArray[offset + 25] = 0.0;
                vertexArray[offset + 26] = r * point3Factor;
                vertexArray[offset + 27] = g * point3Factor;
                vertexArray[offset + 28] = b * point3Factor;
                vertexArray[offset + 29] = a;
                vertexArray[offset + 30] = x;
                vertexArray[offset + 31] = y;
                vertexArray[offset + 32] = z + 1;
                vertexArray[offset + 33] = 0.0;
                vertexArray[offset + 34] = -1.0;
                vertexArray[offset + 35] = 0.0;
                vertexArray[offset + 36] = r * point4Factor;
                vertexArray[offset + 37] = g * point4Factor;
                vertexArray[offset + 38] = b * point4Factor;
                vertexArray[offset + 39] = a;
                break;
            case 5:
                cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
                cubeInfo2 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
                cubeInfo3 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
                cubeInfo4 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
                num1 = CubeInfo.Objcect2back[cubeInfo1.point];
                num2 = CubeInfo.Objcect3back[cubeInfo2.point];
                num3 = CubeInfo.Objcect7back[cubeInfo3.point];
                num4 = CubeInfo.Objcect6back[cubeInfo4.point];
                point1Factor = aoFactor[num1];
                point2Factor = aoFactor[num2];
                point3Factor = aoFactor[num3];
                point4Factor = aoFactor[num4];
                cubeInfo.backVBIndex = (verticesIndex << 24) + offset;
                vertexArray[offset] = x + 1;
                vertexArray[offset + 1] = y;
                vertexArray[offset + 2] = z;
                vertexArray[offset + 3] = 0.0;
                vertexArray[offset + 4] = 0.0;
                vertexArray[offset + 5] = -1.0;
                vertexArray[offset + 6] = r * point1Factor;
                vertexArray[offset + 7] = g * point1Factor;
                vertexArray[offset + 8] = b * point1Factor;
                vertexArray[offset + 9] = a;
                vertexArray[offset + 10] = x;
                vertexArray[offset + 11] = y;
                vertexArray[offset + 12] = z;
                vertexArray[offset + 13] = 0.0;
                vertexArray[offset + 14] = 0.0;
                vertexArray[offset + 15] = -1.0;
                vertexArray[offset + 16] = r * point2Factor;
                vertexArray[offset + 17] = g * point2Factor;
                vertexArray[offset + 18] = b * point2Factor;
                vertexArray[offset + 19] = a;
                vertexArray[offset + 20] = x;
                vertexArray[offset + 21] = y + 1;
                vertexArray[offset + 22] = z;
                vertexArray[offset + 23] = 0.0;
                vertexArray[offset + 24] = 0.0;
                vertexArray[offset + 25] = -1.0;
                vertexArray[offset + 26] = r * point3Factor;
                vertexArray[offset + 27] = g * point3Factor;
                vertexArray[offset + 28] = b * point3Factor;
                vertexArray[offset + 29] = a;
                vertexArray[offset + 30] = x + 1;
                vertexArray[offset + 31] = y + 1;
                vertexArray[offset + 32] = z;
                vertexArray[offset + 33] = 0.0;
                vertexArray[offset + 34] = 0.0;
                vertexArray[offset + 35] = -1.0;
                vertexArray[offset + 36] = r * point4Factor;
                vertexArray[offset + 37] = g * point4Factor;
                vertexArray[offset + 38] = b * point4Factor;
                vertexArray[offset + 39] = a;
                break;
        }
    }
    _updataColorPropertyFaceVertex(selfCube, FaceIndex, property) {
        var vertexArray = this._vertices[FaceIndex >> 24];
        var endStartArray = this._vertexUpdateFlag[FaceIndex >> 24];
        var offset = FaceIndex & 0x00ffffff;
        if (endStartArray[0] > offset)
            endStartArray[0] = offset;
        if (endStartArray[1] < offset + 39)
            endStartArray[1] = offset + 39;
        vertexArray[offset + 9] = property;
        vertexArray[offset + 19] = property;
        vertexArray[offset + 29] = property;
        vertexArray[offset + 39] = property;
    }
    _updataColorFaceVertex(selfCube, FaceIndex, color) {
        var point1Factor;
        var point2Factor;
        var point3Factor;
        var point4Factor;
        var cubeInfo1;
        var cubeInfo2;
        var cubeInfo3;
        var cubeInfo4;
        switch (FaceIndex) {
            case 0:
                cubeInfo1 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z + 1);
                cubeInfo2 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z + 1);
                cubeInfo3 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z + 1);
                cubeInfo4 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z + 1);
                point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect4front[cubeInfo1.point]];
                point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect5front[cubeInfo2.point]];
                point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect1front[cubeInfo3.point]];
                point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect0front[cubeInfo4.point]];
                this._updataOnePlaneVertex(selfCube.frontVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
                break;
            case 1:
                cubeInfo1 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z + 1);
                cubeInfo2 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z + 1);
                cubeInfo3 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z);
                cubeInfo4 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z);
                point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect4right[cubeInfo1.point]];
                point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect0right[cubeInfo2.point]];
                point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect2right[cubeInfo3.point]];
                point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect6right[cubeInfo4.point]];
                this._updataOnePlaneVertex(selfCube.rightVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
                break;
            case 2:
                cubeInfo1 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z + 1);
                cubeInfo2 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z);
                cubeInfo3 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z);
                cubeInfo4 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z + 1);
                point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect4up[cubeInfo1.point]];
                point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect6up[cubeInfo2.point]];
                point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect7up[cubeInfo3.point]];
                point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect5up[cubeInfo4.point]];
                this._updataOnePlaneVertex(selfCube.topVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
                break;
            case 3:
                cubeInfo1 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z + 1);
                cubeInfo2 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z);
                cubeInfo3 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z);
                cubeInfo4 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z + 1);
                point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect5left[cubeInfo1.point]];
                point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect7left[cubeInfo2.point]];
                point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect3left[cubeInfo3.point]];
                point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect1left[cubeInfo4.point]];
                this._updataOnePlaneVertex(selfCube.leftVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
                break;
            case 4:
                cubeInfo1 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z);
                cubeInfo2 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z);
                cubeInfo3 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z + 1);
                cubeInfo4 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z + 1);
                point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect3down[cubeInfo1.point]];
                point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect2down[cubeInfo2.point]];
                point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect0down[cubeInfo3.point]];
                point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect1down[cubeInfo4.point]];
                this._updataOnePlaneVertex(selfCube.downVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
                break;
            case 5:
                cubeInfo1 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z);
                cubeInfo2 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z);
                cubeInfo3 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z);
                cubeInfo4 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z);
                point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect2back[cubeInfo1.point]];
                point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect3back[cubeInfo2.point]];
                point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect7back[cubeInfo3.point]];
                point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect6back[cubeInfo4.point]];
                this._updataOnePlaneVertex(selfCube.backVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
                break;
        }
    }
    _updataCubeInfoAO(cubeInfo) {
        for (var i = 0; i < 6; i++) {
            this._updataOnePlaneAO(cubeInfo, i, cubeInfo.frontFaceAO[i]);
        }
    }
    _updataOnePlaneAO(cubeInfo, faceIndex, UpdataData) {
        if (UpdataData == 0) {
            return;
        }
        var VBPoint = cubeInfo.getVBPointbyFaceIndex(faceIndex);
        if (VBPoint == -1) {
            return;
        }
        var vertices = cubeInfo.subCube._vertices;
        var vertexUpdateFlag = cubeInfo.subCube._vertexUpdateFlag;
        var vertexArray = vertices[VBPoint >> 24];
        var endStartArray = vertexUpdateFlag[VBPoint >> 24];
        var offset = VBPoint & 0x00ffffff;
        if (endStartArray[0] > offset)
            endStartArray[0] = offset;
        if (endStartArray[1] < offset + 39)
            endStartArray[1] = offset + 39;
        var colorindex = cubeInfo.color;
        var r = (colorindex & 0xff) / 255;
        var g = ((colorindex & 0xff00) >> 8) / 255;
        var b = ((colorindex & 0xff0000) >> 16) / 255;
        var pointFactor;
        var cubeInfo1;
        if ((UpdataData & CubeInfo.PanduanWei[0]) != 0) {
            switch (faceIndex) {
                case 0:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect4front[cubeInfo1.point]];
                    break;
                case 1:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect4right[cubeInfo1.point]];
                    break;
                case 2:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect4up[cubeInfo1.point]];
                    break;
                case 3:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect5left[cubeInfo1.point]];
                    break;
                case 4:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect3down[cubeInfo1.point]];
                    break;
                case 5:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect2back[cubeInfo1.point]];
                    break;
            }
            vertexArray[offset + 6] = r * pointFactor;
            vertexArray[offset + 7] = g * pointFactor;
            vertexArray[offset + 8] = b * pointFactor;
        }
        if ((UpdataData & CubeInfo.PanduanWei[1]) != 0) {
            switch (faceIndex) {
                case 0:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect5front[cubeInfo1.point]];
                    break;
                case 1:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect0right[cubeInfo1.point]];
                    break;
                case 2:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect6up[cubeInfo1.point]];
                    break;
                case 3:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect7left[cubeInfo1.point]];
                    break;
                case 4:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect2down[cubeInfo1.point]];
                    break;
                case 5:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect3back[cubeInfo1.point]];
                    break;
            }
            vertexArray[offset + 16] = r * pointFactor;
            vertexArray[offset + 17] = g * pointFactor;
            vertexArray[offset + 18] = b * pointFactor;
        }
        if ((UpdataData & CubeInfo.PanduanWei[2]) != 0) {
            switch (faceIndex) {
                case 0:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect1front[cubeInfo1.point]];
                    break;
                case 1:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect2right[cubeInfo1.point]];
                    break;
                case 2:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect7up[cubeInfo1.point]];
                    break;
                case 3:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect3left[cubeInfo1.point]];
                    break;
                case 4:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect0down[cubeInfo1.point]];
                    break;
                case 5:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect7back[cubeInfo1.point]];
                    break;
            }
            vertexArray[offset + 26] = r * pointFactor;
            vertexArray[offset + 27] = g * pointFactor;
            vertexArray[offset + 28] = b * pointFactor;
        }
        if ((UpdataData & CubeInfo.PanduanWei[3]) != 0) {
            switch (faceIndex) {
                case 0:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect0front[cubeInfo1.point]];
                    break;
                case 1:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect6right[cubeInfo1.point]];
                    break;
                case 2:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect5up[cubeInfo1.point]];
                    break;
                case 3:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect1left[cubeInfo1.point]];
                    break;
                case 4:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect1down[cubeInfo1.point]];
                    break;
                case 5:
                    cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
                    pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect6back[cubeInfo1.point]];
                    break;
            }
            vertexArray[offset + 36] = r * pointFactor;
            vertexArray[offset + 37] = g * pointFactor;
            vertexArray[offset + 38] = b * pointFactor;
        }
    }
    _removeOnePlaneVertex(cubeInfo, VBPoint) {
        if (VBPoint == -1) {
            return;
        }
        var This_vertices = cubeInfo.updateCube._vertices;
        var This_vertexUpdateFlag = cubeInfo.updateCube._vertexUpdateFlag;
        var vertexArray = This_vertices[VBPoint >> 24];
        var endStartArray = This_vertexUpdateFlag[VBPoint >> 24];
        var offset = VBPoint & 0x00ffffff;
        var endVertexArray = This_vertices[Math.ceil(cubeInfo.updateCube._currentVertexCount / 65536) - 1];
        var offsetEnd = Math.floor((cubeInfo.updateCube._currentVertexCount - 4) % 65536) * 10;
        if (endStartArray[0] > offset)
            endStartArray[0] = offset;
        if (endStartArray[1] < offset + 39)
            endStartArray[1] = offset + 39;
        cubeInfo.updateCube._currentVertexCount -= 4;
        this._changeCubeInfoFaceVBIndex(endVertexArray[offsetEnd], endVertexArray[offsetEnd + 1], endVertexArray[offsetEnd + 2], endVertexArray[offsetEnd + 3], endVertexArray[offsetEnd + 4], endVertexArray[offsetEnd + 5], VBPoint);
        for (var i = 0; i < 40; i++) {
            vertexArray[offset + i] = endVertexArray[offsetEnd + i];
        }
    }
    _updataOnePlaneVertex(VBPoint, colorindex, point1Factor, point2Factor, point3Factor, point4Factor) {
        var vertexArray = this._vertices[VBPoint >> 24];
        var endStartArray = this._vertexUpdateFlag[VBPoint >> 24];
        var offset = VBPoint & 0x00ffffff;
        if (endStartArray[0] > offset)
            endStartArray[0] = offset;
        if (endStartArray[1] < offset + 39)
            endStartArray[1] = offset + 39;
        var r = (colorindex & 0xff) / 255;
        var g = ((colorindex & 0xff00) >> 8) / 255;
        var b = ((colorindex & 0xff0000) >> 16) / 255;
        vertexArray[offset + 6] = r * point1Factor;
        vertexArray[offset + 7] = g * point1Factor;
        vertexArray[offset + 8] = b * point1Factor;
        vertexArray[offset + 16] = r * point2Factor;
        vertexArray[offset + 17] = g * point2Factor;
        vertexArray[offset + 18] = b * point2Factor;
        vertexArray[offset + 26] = r * point3Factor;
        vertexArray[offset + 27] = g * point3Factor;
        vertexArray[offset + 28] = b * point3Factor;
        vertexArray[offset + 36] = r * point4Factor;
        vertexArray[offset + 37] = g * point4Factor;
        vertexArray[offset + 38] = b * point4Factor;
    }
    _changeCubeInfoFaceVBIndex(x, y, z, norx, nory, norz, VBPoint) {
        var cubeinfox;
        var cubeinfoy;
        var cubeinfoz;
        var cubeinfo;
        if (norx == 0 && nory == 0 && norz == 1) {
            cubeinfox = x - 1;
            cubeinfoy = y - 1;
            cubeinfoz = z - 1;
            cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
            cubeinfo.frontVBIndex = VBPoint;
        }
        else if (norx == 1 && nory == 0 && norz == 0) {
            cubeinfox = x - 1;
            cubeinfoy = y - 1;
            cubeinfoz = z - 1;
            cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
            cubeinfo.rightVBIndex = VBPoint;
        }
        else if (norx == 0 && nory == 1 && norz == 0) {
            cubeinfox = x - 1;
            cubeinfoy = y - 1;
            cubeinfoz = z - 1;
            cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
            cubeinfo.topVBIndex = VBPoint;
        }
        else if (norx == -1 && nory == 0 && norz == 0) {
            cubeinfox = x;
            cubeinfoy = y - 1;
            cubeinfoz = z - 1;
            cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
            cubeinfo.leftVBIndex = VBPoint;
        }
        else if (norx == 0 && nory == -1 && norz == 0) {
            cubeinfox = x;
            cubeinfoy = y;
            cubeinfoz = z;
            cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
            cubeinfo.downVBIndex = VBPoint;
        }
        else if (norx == 0 && nory == 0 && norz == -1) {
            cubeinfox = x - 1;
            cubeinfoy = y;
            cubeinfoz = z;
            cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
            cubeinfo.backVBIndex = VBPoint;
        }
    }
    _addCubeInfo(selfCube) {
        var x = selfCube.x;
        var y = selfCube.y;
        var z = selfCube.z;
        var otherCube = this._cubeMap.find(x + 1, y + 1, z + 1);
        var cubeInfo;
        this._cubeMap.data[(x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16)].save = null;
        if (otherCube.calDirectCubeExit(6) == -1) {
            selfCube.frontVBIndex == -1 && this._addFaceVertex(selfCube, 0);
        }
        else {
            cubeInfo = this._cubeMap.find(x, y, z + 1);
            this._removeOnePlaneVertex(cubeInfo, cubeInfo.backVBIndex);
            cubeInfo.backVBIndex = -1;
        }
        if (otherCube.calDirectCubeExit(5) == -1) {
            selfCube.rightVBIndex == -1 && this._addFaceVertex(selfCube, 1);
        }
        else {
            cubeInfo = this._cubeMap.find(x + 1, y, z);
            this._removeOnePlaneVertex(cubeInfo, cubeInfo.leftVBIndex);
            cubeInfo.leftVBIndex = -1;
        }
        if (otherCube.calDirectCubeExit(0) == -1) {
            selfCube.topVBIndex == -1 && this._addFaceVertex(selfCube, 2);
        }
        else {
            cubeInfo = this._cubeMap.find(x, y + 1, z);
            this._removeOnePlaneVertex(cubeInfo, cubeInfo.downVBIndex);
            cubeInfo.downVBIndex = -1;
        }
        if (selfCube.calDirectCubeExit(2) == -1) {
            selfCube.leftVBIndex == -1 && this._addFaceVertex(selfCube, 3);
        }
        else {
            cubeInfo = this._cubeMap.find(x - 1, y, z);
            this._removeOnePlaneVertex(cubeInfo, cubeInfo.rightVBIndex);
            cubeInfo.rightVBIndex = -1;
        }
        if (selfCube.calDirectCubeExit(7) == -1) {
            selfCube.downVBIndex == -1 && this._addFaceVertex(selfCube, 4);
        }
        else {
            cubeInfo = this._cubeMap.find(x, y - 1, z);
            this._removeOnePlaneVertex(cubeInfo, cubeInfo.topVBIndex);
            cubeInfo.topVBIndex = -1;
        }
        if (selfCube.calDirectCubeExit(1) == -1) {
            selfCube.backVBIndex == -1 && this._addFaceVertex(selfCube, 5);
        }
        else {
            cubeInfo = this._cubeMap.find(x, y, z - 1);
            this._removeOnePlaneVertex(cubeInfo, cubeInfo.frontVBIndex);
            cubeInfo.frontVBIndex = -1;
        }
    }
    _removeCubeInfo(selfCube) {
        var x = selfCube.x;
        var y = selfCube.y;
        var z = selfCube.z;
        var otherCube = this._cubeMap.find(x + 1, y + 1, z + 1);
        var cubeInfo;
        this._cubeMap.data[(x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16)].save = null;
        if (selfCube.frontVBIndex != -1) {
            this._removeOnePlaneVertex(selfCube, selfCube.frontVBIndex);
            selfCube.frontVBIndex = -1;
        }
        if (otherCube.calDirectCubeExit(6) != -1) {
            cubeInfo = this._cubeMap.find(x, y, z + 1);
            cubeInfo.backVBIndex == -1 && this._addFaceVertex(cubeInfo, 5);
        }
        if (selfCube.rightVBIndex != -1) {
            this._removeOnePlaneVertex(selfCube, selfCube.rightVBIndex);
            selfCube.rightVBIndex = -1;
        }
        if (otherCube.calDirectCubeExit(5) != -1) {
            cubeInfo = this._cubeMap.find(x + 1, y, z);
            this._addFaceVertex(cubeInfo, 3);
        }
        if (selfCube.topVBIndex != -1) {
            this._removeOnePlaneVertex(selfCube, selfCube.topVBIndex);
            selfCube.topVBIndex = -1;
        }
        if (otherCube.calDirectCubeExit(0) != -1) {
            cubeInfo = this._cubeMap.find(x, y + 1, z);
            this._addFaceVertex(cubeInfo, 4);
        }
        if (selfCube.leftVBIndex != -1) {
            this._removeOnePlaneVertex(selfCube, selfCube.leftVBIndex);
            selfCube.leftVBIndex = -1;
        }
        if (selfCube.calDirectCubeExit(2) != -1) {
            cubeInfo = this._cubeMap.find(x - 1, y, z);
            this._addFaceVertex(cubeInfo, 1);
        }
        if (selfCube.downVBIndex != -1) {
            this._removeOnePlaneVertex(selfCube, selfCube.downVBIndex);
            selfCube.downVBIndex = -1;
        }
        if (selfCube.calDirectCubeExit(7) != -1) {
            cubeInfo = this._cubeMap.find(x, y - 1, z);
            this._addFaceVertex(cubeInfo, 2);
        }
        if (selfCube.backVBIndex != -1) {
            this._removeOnePlaneVertex(selfCube, selfCube.backVBIndex);
            selfCube.backVBIndex = -1;
        }
        if (selfCube.calDirectCubeExit(1) != -1) {
            cubeInfo = this._cubeMap.find(x, y, z - 1);
            this._addFaceVertex(cubeInfo, 0);
        }
    }
    _updateCubeInfo(selfCube) {
        var color = selfCube.color;
        this._cubeMap.data[(selfCube.x >> 5) + ((selfCube.y >> 5) << 8) + ((selfCube.z >> 5) << 16)].save = null;
        if (selfCube.frontVBIndex != -1)
            this._updataColorFaceVertex(selfCube, 0, color);
        if (selfCube.rightVBIndex != -1)
            this._updataColorFaceVertex(selfCube, 1, color);
        if (selfCube.topVBIndex != -1)
            this._updataColorFaceVertex(selfCube, 2, color);
        if (selfCube.leftVBIndex != -1)
            this._updataColorFaceVertex(selfCube, 3, color);
        if (selfCube.downVBIndex != -1)
            this._updataColorFaceVertex(selfCube, 4, color);
        if (selfCube.backVBIndex != -1)
            this._updataColorFaceVertex(selfCube, 5, color);
    }
    _updateCubeInfoProperty(selfCube) {
        var color = (selfCube.color & 0xff000000) >> 24;
        this._cubeMap.data[(selfCube.x >> 5) + ((selfCube.y >> 5) << 8) + ((selfCube.z >> 5) << 16)].save = null;
        if (selfCube.frontVBIndex != -1)
            this._updataColorPropertyFaceVertex(selfCube, selfCube.frontVBIndex, color);
        if (selfCube.rightVBIndex != -1)
            this._updataColorPropertyFaceVertex(selfCube, selfCube.rightVBIndex, color);
        if (selfCube.topVBIndex != -1)
            this._updataColorPropertyFaceVertex(selfCube, selfCube.topVBIndex, color);
        if (selfCube.leftVBIndex != -1)
            this._updataColorPropertyFaceVertex(selfCube, selfCube.leftVBIndex, color);
        if (selfCube.downVBIndex != -1)
            this._updataColorPropertyFaceVertex(selfCube, selfCube.downVBIndex, color);
        if (selfCube.backVBIndex != -1)
            this._updataColorPropertyFaceVertex(selfCube, selfCube.backVBIndex, color);
    }
    updatePlane(cubeInfo) {
        var modifyFlag = cubeInfo.modifyFlag;
        switch (modifyFlag) {
            case CubeInfo.MODIFYE_ADD:
                this._addCubeInfo(cubeInfo);
                break;
            case CubeInfo.MODIFYE_REMOVE:
                this._removeCubeInfo(cubeInfo);
                break;
            case CubeInfo.MODIFYE_UPDATE:
                this._updateCubeInfo(cubeInfo);
                break;
            case CubeInfo.MODIFYE_UPDATEAO:
                this._updataCubeInfoAO(cubeInfo);
                cubeInfo.clearAoData();
                break;
            case CubeInfo.MODIFYE_UPDATEPROPERTY:
                this._updateCubeInfoProperty(cubeInfo);
        }
        cubeInfo.modifyFlag = CubeInfo.MODIFYE_NONE;
        return;
    }
    updateBuffer() {
        var count = Math.ceil(this._currentVertexCount / 65536);
        for (var i = 0, n = this._vertexUpdateFlag.length; i < n; i++) {
            var flag = this._vertexUpdateFlag[i];
            if (i < count) {
                var updateStart = flag[0];
                var updateEnd = flag[1] + 1;
                if (updateStart !== 2147483647 && updateEnd !== -2147483647) {
                    this._vertexbuffers[i].setData(this._vertices[i], updateStart, updateStart, updateEnd - updateStart);
                    flag[0] = 2147483647;
                    flag[1] = -2147483647;
                }
            }
            else {
                flag[0] = 2147483647;
                flag[1] = -2147483647;
            }
        }
    }
    render(state) {
        var gl = LayaGL.instance;
        var count = Math.ceil(this._currentVertexCount / 65536);
        var endIndex = count - 1;
        for (var i = 0; i < count; i++) {
            this._bufferStates[i].bind();
            var renderCount = (i === endIndex) ? this._currentVertexCount - 65536 * endIndex : 65536;
            gl.drawElements(WebGLContext.TRIANGLES, (renderCount / 4) * 6, WebGLContext.UNSIGNED_SHORT, 0);
        }
        Stat.renderBatches += count;
        Stat.trianglesFaces += this._currentVertexCount / 2;
    }
    clear() {
        this._currentVertexCount = 0;
        this.cubeCount = 0;
    }
    destroy() {
        for (var i = 0, n = this._vertexbuffers.length; i < n; i++) {
            this._bufferStates[i].destroy();
            this._vertexbuffers[i].destroy();
        }
        this._vertexbuffers = null;
        this._vertices = null;
        var memory = this._currentVertexSize * SubCubeGeometry.FLOATCOUNTPERVERTEX * 4;
        Resource._addCPUMemory(-memory);
        Resource._addGPUMemory(-memory);
    }
}
SubCubeGeometry.SIZE = 32;
SubCubeGeometry.MAXSUBCOUNT = CubeGeometry.HLAFMAXSIZE * 2 / SubCubeGeometry.SIZE;
SubCubeGeometry.SUBVERTEXCOUNT = 65536 / 8;
SubCubeGeometry.MaxVertexCount = 0;
SubCubeGeometry.FLOATCOUNTPERVERTEX = 10;
SubCubeGeometry.FLOATCOUNTPERPLANE = 40;
SubCubeGeometry.HALFMAXNumCube = 1600;
SubCubeGeometry._pool = [];
