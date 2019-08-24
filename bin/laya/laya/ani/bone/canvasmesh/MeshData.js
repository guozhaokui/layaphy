import { Rectangle } from "../../../maths/Rectangle";
export class MeshData {
    constructor() {
        this.uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        this.vertices = new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
        this.indexes = new Uint16Array([0, 1, 3, 3, 1, 2]);
        this.useUvTransform = false;
        this.canvasPadding = 1;
    }
    getBounds() {
        return Rectangle._getWrapRec(this.vertices);
    }
}
