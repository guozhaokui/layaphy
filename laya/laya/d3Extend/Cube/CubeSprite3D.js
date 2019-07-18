import { CubeGeometry } from "./CubeGeometry";
import { CubeInfo } from "./CubeInfo";
import { CubeRender } from "./CubeRender";
import { CubeMaterial } from "./CubeMaterial";
import { CubeMap } from "./CubeMap";
import { VoxFileData } from "./../vox/VoxFileData";
import { Handler } from "laya/utils/Handler";
import { Event } from "events/Event";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D";
import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { RenderState } from "laya/d3/core/material/RenderState";
import { PixelLineMaterial } from "laya/d3/core/pixelLine/PixelLineMaterial";
import { RenderElement } from "laya/d3/core/render/RenderElement";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { CubeInfoArray } from "../worldMaker/CubeInfoArray";
export class CubeSprite3D extends RenderableSprite3D {
    constructor(cubeSprite3D = null, name = null) {
        super(name);
        this.Layer = 0;
        this.UpdataCube = [];
        this.CubeNums = 0;
        this.enableRender = true;
        this.isReady = true;
        this.returnArrayValues = [];
        this.cubeMeshSpriteLines = new PixelLineSprite3D(100);
        this.StarPoint = new Vector3(0, 0, 0);
        this.EndPoint = new Vector3(0, 0, 0);
        this.selectCubeMap = new CubeMap();
        this.selectCube = CubeInfo.create(0, 0, 0);
        if (cubeSprite3D) {
            if (cubeSprite3D.enableEditer) {
                throw "CubeSprite3D: cubeSprite3D must be can't editer.";
            }
            else {
                this._cubeGeometry = cubeSprite3D._cubeGeometry;
                this._enableEditer = false;
            }
        }
        else {
            this._cubeGeometry = new CubeGeometry(this);
            this._enableEditer = true;
        }
        var render = new CubeRender(this);
        this._render = render;
        var renderObjects = render._renderElements;
        var renderElement = new RenderElement();
        var material = new CubeMaterial();
        material.modEnableVertexColor = true;
        material.enableVertexColor = true;
        material.albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        material.specularColor = new Vector4(0.2, 0.2, 0.2, 1);
        renderElement.setTransform(this._transform);
        renderElement.setGeometry(this._cubeGeometry);
        renderElement.render = render;
        renderElement.material = material;
        renderObjects.push(renderElement);
        this._render._defineDatas.add(MeshSprite3D.SHADERDEFINE_COLOR);
        this._render.sharedMaterial = material;
        this.addChild(this.cubeMeshSpriteLines);
        this.cubeMeshSpriteLinesFill = this.cubeMeshSpriteLines._geometryFilter;
        var pm = new PixelLineMaterial();
        pm.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE + 1;
        pm.getRenderState(0).depthTest = RenderState.DEPTHTEST_LEQUAL;
        this.cubeMeshSpriteLines.pixelLineRenderer.material = pm;
        this.addComponent(Asynchronousloading);
    }
    get enableEditer() {
        return this._enableEditer;
    }
    AddCube(x, y, z, color, layer = 0, isSetData = false) {
        if (y <= -CubeGeometry.HLAFMAXSIZE || y >= CubeGeometry.HLAFMAXSIZE) {
            return -1;
        }
        return this._cubeGeometry.addCube(x, y, z, color, isSetData);
    }
    RemoveCube(x, y, z, isSetData = false) {
        return (this.CubeNums == 1) ? -1 : this._cubeGeometry.removeCube(x, y, z, isSetData);
    }
    UpdataColor(x, y, z, color) {
        if (this._enableEditer)
            return this._cubeGeometry.updateColor(x, y, z, color);
        else
            return -1;
    }
    UpdataProperty(x, y, z, Property) {
        if (this._enableEditer)
            return this._cubeGeometry.updataProperty(x, y, z, Property);
        else
            return -1;
    }
    deletNoFaceCube() {
        var cubemap = this._cubeGeometry.cubeMap;
        var cubeinfos = cubemap.returnAllCube();
        for (var i = 0; i < cubeinfos.length; i++) {
            this.RemoveCube(cubeinfos[i].x - 1600, cubeinfos[i].y - 1600, cubeinfos[i].z - 1600);
        }
    }
    UpdataAo(x, y, z) {
        if (this._enableEditer)
            this._cubeGeometry.updateAO(x, y, z);
    }
    FindCube(x, y, z) {
        return this._cubeGeometry.findCube(x, y, z);
    }
    RemoveAllCube() {
        if (this._enableEditer) {
            this._cubeGeometry.clear();
            this.UpdataCube && (this.UpdataCube.length = 0);
            this.CubeNums = 0;
        }
    }
    clearEditerInfo() {
        if (this._enableEditer) {
            this.UpdataCube = null;
            this._enableEditer = false;
        }
    }
    loadFileData(url) {
        this.RemoveAllCube();
        if (url.indexOf(".vox") != -1 || url.indexOf(".lm") != -1) {
            this.voxfile = this.voxfile || new VoxFileData();
            this.voxfile.LoadVoxFile(url, Handler.create(this, function (cubeArray) {
                cubeArray.Layar = this.layer;
                this.AddCubes(cubeArray);
                this.event(Event.COMPLETE);
            }));
        }
        else if (url.indexOf(".lvox") != -1 || url.indexOf(".lh") != -1) {
            this.lVoxFile.LoadlVoxFile(url, Handler.create(this, function (cubeArray) {
                cubeArray.Layar = this.layer;
                this.AddCubes(cubeArray);
                this.event(Event.COMPLETE);
            }));
        }
    }
    set src(str) {
        this._src = str;
        this.loadFileData(str);
    }
    _parse(data) {
        super._parse(data);
        if (data.src) {
            this.src = data.src;
        }
    }
    get src() {
        return this._src;
    }
    loadByArrayBuffer(arrayBuffer) {
        this.isReady = false;
        var cubeInfo = this.lVoxFile.LoadlVoxFilebyArray(arrayBuffer);
        if (cubeInfo) {
            this.AddCubeByArray(cubeInfo);
        }
    }
    VectorCubeRevertCubeInfoArray(cubearray) {
        var cubeInfoarray = new CubeInfoArray();
        var length = cubearray.length;
        for (var i = 0; i < length; i++) {
            cubeInfoarray.PositionArray.push(cubearray[i].x);
            cubeInfoarray.PositionArray.push(cubearray[i].y);
            cubeInfoarray.PositionArray.push(cubearray[i].z);
            cubeInfoarray.colorArray.push(cubearray[i]._color);
        }
        return cubeInfoarray;
    }
    AddCubeByArray(cubeInfoArray) {
        cubeInfoArray.currentPosindex = 0;
        cubeInfoArray.currentColorindex = 0;
        this.Layer = cubeInfoArray.Layar;
        cubeInfoArray.operation = CubeInfoArray.Add;
        this.UpdataCube.push(cubeInfoArray);
        this._cubeGeometry.IsRender = false;
        var cubeAoArray = CubeInfoArray.create();
        cubeAoArray.PositionArray.length = 0;
        cubeAoArray.PositionArray = cubeInfoArray.PositionArray.slice();
    }
    AddCubes(cubeInfoArray, isUpdataAo = true) {
        var lenth = cubeInfoArray.PositionArray.length / 3;
        var PositionArray = cubeInfoArray.PositionArray;
        cubeInfoArray.currentColorindex = 0;
        cubeInfoArray.currentPosindex = 0;
        this.returnArrayValues.length = lenth;
        for (var i = 0; i < lenth; i++) {
            var x = PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dx;
            var y = PositionArray[cubeInfoArray.currentPosindex + 1] + cubeInfoArray.dy;
            var z = PositionArray[cubeInfoArray.currentPosindex + 2] + cubeInfoArray.dz;
            var color = cubeInfoArray.colorArray[cubeInfoArray.currentColorindex];
            cubeInfoArray.currentPosindex += 3;
            cubeInfoArray.currentColorindex++;
            this.returnArrayValues[i] = this.AddCube(x, y, z, color, cubeInfoArray.Layar, isUpdataAo);
        }
        return this.returnArrayValues;
    }
    RemoveCubes(cubeInfoArray, CalAo = true) {
        this.returnArrayValues.length = 0;
        var lenth = cubeInfoArray.PositionArray.length / 3;
        cubeInfoArray.currentPosindex = 0;
        for (var i = 0; i < lenth; i++) {
            var x = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dx;
            cubeInfoArray.currentPosindex++;
            var y = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dy;
            cubeInfoArray.currentPosindex++;
            var z = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dz;
            cubeInfoArray.currentPosindex++;
            if (this.FindCube(x, y, z) != -1) {
                this.returnArrayValues.push(this.RemoveCube(x, y, z, CalAo));
            }
            else {
                this.returnArrayValues.push(-1);
            }
        }
        return this.returnArrayValues;
    }
    UpdateColors(cubeInfoArray, color) {
        this.returnArrayValues.length = 0;
        var len = cubeInfoArray.colorArray.length;
        var posarr = cubeInfoArray.PositionArray;
        for (var i = 0; i < len; i++) {
            var tempArr = this.UpdataColor(posarr[i * 3] + cubeInfoArray.dx, posarr[i * 3 + 1] + cubeInfoArray.dy, posarr[i * 3 + 2] + cubeInfoArray.dz, color == -1 ? cubeInfoArray.colorArray[i] : color, false);
            this.returnArrayValues.push(tempArr);
        }
        return this.returnArrayValues;
    }
    CalCubeAos(cubeInfoArray) {
        var lenth = cubeInfoArray.PositionArray.length / 3;
        cubeInfoArray.currentPosindex = 0;
        for (var i = 0; i < lenth; i++) {
            var x = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dx;
            cubeInfoArray.currentPosindex++;
            var y = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dy;
            cubeInfoArray.currentPosindex++;
            var z = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dz;
            cubeInfoArray.currentPosindex++;
            this.UpdataAo(x, y, z);
        }
    }
    drawLineFace(index, x, y, z, isSetData) {
        switch (index) {
            case 0:
                this.selectCube.selectArrayIndex.push(this.lineCount);
                this.drawoneLine(this.lineCount++, x + 1, y + 1, z + 1, x, y + 1, z + 1, isSetData);
                this.drawoneLine(this.lineCount++, x, y + 1, z + 1, x, y, z + 1, isSetData);
                this.drawoneLine(this.lineCount++, x, y, z + 1, x + 1, y, z + 1, isSetData);
                this.drawoneLine(this.lineCount++, x + 1, y, z + 1, x + 1, y + 1, z + 1, isSetData);
                break;
            case 1:
                this.selectCube.selectArrayIndex.push(this.lineCount);
                this.drawoneLine(this.lineCount++, x + 1, y + 1, z + 1, x + 1, y, z + 1, isSetData);
                this.drawoneLine(this.lineCount++, x + 1, y, z + 1, x + 1, y, z, isSetData);
                this.drawoneLine(this.lineCount++, x + 1, y, z, x + 1, y + 1, z, isSetData);
                this.drawoneLine(this.lineCount++, x + 1, y + 1, z, x + 1, y + 1, z + 1, isSetData);
                break;
            case 2:
                this.selectCube.selectArrayIndex.push(this.lineCount);
                this.drawoneLine(this.lineCount++, x + 1, y + 1, z + 1, x + 1, y + 1, z, isSetData);
                this.drawoneLine(this.lineCount++, x + 1, y + 1, z, x, y + 1, z, isSetData);
                this.drawoneLine(this.lineCount++, x, y + 1, z, x, y + 1, z + 1, isSetData);
                this.drawoneLine(this.lineCount++, x, y + 1, z + 1, x + 1, y + 1, z + 1, isSetData);
                break;
            case 3:
                this.selectCube.selectArrayIndex.push(this.lineCount);
                this.drawoneLine(this.lineCount++, x, y + 1, z + 1, x, y + 1, z, isSetData);
                this.drawoneLine(this.lineCount++, x, y + 1, z, x, y, z, isSetData);
                this.drawoneLine(this.lineCount++, x, y, z, x, y, z + 1, isSetData);
                this.drawoneLine(this.lineCount++, x, y, z + 1, x, y + 1, z + 1, isSetData);
                break;
            case 4:
                this.selectCube.selectArrayIndex.push(this.lineCount);
                this.drawoneLine(this.lineCount++, x, y, z, x + 1, y, z, isSetData);
                this.drawoneLine(this.lineCount++, x + 1, y, z, x + 1, y, z + 1, isSetData);
                this.drawoneLine(this.lineCount++, x + 1, y, z + 1, x, y, z + 1, isSetData);
                this.drawoneLine(this.lineCount++, x, y, z + 1, x, y, z, isSetData);
                break;
            case 5:
                this.selectCube.selectArrayIndex.push(this.lineCount);
                this.drawoneLine(this.lineCount++, x + 1, y, z, x, y, z, isSetData);
                this.drawoneLine(this.lineCount++, x, y, z, x, y + 1, z, isSetData);
                this.drawoneLine(this.lineCount++, x, y + 1, z, x + 1, y + 1, z, isSetData);
                this.drawoneLine(this.lineCount++, x + 1, y + 1, z, x + 1, y, z, isSetData);
                break;
        }
    }
    SelectCube(x, y, z, isSetData = true, IsFanXuan = false) {
        this.selectCube = this._cubeGeometry.findCubeToCubeInfo(x, y, z);
        if (!this.selectCube || !this.selectCube.subCube) {
            console.warn("this SelectCube is not exist");
            return 0;
        }
        if (IsFanXuan) {
            if ((this.selectCubeMap.find(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE)) != null) {
                this.selectCubeMap.remove(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE);
                this.CancelSelect(this.selectCube, isSetData);
                return 1;
            }
            return 0;
        }
        if ((this.selectCubeMap.find(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE)) == null) {
            this.selectCubeMap.add(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE, this.selectCube);
            this.selectCube.ClearSelectArray();
            for (var j = 0; j < 6; j++) {
                if ((x + CubeGeometry.HLAFMAXSIZE + 1 < 0) || (y + CubeGeometry.HLAFMAXSIZE + 1 < 0) || (z + CubeGeometry.HLAFMAXSIZE + 1 < 0)) {
                    return -1;
                }
                var otherCube = this._cubeGeometry.cubeMap.find(x + CubeGeometry.HLAFMAXSIZE + 1, y + CubeGeometry.HLAFMAXSIZE + 1, z + CubeGeometry.HLAFMAXSIZE + 1);
                switch (j) {
                    case 0:
                        if (otherCube.calDirectCubeExit(6) != -1)
                            continue;
                        break;
                    case 1:
                        if (otherCube.calDirectCubeExit(5) != -1)
                            continue;
                        break;
                    case 2:
                        if (otherCube.calDirectCubeExit(0) != -1)
                            continue;
                        break;
                    case 3:
                        if (this.selectCube.calDirectCubeExit(2) != -1)
                            continue;
                        break;
                    case 4:
                        if (this.selectCube.calDirectCubeExit(7) != -1)
                            continue;
                        break;
                    case 5:
                        if (this.selectCube.calDirectCubeExit(1) != -1)
                            continue;
                        break;
                }
                this.drawLineFace(j, x, y, z, isSetData);
            }
            return 1;
        }
        return 0;
    }
    SelectCubes(cubeInfoarray, isFanXuan = false) {
        var length = cubeInfoarray.colorArray.length;
        this.returnArrayValues.length = length;
        cubeInfoarray.currentPosindex = 0;
        for (var i = 0; i < length; i++) {
            var x = cubeInfoarray.PositionArray[i * 3] + cubeInfoarray.dx;
            var y = cubeInfoarray.PositionArray[i * 3 + 1] + cubeInfoarray.dy;
            var z = cubeInfoarray.PositionArray[i * 3 + 2] + cubeInfoarray.dz;
            this.returnArrayValues[i] = this.SelectCube(x, y, z, false, isFanXuan);
        }
        this.cubeMeshSpriteLinesFill._vertexBuffer.setData(this.cubeMeshSpriteLinesFill._vertices, 0, 0, this.lineCount * 14);
        return this.returnArrayValues;
    }
    drawoneLine(LineIndex, startx, starty, startz, endx, endy, endz, IssetData) {
        var offset = LineIndex * 14;
        var vertices = this.cubeMeshSpriteLinesFill._vertices;
        vertices[offset + 0] = startx;
        vertices[offset + 1] = starty;
        vertices[offset + 2] = startz;
        vertices[offset + 3] = 1;
        vertices[offset + 4] = 1;
        vertices[offset + 5] = 1;
        vertices[offset + 6] = 1;
        vertices[offset + 7] = endx;
        vertices[offset + 8] = endy;
        vertices[offset + 9] = endz;
        vertices[offset + 10] = 1;
        vertices[offset + 11] = 1;
        vertices[offset + 12] = 1;
        vertices[offset + 13] = 1;
        this.cubeMeshSpriteLinesFill._lineCount += 1;
        if (this.cubeMeshSpriteLinesFill._lineCount == this.cubeMeshSpriteLinesFill._maxLineCount)
            this.cubeMeshSpriteLines.maxLineCount += 20000;
        if (IssetData)
            this.cubeMeshSpriteLinesFill._vertexBuffer.setData(vertices, offset, offset, 14);
    }
    CancelSelect(cubeInfoCan, IsSetData) {
        var FaceNum = cubeInfoCan.selectArrayIndex.length;
        var arrayInt = cubeInfoCan.selectArrayIndex;
        for (var i = 0; i < FaceNum; i++) {
            this.CancelDrawOneFace(arrayInt[i], IsSetData);
        }
    }
    CancelDrawOneFace(LineIndex, IssetData) {
        for (var i = 0; i < 4; i++) {
            this.CancelDrawOneLine(LineIndex + i, IssetData);
        }
    }
    CancelDrawOneLine(LineIndex, IssetData) {
        var offset = LineIndex * 14;
        var vertices = this.cubeMeshSpriteLinesFill._vertices;
        vertices[offset + 0] = 0;
        vertices[offset + 1] = 0;
        vertices[offset + 2] = 0;
        vertices[offset + 3] = 1;
        vertices[offset + 4] = 1;
        vertices[offset + 5] = 1;
        vertices[offset + 6] = 1;
        vertices[offset + 7] = 0;
        vertices[offset + 8] = 0;
        vertices[offset + 9] = 0;
        vertices[offset + 10] = 1;
        vertices[offset + 11] = 1;
        vertices[offset + 12] = 1;
        vertices[offset + 13] = 1;
        if (IssetData)
            this.cubeMeshSpriteLinesFill._vertexBuffer.setData(vertices, offset, offset, 14);
    }
    LineClear() {
        this.cubeMeshSpriteLines.clear();
        this.selectCubeMap.clear();
        this.lineCount = 0;
    }
    SelectAllCube() {
        var vec = this._cubeGeometry.cubeMap.returnCubeInfo();
        var length = vec.length;
        var cubeinfo;
        for (var i = 0; i < length; i++) {
            cubeinfo = vec[i];
            this.SelectCube(cubeinfo.x - CubeGeometry.HLAFMAXSIZE, cubeinfo.y - CubeGeometry.HLAFMAXSIZE, cubeinfo.z - CubeGeometry.HLAFMAXSIZE, false, false);
        }
        this.cubeMeshSpriteLinesFill._vertexBuffer.setData(this.cubeMeshSpriteLinesFill._vertices, 0, 0, this.lineCount * 14);
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._cubeGeometry.destroy();
        CubeInfo.recover(this.selectCube);
    }
    cubeTrans(isTran = true) {
        var maa = this._render.sharedMaterial;
        if (isTran) {
            (maa).renderMode = CubeMaterial.RENDERMODE_TRANSPARENT;
            (maa).albedoColorA = 0.5;
        }
        else {
            (maa).renderMode = CubeMaterial.RENDERMODE_OPAQUE;
            (maa).albedoColorA = 1.0;
        }
    }
}
CubeSprite3D.MAXCUBES = 300000;
import { Script3D } from "laya/d3/component/Script3D";
import { Stat } from "laya/utils/Stat";
class Asynchronousloading extends Script3D {
    constructor() {
        super(...arguments);
        this._linecolor = new Vector4(1, 1, 1, 1);
        this._tim = 0;
    }
    onStart() {
        this.cubeSprite3D = this.owner;
        this._pixelline = this.cubeSprite3D.cubeMeshSpriteLines;
        this._pixelMaterial = this._pixelline._render.material;
    }
    onUpdate() {
        this.AddCubeYiBu();
        if (this._pixelline.lineCount > 0) {
            if (Stat.loopCount % 2 == 0) {
                this.changeLineColor();
            }
        }
    }
    AddCubeYiBu() {
        if (this.cubeSprite3D.UpdataCube.length != 0) {
            this.cubeinfoarray = this.cubeSprite3D.UpdataCube[0];
            var currentPosIndex = this.cubeinfoarray.currentPosindex;
            if ((this.cubeinfoarray.PositionArray.length - currentPosIndex - 1) / 3 < CubeGeometry.updateCubeCount) {
                var length = (this.cubeinfoarray.PositionArray.length - (currentPosIndex + 1)) / 3;
                for (var i = 0; i < length; i++) {
                    this.x = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dx;
                    this.y = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dy;
                    this.z = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dz;
                    this.color = this.cubeinfoarray.colorArray[this.cubeinfoarray.currentColorindex++];
                    this.cubeSprite3D.AddCube(this.x, this.y, this.z, this.color, this.cubeinfoarray.Layar, false);
                }
                this.cubeinfoarray.currentColorindex = this.cubeinfoarray.currentPosindex = 0;
                this.cubeSprite3D.UpdataCube.shift();
                this.cubeSprite3D._cubeGeometry.IsRender = true;
                if (this.cubeSprite3D.UpdataCube.length == 0) {
                    this.cubeSprite3D.isReady = true;
                }
            }
            else {
                for (var i = 0; i < CubeGeometry.updateCubeCount; i++) {
                    this.x = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dx;
                    this.y = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dy;
                    this.z = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dz;
                    this.color = this.cubeinfoarray.colorArray[this.cubeinfoarray.currentColorindex++];
                    this.cubeSprite3D.AddCube(this.x, this.y, this.z, this.color, this.cubeinfoarray.Layar, false);
                }
                this.cubeinfoarray.currentPosindex += CubeGeometry.updateCubeCount * 3;
            }
        }
    }
    changeLineColor() {
        this._tim += 0.05;
        this._linecolor.y = Math.abs(Math.cos(this._tim));
        this._linecolor.z = Math.abs(Math.cos(this._tim));
        this._pixelMaterial.color = this._linecolor;
    }
}
