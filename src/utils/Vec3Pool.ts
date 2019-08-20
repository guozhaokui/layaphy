import Vec3 from '../math/Vec3.js';
import Pool from './Pool.js';

export default class Vec3Pool extends Pool {
    constructor() {
        super();
        this.type=Vec3;
    }

    constructObject() {
        return new Vec3();
    }
}
