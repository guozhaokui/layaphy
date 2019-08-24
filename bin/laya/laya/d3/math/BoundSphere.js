import { Vector3 } from "./Vector3";
import { CollisionUtils } from "./CollisionUtils";
export class BoundSphere {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }
    toDefault() {
        this.center.toDefault();
        this.radius = 0;
    }
    static createFromSubPoints(points, start, count, out) {
        if (points == null) {
            throw new Error("points");
        }
        if (start < 0 || start >= points.length) {
            throw new Error("start" + start + "Must be in the range [0, " + (points.length - 1) + "]");
        }
        if (count < 0 || (start + count) > points.length) {
            throw new Error("count" + count + "Must be in the range <= " + points.length + "}");
        }
        var upperEnd = start + count;
        var center = BoundSphere._tempVector3;
        center.x = 0;
        center.y = 0;
        center.z = 0;
        for (var i = start; i < upperEnd; ++i) {
            Vector3.add(points[i], center, center);
        }
        var outCenter = out.center;
        Vector3.scale(center, 1 / count, outCenter);
        var radius = 0.0;
        for (i = start; i < upperEnd; ++i) {
            var distance = Vector3.distanceSquared(outCenter, points[i]);
            if (distance > radius)
                radius = distance;
        }
        out.radius = Math.sqrt(radius);
    }
    static createfromPoints(points, out) {
        if (points == null) {
            throw new Error("points");
        }
        BoundSphere.createFromSubPoints(points, 0, points.length, out);
    }
    intersectsRayDistance(ray) {
        return CollisionUtils.intersectsRayAndSphereRD(ray, this);
    }
    intersectsRayPoint(ray, outPoint) {
        return CollisionUtils.intersectsRayAndSphereRP(ray, this, outPoint);
    }
    cloneTo(destObject) {
        var dest = destObject;
        this.center.cloneTo(dest.center);
        dest.radius = this.radius;
    }
    clone() {
        var dest = new BoundSphere(new Vector3(), 0);
        this.cloneTo(dest);
        return dest;
    }
}
BoundSphere._tempVector3 = new Vector3();
