import { Vector3 } from "./Vector3";
export class BoundBox {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    _rotateExtents(extents, rotation, out) {
        var extentsX = extents.x;
        var extentsY = extents.y;
        var extentsZ = extents.z;
        var matElements = rotation.elements;
        out.x = Math.abs(matElements[0] * extentsX) + Math.abs(matElements[4] * extentsY) + Math.abs(matElements[8] * extentsZ);
        out.y = Math.abs(matElements[1] * extentsX) + Math.abs(matElements[5] * extentsY) + Math.abs(matElements[9] * extentsZ);
        out.z = Math.abs(matElements[2] * extentsX) + Math.abs(matElements[6] * extentsY) + Math.abs(matElements[10] * extentsZ);
    }
    getCorners(corners) {
        corners.length = 8;
        var minX = this.min.x;
        var minY = this.min.y;
        var minZ = this.min.z;
        var maxX = this.max.x;
        var maxY = this.max.y;
        var maxZ = this.max.z;
        corners[0] = new Vector3(minX, maxY, maxZ);
        corners[1] = new Vector3(maxX, maxY, maxZ);
        corners[2] = new Vector3(maxX, minY, maxZ);
        corners[3] = new Vector3(minX, minY, maxZ);
        corners[4] = new Vector3(minX, maxY, minZ);
        corners[5] = new Vector3(maxX, maxY, minZ);
        corners[6] = new Vector3(maxX, minY, minZ);
        corners[7] = new Vector3(minX, minY, minZ);
    }
    getCenter(out) {
        Vector3.add(this.min, this.max, out);
        Vector3.scale(out, 0.5, out);
    }
    getExtent(out) {
        Vector3.subtract(this.max, this.min, out);
        Vector3.scale(out, 0.5, out);
    }
    setCenterAndExtent(center, extent) {
        Vector3.subtract(center, extent, this.min);
        Vector3.add(center, extent, this.max);
    }
    tranform(matrix, out) {
        var center = BoundBox._tempVector30;
        var extent = BoundBox._tempVector31;
        this.getCenter(center);
        this.getExtent(extent);
        Vector3.transformCoordinate(center, matrix, center);
        this._rotateExtents(extent, matrix, extent);
        out.setCenterAndExtent(center, extent);
    }
    toDefault() {
        this.min.toDefault();
        this.max.toDefault();
    }
    static createfromPoints(points, out) {
        if (points == null)
            throw new Error("points");
        var min = out.min;
        var max = out.max;
        min.x = Number.MAX_VALUE;
        min.y = Number.MAX_VALUE;
        min.z = Number.MAX_VALUE;
        max.x = -Number.MAX_VALUE;
        max.y = -Number.MAX_VALUE;
        max.z = -Number.MAX_VALUE;
        for (var i = 0, n = points.length; i < n; ++i) {
            Vector3.min(min, points[i], min);
            Vector3.max(max, points[i], max);
        }
    }
    static merge(box1, box2, out) {
        Vector3.min(box1.min, box2.min, out.min);
        Vector3.max(box1.max, box2.max, out.max);
    }
    cloneTo(destObject) {
        var dest = destObject;
        this.min.cloneTo(dest.min);
        this.max.cloneTo(dest.max);
    }
    clone() {
        var dest = new BoundBox(new Vector3(), new Vector3());
        this.cloneTo(dest);
        return dest;
    }
}
BoundBox._tempVector30 = new Vector3();
BoundBox._tempVector31 = new Vector3();
