import { Vector3 } from "laya/d3/math/Vector3";
export class CubeMap {
    constructor() {
        this.data = {};
        this._fenKuaiArray = [];
        this.xMax = 0;
        this.xMin = 0;
        this.yMax = 0;
        this.yMin = 0;
        this.zMax = 0;
        this.zMin = 0;
        this.clear();
    }
    add(x, y, z, value) {
        var key = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
        var o = this.data[key] || (this.data[key] = {});
        o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)] = value;
        o.save = null;
        this.length++;
    }
    check32(x, y, z) {
        var key = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
        var o = this.data[key] || (this.data[key] = {});
        o.save = null;
    }
    add2(x, y, z, value) {
        this.data[(x >> 5) + (y << 3) + (z << 11)][x % 32 + ((y % 32) << 8) + ((z % 32) << 16)] = value;
    }
    find(x, y, z) {
        var key = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
        var o = this.data[key];
        return o ? o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)] : null;
    }
    remove(x, y, z) {
        var key = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
        var o = this.data[key];
        if (o) {
            var key = x % 32 + ((y % 32) << 8) + ((z % 32) << 16);
            if (o[key]) {
                o[key] = null;
                o.save = null;
            }
        }
        this.length--;
    }
    clear() {
        for (var i in this.data) {
            this.data[i] = {};
        }
        this.length = 0;
    }
    saveData() {
        this._fenKuaiArray = [];
        var cubeinfo;
        var sz, n, n2;
        var n = 0;
        for (var i in this.data) {
            n++;
        }
        console.log('n=', n);
        for (var i in this.data) {
            var o32 = this.data[i];
            var o32save = o32.save;
            if (!o32save) {
                o32save = o32.save = [];
                for (var j in o32) {
                    cubeinfo = (o32[j]);
                    if (cubeinfo && cubeinfo.subCube != null)
                        o32.save.push(cubeinfo.x, cubeinfo.y, cubeinfo.z, cubeinfo.color);
                }
            }
            o32save.length > 0 && this._fenKuaiArray.push(o32save.concat());
        }
        return this._fenKuaiArray;
    }
    returnData() {
        var Returnarray = [];
        var array;
        var cubeinfo;
        for (var i in this.data) {
            array = this.data[i];
            if (array) {
                var sv = [];
                for (var j in array) {
                    cubeinfo = (array[j]);
                    if (cubeinfo && cubeinfo.subCube != null)
                        sv.push(cubeinfo.x, cubeinfo.y, cubeinfo.z, cubeinfo.color);
                }
                Returnarray.push(sv);
            }
        }
        return Returnarray;
    }
    returnAllCube() {
        var cubeinfos = [];
        var cubeinfoo;
        var array;
        for (var i in this.data) {
            array = this.data[i];
            if (array) {
                for (var j in array) {
                    cubeinfoo = (array[j]);
                    if (cubeinfoo && cubeinfoo.subCube != null) {
                        if (!(cubeinfoo.backVBIndex == -1 && cubeinfoo.frontVBIndex == -1 && cubeinfoo.topVBIndex == -1 && cubeinfoo.downVBIndex == -1 && cubeinfoo.leftVBIndex == -1 && cubeinfoo.rightVBIndex == -1)) {
                            cubeinfos.push(cubeinfoo);
                        }
                    }
                }
            }
        }
        return cubeinfos;
    }
    checkColor(colorNum) {
        var colorobject = {};
        var nums = 0;
        var cubeinfoo;
        var array;
        for (var i in this.data) {
            array = this.data[i];
            if (array) {
                for (var j in array) {
                    cubeinfoo = (array[j]);
                    if (cubeinfoo && cubeinfoo.subCube != null) {
                        if (!(cubeinfoo.backVBIndex == -1 && cubeinfoo.frontVBIndex == -1 && cubeinfoo.topVBIndex == -1 && cubeinfoo.downVBIndex == -1 && cubeinfoo.leftVBIndex == -1 && cubeinfoo.rightVBIndex == -1)) {
                            if (!colorobject[cubeinfoo.color]) {
                                colorobject[cubeinfoo.color] = 1;
                                nums++;
                                if (nums > colorNum) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    modolCenter() {
        var cubeinfoo;
        var xmax = -9999;
        var xmin = 9999;
        var ymax = -9999;
        var ymin = 9999;
        var zmax = -9999;
        var zmin = 9999;
        var array;
        for (var i in this.data) {
            array = this.data[i];
            if (array) {
                for (var j in array) {
                    cubeinfoo = (array[j]);
                    if (cubeinfoo && cubeinfoo.subCube != null) {
                        if (cubeinfoo.x > xmax) {
                            xmax = cubeinfoo.x;
                        }
                        else {
                            xmin = Math.min(xmin, cubeinfoo.x);
                        }
                        if (cubeinfoo.y > ymax) {
                            ymax = cubeinfoo.y;
                        }
                        else {
                            ymin = Math.min(ymin, cubeinfoo.y);
                        }
                        if (cubeinfoo.z > zmax) {
                            zmax = cubeinfoo.z;
                        }
                        else {
                            zmin = Math.min(zmin, cubeinfoo.z);
                        }
                    }
                }
            }
        }
        this.xMax = xmax - 1600;
        this.xMin = xmin - 1600;
        this.yMax = ymax - 1600;
        this.yMin = ymin - 1600;
        this.zMax = zmax - 1600;
        this.zMin = zmin - 1600;
        this.cubeinfos = new Vector3((xmax + xmin) / 2 - 1600, (ymax + ymin) / 2 - 1600, (zmax + zmin) / 2 - 1600);
        return this.cubeinfos;
    }
}
CubeMap.SIZE = 3201;
CubeMap.CUBESIZE = 32;
CubeMap.CUBENUMS = 100;
