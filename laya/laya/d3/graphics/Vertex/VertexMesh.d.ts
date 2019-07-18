import { VertexDeclaration } from "../VertexDeclaration";
export declare class VertexMesh {
    static MESH_POSITION0: number;
    static MESH_COLOR0: number;
    static MESH_TEXTURECOORDINATE0: number;
    static MESH_NORMAL0: number;
    static MESH_TANGENT0: number;
    static MESH_BLENDINDICES0: number;
    static MESH_BLENDWEIGHT0: number;
    static MESH_TEXTURECOORDINATE1: number;
    static MESH_WORLDMATRIX_ROW0: number;
    static MESH_WORLDMATRIX_ROW1: number;
    static MESH_WORLDMATRIX_ROW2: number;
    static MESH_WORLDMATRIX_ROW3: number;
    static MESH_MVPMATRIX_ROW0: number;
    static MESH_MVPMATRIX_ROW1: number;
    static MESH_MVPMATRIX_ROW2: number;
    static MESH_MVPMATRIX_ROW3: number;
    static instanceWorldMatrixDeclaration: VertexDeclaration;
    static instanceMVPMatrixDeclaration: VertexDeclaration;
    static getVertexDeclaration(vertexFlag: string, compatible?: boolean): VertexDeclaration;
}
