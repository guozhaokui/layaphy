import Vec3 from '../math/Vec3.js';
import Shape from '../shapes/Shape.js';
import Body from '../objects/Body.js';

/**
 * Storage for Ray casting data.
 */
export default class RaycastResult {
    rayFromWorld = new Vec3();
    rayToWorld = new Vec3();
    hitNormalWorld = new Vec3();
    hitPointWorld = new Vec3();
    hasHit = false;
    shape = null;

    /**
     * The hit body, or null.
     */
    body = null;

    /**
     * The index of the hit triangle, if the hit shape was a trimesh.
     */
    hitFaceIndex = -1;

    /**
     * Distance to the hit. Will be set to -1 if there was no hit.
     */
    distance = -1;

    /**
     * If the ray should stop traversing the bodies.
     */
    _shouldStop = false;

    constructor() {

    }

    /**
     * Reset all result data.
     * @method reset
     */
    reset() {
        this.rayFromWorld.setZero();
        this.rayToWorld.setZero();
        this.hitNormalWorld.setZero();
        this.hitPointWorld.setZero();
        this.hasHit = false;
        this.shape = null;
        this.body = null;
        this.hitFaceIndex = -1;
        this.distance = -1;
        this._shouldStop = false;
    }

    /**
     * @method abort
     */
    abort() {
        this._shouldStop = true;
    }

    set(
        rayFromWorld: Vec3,
        rayToWorld: Vec3,
        hitNormalWorld: Vec3,
        hitPointWorld: Vec3,
        shape: Shape,
        body: Body,
        distance: number
    ) {
        this.rayFromWorld.copy(rayFromWorld);
        this.rayToWorld.copy(rayToWorld);
        this.hitNormalWorld.copy(hitNormalWorld);
        this.hitPointWorld.copy(hitPointWorld);
        this.shape = shape;
        this.body = body;
        this.distance = distance;
    }
}