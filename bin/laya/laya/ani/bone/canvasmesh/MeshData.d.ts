import { Texture } from "../../../resource/Texture";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";
export declare class MeshData {
    texture: Texture;
    uvs: Float32Array;
    vertices: Float32Array;
    indexes: Uint16Array;
    uvTransform: Matrix;
    useUvTransform: boolean;
    canvasPadding: number;
    getBounds(): Rectangle;
}
