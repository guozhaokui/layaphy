import { UVTools } from "./UVTools";
import { SkinMeshForGraphic } from "./canvasmesh/SkinMeshForGraphic";
import { ILaya } from "../../../ILaya";
import { Matrix } from "../../maths/Matrix";
export class BoneSlot {
    constructor() {
        this.srcDisplayIndex = -1;
        this.type = "src";
        this.displayIndex = -1;
        this.originalIndex = -1;
        this._replaceDic = {};
    }
    showSlotData(slotData, freshIndex = true) {
        this.currSlotData = slotData;
        if (freshIndex)
            this.displayIndex = this.srcDisplayIndex;
        this.currDisplayData = null;
        this.currTexture = null;
    }
    showDisplayByName(name) {
        if (this.currSlotData) {
            this.showDisplayByIndex(this.currSlotData.getDisplayByName(name));
        }
    }
    replaceDisplayByName(tarName, newName) {
        if (!this.currSlotData)
            return;
        var preIndex;
        preIndex = this.currSlotData.getDisplayByName(tarName);
        var newIndex;
        newIndex = this.currSlotData.getDisplayByName(newName);
        this.replaceDisplayByIndex(preIndex, newIndex);
    }
    replaceDisplayByIndex(tarIndex, newIndex) {
        if (!this.currSlotData)
            return;
        this._replaceDic[tarIndex] = newIndex;
        if (this.originalIndex == tarIndex) {
            this.showDisplayByIndex(tarIndex);
        }
    }
    showDisplayByIndex(index) {
        this.originalIndex = index;
        if (this._replaceDic[index] != null)
            index = this._replaceDic[index];
        if (this.currSlotData && index > -1 && index < this.currSlotData.displayArr.length) {
            this.displayIndex = index;
            this.currDisplayData = this.currSlotData.displayArr[index];
            if (this.currDisplayData) {
                var tName = this.currDisplayData.name;
                this.currTexture = this.templet.getTexture(tName);
                if (this.currTexture && this.currDisplayData.type == 0 && this.currDisplayData.uvs) {
                    this.currTexture = this.currDisplayData.createTexture(this.currTexture);
                }
            }
        }
        else {
            this.displayIndex = -1;
            this.currDisplayData = null;
            this.currTexture = null;
        }
    }
    replaceSkin(_texture) {
        this._diyTexture = _texture;
        if (this._curDiyUV)
            this._curDiyUV.length = 0;
        if (this.currDisplayData && this._diyTexture == this.currDisplayData.texture) {
            this._diyTexture = null;
        }
    }
    setParentMatrix(parentMatrix) {
        this._parentMatrix = parentMatrix;
    }
    static createSkinMesh() {
        return new SkinMeshForGraphic();
    }
    static isSameArr(arrA, arrB) {
        if (arrA.length != arrB.length)
            return false;
        var i, len;
        len = arrA.length;
        for (i = 0; i < len; i++) {
            if (arrA[i] != arrB[i])
                return false;
        }
        return true;
    }
    getSaveVerticle(tArr) {
        if (BoneSlot.useSameMatrixAndVerticle && this._preGraphicVerticle && BoneSlot.isSameArr(tArr, this._preGraphicVerticle)) {
            tArr = this._preGraphicVerticle;
        }
        else {
            tArr = ILaya.Utils.copyArray([], tArr);
            this._preGraphicVerticle = tArr;
        }
        return tArr;
    }
    static isSameMatrix(mtA, mtB) {
        return mtA.a == mtB.a && mtA.b == mtB.b && mtA.c == mtB.c && mtA.d == mtB.d && Math.abs(mtA.tx - mtB.tx) < 0.00001 && Math.abs(mtA.ty - mtB.ty) < 0.00001;
    }
    getSaveMatrix(tResultMatrix) {
        if (BoneSlot.useSameMatrixAndVerticle && this._preGraphicMatrix && BoneSlot.isSameMatrix(tResultMatrix, this._preGraphicMatrix)) {
            tResultMatrix = this._preGraphicMatrix;
        }
        else {
            var newMatrix = tResultMatrix.clone();
            tResultMatrix = newMatrix;
            this._preGraphicMatrix = tResultMatrix;
        }
        return tResultMatrix;
    }
    draw(graphics, boneMatrixArray, noUseSave = false, alpha = 1) {
        if ((this._diyTexture == null && this.currTexture == null) || this.currDisplayData == null) {
            if (!(this.currDisplayData && this.currDisplayData.type == 3)) {
                return;
            }
        }
        var tTexture = this.currTexture;
        if (this._diyTexture)
            tTexture = this._diyTexture;
        var tSkinSprite;
        switch (this.currDisplayData.type) {
            case 0:
                if (graphics) {
                    var tCurrentMatrix = this.getDisplayMatrix();
                    if (this._parentMatrix) {
                        var tRotateKey = false;
                        if (tCurrentMatrix) {
                            Matrix.mul(tCurrentMatrix, this._parentMatrix, Matrix.TEMP);
                            var tResultMatrix;
                            if (noUseSave) {
                                if (this._resultMatrix == null)
                                    this._resultMatrix = new Matrix();
                                tResultMatrix = this._resultMatrix;
                            }
                            else {
                                tResultMatrix = BoneSlot._tempResultMatrix;
                            }
                            if (this._diyTexture && this.currDisplayData.uvs) {
                                var tTestMatrix = BoneSlot._tempMatrix;
                                tTestMatrix.identity();
                                if (this.currDisplayData.uvs[1] > this.currDisplayData.uvs[5]) {
                                    tTestMatrix.d = -1;
                                }
                                if (this.currDisplayData.uvs[0] > this.currDisplayData.uvs[4]
                                    && this.currDisplayData.uvs[1] > this.currDisplayData.uvs[5]) {
                                    tRotateKey = true;
                                    tTestMatrix.rotate(-Math.PI / 2);
                                }
                                Matrix.mul(tTestMatrix, Matrix.TEMP, tResultMatrix);
                            }
                            else {
                                Matrix.TEMP.copyTo(tResultMatrix);
                            }
                            if (!noUseSave) {
                                tResultMatrix = this.getSaveMatrix(tResultMatrix);
                            }
                            tResultMatrix._checkTransform();
                            if (tRotateKey) {
                                graphics.drawTexture(tTexture, -this.currDisplayData.height / 2, -this.currDisplayData.width / 2, this.currDisplayData.height, this.currDisplayData.width, tResultMatrix, alpha);
                            }
                            else {
                                graphics.drawTexture(tTexture, -this.currDisplayData.width / 2, -this.currDisplayData.height / 2, this.currDisplayData.width, this.currDisplayData.height, tResultMatrix, alpha);
                            }
                        }
                    }
                }
                break;
            case 1:
                if (noUseSave) {
                    if (this._skinSprite == null) {
                        this._skinSprite = BoneSlot.createSkinMesh();
                    }
                    tSkinSprite = this._skinSprite;
                }
                else {
                    tSkinSprite = BoneSlot.createSkinMesh();
                }
                if (tSkinSprite == null) {
                    return;
                }
                var tIBArray;
                var tRed = 1;
                var tGreed = 1;
                var tBlue = 1;
                var tAlpha = 1;
                if (this.currDisplayData.bones == null) {
                    var tVertices = this.currDisplayData.weights;
                    if (this.deformData) {
                        tVertices = this.deformData;
                    }
                    var tUVs;
                    if (this._diyTexture) {
                        if (!this._curDiyUV) {
                            this._curDiyUV = [];
                        }
                        if (this._curDiyUV.length == 0) {
                            this._curDiyUV = UVTools.getRelativeUV(this.currTexture.uv, this.currDisplayData.uvs, this._curDiyUV);
                            this._curDiyUV = UVTools.getAbsoluteUV(this._diyTexture.uv, this._curDiyUV, this._curDiyUV);
                        }
                        tUVs = this._curDiyUV;
                    }
                    else {
                        tUVs = this.currDisplayData.uvs;
                    }
                    this._mVerticleArr = tVertices;
                    var tTriangleNum = this.currDisplayData.triangles.length / 3;
                    tIBArray = this.currDisplayData.triangles;
                    if (this.deformData) {
                        if (!noUseSave) {
                            this._mVerticleArr = this.getSaveVerticle(this._mVerticleArr);
                        }
                    }
                    tSkinSprite.init2(tTexture, tIBArray, this._mVerticleArr, tUVs);
                    var tCurrentMatrix2 = this.getDisplayMatrix();
                    if (this._parentMatrix) {
                        if (tCurrentMatrix2) {
                            Matrix.mul(tCurrentMatrix2, this._parentMatrix, Matrix.TEMP);
                            var tResultMatrix2;
                            if (noUseSave) {
                                if (this._resultMatrix == null)
                                    this._resultMatrix = new Matrix();
                                tResultMatrix2 = this._resultMatrix;
                            }
                            else {
                                tResultMatrix2 = BoneSlot._tempResultMatrix;
                            }
                            Matrix.TEMP.copyTo(tResultMatrix2);
                            if (!noUseSave) {
                                tResultMatrix2 = this.getSaveMatrix(tResultMatrix2);
                            }
                            tSkinSprite.transform = tResultMatrix2;
                        }
                    }
                }
                else {
                    this.skinMesh(boneMatrixArray, tSkinSprite);
                }
                graphics.drawSkin(tSkinSprite, alpha);
                break;
            case 2:
                if (noUseSave) {
                    if (this._skinSprite == null) {
                        this._skinSprite = BoneSlot.createSkinMesh();
                    }
                    tSkinSprite = this._skinSprite;
                }
                else {
                    tSkinSprite = BoneSlot.createSkinMesh();
                }
                if (tSkinSprite == null) {
                    return;
                }
                this.skinMesh(boneMatrixArray, tSkinSprite);
                graphics.drawSkin(tSkinSprite, alpha);
                break;
            case 3:
                break;
        }
    }
    skinMesh(boneMatrixArray, skinSprite) {
        var tTexture = this.currTexture;
        var tBones = this.currDisplayData.bones;
        var tUvs;
        if (this._diyTexture) {
            tTexture = this._diyTexture;
            if (!this._curDiyUV) {
                this._curDiyUV = [];
            }
            if (this._curDiyUV.length == 0) {
                this._curDiyUV = UVTools.getRelativeUV(this.currTexture.uv, this.currDisplayData.uvs, this._curDiyUV);
                this._curDiyUV = UVTools.getAbsoluteUV(this._diyTexture.uv, this._curDiyUV, this._curDiyUV);
            }
            tUvs = this._curDiyUV;
        }
        else {
            tUvs = this.currDisplayData.uvs;
        }
        var tWeights = this.currDisplayData.weights;
        var tTriangles = this.currDisplayData.triangles;
        var tIBArray;
        var tRx = 0;
        var tRy = 0;
        var nn = 0;
        var tMatrix;
        var tX;
        var tY;
        var tB = 0;
        var tWeight = 0;
        var tVertices;
        var i = 0, j = 0, n = 0;
        var tRed = 1;
        var tGreed = 1;
        var tBlue = 1;
        BoneSlot._tempVerticleArr.length = 0;
        tVertices = BoneSlot._tempVerticleArr;
        if (this.deformData && this.deformData.length > 0) {
            var f = 0;
            for (i = 0, n = tBones.length; i < n;) {
                nn = tBones[i++] + i;
                tRx = 0, tRy = 0;
                for (; i < nn; i++) {
                    tMatrix = boneMatrixArray[tBones[i]];
                    tX = tWeights[tB] + this.deformData[f++];
                    tY = tWeights[tB + 1] + this.deformData[f++];
                    tWeight = tWeights[tB + 2];
                    tRx += (tX * tMatrix.a + tY * tMatrix.c + tMatrix.tx) * tWeight;
                    tRy += (tX * tMatrix.b + tY * tMatrix.d + tMatrix.ty) * tWeight;
                    tB += 3;
                }
                tVertices.push(tRx, tRy);
            }
        }
        else {
            for (i = 0, n = tBones.length; i < n;) {
                nn = tBones[i++] + i;
                tRx = 0, tRy = 0;
                for (; i < nn; i++) {
                    tMatrix = boneMatrixArray[tBones[i]];
                    tX = tWeights[tB];
                    tY = tWeights[tB + 1];
                    tWeight = tWeights[tB + 2];
                    tRx += (tX * tMatrix.a + tY * tMatrix.c + tMatrix.tx) * tWeight;
                    tRy += (tX * tMatrix.b + tY * tMatrix.d + tMatrix.ty) * tWeight;
                    tB += 3;
                }
                tVertices.push(tRx, tRy);
            }
        }
        this._mVerticleArr = tVertices;
        tIBArray = tTriangles;
        this._mVerticleArr = this.getSaveVerticle(this._mVerticleArr);
        skinSprite.init2(tTexture, tIBArray, this._mVerticleArr, tUvs);
    }
    drawBonePoint(graphics) {
        if (graphics && this._parentMatrix) {
            graphics.drawCircle(this._parentMatrix.tx, this._parentMatrix.ty, 5, "#ff0000");
        }
    }
    getDisplayMatrix() {
        if (this.currDisplayData) {
            return this.currDisplayData.transform.getMatrix();
        }
        return null;
    }
    getMatrix() {
        return this._resultMatrix;
    }
    copy() {
        var tBoneSlot = new BoneSlot();
        tBoneSlot.type = "copy";
        tBoneSlot.name = this.name;
        tBoneSlot.attachmentName = this.attachmentName;
        tBoneSlot.srcDisplayIndex = this.srcDisplayIndex;
        tBoneSlot.parent = this.parent;
        tBoneSlot.displayIndex = this.displayIndex;
        tBoneSlot.templet = this.templet;
        tBoneSlot.currSlotData = this.currSlotData;
        tBoneSlot.currTexture = this.currTexture;
        tBoneSlot.currDisplayData = this.currDisplayData;
        return tBoneSlot;
    }
}
BoneSlot._tempMatrix = new Matrix();
BoneSlot._tempResultMatrix = new Matrix();
BoneSlot.useSameMatrixAndVerticle = true;
BoneSlot._tempVerticleArr = [];
