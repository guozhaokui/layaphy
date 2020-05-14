import {Broadphase} from './Broadphase.js';
import {Vec3} from '../math/Vec3.js';
import {World, AddBodyEvent, RemoveBodyEvent} from '../world/World.js';
import {Body} from '../objects/Body.js';
import { AABB } from './AABB.js';


class Area{
	bodies:Body[];
}

class NullArea{
}

/**
 * 基于格子的宽阶段碰撞检测。
 * 分成静止和动态两个格子，动态的每次都清理
 * 静态的一直保存，一旦active就要从静态格子删除
 * 注意 超出范围的会被忽略
 * 
 */
export class GridBroadphase1 extends Broadphase {
    nx = 10;
    ny = 10;
    nz = 10;
    aabbMin = new Vec3(100, 100, 100);
    aabbMax = new Vec3(-100, -100, -100);
    bins:Body[][] = [];

    // bins 数组中的每个数组的长度
    binLengths:number[] = [];//Rather than continually resizing arrays (thrashing the memory), just record length and allow them to grow

    constructor(aabbMin?: Vec3, aabbMax?: Vec3, nx:i32=10, ny:i32=10, nz:i32=10) {
        super();
        this.nx = nx;
        this.ny = ny;
        this.nz = nz;
        aabbMin && (this.aabbMin = aabbMin);
        aabbMax && (this.aabbMax = aabbMax);;
        const nbins = this.nx * this.ny * this.nz;
        if (nbins <= 0) {
            throw "GridBroadphase: Each dimension's n must be >0";
        }
        this.bins.length = nbins;
        this.binLengths.length = nbins;
        for (let i = 0; i < nbins; i++) {
            this.bins[i] = [];
            this.binLengths[i] = 0;
        }
    }

	setWorld(world: World) {
		world.addEventListener('addBody',(e:AddBodyEvent)=>{
			debugger;
		});
		world.addEventListener('removeBody',(e:RemoveBodyEvent)=>{
			debugger;
		});

		//world.removeEventListener()
	}

	aabbQuery(world: World, aabb: AABB, result: Body[]): Body[] {
		// 没实现，下面的是naive的

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

    /**
	 * 
     */
    collisionPairs(world: World, pairs1: Body[], pairs2: Body[]) {
        const N = world.numObjects();
        const bodies = world.bodies;
        var max = this.aabbMax;
        var min = this.aabbMin;
     
        //this.makePairsUnique(pairs1, pairs2);
    }
}

var GridBroadphase_collisionPairs_d = new Vec3();
