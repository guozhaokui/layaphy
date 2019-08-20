import Body from "../objects/Body";

/**
 * Collision "matrix". It's actually a triangular-shaped array of whether two bodies are touching this step, for reference next step
 * 记录两个对象在当前帧是否碰撞，是一个三角矩阵
 * TODO 如果对象多了这个占内存太多 n*(n-1)/2
 */
export default class ArrayCollisionMatrix {
    /**
     * The matrix storage
     */
    matrix:number[] = [];
    constructor() {
    }

    /**
     * Get an element
     */
    get(i:Body, j:Body) {
        let ii = i.index;
        let ji = j.index;
        if (ji > ii) {
            const temp = ji;
            ji = ii;
            ii = temp;
        }
        return this.matrix[(ii * (ii + 1) >> 1) + ji - 1];
    }

    /**
     * Set an element
     */
    set(bi:Body, bj:Body, value:boolean) {
        let i = bi.index;
        let j = bj.index;
        if (j > i) {
            const temp = j;
            j = i;
            i = temp;
        }
        this.matrix[(i * (i + 1) >> 1) + j - 1] = value ? 1 : 0;
    }

    /**
     * Sets all elements to zero
     */
    reset() {
        for (let i = 0, l = this.matrix.length; i !== l; i++) {
            this.matrix[i] = 0;
        }
    }

    /**
     * Sets the max number of objects
     */
    setNumObjects(n:number) {
        this.matrix.length = n * (n - 1) >> 1;
    }
}
