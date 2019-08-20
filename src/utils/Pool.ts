
/**
 * For pooling objects that can be reused.
 * @class Pool
 * @constructor
 */
export default class Pool {
    /**
     * The pooled objects
     */
    objects: any[] = [];

    /**
     * Constructor of the objects
     */
    type:any;

    constructor() {
    }

    /**
     * Release an object after use
     * @method release
     * @param {Object} obj
     */
    release(...args) {
        const Nargs = args.length;
        for (let i = 0; i !== Nargs; i++) {
            this.objects.push(args[i]);
        }
        return this;
    }

    /**
     * Get an object
     * @method get
     */
    get() {
        if (this.objects.length === 0) {
            return this.constructObject();
        } else {
            return this.objects.pop();
        }
    }

    /**
     * Construct an object. Should be implmented in each subclass.
     */
    constructObject() {
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

