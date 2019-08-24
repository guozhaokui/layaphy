import { Vector3 } from "./Vector3";
export class Plane {
    constructor(normal, d = 0) {
        this.normal = normal;
        this.distance = d;
    }
    static createPlaneBy3P(point1, point2, point3) {
        var x1 = point2.x - point1.x;
        var y1 = point2.y - point1.y;
        var z1 = point2.z - point1.z;
        var x2 = point3.x - point1.x;
        var y2 = point3.y - point1.y;
        var z2 = point3.z - point1.z;
        var yz = (y1 * z2) - (z1 * y2);
        var xz = (z1 * x2) - (x1 * z2);
        var xy = (x1 * y2) - (y1 * x2);
        var invPyth = 1 / (Math.sqrt((yz * yz) + (xz * xz) + (xy * xy)));
        var x = yz * invPyth;
        var y = xz * invPyth;
        var z = xy * invPyth;
        Plane._TEMPVec3.x = x;
        Plane._TEMPVec3.y = y;
        Plane._TEMPVec3.z = z;
        var d = -((x * point1.x) + (y * point1.y) + (z * point1.z));
        var plane = new Plane(Plane._TEMPVec3, d);
        return plane;
    }
    normalize() {
        var normalEX = this.normal.x;
        var normalEY = this.normal.y;
        var normalEZ = this.normal.z;
        var magnitude = 1 / Math.sqrt(normalEX * normalEX + normalEY * normalEY + normalEZ * normalEZ);
        this.normal.x = normalEX * magnitude;
        this.normal.y = normalEY * magnitude;
        this.normal.z = normalEZ * magnitude;
        this.distance *= magnitude;
    }
}
Plane._TEMPVec3 = new Vector3();
Plane.PlaneIntersectionType_Back = 0;
Plane.PlaneIntersectionType_Front = 1;
Plane.PlaneIntersectionType_Intersecting = 2;
