import { CubePhysicsCompnent } from "./CubePhysicsCompnent";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { BoundSphere } from "laya/d3/math/BoundSphere";
import { CollisionUtils } from "laya/d3/math/CollisionUtils";
import { Color } from "laya/d3/math/Color";
import { Vector3 } from "laya/d3/math/Vector3";
export class CubeSphereCollider extends CubePhysicsCompnent {
    constructor() {
        super();
        this.center = new Vector3(0, 0, 0);
        this.radius = 1;
        this._boundSphere = new BoundSphere(new Vector3(0, 0, 0), 0);
        this._disparity = new Vector3();
        this._primitscale = new Vector3();
        this.pixelline = new PixelLineSprite3D(320);
        this.primitradius = 0;
        this.cubePoint = new Vector3();
        this.vec1 = new Vector3();
        this.vec2 = new Vector3();
    }
    onAwake() {
        this.type = CubePhysicsCompnent.TYPE_SPHERE;
        this._sprite3D = this.owner;
        if (!this.pixelline) {
            this.pixelline = new PixelLineSprite3D(320);
        }
        this._sprite3D.scene.addChild(this.pixelline);
        var Mesharray = [];
        var spriteArray = [];
        CubePhysicsCompnent.findAllMesh(this._sprite3D, Mesharray, spriteArray);
        var AllPositions = [];
        for (var i = 0, n = Mesharray.length; i < n; i++) {
            var positions = Mesharray[i]._getPositions();
            var worldmatrix = spriteArray[i].transform.worldMatrix;
            for (var j = 0; j < positions.length; j++) {
                Vector3.transformCoordinate(positions[j], worldmatrix, positions[j]);
                AllPositions.push(positions[j]);
            }
        }
        BoundSphere.createfromPoints(AllPositions, this._boundSphere);
        var OBBcenter = this._boundSphere.center;
        this._primitPosition = this._sprite3D.transform.position;
        this._primitscale = this._sprite3D.transform.scale;
        this._disparity.setValue(OBBcenter.x - this._primitPosition.x, OBBcenter.y - this._primitPosition.y, OBBcenter.z - this._primitPosition.z);
        this.primitradius = this._boundSphere.radius / Math.max(this._primitscale.x, this._primitscale.y, this._primitscale.z);
        this._boundBox.max.setValue(OBBcenter.x + this.radius, OBBcenter.y + this.radius, OBBcenter.z + this.radius);
        this._boundBox.min.setValue(OBBcenter.x - this.radius, OBBcenter.y - this.radius, OBBcenter.z - this.radius);
        this._boundSpheres.center.setValue(OBBcenter.x, OBBcenter.y, OBBcenter.z);
        this._boundSpheres.radius = this._boundSphere.radius;
        CubePhysicsCompnent._octree.add(this);
    }
    onUpdate() {
        this.updataBoundSphere();
    }
    updataBoundSphere() {
        var bei = Math.max(this._primitscale.x, this._primitscale.y, this._primitscale.z);
        this._boundSphere.radius = this.primitradius * bei * this.radius;
        var spt = this._sprite3D.transform.position;
        this._boundSphere.center.setValue((spt.x + this._disparity.x * bei) + this.center.x, (spt.y + this._disparity.y * bei + this.center.y), (spt.z + this._disparity.z * bei + this.center.z));
        var vec = this._boundSphere.center;
        var ra = this._boundSphere.radius;
        this._boundBox.max.setValue(vec.x + ra, vec.y + ra, vec.z + ra);
        this._boundBox.min.setValue(vec.x - ra, vec.y - ra, vec.z - ra);
        this._boundSpheres.center.setValue(vec.x, vec.y, vec.z);
        this._boundSpheres.radius = ra;
    }
    isCollision(other) {
        switch (other.type) {
            case 0:
                return this.sphereAndBox(other);
                break;
            case 1:
                return this.sphereAndShpere(other);
                break;
            case 2:
                return this.sphereAndCube(other);
                break;
            default:
                return 999;
        }
    }
    sphereAndShpere(other) {
        return CollisionUtils.sphereContainsSphere(other._boundSphere, this._boundSphere);
    }
    sphereAndBox(other) {
        return other.boxAndSphere(this);
    }
    _showline() {
        this.pixelline.active = true;
        this.drawBound();
    }
    _noShowLine() {
        this.pixelline.active = false;
    }
    sphereAndCube(other) {
        var cubemap = other.cubeMap;
        var minx = Math.floor(this._boundSphere.center.x - this._boundSphere.radius);
        var maxx = Math.floor(this._boundSphere.center.x + this._boundSphere.radius);
        var miny = Math.floor(this._boundSphere.center.y - this._boundSphere.radius);
        var maxy = Math.floor(this._boundSphere.center.y + this._boundSphere.radius);
        var minz = Math.floor(this._boundSphere.center.z - this._boundSphere.radius);
        var maxz = Math.floor(this._boundSphere.center.z + this._boundSphere.radius);
        var ix;
        var iy;
        var iz;
        for (var i = minx; i <= maxx; i++) {
            for (var j = miny; j <= maxy; j++) {
                for (var k = minz; k <= maxz; k++) {
                    if (this.OneCubeIsCollider(other, i, j, k) != 0)
                        return 1;
                }
            }
        }
        return 0;
    }
    OneCubeIsCollider(cubeCollider, x, y, z) {
        var ii = this.cubecollider.find(x + 1600, y + 1600, z + 1600);
        if (ii != -1) {
            this.cubecollider.collisionCube.setValue(x, y, z);
            this.cubecollider.cubeProperty = ii;
            this.cubePoint.setValue(x, y, z);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x + 1, y, z);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x, y + 1, z);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x, y, z + 1);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x + 1, y + 1, z);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x + 1, y, z + 1);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x, y + 1, z + 1);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x + 1, y + 1, z + 1);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0)
                return 1;
        }
        return 0;
    }
    drawBound(color = Color.GREEN) {
        this.pixelline.clear();
        var lineNums = 100;
        var duan = 6.28 / lineNums;
        var sita = 0;
        var center = this._boundSphere.center;
        var ra = this._boundSphere.radius;
        for (var i = 0; i <= lineNums; i++) {
            this.vec1.setValue(Math.cos(sita) * ra + center.x, Math.sin(sita) * ra + center.y, center.z);
            sita = i * duan;
            this.vec2.setValue(Math.cos(sita) * ra + center.x, Math.sin(sita) * ra + center.y, center.z);
            this.pixelline.addLine(this.vec1, this.vec2, color, color);
        }
        for (var i = 0; i <= lineNums; i++) {
            this.vec1.setValue(center.x, Math.sin(sita) * ra + center.y, Math.cos(sita) * ra + center.z);
            sita = i * duan;
            this.vec2.setValue(center.x, Math.sin(sita) * ra + center.y, Math.cos(sita) * ra + center.z);
            this.pixelline.addLine(this.vec1, this.vec2, color, color);
        }
        for (var i = 0; i <= lineNums; i++) {
            this.vec1.setValue(Math.cos(sita) * ra + center.x, center.y, Math.sin(sita) * ra + center.z);
            sita = i * duan;
            this.vec2.setValue(Math.cos(sita) * ra + center.x, center.y, Math.sin(sita) * ra + center.z);
            this.pixelline.addLine(this.vec1, this.vec2, color, color);
        }
    }
    resizeBound() {
        var Mesharray = [];
        var spriteArray = [];
        CubePhysicsCompnent.findAllMesh(this._sprite3D, Mesharray, spriteArray);
        var AllPositions = [];
        for (var i = 0, n = Mesharray.length; i < n; i++) {
            var positions = Mesharray[i]._getPositions();
            var worldmatrix = spriteArray[i].transform.worldMatrix;
            for (var j = 0; j < positions.length; j++) {
                Vector3.transformCoordinate(positions[j], worldmatrix, positions[j]);
                AllPositions.push(positions[j]);
            }
        }
        BoundSphere.createfromPoints(AllPositions, this._boundSphere);
        var OBBcenter = this._boundSphere.center;
        this._primitPosition = this._sprite3D.transform.position;
        this._primitscale = this._sprite3D.transform.scale;
        this._disparity.setValue(OBBcenter.x - this._primitPosition.x, OBBcenter.y - this._primitPosition.y, OBBcenter.z - this._primitPosition.z);
        this.primitradius = this._boundSphere.radius;
    }
    onDestroy() {
        this.clearLine();
        super.onDestroy();
    }
    onDisable() {
        super.onDisable();
        this.pixelline.active = false;
    }
    onEnable() {
        super.onEnable();
        this.pixelline.active = true;
    }
    clearLine() {
        this.pixelline.clear();
        this.pixelline.destroy();
    }
}
