import { CubePhysicsCompnent } from "./CubePhysicsCompnent";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { BoundBox } from "laya/d3/math/BoundBox";
import { BoundSphere } from "laya/d3/math/BoundSphere";
import { Color } from "laya/d3/math/Color";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { OrientedBoundBox } from "laya/d3/math/OrientedBoundBox";
import { Vector3 } from "laya/d3/math/Vector3";
export class CubeBoxCollider extends CubePhysicsCompnent {
    constructor() {
        super(...arguments);
        this.oriBoundCenter = new Vector3();
        this.position = new Vector3(0, 0, 0);
        this.scale = new Vector3(2, 2, 2);
        this.privateScale = new Vector3(0, 0, 0);
        this.lineActive = false;
        this.temp = new Vector3(0, 0, 0);
        this._vec1 = new Vector3();
        this._vec2 = new Vector3();
        this.scaleMatrix = new Matrix4x4();
        this.W_minx = 9999;
        this.W_miny = 9999;
        this.W_minz = 9999;
        this.W_maxx = -9999;
        this.W_maxy = -9999;
        this.W_maxz = -9999;
        this.pixelline = new PixelLineSprite3D(20);
        this.OBBWorldPointList = [];
        this._orientedBoundBox = new OrientedBoundBox(new Vector3(), new Matrix4x4());
        this._primitPosition = new Vector3();
        this._disparity = new Vector3();
        this.tempVector = new Vector3();
        this.tempVectorPoints = [];
        this.OBBpoints = [];
        this.cubePoint = new Vector3();
    }
    onAwake() {
        this.type = CubePhysicsCompnent.TYPE_BOX;
        this._sprite3D = this.owner;
        if (!this.pixelline) {
            this.pixelline = new PixelLineSprite3D(20);
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
        var boundbox = new BoundBox(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
        BoundBox.createfromPoints(AllPositions, boundbox);
        OrientedBoundBox.createByBoundBox(boundbox, this._orientedBoundBox);
        var vect = this._orientedBoundBox.extents;
        var SpriteScale = this._sprite3D.transform.scale;
        this.privateScale.setValue(vect.x / SpriteScale.x, vect.y / SpriteScale.y, vect.z / SpriteScale.z);
        var OBBcenter = new Vector3();
        this._orientedBoundBox.getCenter(OBBcenter);
        Vector3.subtract(OBBcenter, this._sprite3D.transform.position, this._primitPosition);
        this._boundBox = boundbox;
        for (var k = 0; k < 8; k++) {
            this.tempVectorPoints.push(new Vector3());
        }
        this._boundBox = boundbox;
        BoundSphere.createfromPoints(AllPositions, this._boundSpheres);
        CubePhysicsCompnent._octree.add(this);
        for (var k = 0; k < 8; k++) {
            this.tempVectorPoints.push(new Vector3());
        }
    }
    onUpdate() {
        this.updataObbTranform();
    }
    updataObbTranform() {
        var obbMat = this._orientedBoundBox.transformation;
        var transform = this._sprite3D.transform;
        var rotation = transform.rotation;
        var scale1 = transform.scale;
        Vector3.add(this._primitPosition, this.position, this._disparity);
        if (this._disparity.x === 0.0 && this._disparity.y === 0.0 && this._disparity.z === 0.0) {
            Matrix4x4.createAffineTransformation(transform.position, rotation, Vector3.ONE, obbMat);
        }
        else {
            Vector3.multiply(this._disparity, scale1, this.tempVector);
            Vector3.transformQuat(this.tempVector, rotation, this.tempVector);
            Vector3.add(transform.position, this.tempVector, this.tempVector);
            Matrix4x4.createAffineTransformation(this.tempVector, rotation, Vector3.ONE, obbMat);
        }
        this._orientedBoundBox.transformation = obbMat;
        var extentsE = this._orientedBoundBox.extents;
        var sizeE = this.scale.elements;
        var scaleE = scale1.elements;
        extentsE.x = this.scale.x * 0.5 * scale1.x * this.privateScale.x;
        extentsE.y = this.scale.y * 0.5 * scale1.y * this.privateScale.y;
        extentsE.z = this.scale.z * 0.5 * scale1.z * this.privateScale.z;
        this._orientedBoundBox.extents = extentsE;
        var extend = this._orientedBoundBox.extents;
        this._boundBox.max.setValue(this.oriBoundCenter.x + extend.x, this.oriBoundCenter.y + extend.y, this.oriBoundCenter.z + extend.z);
        this._boundBox.min.setValue(this.oriBoundCenter.x - extend.x, this.oriBoundCenter.y - extend.y, this.oriBoundCenter.z - extend.z);
        this._boundSpheres.center = this.oriBoundCenter;
    }
    isCollision(other) {
        switch (other.type) {
            case 0:
                return this.boxAndBox(other);
                break;
            case 1:
                return this.boxAndSphere(other);
                break;
            case 2:
                return this.boxAndCube(other);
                break;
            default:
                return 999;
        }
    }
    _showline() {
        this.pixelline.active = true;
        this.drawBound();
    }
    _noShowLine() {
        this.pixelline.active = false;
    }
    drawBound(color = Color.GREEN) {
        this.pixelline.clear();
        this._orientedBoundBox.getCorners(this.tempVectorPoints);
        this.pixelline.addLine(this.tempVectorPoints[0], this.tempVectorPoints[1], color, color);
        this.pixelline.addLine(this.tempVectorPoints[1], this.tempVectorPoints[2], color, color);
        this.pixelline.addLine(this.tempVectorPoints[2], this.tempVectorPoints[3], color, color);
        this.pixelline.addLine(this.tempVectorPoints[3], this.tempVectorPoints[0], color, color);
        this.pixelline.addLine(this.tempVectorPoints[0], this.tempVectorPoints[4], color, color);
        this.pixelline.addLine(this.tempVectorPoints[1], this.tempVectorPoints[5], color, color);
        this.pixelline.addLine(this.tempVectorPoints[2], this.tempVectorPoints[6], color, color);
        this.pixelline.addLine(this.tempVectorPoints[3], this.tempVectorPoints[7], color, color);
        this.pixelline.addLine(this.tempVectorPoints[4], this.tempVectorPoints[5], color, color);
        this.pixelline.addLine(this.tempVectorPoints[5], this.tempVectorPoints[6], color, color);
        this.pixelline.addLine(this.tempVectorPoints[6], this.tempVectorPoints[7], color, color);
        this.pixelline.addLine(this.tempVectorPoints[7], this.tempVectorPoints[4], color, color);
    }
    boxAndSphere(other) {
        return this._orientedBoundBox.containsSphere(other._boundSphere, true);
    }
    boxAndBox(other) {
        return this._orientedBoundBox.containsOrientedBoundBox(other._orientedBoundBox);
    }
    boxAndCube(other) {
        this.initmaxmin();
        this.updataMinMax();
        this.init2maxmin();
        for (var i = this.W_minx; i <= this.W_maxx; i++) {
            for (var j = this.W_miny; j <= this.W_maxy; j++) {
                for (var k = this.W_minz; k <= this.W_maxz; k++) {
                    if (this.OneCubeIsCollider(other, i, j, k) != 0) {
                        return 1;
                    }
                }
            }
        }
        return 0;
    }
    updataMinMax() {
        this._orientedBoundBox.getCorners(this.tempVectorPoints);
        for (var i = 0; i < this.tempVectorPoints.length; i++) {
            if (this.tempVectorPoints[i].x > this.W_maxx)
                this.W_maxx = this.tempVectorPoints[i].x;
            if (this.tempVectorPoints[i].x < this.W_minx)
                this.W_minx = this.tempVectorPoints[i].x;
            if (this.tempVectorPoints[i].y > this.W_maxy)
                this.W_maxy = this.tempVectorPoints[i].y;
            if (this.tempVectorPoints[i].y < this.W_miny)
                this.W_miny = this.tempVectorPoints[i].y;
            if (this.tempVectorPoints[i].z > this.W_maxz)
                this.W_maxz = this.tempVectorPoints[i].z;
            if (this.tempVectorPoints[i].z < this.W_minz)
                this.W_minz = this.tempVectorPoints[i].z;
        }
    }
    initmaxmin() {
        this.W_minx = 9999;
        this.W_miny = 9999;
        this.W_minz = 9999;
        this.W_maxx = -9999;
        this.W_maxy = -9999;
        this.W_maxz = -9999;
    }
    init2maxmin() {
        this.W_minx = Math.floor(this.W_minx);
        this.W_miny = Math.floor(this.W_miny);
        this.W_minz = Math.floor(this.W_minz);
        this.W_maxx = Math.ceil(this.W_maxx);
        this.W_maxy = Math.ceil(this.W_maxy);
        this.W_maxz = Math.ceil(this.W_maxz);
    }
    OneCubeIsCollider(cubecollider, x, y, z) {
        var ii = cubecollider.find(x + 1600, y + 1600, z + 1600);
        if (ii != -1) {
            cubecollider.collisionCube.setValue(x, y, z);
            cubecollider.cubeProperty = ii;
            this.cubePoint.setValue(x, y, z);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x + 1, y, z);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x, y + 1, z);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x, y, z + 1);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x + 1, y + 1, z);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x + 1, y, z + 1);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x, y + 1, z + 1);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0)
                return 1;
            this.cubePoint.setValue(x + 1, y + 1, z + 1);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0)
                return 1;
        }
        return 0;
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
        var boundbox = new BoundBox(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
        BoundBox.createfromPoints(AllPositions, boundbox);
        OrientedBoundBox.createByBoundBox(boundbox, this._orientedBoundBox);
        var vect = this._orientedBoundBox.extents;
        this.privateScale.setValue(vect.x, vect.y, vect.z);
        var OBBcenter = new Vector3();
        this._orientedBoundBox.getCenter(OBBcenter);
        Vector3.subtract(OBBcenter, this._sprite3D.transform.position, this._primitPosition);
    }
}
