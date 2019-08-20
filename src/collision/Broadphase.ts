import Body from '../objects/Body.js';
import Vec3 from '../math/Vec3.js';
import Quaternion from '../math/Quaternion.js';
import World from '../world/World.js';
import AABB from './AABB.js';

/**
 * Base class for broadphase implementations
 * @class Broadphase
 * @constructor
 * @author schteppe
 */
export default class Broadphase {
    /**
    * The world to search for collisions in.
    */
    world: World = null;

    /**
     * If set to true, the broadphase uses bounding boxes for intersection test, else it uses bounding spheres.
     */
    useBoundingBoxes = false;

    /**
     * Set to true if the objects in the world moved.
     */
    dirty = true;

    constructor() {
    }

    /**
     * Get the collision pairs from the world
     */
    collisionPairs(world: World, p1: Body[], p2: Body[]) {
        throw new Error("collisionPairs not implemented for this BroadPhase class!");
    }

    /**
     * Check if a body pair needs to be intersection tested at all.
     */
    needBroadphaseCollision(bodyA: Body, bodyB: Body) {

        // Check collision filter masks
        if ((bodyA.collisionFilterGroup & bodyB.collisionFilterMask) === 0 || (bodyB.collisionFilterGroup & bodyA.collisionFilterMask) === 0) {
            return false;
        }

        // Check types
        if (((bodyA.type & Body.STATIC) !== 0 || bodyA.sleepState === Body.SLEEPING) &&
            ((bodyB.type & Body.STATIC) !== 0 || bodyB.sleepState === Body.SLEEPING)) {
            // Both bodies are static or sleeping. Skip.
            return false;
        }

        return true;
    }

    /**
     * Check if the bounding volumes of two bodies intersect.
      */
    intersectionTest(bodyA: Body, bodyB: Body, pairs1: Body[], pairs2: Body[]) {
        if (this.useBoundingBoxes) {
            this.doBoundingBoxBroadphase(bodyA, bodyB, pairs1, pairs2);
        } else {
            this.doBoundingSphereBroadphase(bodyA, bodyB, pairs1, pairs2);
        }
    }

    /**
     * Check if the bounding spheres of two bodies are intersecting.
     */
    doBoundingSphereBroadphase(bodyA: Body, bodyB: Body, pairs1: Body[], pairs2: Body[]) {
        const r = Broadphase_collisionPairs_r;
        bodyB.position.vsub(bodyA.position, r);
        const boundingRadiusSum2 = (bodyA.boundingRadius + bodyB.boundingRadius) ** 2;
        const norm2 = r.lengthSquared();
        if (norm2 < boundingRadiusSum2) {
            pairs1.push(bodyA);
            pairs2.push(bodyB);
        }
    }

    /**
     * Check if the bounding boxes of two bodies are intersecting.
     */
    doBoundingBoxBroadphase(bodyA: Body, bodyB: Body, pairs1: Body[], pairs2: Body[]) {
        if (bodyA.aabbNeedsUpdate) {
            bodyA.computeAABB();
        }
        if (bodyB.aabbNeedsUpdate) {
            bodyB.computeAABB();
        }

        // Check AABB / AABB
        if (bodyA.aabb.overlaps(bodyB.aabb)) {
            pairs1.push(bodyA);
            pairs2.push(bodyB);
        }
    }

    /**
     * Removes duplicate pairs from the pair arrays.
     */
    makePairsUnique(pairs1: Body[], pairs2: Body[]) {
        const t = Broadphase_makePairsUnique_temp;
        const p1 = Broadphase_makePairsUnique_p1;
        const p2 = Broadphase_makePairsUnique_p2;
        const N = pairs1.length;

        for (var i = 0; i !== N; i++) {
            p1[i] = pairs1[i];
            p2[i] = pairs2[i];
        }

        pairs1.length = 0;
        pairs2.length = 0;

        for (var i = 0; i !== N; i++) {
            const id1 = p1[i].id;
            const id2 = p2[i].id;
            var key = id1 < id2 ? `${id1},${id2}` : `${id2},${id1}`;
            t[key] = i;
            t.keys.push(key);
        }

        for (var i = 0; i !== t.keys.length; i++) {
            const key = t.keys.pop();
            const pairIndex = t[key];
            pairs1.push(p1[pairIndex]);
            pairs2.push(p2[pairIndex]);
            delete t[key];
        }
    }

    /**
     * To be implemented by subcasses
     */
    setWorld(world: World) {
    }

    /**
     * Returns all the bodies within the AABB.
     */
    aabbQuery(world: World, aabb: AABB, result: Body[]): Body[] {
        console.warn('.aabbQuery is not implemented in this Broadphase subclass.');
        return [];
    }

    /**
     * Check if the bounding spheres of two bodies overlap.
     * 检查两个body的包围球是否碰撞
     */
    static boundingSphereCheck(bodyA: Body, bodyB: Body) {
        throw 'compile err' // 编译有错误，先注掉
        //var dist = bsc_dist;
        //bodyA.position.vsub(bodyB.position, dist);
        //return Math.pow(bodyA.shape.boundingSphereRadius + bodyB.shape.boundingSphereRadius, 2) > dist.lengthSquared();
    }
}

// Temp objects
var  Broadphase_collisionPairs_r = new Vec3();
const Broadphase_collisionPairs_normal = new Vec3();
const Broadphase_collisionPairs_quat = new Quaternion();
const Broadphase_collisionPairs_relpos = new Vec3();

var Broadphase_makePairsUnique_temp = { keys: [] };

var Broadphase_makePairsUnique_p1: Body[] = [];
var Broadphase_makePairsUnique_p2: Body[] = [];


const bsc_dist = new Vec3();
