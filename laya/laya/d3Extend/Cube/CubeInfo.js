export class CubeInfo {
    constructor(_x, _y, _z) {
        this.frontFaceAO = new Int32Array([0, 0, 0, 0, 0, 0]);
        this.selectArrayIndex = [];
        this.modifyFlag = CubeInfo.MODIFYE_NONE;
        this.frontVBIndex = -1;
        this.backVBIndex = -1;
        this.leftVBIndex = -1;
        this.rightVBIndex = -1;
        this.topVBIndex = -1;
        this.downVBIndex = -1;
        this.modifyIndex = -1;
        this.cubeProperty = 999;
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }
    static create(x, y, z) {
        if (CubeInfo._pool.length) {
            var cube = CubeInfo._pool.pop();
            cube.x = x;
            cube.y = y;
            cube.z = z;
            cube.modifyFlag = CubeInfo.MODIFYE_NONE;
            cube.frontVBIndex = -1;
            cube.backVBIndex = -1;
            cube.leftVBIndex = -1;
            cube.rightVBIndex = -1;
            cube.topVBIndex = -1;
            cube.downVBIndex = -1;
            cube.point = 0;
            cube.subCube = null;
            return cube;
        }
        else {
            return new CubeInfo(x, y, z);
        }
    }
    static recover(cube) {
        if (cube) {
            if (cube instanceof CubeInfo) {
                CubeInfo._pool.push(cube);
            }
        }
    }
    update() {
        this.updateCube.updatePlane(this);
    }
    clearAoData() {
        this.frontFaceAO[0] = 0;
        this.frontFaceAO[1] = 0;
        this.frontFaceAO[2] = 0;
        this.frontFaceAO[3] = 0;
        this.frontFaceAO[4] = 0;
        this.frontFaceAO[5] = 0;
    }
    static Cal24Object() {
        for (var j = 0; j < 4; j++) {
            CubeInfo.aoFactor[j] = Math.pow(CubeInfo._aoFactor, j);
        }
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect0down, 5, 6, 7);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect0front, 3, 6, 7);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect0right, 3, 5, 7);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect1down, 4, 6, 7);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect1left, 2, 4, 6);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect1front, 2, 6, 7);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect2down, 4, 5, 7);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect2back, 1, 4, 5);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect2right, 1, 5, 7);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect3down, 4, 5, 6);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect3left, 0, 4, 6);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect3back, 0, 4, 5);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect4up, 1, 2, 3);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect4front, 7, 3, 2);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect4right, 1, 3, 7);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect5up, 0, 2, 3);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect5left, 0, 2, 6);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect5front, 2, 3, 6);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect6up, 0, 1, 3);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect6back, 0, 1, 5);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect6right, 1, 3, 5);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect7up, 0, 1, 2);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect7back, 0, 1, 4);
        CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect7left, 0, 2, 4);
    }
    static CalOneObjectKeyValue(array, Wei1, Wei2, Wei3) {
        for (var i = 0; i < 256; i++) {
            var num = 0;
            if ((i & CubeInfo.PanduanWei[Wei1]) != 0)
                num++;
            if ((i & CubeInfo.PanduanWei[Wei2]) != 0)
                num++;
            if ((i & CubeInfo.PanduanWei[Wei3]) != 0)
                num++;
            array[i] = num;
        }
    }
    calDirectCubeExit(Wei) {
        return ((this.point & CubeInfo.PanduanWei[Wei]) != 0) ? 1 : -1;
    }
    getVBPointbyFaceIndex(faceIndex) {
        switch (faceIndex) {
            case 0:
                return this.frontVBIndex;
                break;
            case 1:
                return this.rightVBIndex;
                break;
            case 2:
                return this.topVBIndex;
                break;
            case 3:
                return this.leftVBIndex;
                break;
            case 4:
                return this.downVBIndex;
                break;
            case 5:
                return this.backVBIndex;
                break;
            default:
                return -1;
        }
    }
    returnColorProperty() {
        var ss = this.color & 0xff000000 >> 24;
        return ss;
    }
    ClearSelectArray() {
        this.selectArrayIndex.length = 0;
    }
}
CubeInfo._aoFactor = 0.85;
CubeInfo.aoFactor = [];
CubeInfo.Objcect0down = new Array(256);
CubeInfo.Objcect0front = new Array(256);
CubeInfo.Objcect0right = new Array(256);
CubeInfo.Objcect1down = new Array(256);
CubeInfo.Objcect1left = new Array(256);
CubeInfo.Objcect1front = new Array(256);
CubeInfo.Objcect2down = new Array(256);
CubeInfo.Objcect2back = new Array(256);
CubeInfo.Objcect2right = new Array(256);
CubeInfo.Objcect3down = new Array(256);
CubeInfo.Objcect3left = new Array(256);
CubeInfo.Objcect3back = new Array(256);
CubeInfo.Objcect4up = new Array(256);
CubeInfo.Objcect4front = new Array(256);
CubeInfo.Objcect4right = new Array(256);
CubeInfo.Objcect5up = new Array(256);
CubeInfo.Objcect5left = new Array(256);
CubeInfo.Objcect5front = new Array(256);
CubeInfo.Objcect6up = new Array(256);
CubeInfo.Objcect6back = new Array(256);
CubeInfo.Objcect6right = new Array(256);
CubeInfo.Objcect7up = new Array(256);
CubeInfo.Objcect7back = new Array(256);
CubeInfo.Objcect7left = new Array(256);
CubeInfo.PanduanWei = new Int32Array([1, 2, 4, 8, 16, 32, 64, 128]);
CubeInfo.MODIFYE_NONE = 0;
CubeInfo.MODIFYE_ADD = 1;
CubeInfo.MODIFYE_REMOVE = 2;
CubeInfo.MODIFYE_UPDATE = 3;
CubeInfo.MODIFYE_UPDATEAO = 4;
CubeInfo.MODIFYE_UPDATEPROPERTY = 5;
CubeInfo._pool = [];
