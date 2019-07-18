import { Ray } from "../math/Ray";
import { Vector3 } from "../math/Vector3";
import { Picker } from "../utils/Picker";
export class HeightMap {
    constructor(width, height, minHeight, maxHeight) {
        this._datas = [];
        this._w = width;
        this._h = height;
        this._minHeight = minHeight;
        this._maxHeight = maxHeight;
    }
    static creatFromMesh(mesh, width, height, outCellSize) {
        var vertices = [];
        var indexs = [];
        var submesheCount = mesh.subMeshCount;
        for (var i = 0; i < submesheCount; i++) {
            var subMesh = mesh.getSubMesh(i);
            var vertexBuffer = subMesh._vertexBuffer;
            var verts = vertexBuffer.getFloat32Data();
            var subMeshVertices = [];
            for (var j = 0; j < verts.length; j += vertexBuffer.vertexDeclaration.vertexStride / 4) {
                var position = new Vector3(verts[j + 0], verts[j + 1], verts[j + 2]);
                subMeshVertices.push(position);
            }
            vertices.push(subMeshVertices);
            var ib = subMesh._indexBuffer;
            indexs.push(ib.getData());
        }
        var bounds = mesh.bounds;
        var minX = bounds.getMin().x;
        var minZ = bounds.getMin().z;
        var maxX = bounds.getMax().x;
        var maxZ = bounds.getMax().z;
        var minY = bounds.getMin().y;
        var maxY = bounds.getMax().y;
        var widthSize = maxX - minX;
        var heightSize = maxZ - minZ;
        var cellWidth = outCellSize.x = widthSize / (width - 1);
        var cellHeight = outCellSize.y = heightSize / (height - 1);
        var heightMap = new HeightMap(width, height, minY, maxY);
        var ray = HeightMap._tempRay;
        var rayDir = ray.direction;
        rayDir.x = 0;
        rayDir.y = -1;
        rayDir.z = 0;
        const heightOffset = 0.1;
        var rayY = maxY + heightOffset;
        ray.origin.y = rayY;
        for (var h = 0; h < height; h++) {
            var posZ = minZ + h * cellHeight;
            heightMap._datas[h] = [];
            for (var w = 0; w < width; w++) {
                var posX = minX + w * cellWidth;
                var rayOri = ray.origin;
                rayOri.x = posX;
                rayOri.z = posZ;
                var closestIntersection = HeightMap._getPosition(ray, vertices, indexs);
                heightMap._datas[h][w] = (closestIntersection === Number.MAX_VALUE) ? NaN : rayY - closestIntersection;
            }
        }
        return heightMap;
    }
    static createFromImage(texture, minHeight, maxHeight) {
        var textureWidth = texture.width;
        var textureHeight = texture.height;
        var heightMap = new HeightMap(textureWidth, textureHeight, minHeight, maxHeight);
        var compressionRatio = (maxHeight - minHeight) / 254;
        var pixelsInfo = texture.getPixels();
        var index = 0;
        for (var h = 0; h < textureHeight; h++) {
            var colDatas = heightMap._datas[h] = [];
            for (var w = 0; w < textureWidth; w++) {
                var r = pixelsInfo[index++];
                var g = pixelsInfo[index++];
                var b = pixelsInfo[index++];
                var a = pixelsInfo[index++];
                if (r == 255 && g == 255 && b == 255 && a == 255)
                    colDatas[w] = NaN;
                else {
                    colDatas[w] = (r + g + b) / 3 * compressionRatio + minHeight;
                }
            }
        }
        return heightMap;
    }
    static _getPosition(ray, vertices, indexs) {
        var closestIntersection = Number.MAX_VALUE;
        for (var i = 0; i < vertices.length; i++) {
            var subMeshVertices = vertices[i];
            var subMeshIndexes = indexs[i];
            for (var j = 0; j < subMeshIndexes.length; j += 3) {
                var vertex1 = subMeshVertices[subMeshIndexes[j + 0]];
                var vertex2 = subMeshVertices[subMeshIndexes[j + 1]];
                var vertex3 = subMeshVertices[subMeshIndexes[j + 2]];
                var intersection = Picker.rayIntersectsTriangle(ray, vertex1, vertex2, vertex3);
                if (!isNaN(intersection) && intersection < closestIntersection) {
                    closestIntersection = intersection;
                }
            }
        }
        return closestIntersection;
    }
    get width() {
        return this._w;
    }
    get height() {
        return this._h;
    }
    get maxHeight() {
        return this._maxHeight;
    }
    get minHeight() {
        return this._minHeight;
    }
    _inBounds(row, col) {
        return row >= 0 && row < this._h && col >= 0 && col < this._w;
    }
    getHeight(row, col) {
        if (this._inBounds(row, col))
            return this._datas[row][col];
        else
            return NaN;
    }
}
HeightMap._tempRay = new Ray(new Vector3(), new Vector3());
