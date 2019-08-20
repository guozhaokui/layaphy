/**
 * 避免重复添加碰撞信息
 */
export default class OverlapKeeper {
    current:number[] = [];
    previous:number[] = [];
    constructor() {
    }

    getKey(i:number, j:number) {
        /*
        if (j < i) {
            const temp = j;
            j = i;
            i = temp;
        }
        return (i << 16) | j;
        */
       return (j<i)?((j<<16)|i):((i<<16)|j);
    }

    /**
     * 记录i与j相交了，把key插入current中。按照从小到大排序
     */
    set(i:number, j:number) {
        // Insertion sort. This way the diff will have linear complexity.
        const key = this.getKey(i, j);
        const current = this.current;
        let index = 0;
        while (key > current[index]) {
            index++;
        }
        if (key === current[index]) {
            return; // Pair was already added
        }
        for (var j = current.length - 1; j >= index; j--) {
            current[j + 1] = current[j];
        }
        current[index] = key;
    }

    /**
     * 每帧执行一次交换
     */
    tick() {
        //swap(current,previous)
        const tmp = this.current;
        this.current = this.previous;
        this.previous = tmp;
        this.current.length = 0;
    }

    /**
     * @method getDiff
     * @param  {array} additions
     * @param  {array} removals
     */
    getDiff(additions, removals) {
        const a = this.current;
        const b = this.previous;
        const al = a.length;
        const bl = b.length;

        let j = 0;
        for (var i = 0; i < al; i++) {
            var found = false;
            const keyA = a[i];
            while (keyA > b[j]) {
                j++;
            }
            found = keyA === b[j];

            if (!found) {
                unpackAndPush(additions, keyA);
            }
        }
        j = 0;
        for (var i = 0; i < bl; i++) {
            var found = false;
            const keyB = b[i];
            while (keyB > a[j]) {
                j++;
            }
            found = a[j] === keyB;

            if (!found) {
                unpackAndPush(removals, keyB);
            }
        }
    }
}

function unpackAndPush(array, key) {
    array.push((key & 0xFFFF0000) >> 16, key & 0x0000FFFF);
}