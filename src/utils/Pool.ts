
/**
 * For pooling objects that can be reused.
 * @class Pool
 * @constructor
 */
export class Pool<T> {
    /**
     * The pooled objects
     */
    objects: T[] = [];

    constructor() {
    }

    /**
     * Release an object after use
     * @method release
     * @param {Object} obj
     */
    releaseMany(args:T[]) {
        const Nargs = args.length;
        for (let i = 0; i !== Nargs; i++) {
            this.objects.push(args[i]);
        }
        return this;
    }

    release(o:T){
        this.objects.push(o);
        return this;
    }

    /**
     * Get an object
     * @method get
     */
    get():T {
        if (this.objects.length === 0) {
            return this.constructObject();
        } else {
            return this.objects.pop() as T;
        }
    }

    /**
     * Construct an object. Should be implmented in each subclass.
     */
    constructObject():T {
        throw new Error("constructObject() not implemented in this Pool subclass yet!");
    }

    /**
     * @method resize
     * @param  size
     * @return  Self, for chaining
     */
    resize(size:number) {
        const objects = this.objects;

        while (objects.length > size) {
            objects.pop();
        }

        while (objects.length < size) {
            objects.push(this.constructObject());
        }

        return this;
    }
}

