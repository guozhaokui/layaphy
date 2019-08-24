import { Utils } from "../../utils/Utils";
export class UVTools {
    constructor() {
    }
    static getRelativeUV(bigUV, smallUV, rst = null) {
        var startX = bigUV[0];
        var width = bigUV[2] - bigUV[0];
        var startY = bigUV[1];
        var height = bigUV[5] - bigUV[1];
        if (!rst)
            rst = [];
        rst.length = smallUV.length;
        var i, len;
        len = rst.length;
        var dWidth = 1 / width;
        var dHeight = 1 / height;
        for (i = 0; i < len; i += 2) {
            rst[i] = (smallUV[i] - startX) * dWidth;
            rst[i + 1] = (smallUV[i + 1] - startY) * dHeight;
        }
        return rst;
    }
    static getAbsoluteUV(bigUV, smallUV, rst = null) {
        if (bigUV[0] == 0 && bigUV[1] == 0 && bigUV[4] == 1 && bigUV[5] == 1) {
            if (rst) {
                Utils.copyArray(rst, smallUV);
                return rst;
            }
            else {
                return smallUV;
            }
        }
        var startX = bigUV[0];
        var width = bigUV[2] - bigUV[0];
        var startY = bigUV[1];
        var height = bigUV[5] - bigUV[1];
        if (!rst)
            rst = [];
        rst.length = smallUV.length;
        var i, len;
        len = rst.length;
        for (i = 0; i < len; i += 2) {
            rst[i] = smallUV[i] * width + startX;
            rst[i + 1] = smallUV[i + 1] * height + startY;
        }
        return rst;
    }
}
