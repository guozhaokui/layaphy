import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Pool } from "laya/utils/Pool";
export class CubeInfoArray {
    constructor() {
        this.currentPosindex = 0;
        this.PositionArray = [];
        this.currentColorindex = 0;
        this.colorArray = [];
        this.Layar = 0;
        this.sizex = 0;
        this.sizey = 0;
        this.sizez = 0;
        this.operation = 0;
        this.listObject = {};
    }
    clear() {
        this.PositionArray.length = 0;
        this.colorArray.length = 0;
        this.currentColorindex = this.currentPosindex = 0;
        this.dx = this.dy = this.dz = 0;
    }
    static create() {
        var rs = Pool.getItem("CubeInfoArray");
        return rs || new CubeInfoArray();
    }
    dispose() {
        this.clear();
        Pool.recover("CubeInfoArray", this);
    }
    static recover(cubeinfoArray) {
    }
    append(x, y, z, color) {
        this.PositionArray.push(x, y, z);
        this.colorArray.push(color);
        this.listObject[x + "," + y + "," + z] = color;
    }
    find(x, y, z) {
        return this.listObject[x + "," + y + "," + z] || -1;
    }
    removefind() {
        this.listObject = {};
    }
    setToCube(x, y, z, color) {
        this.PositionArray.push(x, y, z);
        this.colorArray.push(color);
        if (this.maxminXYZ[0] < x)
            this.maxminXYZ[0] = x;
        if (this.maxminXYZ[1] > x)
            this.maxminXYZ[1] = x;
        if (this.maxminXYZ[2] < y)
            this.maxminXYZ[2] = y;
        if (this.maxminXYZ[3] > y)
            this.maxminXYZ[3] = y;
        if (this.maxminXYZ[4] < z)
            this.maxminXYZ[4] = z;
        if (this.maxminXYZ[5] > z)
            this.maxminXYZ[5] = z;
    }
    calMidxyz() {
        this.midx = 0 | ((this.maxminXYZ[0] - this.maxminXYZ[1]) / 2 + this.maxminXYZ[1]);
        this.midy = 0 | ((this.maxminXYZ[2] - this.maxminXYZ[3]) / 2 + this.maxminXYZ[3]);
        this.midz = 0 | ((this.maxminXYZ[4] - this.maxminXYZ[5]) / 2 + this.maxminXYZ[5]);
    }
    rotation(x = 0, y = 0, z = 0) {
        if (!x && !y && !z)
            return;
        this._rotation = this._rotation || new Quaternion();
        this._v3 = this._v3 || new Vector3();
        if (x != 0)
            x = x / 180 * Math.PI;
        if (y != 0)
            y = y / 180 * Math.PI;
        if (z != 0)
            z = z / 180 * Math.PI;
        var positionArray = this.PositionArray;
        var i, l = positionArray.length;
        Quaternion.createFromYawPitchRoll(y, x, z, this._rotation);
        for (i = 0; i < l; i += 3) {
            this._v3.setValue(positionArray[i] - this.midx, positionArray[i + 1] - this.midy, positionArray[i + 2] - this.midz);
            Vector3.transformQuat(this._v3, this._rotation, this._v3);
            positionArray[i] = Math.round(this._v3.x + this.midx);
            positionArray[i + 1] = Math.round(this._v3.y + this.midy);
            positionArray[i + 2] = Math.round(this._v3.z + this.midz);
        }
    }
    scale(x = 1, y = 1, z = 1) {
        console.time("scale");
        var newPositionArray = [];
        var newColorArray = [];
        var positionArray = this.PositionArray;
        newPositionArray.length = positionArray.length * x * y * z;
        newColorArray.length = this.colorArray.length * x * y * z;
        var i, l = this.colorArray.length;
        var j, p, g;
        var flag = 0;
        for (i = 0; i < l; i++) {
            var rx = positionArray[i * 3];
            rx = rx + (rx - this.midx) * (x - 1);
            var ry = positionArray[i * 3 + 1];
            ry = ry + (ry - this.midy) * (y - 1);
            var rz = positionArray[i * 3 + 2];
            rz = rz + (rz - this.midz) * (z - 1);
            var ncolor = this.colorArray[i];
            for (j = 0; j < x; j++) {
                for (p = 0; p < y; p++) {
                    for (g = 0; g < z; g++) {
                        newPositionArray[flag * 3] = rx + j;
                        newPositionArray[flag * 3 + 1] = ry + p;
                        newPositionArray[flag * 3 + 2] = rz + g;
                        newColorArray[flag++] = ncolor;
                    }
                }
            }
        }
        this.colorArray = newColorArray;
        this.PositionArray = newPositionArray;
        console.timeEnd("scale");
    }
}
CubeInfoArray.Add = 1;
CubeInfoArray.Delete = 2;
CubeInfoArray.Updata = 3;
