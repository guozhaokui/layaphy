import Vec3 from './Vec3.js';

/**
 * An element containing 6 entries, 3 spatial and 3 rotational degrees of freedom.
 */
export default class JacobianElement {
    spatial = new Vec3();
    rotational = new Vec3();

    constructor() {
    }

    /**
     * Multiply with other JacobianElement
     */
    multiplyElement(element:JacobianElement) {
        return element.spatial.dot(this.spatial) + element.rotational.dot(this.rotational);
    }

    /**
     * Multiply with two vectors
     */
    multiplyVectors(spatial:Vec3, rotational:Vec3) {
        return spatial.dot(this.spatial) + rotational.dot(this.rotational);
    }
}
