import {Vec3} from '../math/Vec3.js';
import {Body,  BODYTYPE, BODY_SLEEP_STATE } from '../objects/Body.js';
import {World} from '../world/World.js';
import {AABB} from './AABB.js';

/**
 * Base class for broadphase implementations
 * @class Broadphase
 * @constructor
 * @author schteppe
 */
export abstract class Broadphase {
    /**
    * The world to search for collisions in.
    */
    world: World;

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
    abstract collisionPairs(world: World, p1: Body[], p2: Body[]):void;

    /**
     * Check if a body pair needs to be intersection tested at all.
     */
    needBroadphaseCollision(bodyA: Body, bodyB: Body) {
		if(!bodyA.enable || !bodyB.enable)
			return false;

        // Check collision filter masks
        if ((bodyA.collisionFilterGroup & bodyB.collisionFilterMask) === 0 || (bodyB.collisionFilterGroup & bodyA.collisionFilterMask) === 0) {
            return false;
        }

        // Check types
        if (((bodyA.type & BODYTYPE.STATIC) !== 0 || bodyA.sleepState === BODY_SLEEP_STATE.SLEEPING) &&
            ((bodyB.type & BODYTYPE.STATIC) !== 0 || bodyB.sleepState === BODY_SLEEP_STATE.SLEEPING)) {
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
            bodyA.updateAABB();
        }
        if (bodyB.aabbNeedsUpdate) {
            bodyB.updateAABB();
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
        let t:{[key:string]:int} = {};
        const p1 = Broadphase_makePairsUnique_p1;
        const p2 = Broadphase_makePairsUnique_p2;
		const N = pairs1.length;
		let keys = Broadphase_makePairsUnique_keys;

		// 先把原始的保存到p1,p2
        for (let i = 0; i !== N; i++) {
            p1[i] = pairs1[i];
            p2[i] = pairs2[i];
        }

		// pairs12清零，以后准备放最终不重复的
        pairs1.length = 0;
        pairs2.length = 0;

        for (let i:i32 = 0; i < N; i++) {
            const id1 = p1[i].id;
            const id2 = p2[i].id;
			let key = id1 < id2 ? `${id1},${id2}` : `${id2},${id1}`;
			// 通过key的方式冲掉已有的
			if(t[key]==undefined){
            	t[key] = i;
				keys.push(key);
			}
        }

        for (let i = 0,l = keys.length; i < l; i++) {
            let key = keys[i];
            const pairIndex = t[key] as i32;
            pairs1.push(p1[pairIndex]);
            pairs2.push(p2[pairIndex]);
            //delete t[key];
		}
		keys.length=0;
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
	
	hasRayQuery(){
		return false;
	}
	/**
	 * 为了优化提供一个rayQuery接口，如果
	 */
	rayQuery(){

	}

	sphereQuery(world:World, pos:Vec3, radius:number,result:Body[]):Body[]{
		console.warn('.sphereQuery is not implemented in this Broadphase subclass.');
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
//const Broadphase_collisionPairs_normal = new Vec3();
//const Broadphase_collisionPairs_quat = new Quaternion();
//const Broadphase_collisionPairs_relpos = new Vec3();

var Broadphase_makePairsUnique_temp:{[key:string]:i32} = {};
var Broadphase_makePairsUnique_p1: Body[] = [];
var Broadphase_makePairsUnique_p2: Body[] = [];
var Broadphase_makePairsUnique_keys:string[]=[];

//const bsc_dist = new Vec3();
