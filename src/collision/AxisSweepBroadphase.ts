import {Broadphase} from './Broadphase.js';
import {AABB} from './AABB.js';
import {World} from '../world/World.js';
import {Body} from '../objects/Body.js';

/**
 * sweep and prune 算法
 */

export class AxisSweepBroadphase extends Broadphase {
    constructor() {
        super();
    }

    /**
     * 插入排序算法。比较适合基本排好序的数据。
     * TODO 与js内置排序算法比较性能
     * @param inputArr 
     */
    insertionSort(inputArr:f32[]){
        let length:i32 = inputArr.length;
        for (let i:i32 = 1; i < length; i++) {
            let key:f32 = inputArr[i];
            let j:i32 = i - 1;
            while (j >= 0 && inputArr[j] > key) {
                inputArr[j + 1] = inputArr[j];
                j = j - 1;
            }
            inputArr[j + 1] = key;
        }
        return inputArr;
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
                b.updateAABB();
            }

            // Ugly hack until Body gets aabb
            if (b.aabb.overlaps(aabb)) {
                result.push(b);
            }
        }

        return result;
    }
}
