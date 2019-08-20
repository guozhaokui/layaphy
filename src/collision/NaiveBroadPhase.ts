import Broadphase from './Broadphase.js';
import AABB from './AABB.js';
import World from '../world/World.js';
import Body from '../objects/Body.js';

/**
 * Naive broadphase implementation, used in lack of better ones.
 * @description The naive broadphase looks at all possible pairs without restriction, therefore it has complexity N^2 (which is bad)
 */
export default class NaiveBroadphase extends Broadphase {
    constructor() {
        super();
    }

    /**
     * Get all the collision pairs in the physics world
     */
    collisionPairs(world:World, pairs1:Body[], pairs2:Body[]) {
        const bodies = world.bodies;
        const n = bodies.length;
        let i:number;
        let j:number;
        let bi:Body;
        let bj:Body;

        // Naive N^2 ftw!
        for (i = 0; i !== n; i++) {
            for (j = 0; j !== i; j++) {

                bi = bodies[i];
                bj = bodies[j];

                if (!this.needBroadphaseCollision(bi, bj)) {
                    continue;
                }

                this.intersectionTest(bi, bj, pairs1, pairs2);
            }
        }
    }

    /**
     * Returns all the bodies within an AABB.
     * @param result An array to store resulting bodies in.
     */
    aabbQuery( world:World, aabb:AABB, result:Body[] = []) {
        let bodies = world.bodies;
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];

            if (b.aabbNeedsUpdate) {
                b.computeAABB();
            }

            // Ugly hack until Body gets aabb
            if (b.aabb.overlaps(aabb)) {
                result.push(b);
            }
        }

        return result;
    }
}
