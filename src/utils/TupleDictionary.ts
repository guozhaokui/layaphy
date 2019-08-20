/**
 * @class TupleDictionary
 * @constructor
 */
export default class TupleDictionary<T> {
    data:{keys:string[],[key:string]:any};
    constructor() {
        this.data = { keys: [] };
    }

    get(i:number, j:number):T {
        if (i > j) {
            // swap
            const temp = j;
            j = i;
            i = temp;
        }
        return this.data[`${i}-${j}`];
    }

    set(i:number, j:number, value:T) {
        if (i > j) {
            const temp = j;
            j = i;
            i = temp;
        }
        const key = `${i}-${j}`;

        // Check if key already exists
        if (!this.get(i, j)) {
            this.data.keys.push(key);
        }

        this.data[key] = value;
    }

    reset() {
        const data = this.data;
        const keys = data.keys;
        while (keys.length > 0) {
            const key = keys.pop();
            delete data[key];
        }
    }
}
