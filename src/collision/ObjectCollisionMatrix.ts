import Body from "../objects/Body";

/**
 * Records what objects are colliding with each other
 */
export default class ObjectCollisionMatrix {
    /**
     * The matrix storage
     */
    matrix: { [key: string]: boolean } = {};
    constructor() {
    }

    get(bi:Body, bj:Body) {
        let i = bi.id;
        let j = bj.id;
        if (j > i) {
            const temp = j;
            j = i;
            i = temp;
        }
        return `${i}-${j}` in this.matrix;
    }

    set(bi:Body, bj:Body, value:boolean) {
        let i = bi.id;
        let j = bj.id;
        if (j > i) {
            const temp = j;
            j = i;
            i = temp;
        }
        if (value) {
            this.matrix[`${i}-${j}`] = true;
        }
        else {
            delete this.matrix[`${i}-${j}`];
        }
    }

    /**
     * Empty the matrix
     */
    reset() {
        this.matrix = {};
    }

    /**
     * Set max number of objects
     */
    setNumObjects(n: number) {
    }
}
