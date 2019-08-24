import { CubeGeometry } from "./CubeGeometry";
import { CubeMap } from "./CubeMap";
import { CubeInfo } from "./CubeInfo";
import { BufferState } from "laya/d3/core/BufferState";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D";
export declare class SubCubeGeometry {
    static SIZE: number;
    static MAXSUBCOUNT: number;
    static SUBVERTEXCOUNT: number;
    static MaxVertexCount: number;
    static FLOATCOUNTPERVERTEX: number;
    static FLOATCOUNTPERPLANE: number;
    static HALFMAXNumCube: number;
    private static _pool;
    private static _indexBuffer;
    private static _UVvertexBuffer;
    static create(owner: CubeGeometry): SubCubeGeometry;
    static recover(cube: SubCubeGeometry): void;
    static __init__(): void;
    static getKey(x: number, y: number, z: number): number;
    _currentVertexCount: number;
    _currentVertexSize: number;
    _vertices: Float32Array[];
    _vertexbuffers: VertexBuffer3D[];
    _vertexUpdateFlag: any[][];
    _bufferStates: BufferState[];
    _cubeMap: CubeMap;
    cubeCount: number;
    constructor();
    _clearEditerInfo(): void;
    private _createVertexBuffer;
    private _resizeVertexBuffer;
    _addFaceVertex(cubeInfo: CubeInfo, FaceIndex: number): void;
    _updataColorPropertyFaceVertex(selfCube: CubeInfo, FaceIndex: number, property: number): void;
    _updataColorFaceVertex(selfCube: CubeInfo, FaceIndex: number, color: number): void;
    _updataCubeInfoAO(cubeInfo: CubeInfo): void;
    private _updataOnePlaneAO;
    _removeOnePlaneVertex(cubeInfo: CubeInfo, VBPoint: number): void;
    private _updataOnePlaneVertex;
    private _changeCubeInfoFaceVBIndex;
    private _addCubeInfo;
    private _removeCubeInfo;
    private _updateCubeInfo;
    private _updateCubeInfoProperty;
    updatePlane(cubeInfo: CubeInfo): void;
    updateBuffer(): void;
    render(state: RenderContext3D): void;
    clear(): void;
    destroy(): void;
}