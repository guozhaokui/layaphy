import {Broadphase} from './Broadphase.js';
import {Vec3} from '../math/Vec3.js';
import {World, AddBodyEvent, RemoveBodyEvent} from '../world/World.js';
import {Body, BODYTYPE} from '../objects/Body.js';
import { AABB } from './AABB.js';


class Area{
	bodies:Body[];
}

class NullArea{
}

export class gridInfo{
	//udpateAABB=false;
	needUpdate=true;
	grids:number[]|null=null;
	sys:GridBroadphase1;
	onNeedUpdate(){
		//
	}
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
	uninitedBodies:Body[]=[];

	private sleepyListener:EventListener;
	private sleepListener:EventListener;
	private awakeListener:EventListener;
	private addBodyListener:EventListener;
	private removeBodyListener:EventListener;

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
		
		this.sleepyListener = this.onSleepyEvent.bind(this);
		this.sleepListener = this.onSleepEvent.bind(this);
		this.awakeListener = this.onWakeupEvent.bind(this);
		this.addBodyListener = this.onAddBody.bind(this);
		this.removeBodyListener = this.onRemoveBody.bind(this);
    }

	setWorld(world: World) {
		world.addEventListener('addBody',this.addBodyListener);
		world.addEventListener('removeBody',this.removeBodyListener);
		world.addEventListener(Body.sleepEvent.type, this.sleepListener);
		world.addEventListener(Body.sleepyEvent.type,this.sleepyListener);
		world.addEventListener(Body.wakeupEvent.type, this.awakeListener);
	}

	onAddBody(e:AddBodyEvent){
		// 注意type可能会变
		// 刚添加进去的时候可能还没有设置位置，aabb是不对的
		let b = e.body;
		if(b && !b?.gridinfo){
			b.gridinfo =new gridInfo();
			b.gridinfo.sys = this;
			this.uninitedBodies.push(b);
		}

		b?.aabb;
		switch(b?.type){
			case BODYTYPE.STATIC:
				break;
			case BODYTYPE.DYNAMIC:
				break;
			case BODYTYPE.KINEMATIC:
				break;
		}
	}

	onRemoveBody(e:RemoveBodyEvent){
		let b = e.body;
	}

	onSleepEvent(){

	}
	onSleepyEvent(){

	}
	onWakeupEvent(){

	}

	onBodyMoved(b:Body){

	}

	updateAllDynaBody(){

	}
	aabbQuery(world: World, aabb: AABB, result: Body[]): Body[] {
		throw 'NI';
	}

	updateBody(b:Body){

	}

    /**
	 * 
     */
    collisionPairs(world: World, pairs1: Body[], pairs2: Body[]) {
		// 
		let uninited:Body[] = this.uninitedBodies;
		uninited.forEach( (b:Body)=>{
			this.updateBody(b);
		});
		uninited.length=0;
		// 根据动态对象得到所有的动态格子
		// 

        const N = world.numObjects();
        const bodies = world.bodies;
        var max = this.aabbMax;
        var min = this.aabbMin;
     
        //this.makePairsUnique(pairs1, pairs2);
    }
}

var GridBroadphase_collisionPairs_d = new Vec3();
