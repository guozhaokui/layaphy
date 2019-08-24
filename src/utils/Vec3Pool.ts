import Vec3 from '../math/Vec3.js';
import Pool from './Pool.js';

export default class Vec3Pool extends Pool<Vec3> {
    constructor() {
        super();
    }

    constructObject() {
        return new Vec3();
    }
}
