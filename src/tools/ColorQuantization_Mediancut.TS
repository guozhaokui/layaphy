
class VoxelColor {
    r = 0;	// 0~255
    g = 0;
    b = 0;
    w = 0; 	// 这里表示重复次数
    obj: Object | null = null;

    constructor(r: number, g: number, b: number, o: Object | null) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.obj = o;
    }

    toInt(): number {
        return (this.r << 16) | (this.g << 8) | (this.b);
    }
}

/**
 * 给 median cut 算法用的包围盒。
 */
class ColorBoundingBox {
    minr = 255;
    ming = 255;
    minb = 255;
    maxr = 0;
    maxg = 0;
    maxb = 0;
    bc: VoxelColor[] = [];

    /**
     * 
     * @param	colors 颜色统计数组。w是颜色个数。由于需要排序，所以不方便直接用数组
     */
    constructor(colors: VoxelColor[]) {
        for (var i = 0, sz= colors.length; i < sz; i++) {
            var c: VoxelColor = colors[i];
            this.minr = Math.min(c.r, this.minr);
            this.ming = Math.min(c.g, this.ming);
            this.minb = Math.min(c.b, this.minb);

            this.maxr = Math.max(c.r, this.maxr);
            this.maxg = Math.max(c.g, this.maxg);
            this.maxb = Math.max(c.b, this.maxb);
            //bc.push({r: c.r, g: c.g, b: c.b, w: c.w});		
        }
        this.bc = colors;// 注意是直接引用。
    }

    /**
     * 从数据中间二分
     */
    split() {
        var dr = this.maxr - this.minr;
        var dg = this.maxg - this.ming;
        var db = this.maxb - this.minb;

        var dir = 'r';
        if (dg > dr) {
            if (db > dg) dir = 'b';
            else dir = 'g';
        }
        else {
            if (db > dr) dir = 'b';
        }

        switch (dir) {
            case 'r': {
                // sort the colors along r axis
                this.bc.sort(function (a: VoxelColor, b: VoxelColor) { return a.r - b.r; });
                break;
            }
            case 'g': {
                this.bc.sort(function (a: VoxelColor, b: VoxelColor) { return a.g - b.g; });
                break;
            }
            case 'b': {
                this.bc.sort(function (a: VoxelColor, b: VoxelColor) { return a.b - b.b; });
                break;
            }
        }

        // TODO 怎么没有处理颜色数量不够的情况
        var mid = this.bc.length / 2;
        var lBox = new ColorBoundingBox(this.bc.slice(0, mid));
        var rBox = new ColorBoundingBox(this.bc.slice(mid));

        return {
            left: lBox,
            right: rBox
        }
    }

    /**
     * 求box中颜色的平均数
     * @param idx  当前所属的调色板索引,同时修改保存的对象的调色板索引可以省掉后面的颜色转调色板
     */
    meanColor(idx: number, out: VoxelColor): VoxelColor {
        var r = 0, g = 0, b = 0, wSum = 0;
        var colors = this.bc;
        for (var i = 0, len = colors.length; i < len; i++) {
            var o = colors[i];
            var w = o.w;        // w是重复次数，或者这里放了多少个相同颜色
            r += o.r * w;
            g += o.g * w;
            b += o.b * w;
            wSum += w;
            if (o.obj) {
                o.obj[0] = idx;
            }
        }
        if (wSum === 0) {
            r = g = b = 0;
        } else {
            r /= wSum;
            g /= wSum;
            b /= wSum;
        }
        out.r = Math.round(r);
        out.g = Math.round(g);
        out.b = Math.round(b);
        return out;
    }
}

/**
 * 用median cut算法实现的颜色量化算法，即真彩转256色调色板
 * 源码来自：
 * https://github.com/phg1024/ImageProcJS/blob/master/algorithms/mediancut.js
 */
export class ColorQuantization_Mediancut {
    tmpCol = new VoxelColor(0, 0, 0, null);
    /**
     * mediancut 颜色分类法
     * @param src rgb格式的数组
     * @param n  颜色数目
     * @return {uint8[]}  256色调色板. 每个占3个字节
     */
    mediancut(src: Uint8Array, n = 256): number[] {
        var incolorNum = src.length / 3;    // 总数据个数
        // 统计
        var inColors: {[key:string]:number} = {};   // 每个颜色的个数统计
        var hex: string;
        var ci: number = 0;
        var i = 0;
        for (i = 0; i < incolorNum; i++) {
            var r = src[ci++];
            var g = src[ci++];
            var b = src[ci++];
            hex = ((r << 16) | (g << 8) | b).toString(16);
            if (!(hex in inColors)) {
                inColors[hex] = 1;
            } else {
                inColors[hex]++;		// 统计相同颜色的个数
            }
        }

        var tmp: VoxelColor[] = [];
        for (hex in inColors) {
            var intv = parseInt(hex, 16);
            var c = new VoxelColor(intv >>> 16, (intv >>> 8) & 0xff, intv & 0xff, null);
            c.w = inColors[hex]; // 相同颜色个数
            tmp.push(c);
        }

        // build the mean cut tree
        var root = new ColorBoundingBox(tmp);

        var Q: ColorBoundingBox[] = [];
        Q.push(root);
        // 每次都是把所有的节点切成两半，所以结果一定是2的n次方
        while (Q.length < n) {
            // recursively refine the tree
            let cur = Q[0];
            Q.shift();

            var children = cur.split();

            Q.push(children.left);
            Q.push(children.right);
        }

        // 这时候Q中保留下来的都是还没有拆分的
        var colors: number[] = [];
        for (i = 0; i < Q.length; i++) {
            Q[i].meanColor(i, this.tmpCol);
            //colors.push( Q[i].meanColor() );
            colors.push(this.tmpCol.r, this.tmpCol.g, this.tmpCol.b);
        }
        return colors;
    }

    // 已经统计好各个颜色的数量了，这样可以快速一些。直接返回 Uint8Array
    mediancut1(colorData: Object, colNum:number, n = 256): Uint8Array {
        var ret8 = new Uint8Array(n * 3);
        var colors: VoxelColor[] = new Array<VoxelColor>(colNum);	// r,g,b,num

        var ci = 0;
        for (var c in colorData) {
            var ic = parseInt(c);
            var b = ((ic >>> 10) & 0x1f);// 用的直接是555的
            var g = ((ic >>> 5) & 0x1f);
            var r = (ic & 0x1f);
            var o = colorData[c];
            var cc: VoxelColor = colors[ci] = new VoxelColor(r, g, b, o);
            cc.w = o[1];
            ci++;
        }

        // build the mean cut tree
        var root: ColorBoundingBox = new ColorBoundingBox(colors);

        var Q: ColorBoundingBox[] = new Array<ColorBoundingBox>();
        Q.push(root);
        // 每次都是把所有的节点切成两半，所以结果一定是2的n次方
        while (Q.length < n) {
            // recursively refine the tree
            var cur: ColorBoundingBox = Q[0];
            Q.shift();

            var children = cur.split();

            Q.push(children.left);
            Q.push(children.right);
        }

        // 这时候Q中保留下来的都是还没有拆分的
        for (var i = 0; i < Q.length; i++) {
            Q[i].meanColor(i, this.tmpCol);
            ret8[i * 3] = this.tmpCol.r;
            ret8[i * 3 + 1] = this.tmpCol.g;
            ret8[i * 3 + 2] = this.tmpCol.b;
        }
        return ret8;
    }

    /**
     * 传入rgb，返回调色板中最接近的index
     * @param	r
     * @param	g
     * @param	b
     * @param	pal
     * @return {int} 调色板索引
     */
    getNearestIndex(r: number, g: number, b: number, pal: number[]): number {
        var minV: number = Number.MAX_VALUE;
        var minIdx: number = 0;
        var pi = 0;
        for (var i = 0; i < 256; i++) {
            var pr = pal[pi++];
            var pg = pal[pi++];
            var pb = pal[pi++];
            var dr = pr - r;
            var dg = pg - g;
            var db = pb - b;
            var dist: number = Math.sqrt(dr * dr + dg * dg + db * db);
            if (dist < minV) {
                minIdx = i;
                minV = dist;
            }
        }
        return minIdx;
    }

    trueColorToIndexColor(img: Uint8Array, pal: number[]): Object {
        var ptNum = img.length / 4;
        var ret = new Uint8Array(ptNum);
        var retImg = new Uint8Array(img.length);
        var pi = 0;
        for (var i = 0; i < ptNum; i++) {
            var r = img[pi++];
            var g = img[pi++];
            var b = img[pi++];
            pi++;
            var idx = this.getNearestIndex(r, g, b, pal);
            ret[i] = idx;
            retImg[i * 4] = pal[idx * 3];
            retImg[i * 4 + 1] = pal[idx * 3 + 1];
            retImg[i * 4 + 2] = pal[idx * 3 + 2];
            retImg[i * 4 + 3] = 255;
        }
        return { idxdt: ret, idximg: retImg };
    }
}