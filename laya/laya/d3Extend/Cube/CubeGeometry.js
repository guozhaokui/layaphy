import { CubeMap } from "./CubeMap";
import { CubeInfo } from "./CubeInfo";
import { SubCubeGeometry } from "./SubCubeGeometry";
import { FileSaver } from "./../FileSaver";
import { GeometryElement } from "laya/d3/core/GeometryElement";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshReader } from "laya/d3/loaders/MeshReader";
import { Vector4 } from "laya/d3/math/Vector4";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Byte } from "laya/utils/Byte";
export class CubeGeometry extends GeometryElement {
    constructor(cubeGeometry) {
        super();
        this._modifyCubes = [];
        this.cubeMap = new CubeMap();
        this.subBoxMap = {};
        this.enableUpdate = true;
        this.IsRender = true;
        this.cubeSprite3D = cubeGeometry;
    }
    addCube(x, y, z, color, isUpdataAO = false) {
        x += CubeGeometry.HLAFMAXSIZE;
        y += CubeGeometry.HLAFMAXSIZE;
        z += CubeGeometry.HLAFMAXSIZE;
        var mainCube = this.cubeMap.find(x, y, z);
        if (mainCube && mainCube.subCube) {
            console.log("CubeGeometry: this cube has exits.");
            return mainCube.color;
        }
        var POINTS = CubeGeometry.POINTS;
        for (var i = 0; i < 24; i += 3) {
            var pX = x + POINTS[i];
            var pY = y + POINTS[i + 1];
            var pZ = z + POINTS[i + 2];
            var cube = this.cubeMap.find(pX, pY, pZ);
            if (!cube) {
                cube = CubeInfo.create(pX, pY, pZ);
                this.cubeMap.add(pX, pY, pZ, cube);
            }
            cube.point |= 1 << (i / 3);
            if (i === CubeGeometry.CUBEINDEX) {
                cube.x = pX;
                cube.y = pY;
                cube.z = pZ;
                cube.color = color;
                var keybox = SubCubeGeometry.getKey(pX, pY, pZ);
                var subBox = this.subBoxMap[keybox];
                if (!subBox) {
                    subBox = this.subBoxMap[keybox] = SubCubeGeometry.create(this);
                }
                cube.subCube = cube.updateCube = subBox;
                switch (cube.modifyFlag) {
                    case CubeInfo.MODIFYE_NONE:
                        cube.modifyIndex = this._modifyCubes.length;
                        cube.modifyFlag = CubeInfo.MODIFYE_ADD;
                        subBox.cubeCount++;
                        this._modifyCubes.push(cube);
                        break;
                    case CubeInfo.MODIFYE_REMOVE:
                        cube.modifyFlag = CubeInfo.MODIFYE_UPDATE;
                        subBox.cubeCount++;
                        break;
                    case CubeInfo.MODIFYE_ADD:
                    case CubeInfo.MODIFYE_UPDATE:
                    case CubeInfo.MODIFYE_UPDATEAO:
                    case CubeInfo.MODIFYE_UPDATEPROPERTY:
                        break;
                }
            }
        }
        isUpdataAO && this.calOneCubeAO(x, y, z);
        this.cubeSprite3D.CubeNums++;
        return -1;
    }
    removeCube(x, y, z, isUpdataAO = false) {
        x += CubeGeometry.HLAFMAXSIZE;
        y += CubeGeometry.HLAFMAXSIZE;
        z += CubeGeometry.HLAFMAXSIZE;
        var mainCube = this.cubeMap.find(x, y, z);
        if (!mainCube || !mainCube.subCube) {
            console.log("CubeGeometry: this cube not exits.");
            return -1;
        }
        var oldcolor = mainCube.color;
        var POINTS = CubeGeometry.POINTS;
        for (var i = 0; i < 24; i += 3) {
            var pX = x + POINTS[i];
            var pY = y + POINTS[i + 1];
            var pZ = z + POINTS[i + 2];
            var cube = this.cubeMap.find(pX, pY, pZ);
            cube.point &= ~(1 << (i / 3));
            if (i === CubeGeometry.CUBEINDEX) {
                var keybox = SubCubeGeometry.getKey(pX, pY, pZ);
                var subBox = this.subBoxMap[keybox];
                cube.subCube = null;
                switch (cube.modifyFlag) {
                    case CubeInfo.MODIFYE_NONE:
                        cube.modifyIndex = this._modifyCubes.length;
                        cube.modifyFlag = CubeInfo.MODIFYE_REMOVE;
                        subBox.cubeCount--;
                        this._modifyCubes.push(cube);
                        break;
                    case CubeInfo.MODIFYE_ADD:
                        cube.modifyFlag = CubeInfo.MODIFYE_NONE;
                        subBox.cubeCount--;
                        var lengh = this._modifyCubes.length - 1;
                        var modifyIndex = cube.modifyIndex;
                        if (modifyIndex !== lengh) {
                            var end = this._modifyCubes[lengh];
                            this._modifyCubes[modifyIndex] = end;
                            end.modifyIndex = modifyIndex;
                        }
                        this._modifyCubes.length--;
                        break;
                    case CubeInfo.MODIFYE_UPDATE:
                    case CubeInfo.MODIFYE_UPDATEAO:
                    case CubeInfo.MODIFYE_UPDATEPROPERTY:
                        cube.modifyFlag = CubeInfo.MODIFYE_REMOVE;
                        subBox.cubeCount--;
                        break;
                    case CubeInfo.MODIFYE_REMOVE:
                        break;
                    case CubeInfo.MODIFYE_UPDATEAO:
                }
            }
        }
        if (isUpdataAO) {
            this.calOneCubeAO(x, y, z);
        }
        this.cubeSprite3D.CubeNums--;
        return oldcolor;
    }
    updateColor(x, y, z, color) {
        x += CubeGeometry.HLAFMAXSIZE;
        y += CubeGeometry.HLAFMAXSIZE;
        z += CubeGeometry.HLAFMAXSIZE;
        var cube = this.cubeMap.find(x, y, z);
        if (!cube || !cube.subCube) {
            console.log("CubeGeometry: this cube not exits.");
            return -1;
        }
        var oldcolor = cube.color;
        cube.color = color;
        switch (cube.modifyFlag) {
            case CubeInfo.MODIFYE_NONE:
            case CubeInfo.MODIFYE_UPDATEPROPERTY:
            case CubeInfo.MODIFYE_UPDATEAO:
                cube.modifyIndex = this._modifyCubes.length;
                this._modifyCubes.push(cube);
                cube.modifyFlag = CubeInfo.MODIFYE_UPDATE;
                break;
            case CubeInfo.MODIFYE_ADD:
            case CubeInfo.MODIFYE_REMOVE:
            case CubeInfo.MODIFYE_UPDATE:
                break;
        }
        return oldcolor;
    }
    updateAO(cube) {
        switch (cube.modifyFlag) {
            case CubeInfo.MODIFYE_NONE:
                cube.modifyIndex = this._modifyCubes.length;
                this._modifyCubes.push(cube);
                cube.modifyFlag = CubeInfo.MODIFYE_UPDATEAO;
                break;
            case CubeInfo.MODIFYE_ADD:
            case CubeInfo.MODIFYE_REMOVE:
            case CubeInfo.MODIFYE_UPDATE:
                break;
        }
    }
    updataProperty(x, y, z, Property) {
        x += CubeGeometry.HLAFMAXSIZE;
        y += CubeGeometry.HLAFMAXSIZE;
        z += CubeGeometry.HLAFMAXSIZE;
        var cube = this.cubeMap.find(x, y, z);
        if (!cube || !cube.subCube) {
            console.log("CubeGeometry: this cube not exits.");
            return -1;
        }
        var oldcolor = cube.color;
        cube.color = (oldcolor & 0x00ffffff) + (Property << 24);
        switch (cube.modifyFlag) {
            case CubeInfo.MODIFYE_NONE:
            case CubeInfo.MODIFYE_UPDATEPROPERTY:
                cube.modifyIndex = this._modifyCubes.length;
                this._modifyCubes.push(cube);
                cube.modifyFlag = CubeInfo.MODIFYE_UPDATEPROPERTY;
                break;
            case CubeInfo.MODIFYE_UPDATEAO:
            case CubeInfo.MODIFYE_ADD:
            case CubeInfo.MODIFYE_REMOVE:
            case CubeInfo.MODIFYE_UPDATE:
                break;
        }
        return oldcolor;
    }
    calOneCubeAO(x, y, z) {
        var _x = x + 1;
        var _y = y + 1;
        var _z = z + 1;
        var x_ = x - 1;
        var y_ = y - 1;
        var z_ = z - 1;
        var cube;
        cube = this.cubeMap.find(x, _y, _z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(5) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
                cube.frontFaceAO[4] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
                cube.frontFaceAO[5] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(_x, y, _z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(5) != -1 || cube.getVBPointbyFaceIndex(3) != -1) {
                cube.frontFaceAO[3] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
                cube.frontFaceAO[5] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x_, y, _z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(5) != -1) {
                cube.frontFaceAO[1] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
                cube.frontFaceAO[5] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[3];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x, y_, _z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(5) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
                cube.frontFaceAO[2] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
                cube.frontFaceAO[5] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(_x, y_, z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(2) != -1 || cube.getVBPointbyFaceIndex(3) != -1) {
                cube.frontFaceAO[2] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
                cube.frontFaceAO[3] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(_x, y, z_);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(3) != -1) {
                cube.frontFaceAO[0] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
                cube.frontFaceAO[3] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[3];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(_x, _y, z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
                cube.frontFaceAO[3] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
                cube.frontFaceAO[4] |= CubeInfo.PanduanWei[3] + CubeInfo.PanduanWei[0];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x, _y, z_);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
                cube.frontFaceAO[0] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
                cube.frontFaceAO[4] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x_, _y, z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
                cube.frontFaceAO[1] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
                cube.frontFaceAO[4] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x_, y, z_);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(1) != -1) {
                cube.frontFaceAO[0] |= CubeInfo.PanduanWei[3] + CubeInfo.PanduanWei[0];
                cube.frontFaceAO[1] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x_, y_, z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
                cube.frontFaceAO[1] |= CubeInfo.PanduanWei[3] + CubeInfo.PanduanWei[0];
                cube.frontFaceAO[2] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x, y_, z_);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
                cube.frontFaceAO[0] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
                cube.frontFaceAO[2] |= CubeInfo.PanduanWei[3] + CubeInfo.PanduanWei[0];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(_x, _y, _z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(4) != -1 || cube.getVBPointbyFaceIndex(5) != -1) {
                cube.frontFaceAO[3] |= CubeInfo.PanduanWei[2];
                cube.frontFaceAO[4] |= CubeInfo.PanduanWei[0];
                cube.frontFaceAO[5] |= CubeInfo.PanduanWei[1];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(_x, _y, z_);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
                cube.frontFaceAO[0] |= CubeInfo.PanduanWei[2];
                cube.frontFaceAO[3] |= CubeInfo.PanduanWei[3];
                cube.frontFaceAO[4] |= CubeInfo.PanduanWei[3];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(_x, y_, _z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(2) != -1 || cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(5) != -1) {
                cube.frontFaceAO[2] |= CubeInfo.PanduanWei[2];
                cube.frontFaceAO[3] |= CubeInfo.PanduanWei[1];
                cube.frontFaceAO[5] |= CubeInfo.PanduanWei[2];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(_x, y_, z_);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
                cube.frontFaceAO[0] |= CubeInfo.PanduanWei[1];
                cube.frontFaceAO[3] |= CubeInfo.PanduanWei[0];
                cube.frontFaceAO[2] |= CubeInfo.PanduanWei[3];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x_, _y, _z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(5) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
                cube.frontFaceAO[1] |= CubeInfo.PanduanWei[2];
                cube.frontFaceAO[5] |= CubeInfo.PanduanWei[0];
                cube.frontFaceAO[4] |= CubeInfo.PanduanWei[1];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x_, _y, z_);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
                cube.frontFaceAO[0] |= CubeInfo.PanduanWei[3];
                cube.frontFaceAO[1] |= CubeInfo.PanduanWei[1];
                cube.frontFaceAO[4] |= CubeInfo.PanduanWei[2];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x_, y_, _z);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(2) != -1 || cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(5) != -1) {
                cube.frontFaceAO[2] |= CubeInfo.PanduanWei[1];
                cube.frontFaceAO[1] |= CubeInfo.PanduanWei[3];
                cube.frontFaceAO[5] |= CubeInfo.PanduanWei[3];
                this.updateAO(cube);
            }
        }
        cube = this.cubeMap.find(x_, y_, z_);
        if (cube != null && cube.subCube != null) {
            if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
                cube.frontFaceAO[0] |= CubeInfo.PanduanWei[0];
                cube.frontFaceAO[1] |= CubeInfo.PanduanWei[0];
                cube.frontFaceAO[2] |= CubeInfo.PanduanWei[0];
                this.updateAO(cube);
            }
        }
    }
    findCube(x, y, z) {
        if ((x + CubeGeometry.HLAFMAXSIZE < 0) || (y + CubeGeometry.HLAFMAXSIZE < 0) || (z + CubeGeometry.HLAFMAXSIZE < 0)) {
            return -1;
        }
        var cubeinfo = this.cubeMap.find(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE);
        if (cubeinfo && cubeinfo.subCube) {
            return cubeinfo.color;
        }
        else {
            return -1;
        }
    }
    findCubeToCubeInfo(x, y, z) {
        if ((x + CubeGeometry.HLAFMAXSIZE < 0) || (y + CubeGeometry.HLAFMAXSIZE < 0) || (z + CubeGeometry.HLAFMAXSIZE < 0)) {
            return null;
        }
        var cubeinfo = this.cubeMap.find(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE);
        if (cubeinfo && cubeinfo.subCube) {
            return cubeinfo;
        }
        else {
            return null;
        }
    }
    _getType() {
        return CubeGeometry._type;
    }
    _prepareRender(state) {
        if (!this.IsRender) {
            return false;
        }
        if (this._modifyCubes.length == 0 || !this.enableUpdate)
            return true;
        var end = Math.max(this._modifyCubes.length - CubeGeometry.updateCubeCount, 0);
        for (var i = this._modifyCubes.length - 1; i >= end; i--)
            this._modifyCubes[i].update();
        this._modifyCubes.length = end;
        return true;
    }
    _render(state) {
        for (var key in this.subBoxMap) {
            var subCube = this.subBoxMap[key];
            subCube.updateBuffer();
            (this.cubeSprite3D.enableRender) && (subCube.render(state));
        }
    }
    clear() {
        this._modifyCubes.length = 0;
        var cubMapData = this.cubeMap.data;
        for (var key in cubMapData) {
            var subData = cubMapData[key];
            for (var subkey in subData)
                CubeInfo.recover(subData[subkey]);
            subData.save = null;
        }
        for (key in this.subBoxMap) {
            var subCube = this.subBoxMap[key];
            subCube.destroy();
        }
        this.cubeMap.clear();
        this.subBoxMap = {};
    }
    destroy() {
        super.destroy();
        this.clear();
    }
    ExportCubeMeshLm() {
        var object = new Object();
        var ss = new Uint8Array(this.compressData().buffer);
        FileSaver.saveBlob(FileSaver.createBlob([ss], {}), "CubeModel.lm");
    }
    static initStaticBlin() {
        CubeGeometry.shareMaterial = new BlinnPhongMaterial();
        CubeGeometry.shareMaterial.enableVertexColor = true;
        CubeGeometry.shareMaterial.albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        CubeGeometry.shareMaterial.specularColor = new Vector4(0.2, 0.2, 0.2, 1);
    }
    lmToMeshSprite3D(byte) {
        var subeMeshs = [];
        var mesh = new Mesh();
        MeshReader.read(byte.buffer, mesh, subeMeshs);
        var sprite = new MeshSprite3D(mesh);
        sprite.meshRenderer.material = CubeGeometry.shareMaterial;
        return sprite;
    }
    compressData() {
        var byteArray = new Byte();
        var surfaceVertexPosArray = [];
        var surfaceVertexNolArray = [];
        var surfaceVertexColArray = [];
        var surfaceVertexIndArray = [];
        var allCubeInfo = this.cubeMap.returnAllCube();
        var cubeLength = allCubeInfo.length;
        for (var i = 0; i < cubeLength; i++) {
            this.calOneCubeSurface(allCubeInfo[i], surfaceVertexPosArray, surfaceVertexNolArray, surfaceVertexColArray);
        }
        var maxFaceNums = surfaceVertexPosArray.length / 12;
        surfaceVertexIndArray.length = maxFaceNums * 6;
        for (var i = 0; i < maxFaceNums; i++) {
            var indexOffset = i * 6;
            var pointOffset = i * 4;
            surfaceVertexIndArray[indexOffset] = pointOffset;
            surfaceVertexIndArray[indexOffset + 1] = 2 + pointOffset;
            surfaceVertexIndArray[indexOffset + 2] = 1 + pointOffset;
            surfaceVertexIndArray[indexOffset + 3] = pointOffset;
            surfaceVertexIndArray[indexOffset + 4] = 3 + pointOffset;
            surfaceVertexIndArray[indexOffset + 5] = 2 + pointOffset;
        }
        var stringDatas = [];
        stringDatas.push("MESH");
        stringDatas.push("SUBMESH");
        var LmVersion = "LAYAMODEL:0400";
        var vbDeclaration = "POSITION,NORMAL,COLOR";
        var everyVBSize = 12 + 12 + 16;
        byteArray.writeUTFString(LmVersion);
        byteArray.pos = 0;
        console.log(byteArray.readUTFString());
        var verionsize = byteArray.pos;
        var ContentAreaPostion_Start = byteArray.pos;
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        var BlockAreaPosition_Start = byteArray.pos;
        byteArray.writeUint16(2);
        for (var i = 0; i < 2; i++) {
            byteArray.writeUint32(0);
            byteArray.writeUint32(0);
        }
        var StringAreaPosition_Start = byteArray.pos;
        byteArray.writeUint32(0);
        byteArray.writeUint16(0);
        var MeshAreaPosition_Start = byteArray.pos;
        byteArray.writeUint16(0);
        stringDatas.push("CubeMesh");
        byteArray.writeUint16(2);
        byteArray.writeUint16(1);
        var VBMeshAreaPosition_Start = byteArray.pos;
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        stringDatas.push(vbDeclaration);
        byteArray.writeUint16(3);
        var IBMeshAreaPosition_Start = byteArray.pos;
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        var BoneAreaPosition_Start = byteArray.pos;
        byteArray.writeUint16(0);
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        var MeshAreaPosition_End = byteArray.pos;
        var MeshAreaSize = MeshAreaPosition_End - MeshAreaPosition_Start;
        var subMeshAreaPosition_Start = byteArray.pos;
        byteArray.writeUint16(1);
        byteArray.writeUint16(0);
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        byteArray.writeUint16(1);
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        byteArray.writeUint32(0);
        var subMeshAreaPosition_End = byteArray.pos;
        var subMeshAreaSize = subMeshAreaPosition_End - subMeshAreaPosition_Start;
        var StringDatasAreaPosition_Start = byteArray.pos;
        for (var i = 0; i < stringDatas.length; i++) {
            byteArray.writeUTFString(stringDatas[i]);
        }
        var StringDatasAreaPosition_End = byteArray.pos;
        var StringDatasAreaSize = StringDatasAreaPosition_End - StringDatasAreaPosition_Start;
        var VBContentDatasAreaPosition_Start = byteArray.pos;
        var VertexCount = surfaceVertexPosArray.length / 3;
        var posIndex = 0;
        var NorIndex = 0;
        var colIndex = 0;
        for (var j = 0; j < VertexCount; j++) {
            byteArray.writeFloat32(surfaceVertexPosArray[posIndex]);
            posIndex++;
            byteArray.writeFloat32(surfaceVertexPosArray[posIndex]);
            posIndex++;
            byteArray.writeFloat32(surfaceVertexPosArray[posIndex]);
            posIndex++;
            byteArray.writeFloat32(surfaceVertexNolArray[NorIndex]);
            NorIndex++;
            byteArray.writeFloat32(surfaceVertexNolArray[NorIndex]);
            NorIndex++;
            byteArray.writeFloat32(surfaceVertexNolArray[NorIndex]);
            NorIndex++;
            byteArray.writeFloat32(surfaceVertexColArray[colIndex]);
            colIndex++;
            byteArray.writeFloat32(surfaceVertexColArray[colIndex]);
            colIndex++;
            byteArray.writeFloat32(surfaceVertexColArray[colIndex]);
            colIndex++;
            byteArray.writeFloat32(surfaceVertexColArray[colIndex]);
            colIndex++;
        }
        var VBContentDatasAreaPosition_End = byteArray.pos;
        var VBContentDatasAreaSize = VBContentDatasAreaPosition_End - VBContentDatasAreaPosition_Start;
        var IBContentDatasAreaPosition_Start = byteArray.pos;
        var vertexIndexArrayLength = surfaceVertexIndArray.length;
        for (var j = 0; j < vertexIndexArrayLength; j++) {
            byteArray.writeUint16(surfaceVertexIndArray[j]);
        }
        var IBContentDatasAreaPosition_End = byteArray.pos;
        var IBContentDatasAreaSize = IBContentDatasAreaPosition_End - IBContentDatasAreaPosition_Start;
        var vbstart = 0;
        var vblength = 0;
        var ibstart = 0;
        var iblength = 0;
        var _ibstart = 0;
        byteArray.pos = subMeshAreaPosition_Start + 4;
        vbstart = 0;
        vblength = VBContentDatasAreaSize / everyVBSize;
        ibstart = 0;
        iblength = IBContentDatasAreaSize / 2;
        byteArray.writeUint32(vbstart);
        byteArray.writeUint32(vblength);
        byteArray.writeUint32(ibstart);
        byteArray.writeUint32(iblength);
        byteArray.pos += 2;
        byteArray.writeUint32(ibstart);
        byteArray.writeUint32(iblength);
        byteArray.pos = VBMeshAreaPosition_Start;
        byteArray.writeUint32(VBContentDatasAreaPosition_Start - StringDatasAreaPosition_Start);
        byteArray.writeUint32(VBContentDatasAreaSize);
        byteArray.pos = IBMeshAreaPosition_Start;
        byteArray.writeUint32(IBContentDatasAreaPosition_Start - StringDatasAreaPosition_Start);
        byteArray.writeUint32(IBContentDatasAreaSize);
        byteArray.pos = StringAreaPosition_Start;
        byteArray.writeUint32(0);
        byteArray.writeUint16(stringDatas.length);
        StringDatasAreaPosition_End = byteArray.pos;
        byteArray.pos = BlockAreaPosition_Start + 2;
        byteArray.writeUint32(MeshAreaPosition_Start);
        byteArray.writeUint32(MeshAreaSize);
        byteArray.writeUint32(subMeshAreaPosition_Start);
        byteArray.writeUint32(subMeshAreaSize);
        byteArray.pos = ContentAreaPostion_Start;
        byteArray.writeUint32(StringDatasAreaPosition_Start);
        byteArray.writeUint32(StringDatasAreaPosition_Start + StringDatasAreaSize
            + VBContentDatasAreaSize + IBContentDatasAreaSize + subMeshAreaSize);
        return byteArray;
    }
    calOneCubeSurface(cubeinfo, posArray, nolArray, colArray) {
        var subcubeGeometry = cubeinfo.subCube;
        var vertexArray;
        var offset;
        var r = (cubeinfo.color & 0xff) / 255;
        if (cubeinfo.frontVBIndex != -1) {
            nolArray.push(0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0);
            this.calOneFaceColor(subcubeGeometry, cubeinfo.frontVBIndex, cubeinfo, colArray, posArray, 0);
        }
        if (cubeinfo.rightVBIndex != -1) {
            nolArray.push(1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
            this.calOneFaceColor(subcubeGeometry, cubeinfo.rightVBIndex, cubeinfo, colArray, posArray, 1);
        }
        if (cubeinfo.topVBIndex != -1) {
            nolArray.push(0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0);
            this.calOneFaceColor(subcubeGeometry, cubeinfo.topVBIndex, cubeinfo, colArray, posArray, 2);
        }
        if (cubeinfo.leftVBIndex != -1) {
            nolArray.push(-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0);
            this.calOneFaceColor(subcubeGeometry, cubeinfo.leftVBIndex, cubeinfo, colArray, posArray, 3);
        }
        if (cubeinfo.downVBIndex != -1) {
            nolArray.push(0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0);
            this.calOneFaceColor(subcubeGeometry, cubeinfo.downVBIndex, cubeinfo, colArray, posArray, 4);
        }
        if (cubeinfo.backVBIndex != -1) {
            nolArray.push(0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0);
            this.calOneFaceColor(subcubeGeometry, cubeinfo.backVBIndex, cubeinfo, colArray, posArray, 5);
        }
    }
    PanDuanFloatXiangDeng(x1, x2) {
        if (Math.abs(x1 - x2) < 0.00001) {
            return true;
        }
        else {
            return false;
        }
    }
    existAo(cubeinfo, VBIndex) {
        if (VBIndex == -1) {
            return false;
        }
        var subcubeGeometry = cubeinfo.subCube;
        var r = (cubeinfo.color & 0xff) / 255;
        var g = ((cubeinfo.color & 0xff00) >> 8) / 255;
        var b = ((cubeinfo.color & 0xff0000) >> 16) / 255;
        var vertexArray;
        var offset;
        vertexArray = subcubeGeometry._vertices[VBIndex >> 24];
        offset = VBIndex & 0x00ffffff;
        if (this.PanDuanFloatXiangDeng(vertexArray[offset + 6], r) && this.PanDuanFloatXiangDeng(vertexArray[offset + 16], r) && this.PanDuanFloatXiangDeng(vertexArray[offset + 26], r) && this.PanDuanFloatXiangDeng(vertexArray[offset + 36], r)) {
            if (this.PanDuanFloatXiangDeng(vertexArray[offset + 7], g) && this.PanDuanFloatXiangDeng(vertexArray[offset + 17], g) && this.PanDuanFloatXiangDeng(vertexArray[offset + 27], g) && this.PanDuanFloatXiangDeng(vertexArray[offset + 37], g)) {
                if (this.PanDuanFloatXiangDeng(vertexArray[offset + 8], b) && this.PanDuanFloatXiangDeng(vertexArray[offset + 18], b) && this.PanDuanFloatXiangDeng(vertexArray[offset + 28], b) && this.PanDuanFloatXiangDeng(vertexArray[offset + 38], b)) {
                    return true;
                }
            }
        }
        return false;
    }
    calOneFaceSurface(cubeinfo, faceIndex, vertexArray) {
        var x = cubeinfo.x - 1600;
        var y = cubeinfo.y - 1600;
        var z = cubeinfo.z - 1600;
        var color = cubeinfo.color;
        var othercubeinfo;
        switch (faceIndex) {
            case 0:
                var left = x;
                var right = x;
                var up = y;
                var down = y;
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(left - 1, y, z);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.frontVBIndex)) {
                        left -= 1;
                        othercubeinfo.frontVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(right + 1, y, z);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.frontVBIndex)) {
                        right += 1;
                        othercubeinfo.frontVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = left; i <= right; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(i, up + 1, z);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.frontVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = left; i <= right; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(i, up + 1, z);
                            othercubeinfo.frontVBIndex = -1;
                        }
                        up += 1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = left; i <= right; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(i, down - 1, z);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.frontVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = left; i <= right; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(i, down - 1, z);
                            othercubeinfo.frontVBIndex = -1;
                        }
                        down -= 1;
                    }
                    else {
                        break;
                    }
                }
                vertexArray.push(right + 1, up + 1, z + 1, left, up + 1, z + 1, left, down, z + 1, right + 1, down, z + 1);
                break;
            case 1:
                var front = z;
                var back = z;
                var up = y;
                var down = y;
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(x, y, back - 1);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.rightVBIndex)) {
                        back -= 1;
                        othercubeinfo.rightVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(x, y, front + 1);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.rightVBIndex)) {
                        front += 1;
                        othercubeinfo.rightVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = back; i <= front; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(x, up + 1, i);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.rightVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = back; i <= front; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(x, up + 1, i);
                            othercubeinfo.rightVBIndex = -1;
                        }
                        up += 1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = back; i <= front; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(x, down - 1, i);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.rightVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = back; i <= front; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(x, down - 1, i);
                            othercubeinfo.rightVBIndex = -1;
                        }
                        down -= 1;
                    }
                    else {
                        break;
                    }
                }
                vertexArray.push(x + 1, up + 1, front + 1, x + 1, down, front + 1, x + 1, down, back, x + 1, up + 1, back);
                break;
            case 2:
                var front = z;
                var back = z;
                var left = x;
                var right = x;
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(left - 1, y, z);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.topVBIndex)) {
                        left -= 1;
                        othercubeinfo.topVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(right + 1, y, z);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.topVBIndex)) {
                        right += 1;
                        othercubeinfo.topVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = left; i <= right; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(i, y, front + 1);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.topVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = left; i <= right; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(i, y, front + 1);
                            othercubeinfo.topVBIndex = -1;
                        }
                        front += 1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = left; i <= right; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(i, y, back - 1);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.topVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = left; i <= right; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(i, y, back - 1);
                            othercubeinfo.topVBIndex = -1;
                        }
                        back -= 1;
                    }
                    else {
                        break;
                    }
                }
                vertexArray.push(right + 1, y + 1, front + 1, right + 1, y + 1, back, left, y + 1, back, left, y + 1, front + 1);
                break;
            case 3:
                var front = z;
                var back = z;
                var up = y;
                var down = y;
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(x, y, back - 1);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.leftVBIndex)) {
                        back -= 1;
                        othercubeinfo.leftVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(x, y, front + 1);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.leftVBIndex)) {
                        front += 1;
                        othercubeinfo.leftVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = back; i <= front; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(x, up + 1, i);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.leftVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = back; i <= front; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(x, up + 1, i);
                            othercubeinfo.leftVBIndex = -1;
                        }
                        up += 1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = back; i <= front; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(x, down - 1, i);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.leftVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = back; i <= front; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(x, down - 1, i);
                            othercubeinfo.leftVBIndex = -1;
                        }
                        down -= 1;
                    }
                    else {
                        break;
                    }
                }
                vertexArray.push(x, up + 1, front + 1, x, up + 1, back, x, down, back, x, down, front + 1);
                break;
            case 4:
                var front = z;
                var back = z;
                var left = x;
                var right = x;
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(left - 1, y, z);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.downVBIndex)) {
                        left -= 1;
                        othercubeinfo.downVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(right + 1, y, z);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.downVBIndex)) {
                        right += 1;
                        othercubeinfo.downVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = left; i <= right; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(i, y, front + 1);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.downVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = left; i <= right; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(i, y, front + 1);
                            othercubeinfo.downVBIndex = -1;
                        }
                        front += 1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = left; i <= right; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(i, y, back - 1);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.downVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = left; i <= right; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(i, y, back - 1);
                            othercubeinfo.downVBIndex = -1;
                        }
                        back -= 1;
                    }
                    else {
                        break;
                    }
                }
                vertexArray.push(left, y, back, right + 1, y, back, right + 1, y, front + 1, left, y, front + 1);
                break;
            case 5:
                var left = x;
                var right = x;
                var up = y;
                var down = y;
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(left - 1, y, z);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.backVBIndex)) {
                        left -= 1;
                        othercubeinfo.backVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    othercubeinfo = this.findCubeToCubeInfo(right + 1, y, z);
                    if (othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.backVBIndex)) {
                        right += 1;
                        othercubeinfo.backVBIndex = -1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = left; i <= right; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(i, up + 1, z);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.backVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = left; i <= right; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(i, up + 1, z);
                            othercubeinfo.backVBIndex = -1;
                        }
                        up += 1;
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    var yipai = true;
                    for (var i = left; i <= right; i++) {
                        othercubeinfo = this.findCubeToCubeInfo(i, down - 1, z);
                        if (!(othercubeinfo && othercubeinfo.color == color && this.existAo(othercubeinfo, othercubeinfo.backVBIndex))) {
                            yipai = false;
                            break;
                        }
                    }
                    if (yipai) {
                        for (var i = left; i <= right; i++) {
                            othercubeinfo = this.findCubeToCubeInfo(i, down - 1, z);
                            othercubeinfo.backVBIndex = -1;
                        }
                        down -= 1;
                    }
                    else {
                        break;
                    }
                }
                vertexArray.push(right + 1, down, z, left, down, z, left, up + 1, z, right + 1, up + 1, z);
                break;
        }
    }
    calOneFaceColor(subcubeGeometry, VBIndex, cubeinfo, colArray, vertexArray, faceIndex) {
        var vertexArrayss;
        var offset;
        vertexArrayss = subcubeGeometry._vertices[VBIndex >> 24];
        offset = VBIndex & 0x00ffffff;
        if (this.existAo(cubeinfo, VBIndex)) {
            var r = (cubeinfo.color & 0xff) / 255;
            var g = ((cubeinfo.color & 0xff00) >> 8) / 255;
            var b = ((cubeinfo.color & 0xff0000) >> 16) / 255;
            colArray.push(r, g, b, 1.0, r, g, b, 1.0, r, g, b, 1.0, r, g, b, 1.0);
            this.calOneFaceSurface(cubeinfo, faceIndex, vertexArray);
        }
        else {
            colArray.push(vertexArrayss[offset + 6], vertexArrayss[offset + 7], vertexArrayss[offset + 8], 1.0, vertexArrayss[offset + 16], vertexArrayss[offset + 17], vertexArrayss[offset + 18], 1.0, vertexArrayss[offset + 26], vertexArrayss[offset + 27], vertexArrayss[offset + 28], 1.0, vertexArrayss[offset + 36], vertexArrayss[offset + 37], vertexArrayss[offset + 38], 1.0);
            vertexArray.push(vertexArrayss[offset], vertexArrayss[offset + 1], vertexArrayss[offset + 2], vertexArrayss[offset + 10], vertexArrayss[offset + 11], vertexArrayss[offset + 12], vertexArrayss[offset + 20], vertexArrayss[offset + 21], vertexArrayss[offset + 22], vertexArrayss[offset + 30], vertexArrayss[offset + 31], vertexArrayss[offset + 32]);
        }
    }
}
CubeGeometry._type = GeometryElement._typeCounter++;
CubeGeometry.CUBEINDEX = 9;
CubeGeometry.HLAFMAXSIZE = 1600;
CubeGeometry.POINTS = [1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0];
CubeGeometry.updateCubeCount = 1000;
